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
    root.innerHTML=`<section class="hr-panel"><div class="hr-head"><h2>🪦 사라진 가게</h2><button type="button" class="hr-close">닫기 ✕</button></div><p class="hr-note">영업 종료·이전한 공간의 추억 기록입니다. 현재 방문 추천에 포함하지 않아요. 지도에는 기존 기록의 추정 옛 위치를 구분해 표시합니다. 주소가 확인되지 않은 새 기록은 핀을 만들지 않습니다.</p>${history.map(p=>`<article class="hr-place"><h3 style="margin:0">${escape(p.name)}</h3><small>${escape(p.year)} · 홍대 공간 영업 종료</small><p class="hr-note">${escape(p.note)}</p><a class="hr-source" href="${p.source}" target="_blank" rel="noopener noreferrer">종료 기록 출처 ↗</a></article>`).join('')}<button type="button" class="hr-close archive-map-action" data-archive-map>추정 옛 위치 지도에서 보기 →</button><p class="hr-note">기존 추억·제보 ${existing.length}곳 · 확인 상태는 각 기록 참고</p>${existing.map(s=>`<button type="button" class="hr-place" data-archive-store="${s.id}"><span class="archive-list-tag">${escape(s.dong||'홍대')} · 옛 공간 기록</span><strong>${escape(s.name)}</strong><small>${escape(s.memory||s.insight)}</small></button>`).join('')}</section>`;
    root.querySelector('.hr-close').onclick=close;
    root.querySelector('[data-archive-map]').onclick=()=>showLocation();
    root.querySelectorAll('[data-archive-store]').forEach(b=>b.onclick=()=>{close();selectStore(Number(b.dataset.archiveStore))});
    root.classList.add('open');root.querySelector('.hr-close').focus();
  }
  root.addEventListener('click',e=>{if(e.target===root)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('DOMContentLoaded',()=>document.body.append(root));
  function showLocation(id){
    close();currentFilter='gone';activeDetailFilters.clear();searchQuery='';showMarkers=true;renderList();
    const places=stores.filter(s=>s.status==='closed'&&Number.isFinite(s.lat)&&Number.isFinite(s.lng));
    const place=id?places.find(s=>s.id===id):places[0];
    if(place&&map){map.panTo(new kakao.maps.LatLng(place.lat,place.lng));map.setLevel(id?3:5);}
    if(id && typeof closeDetail==='function')closeDetail();
    showToast('사라진 가게의 추정 옛 위치 · 현재 영업 장소가 아닙니다');
  }
  window.HongdaeArchive={open,close,showLocation};
})();
