/* Keep legal dong, browsing area and evidence confidence separate. */
(() => {
  const rows=window.HONGDAE_NEIGHBOURHOOD_RESEARCH||[];
  function enrich(target) {
    let added=0;
    for(const row of rows){
      let store=target.find(s=>String(s.kakaoId)===row.kakaoId || s.id===-Number(row.kakaoId));
      if(!store){
        store={id:-Number(row.kakaoId),status:'unverified',rating:null,reviews:null,months:null,rent:null,score:null,certifications:[],tags:[]};
        target.push(store);added++;
        Object.assign(store,{name:row.name,type:row.type,lat:row.lat,lng:row.lng});
      }
      Object.assign(store,{kakaoId:row.kakaoId,kakaoUrl:row.kakaoUrl,naverUrl:row.naverUrl||`https://map.naver.com/p/search/${encodeURIComponent(row.name+' '+row.address)}`,neighbourhood:row.neighbourhood,dong:row.dong,address:row.address,category:row.category,insight:row.insight,hours:row.hours,hoursState:row.hoursState,hoursExceptions:row.hoursExceptions,branchStatus:row.branchStatus,neighbourhoodResearch:row});
      store.tags=[...new Set([...(store.tags||[]),...row.tags.filter(t=>!(/\d{1,2}:\d{2}/.test(t)))])];
      if(row.soloDrinking)store.tags=[...new Set([...store.tags,'혼술'])];
      if(row.menus.length)store.signatureMenu=row.menus.join(', ');
      const menu=row.menus.map(text=>{const m=text.match(/^(.*?)\s+([\d,]+)원$/);return m?[m[1],Number(m[2].replace(/,/g,'')),false]:[text.replace(/\(가격 미표기\)/g,''),null,false];});
      store.surveyMenu={...(store.surveyMenu||{}),kakaoId:row.kakaoId,hours:row.hours,source:row.hoursSource,menuSource:row.kakaoUrl,menu:menu.length?menu:(store.surveyMenu?.menu||[])};
    }
    return added;
  }
  window.HongdaeNeighbourhoodResearch={enrich};
  enrich(stores);
})();
