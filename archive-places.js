(() => {
  const history = [
    {name:'살롱 바다비',year:'2015년 10월',note:'신인 밴드에게 무대를 열어 주던 복합문화 공간. 마지막 기획 공연 후 홍대 공간의 운영을 종료한 기록입니다.',source:'https://koreancontent.tistory.com/2753'},
    {name:'클럽 타',year:'2016년 10월',note:'2006년 시작해 신인 음악인의 활동 무대가 되었던 라이브클럽. 2016년 마지막 공연 후 영업 종료가 보도됐습니다.',source:'https://www.mk.co.kr/news/society/7531765'}
  ];
  const escape = value => String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const root=document.createElement('div');root.className='hr-overlay';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','사라진 가게');
  function close(){root.classList.remove('open')}
  function open(){
    window.HongdaeDiscovery?.close?.();
    const existing=stores.filter(s=>s.status==='closed');
    const card=(p,store)=>`<article class="place-identity-card archive-identity archive-list-card"><div class="place-identity-hero"><span class="place-identity-icon">${store?menuEmoji(store):'🎵'}</span><span class="place-kind">이곳의 기억</span><span class="place-kicker">HONGDAE ARCHIVE</span></div><div class="place-identity-content"><h3>${escape(p.name)}</h3><div class="place-feature-tags"><span>${escape(store?.dong||'홍대')}</span><span>옛 공간 기록</span></div><p class="place-description">${escape(p.note||store?.memory||store?.insight)}</p>${store?`<button type="button" class="map-btn" data-archive-store="${store.id}">이곳의 기억 보기 →</button><button type="button" class="map-btn" data-archive-location="${store.id}">추정 옛 위치 보기 →</button>`:`<a class="map-btn" href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">종료 기록 출처 ↗</a><p class="archive-location-note">옛 위치 확인 필요</p>`}</div></article>`;
    root.innerHTML=`<section class="hr-panel"><div class="hr-head"><h2>사라진 장소</h2><button type="button" class="hr-close">닫기 ✕</button></div><p class="hr-note">영업 종료·이전한 공간에 남은 기억을 모아요. 위치 표시는 기존 기록의 추정 옛 위치이며 현재 방문 장소가 아닙니다.</p><button type="button" class="hr-close archive-map-action" data-archive-map>추정 옛 위치 지도에서 보기 →</button>${history.map(p=>card(p)).join('')}${existing.map(s=>card({name:s.name},s)).join('')}</section>`;
    root.querySelector('.hr-close').onclick=close;
    root.querySelector('[data-archive-map]').onclick=()=>showLocation();
    root.querySelectorAll('[data-archive-location]').forEach(b=>b.onclick=()=>showLocation(Number(b.dataset.archiveLocation)));
    root.querySelectorAll('[data-archive-store]').forEach(b=>b.onclick=()=>{close();selectStore(Number(b.dataset.archiveStore))});
    root.classList.add('open');root.querySelector('.hr-close').focus();
  }
  root.addEventListener('click',e=>{if(e.target===root)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('DOMContentLoaded',()=>document.body.append(root));
  function showLocation(id){
    close();currentFilter='gone';activeDetailFilters.clear();searchText='' ;showMarkers=true;renderList();
    const places=stores.filter(s=>s.status==='closed'&&Number.isFinite(s.lat)&&Number.isFinite(s.lng));
    const place=id?places.find(s=>s.id===id):places[0];
    if(place&&map){map.setCenter(new kakao.maps.LatLng(place.lat,place.lng));map.setLevel(id?3:5);}
    if(id && typeof closeDetail==='function')closeDetail();
    showToast('사라진 가게의 추정 옛 위치 · 현재 영업 장소가 아닙니다');
  }
  window.HongdaeArchive={open,close,showLocation};
})();
