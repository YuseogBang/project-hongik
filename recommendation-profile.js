/* One preference profile shared by landing, feed, routes, and profile editing. */
(() => {
  const KEY='hongdaeRecommendationProfile';
  const groups=[
    {title:'무엇에 끌리나요?',subtitle:'음식부터 음악까지, 여러 개 골라도 좋아요.',tags:['매운맛','혼밥','디저트','술안주','빈티지','구제','독립출판','바이닐','덕후','문구','소품','라이브음악','재즈','전통시장','친환경','제로웨이스트']},
    {title:'어떤 감각의 공간이 좋나요?',subtitle:'사진에 담고 싶은 곳, 조용히 머무는 곳, 나만 아는 골목.',tags:['조용한','시끌벅적','인스타감성','데이트','가성비','로컬단골','노포','홍대병']}
  ];
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{version:1,tags:[],budget:'any',explore:'balanced',company:'solo',walk:1200}}catch{return {version:1,tags:[],budget:'any',explore:'balanced',company:'solo',walk:1200}}};
  const tastes=()=>{try{return typeof userTastes!=='undefined'?userTastes:JSON.parse(localStorage.getItem('userTastes')||'[]')}catch{return []}};
  function profile(){return {...read(),tags:tastes()}}
  const meals=s=>(s.surveyMenu?.menu||[]).filter(([n,p])=>Number.isFinite(p)&&p>0&&p<=10000&&/라멘|우동|국수|냉면|덮밥|볶음밥|비빔밥|국밥|곰탕|설렁탕|찌개|백반|정식|돈까스|돈카츠|버거|샌드위치|오니기리|주먹밥|김밥|카레|소바|짜장|짬뽕|토스트/.test(n)&&!/추가|공기밥|사이드|감자튀김|음료|2인|3인|4인|인 이상|미니|고기\s*마요|곁들임/.test(n));
  function eligible(s){return s.status!=='closed' && (profile().budget!=='10000'||!['restaurant','food'].includes(s.type)||meals(s).length>0)}
  function explain(s){const p=profile(),tags=s.tags||[];const reasons=p.tags.filter(t=>tags.includes(t)).map(t=>'#'+t);
    if(p.budget==='10000'&&meals(s).length)reasons.push('등록 메뉴 중 만원 이하 한 끼');
    if(p.explore==='local'&&tags.some(t=>['로컬단골','노포','홍대병'].includes(t)))reasons.push('로컬 취향 탐색');
    if(p.explore==='new'){try{if(!JSON.parse(localStorage.getItem('hongdaePassportVisited')||'[]').map(Number).includes(s.id))reasons.push('아직 방문 기록이 없는 곳')}catch{}}
    return reasons;
  }
  function score(s){const p=profile(),tags=s.tags||[];let total=p.tags.reduce((n,t)=>n+(tags.includes(t)?(['조용한','시끌벅적','인스타감성','홍대병'].includes(t)?8:6):0),0);
    const companion={solo:'혼밥',date:'데이트',friends:'시끌벅적'}[p.company];if(tags.includes(companion))total+=3;
    if(p.explore==='local')total+=tags.filter(t=>['로컬단골','노포','홍대병'].includes(t)).length*4;
    if(p.explore==='new'&&explain(s).includes('아직 방문 기록이 없는 곳'))total+=4;
    return total;
  }
  function rank(items){return items.filter(eligible).map(s=>({s,score:score(s)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.s.id-b.s.id).map(x=>x.s)}
  function save(value){const p={...value,version:1,tags:[...new Set(value.tags)],updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(p));localStorage.setItem('userTastes',JSON.stringify(p.tags));if(typeof userTastes!=='undefined')userTastes=p.tags;window.dispatchEvent(new Event('hongdae:preferences-change'));return p}
  const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let root,step=0,draft,destination='feed',landing=false,previousFocus;
  function close(){root?.remove();root=null;document.body.style.overflow='';previousFocus?.focus()}
  function render(){
    const group=groups[step];const content=group?`<h2>${group.title}</h2><p>${group.subtitle}</p><div class="rp-tags">${group.tags.map(t=>`<button data-tag="${t}" aria-pressed="${draft.tags.includes(t)}">${t}</button>`).join('')}</div>`:`<h2>오늘의 홍대, 어떻게 둘러볼까요?</h2><p>이 설정은 피드의 추천 순서와 코스의 기본 조건에 함께 반영돼요.</p><label>식사 예산<select name="budget"><option value="any">제한 없이 둘러보기</option><option value="10000">만원 이하 한 끼만 · 확인된 메뉴 기준</option></select></label><label>발견 방식<select name="explore"><option value="balanced">내 취향을 골고루</option><option value="local">로컬·노포를 더 만나기</option><option value="new">아직 가보지 않은 곳 우선</option></select></label><label>동행<select name="company"><option value="solo">혼자</option><option value="date">데이트</option><option value="friends">친구들과</option></select></label><label>장소 사이 이동 범위<select name="walk"><option value="600">가까운 골목 · 600m</option><option value="1200">동네 산책 · 1.2km</option><option value="2200">넓게 탐험 · 2.2km</option></select></label><label>시작 화면<select name="destination"><option value="feed">내 취향 피드</option><option value="course">추천 코스</option><option value="map">지도</option></select></label>`;
    root.innerHTML=`<section class="rp-panel" role="dialog" aria-modal="true" aria-label="내 취향으로 홍대 시작하기"><div class="rp-top"><span>MY HONGDAE · ${step+1}/3</span><button data-close aria-label="닫기">×</button></div><div class="rp-progress"><i style="width:${(step+1)/3*100}%"></i></div>${content}<p class="rp-status" aria-live="polite">${draft.tags.length?draft.tags.map(t=>'#'+escape(t)).join(' '):'취향을 하나 이상 골라주세요.'}</p><button type="button" data-skip class="rp-skip">건너뛰기 (Skip)</button><div class="rp-actions">${step?'<button data-back>이전</button>':''}<button class="rp-primary" data-next>${step===2?'이 취향으로 시작하기':'다음'}</button></div><small>이 기기에 저장돼요. 내 프로필에서 언제든 바꿀 수 있어요.</small></section>`;
    root.querySelector('[data-close]').onclick=close;
    root.querySelector('[data-skip]').onclick=()=>{close();if(destination==='feed')window.HongdaeFeed?.open();else if(destination==='course')window.HongdaeSpecial?.openRoute();else if(destination==='profile')window.HongdaeExperience?.openProfile()};
    root.querySelectorAll('[data-tag]').forEach(b=>b.onclick=()=>{const t=b.dataset.tag;draft.tags=draft.tags.includes(t)?draft.tags.filter(x=>x!==t):[...draft.tags,t];b.setAttribute('aria-pressed',String(draft.tags.includes(t)));root.querySelector('.rp-status').textContent=draft.tags.map(t=>'#'+t).join(' ')||'취향을 하나 이상 골라주세요.'});
    root.querySelector('[data-back]')?.addEventListener('click',()=>{step--;render()});
    for(const name of ['budget','explore','company','walk','destination']){const el=root.querySelector(`[name="${name}"]`);if(el){el.value=String(name==='destination'?destination:draft[name]);el.onchange=()=>{if(name==='destination')destination=el.value;else draft[name]=name==='walk'?Number(el.value):el.value}}}
    root.querySelector('[data-next]').onclick=()=>{if(!draft.tags.length){root.querySelector('.rp-status').textContent='취향을 하나 이상 골라주세요.';return}if(step<2){step++;render();return}save(draft);close();if(landing)location.href='main.html?start='+destination;else if(destination==='feed')window.HongdaeFeed?.openPersonal();else if(destination==='course')window.HongdaeSpecial?.openRoute('student');else if(destination==='profile')window.HongdaeExperience?.openProfile();else if(typeof renderAll==='function')renderAll()};
    root.querySelector('h2').setAttribute('tabindex','-1');root.querySelector('h2').focus();
  }
  function open(options={}){close();previousFocus=document.activeElement;draft={...profile(),tags:[...tastes()]};step=0;landing=!!options.landing;destination=options.destination||'feed';root=document.createElement('div');root.className='rp-overlay';document.body.append(root);document.body.style.overflow='hidden';render()}
  window.HongdaeRecommendations={profile,save,rank,score,explain,eligible,open};
  document.addEventListener('DOMContentLoaded',()=>{
    const css=document.createElement('style');css.textContent=`.rp-overlay{position:fixed;inset:0;z-index:1400;display:grid;place-items:center;padding:16px;background:rgba(20,3,8,.8);font-family:Pretendard,sans-serif}.rp-panel{width:min(540px,100%);max-height:90dvh;overflow:auto;border:1px solid #9e394b;border-radius:26px;background:linear-gradient(150deg,#4b1824,#2b070c);padding:26px;color:#fff1e8;box-shadow:0 24px 80px #120207}.rp-top{display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.1em;color:#ffbf9f}.rp-top button{border:0;background:transparent;color:#fff;font-size:25px}.rp-progress{height:4px;background:#71313e;margin:15px 0 22px;border-radius:99px}.rp-progress i{display:block;height:100%;background:#ff704f;border-radius:99px}.rp-panel h2{font-size:26px;line-height:1.3;margin:0 0 12px;letter-spacing:-.04em}.rp-panel p{font-size:13px;line-height:1.65;color:#dfb8b6}.rp-tags{display:flex;gap:9px;flex-wrap:wrap;margin:22px 0}.rp-tags button{padding:12px 16px;border:1px solid #914453;border-radius:99px;background:#41111b;color:#fff1e8;font:600 13px Pretendard,sans-serif}.rp-tags button[aria-pressed=true]{background:#ed3d2d;border-color:#ff9c83;color:#fff}.rp-panel label{display:grid;gap:7px;margin:16px 0;color:#ffe1d5;font-size:12px}.rp-panel select{width:100%;padding:12px;background:#fff1e8;color:#492126;border:0;border-radius:10px;font:13px Pretendard,sans-serif}.rp-actions{display:flex;gap:10px;margin:20px 0 12px}.rp-actions button{flex:1;padding:14px;border:1px solid #914453;border-radius:13px;background:#41111b;color:#fff;font:700 14px Pretendard,sans-serif}.rp-actions .rp-primary{background:#ed3d2d;border-color:#ed3d2d}.rp-skip{display:block;margin:16px 0 0;padding:10px 0;border:0;background:transparent;color:#ffbf9f;text-decoration:underline;font:13px Pretendard,sans-serif}.rp-panel small{font-size:11px;color:#cda9ab}`;document.head.append(css);
    const isLanding=!!document.querySelector('.hero-primary');


  });
  document.addEventListener('keydown',e=>{if(root&&e.key==='Escape')close();if(root&&e.key==='Tab'){const nodes=[...root.querySelectorAll('button,select')];const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
})();
