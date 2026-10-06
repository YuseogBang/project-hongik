(() => {
  window.HongdaeExcludedPlaceIds=new Set([1786000000038, 1786000000039, 1786000000040, 1786000000041, 1786000000051, 1786000000053, 1786000000055, 1786000000056, 1786000000057, 1786000000058]);
  function isLate(store){
    if(store.status==='closed')return false;
    const raw=store.surveyMenu?.hours||store.hours||'';
    if(!raw)return (store.services||[]).includes('lateNight');
    if(/24\s*시간/.test(raw))return true;
    return String(raw).split(/\s*\/\s*/).some(segment=>{
      const operating=segment.split(/휴게|브레이크|휴식|라스트|L\.?O\.?/i)[0];
      const ranges=[...operating.matchAll(/(\d{1,2}):(\d{2})\s*[~–—-]\s*(?:익일\s*|다음날\s*)?(\d{1,2}):(\d{2})/g)];
      return ranges.some(m=>{const start=+m[1]*60 + +m[2],end=+m[3]*60 + +m[4];return end>1440 || (end>0 && end<start) || (start<360 && end>start);});
    });
  }
  window.HongdaeHoursFilter={isLate};
  document.addEventListener('DOMContentLoaded',()=>{
    const dock=document.createElement('div');dock.className='neighbourhood-switch';dock.setAttribute('aria-label','동네 선택');
    dock.innerHTML=['홍대','연남동','망원동'].map(n=>`<button type="button" data-neighbourhood="${n}">${n==='홍대'?n:n.replace('동','')}</button>`).join('');document.body.append(dock);
    dock.querySelectorAll('button').forEach(button=>button.onclick=async()=>{
      const name=button.dataset.neighbourhood;
      if(name==='망원동'){showToast('망원동 업체를 카카오 장소와 대조하고 있어요');await window.HongdaeResearch?.ensureArea('mangwon');}
      currentFilter=name==='홍대'?'all':name;activeDetailFilters.clear();searchQuery='';
      const input=document.getElementById('search-input');if(input)input.value='';
      if(name==='홍대'){if(map)map.panTo(new kakao.maps.LatLng(HONGDAE_ENTRANCE.lat,HONGDAE_ENTRANCE.lng));}
      else {const points=stores.filter(s=>s.dong===name&&s.status!=='closed'&&Number.isFinite(s.lat)&&Number.isFinite(s.lng));if(points.length&&map){const median=v=>v.sort((a,b)=>a-b)[Math.floor(v.length/2)];map.panTo(new kakao.maps.LatLng(median(points.map(s=>s.lat)),median(points.map(s=>s.lng))));map.setLevel(4);}else showToast('확인된 '+name+' 업체 위치를 불러오는 중입니다.');}
      dock.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderList();
    });
  });
})();
