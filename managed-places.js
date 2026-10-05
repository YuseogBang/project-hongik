/* Public places are read through Supabase RLS; only editor-managed rows override embedded data. */
(() => {
  const inArea = row => Number.isFinite(row.lat) && Number.isFinite(row.lng) && row.lat>=37.543 && row.lat<=37.572 && row.lng>=126.890 && row.lng<=126.939;
  function merge(rows, target) {
    let changed=0;
    for(const row of rows){
      if(!Number.isSafeInteger(Number(row.id)) || !row.name)continue;
      let store=target.find(s=>s.id===Number(row.id));
      const source=row.source||{};
      if(store && !source.editorial)continue;
      if(!store){if(!inArea(row))continue;store={id:Number(row.id),rating:null,reviews:null,months:null,rent:null,score:null,certifications:[]};target.push(store);}
      for(const key of ['name','type','status','address','category'])if(row[key]!=null)store[key]=row[key];
      if(inArea(row)){store.lat=row.lat;store.lng=row.lng;}
      if(Array.isArray(row.tags))store.tags=row.tags.filter(t=>typeof t==='string');
      for(const key of ['hours','signatureMenu','dong','franchise','memory','insight','kakaoId'])if(source[key]!=null && source[key]!=='')store[key]=source[key];
      if(/^https?:\/\//.test(source.kakaoUrl||''))store.kakaoUrl=source.kakaoUrl;
      if(source.editorial && source.franchise==null)delete store.franchise;
      if(source.editorial){store.hoursNote='관리자가 확인한 영업시간';store.menuSourceNote='관리자가 확인한 메뉴';
        if(store.surveyMenu)store.surveyMenu={...store.surveyMenu,hours:store.hours||store.surveyMenu.hours};}
      window.HongdaeMusic?.enrich(store);
      changed++;
    }
    return changed;
  }
  async function load(){
    await window.HongdaePlatform?.whenReady();const sb=window.HongdaePlatform?.getClient();if(!sb)return;
    const rows=[];
    for(let offset=0;offset<5000;offset+=500){const {data,error}=await sb.from('places').select('id,name,type,status,lat,lng,address,category,tags,source').order('id').range(offset,offset+499);if(error){console.warn('Managed places unavailable:',error.message);return;}rows.push(...data);if(data.length<500)break;}
    if(merge(rows,stores)&&typeof renderAll==='function')renderAll();
  }
  window.HongdaeManagedPlaces={merge,load};document.addEventListener('DOMContentLoaded',()=>load().catch(e=>console.warn('Managed places loading failed:',e.message)));
})();
