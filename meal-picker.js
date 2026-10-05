(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const menus=(s,limit)=>(s.surveyMenu?.menu||[]).filter(([n,p])=>Number.isFinite(p)&&p>0&&p<=limit&&/라멘|우동|국수|냉면|덮밥|볶음밥|비빔밥|국밥|곰탕|설렁탕|찌개|백반|정식|돈까스|돈카츠|버거|샌드위치|오니기리|주먹밥|김밥|카레|소바|짜장|짬뽕|토스트/.test(n)&&!/추가|공기밥|사이드|감자튀김|음료|2인|3인|4인|인 이상|미니|고기\s*마요|곁들임|회원가|세트 추가/.test(n)&&!(/떡볶이/.test(s.name+' '+(s.category||''))&&/볶음밥/.test(n)));
  function candidates(limit=10000,dong='',solo=false){return stores.filter(s=>s.type==='restaurant'&&s.status!=='closed'&&(!dong||s.dong===dong)&&(!solo||(s.tags||[]).includes('혼밥'))&&(!(typeof indieOnly!=='undefined'&&indieOnly)||!isFranchise(s))).map(s=>({store:s,menu:menus(s,limit)})).filter(x=>x.menu.length).sort((a,b)=>Math.min(...a.menu.map(m=>m[1]))-Math.min(...b.menu.map(m=>m[1])));}
  let root,limit=10000,dong='',solo=false,lastId=null,timer;
  function close(){clearInterval(timer);root?.remove();root=null;document.querySelector('.meal-map-button')?.focus();}
  function render(){
    const list=candidates(limit,dong,solo);
    const dongs=[...new Set(stores.filter(s=>s.type==='restaurant').map(s=>s.dong).filter(Boolean))];
    root.innerHTML=`<section class="meal-panel"><div class="meal-head"><h2>🍚 오늘 뭐 먹지?</h2><button data-close aria-label="식사 추천 닫기">닫기 ✕</button></div><p>점심도 저녁도, 동네에서 가볍게 한 끼.</p><div class="meal-filters"><select aria-label="식사 예산"><option value="7000">7천 원 이하</option><option value="9000">9천 원 이하</option><option value="10000">만 원 이하</option><option value="15000">1만 5천 원 이하</option></select><select aria-label="식사 동네"><option value="">동네 전체</option>${dongs.map(d=>`<option>${esc(d)}</option>`).join('')}</select><button data-solo aria-pressed="${solo}">혼밥 ${solo?'✓':''}</button></div><p>등록된 1인 식사 메뉴 기준 · ${list.length}곳. 점심·저녁 영업 여부와 현재 가격은 상세에서 확인해 주세요.</p><button class="meal-pick" ${list.length?'':'disabled'}>🎲 식사 돌림판 · 골라줘!</button><p class="meal-status" aria-live="polite"></p><div>${list.length?list.map(({store:s,menu})=>`<button class="meal-item" data-place="${s.id}">${esc(s.name)}<small>${esc(s.dong||'홍대')} · ${menu.slice(0,2).map(([n,p])=>esc(n)+' '+p.toLocaleString('ko-KR')+'원').join(' / ')}</small><small>${esc(s.surveyMenu?.checked||'확인일 미기재')} 등록 정보</small></button>`).join(''):'<p>확인된 가격으로 조건에 맞는 식당이 없어요. 예산이나 동네를 바꿔보세요.</p>'}</div></section>`;
    const selects=root.querySelectorAll('select');selects[0].value=String(limit);selects[1].value=dong;
    selects[0].onchange=e=>{limit=Number(e.target.value);render()};selects[1].onchange=e=>{dong=e.target.value;render()};
    root.querySelector('[data-close]').onclick=close;root.querySelector('[data-solo]').onclick=()=>{solo=!solo;render()};
    root.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.place);close();selectStore(id)});
    root.querySelector('.meal-pick').onclick=()=>{
      const pool=list.length>1?list.filter(x=>x.store.id!==lastId):list; if(!pool.length)return;
      const result=pool[Math.floor(Math.random()*pool.length)].store;lastId=result.id;
      const button=root.querySelector('.meal-pick'),status=root.querySelector('.meal-status');button.disabled=true;
      let frame=0;const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      function finish(){clearInterval(timer);status.textContent='오늘의 한 끼: '+result.name;root.querySelectorAll('.meal-item').forEach(b=>b.classList.toggle('selected',Number(b.dataset.place)===result.id));button.disabled=false;root.querySelector(`[data-place="${result.id}"]`)?.scrollIntoView({block:'nearest',behavior:reduced?'auto':'smooth'});}
      if(reduced){finish();return;}
      timer=setInterval(()=>{status.textContent='고르는 중 · '+pool[frame%pool.length].store.name;if(++frame>=10)finish()},80);
    };
  }
  function open(){close();root=document.createElement('div');root.className='meal-dialog';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','오늘 뭐 먹지?');document.body.append(root);render();root.querySelector('[data-close]').focus();}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root)close()});
  document.addEventListener('DOMContentLoaded',()=>{const parent=document.getElementById('btn-curated-feed')?.parentElement;if(!parent)return;const b=document.createElement('button');b.className='meal-map-button';b.textContent='🍚 오늘 뭐 먹지?';b.onclick=e=>{e.stopPropagation();open()};parent.append(b)});
  window.HongdaeMeals={open,candidates};
})();
