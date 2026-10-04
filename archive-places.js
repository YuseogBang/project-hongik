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
    root.innerHTML=`<section class="hr-panel"><div class="hr-head"><h2>🪦 사라진 가게</h2><button type="button" class="hr-close">닫기 ✕</button></div><p class="hr-note">영업 종료·이전한 공간의 추억 기록입니다. 현재 방문 추천에 포함하지 않아요. 새 역사 기록은 옛 위치가 확인되지 않아 지도 핀과 길찾기를 제공하지 않습니다.</p>${history.map(p=>`<article class="hr-place"><h3 style="margin:0">${escape(p.name)}</h3><small>${escape(p.year)} · 홍대 공간 영업 종료</small><p class="hr-note">${escape(p.note)}</p><a class="hr-source" href="${p.source}" target="_blank" rel="noopener noreferrer">종료 기록 출처 ↗</a></article>`).join('')}<p class="hr-note">기존 추억·제보 ${existing.length}곳 · 확인 상태는 각 기록 참고</p>${existing.map(s=>`<button type="button" class="hr-place" data-archive-store="${s.id}">${escape(s.name)}<small>${escape(s.insight||s.memory)} · 기존 기록 보기 →</small></button>`).join('')}</section>`;
    root.querySelector('.hr-close').onclick=close;
    root.querySelectorAll('[data-archive-store]').forEach(b=>b.onclick=()=>{close();selectStore(Number(b.dataset.archiveStore))});
    root.classList.add('open');root.querySelector('.hr-close').focus();
  }
  root.addEventListener('click',e=>{if(e.target===root)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('DOMContentLoaded',()=>document.body.append(root));
  window.HongdaeArchive={open,close};
})();
