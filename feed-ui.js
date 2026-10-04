(() => {
  const css=document.createElement('style');css.textContent=`.hf-feed{display:none;position:fixed;inset:0;z-index:850;background:#2b070c;color:#f5ece7;font-family:Pretendard,sans-serif;overflow:auto}.hf-feed.open{display:block}.hf-head{position:sticky;top:0;z-index:1;padding:calc(16px + env(safe-area-inset-top)) 18px 14px;background:rgba(43,7,12,.97);border-bottom:1px solid #4f151e}.hf-head-top{display:flex;align-items:center;gap:10px}.hf-close{margin-left:auto;height:36px;padding:0 12px;border:1px solid #7a2534;border-radius:99px;background:#3d0f16;color:#f5ece7;font:700 12px Pretendard,sans-serif}.hf-title{margin:0;font-size:22px;letter-spacing:-.04em}.hf-sub{margin:5px 0 0;color:#c39298;font-size:12px}.hf-filter{display:flex;gap:7px;overflow:auto;margin-top:14px}.hf-filter button{white-space:nowrap;padding:7px 11px;border:1px solid #7a2534;border-radius:99px;background:#3d0f16;color:#c39298;font:600 11px Pretendard,sans-serif}.hf-filter button.on{border-color:#e8362a;background:#e8362a;color:#fff}.hf-list{padding:16px 18px calc(100px + env(safe-area-inset-bottom))}.hf-section{display:flex;align-items:center;gap:8px;margin:0 0 10px}.hf-section b{font-size:12px;color:#ff8a7a}.hf-section span{flex:1;height:1px;background:#4f151e}.hf-card{width:100%;margin-bottom:10px;padding:0;border:1px solid #7a2534;border-radius:18px;overflow:hidden;background:#3d0f16;color:#f5ece7;text-align:left}.hf-card-main{padding:14px}.hf-match{float:right;color:#ff8a7a;font:800 11px monospace}.hf-name{font-size:15px;font-weight:800}.hf-meta{margin-top:5px;color:#c39298;font-size:11px}.hf-tags{margin-top:10px;color:#ff93a2;font-size:11px}.hf-card.featured{border-color:#e8362a;box-shadow:0 8px 24px rgba(232,54,42,.16)}.hf-card.featured .hf-photo{height:82px;background:linear-gradient(135deg,#7d2937,#2b070c);display:grid;place-items:center;font-size:30px}`;document.head.append(css);
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let section='today', generation=0;
  const seasonalMenu = s => {
    const month=Number(new Intl.DateTimeFormat('en-US',{month:'numeric',timeZone:'Asia/Seoul'}).format(new Date()));
    const pattern=month>=10 || month<=3 ? /라멘|국밥|갈비탕|설렁탕|곰탕|매운탕|닭도리탕|감자탕|찌개|전골|우동|짬뽕|떡국/ : /냉면|빙수|아이스|냉소바|메밀소바/;
    const menus=[...(s.surveyMenu?.menu||[]).map(m=>m[0]),...(s.signatureMenu||'').split(/[,/]/)].map(n=>n.trim()).filter(n=>pattern.test(n));
    return [...new Set(menus)].slice(0,2).join(' · ');
  };
  const seasonal=s=>Boolean(seasonalMenu(s));
  function card(s,reason){return `<button class="hf-card" data-id="${s.id}"><div class="hf-card-main"><div class="hf-name">${escape(s.name)}</div><div class="hf-meta">${escape(s.category||TYPES[s.type]||'홍대 장소')} · ${escape(s.dong||'홍대')}</div><div class="hf-meta">${escape(reason)}</div><div class="hf-tags">${(s.tags||[]).slice(0,4).map(t=>'#'+escape(t)).join(' ')}</div></div></button>`}
  async function open(){
    const token=++generation;
    let root=document.querySelector('.hf-feed');if(!root){root=document.createElement('section');root.className='hf-feed';document.body.append(root)}
    const all=stores.filter(s=>s.status!=='closed' && Number.isFinite(s.lat));
    const personal=all.filter(s=>userTastes.some(t=>(s.tags||[]).includes(t))).sort((a,b)=>matchScore(b)-matchScore(a));
    const season=all.filter(seasonal), saved=all.filter(s=>bookmarks[s.id]);
    root.innerHTML=`<header class="hf-head"><div class="hf-head-top"><div><h2 class="hf-title">홍대에서 오늘</h2><p class="hf-sub">새 소식 · 계절 메뉴 · 내 취향</p></div><button class="hf-close" aria-label="피드를 닫고 지도로 돌아가기">← 지도</button></div><div class="hf-filter">${[['today','오늘 소식'],['season','계절 메뉴'],['taste','내 취향'],['saved','저장한 곳']].map(([id,title])=>`<button data-section="${id}" class="${section===id?'on':''}">${title}</button>`).join('')}</div></header><main class="hf-list"></main>`;
    const list=root.querySelector('.hf-list');
    if(section==='season')list.innerHTML=`<div class="hf-section"><b>지금 계절에 어울리는 메뉴</b><span></span></div><p class="hf-sub" style="margin-bottom:16px">등록된 메뉴를 기준으로 골랐어요. 판매 여부는 업체에서 확인해 주세요.</p>${season.slice(0,18).map(s=>card(s,seasonalMenu(s))).join('')||'<p>조건에 맞는 메뉴가 아직 없어요.</p>'}`;
    else if(section==='taste')list.innerHTML=`<div class="hf-section"><b>내 취향에 맞는 곳</b><span></span></div>${personal.slice(0,18).map(s=>card(s,'선택한 취향: '+userTastes.filter(t=>(s.tags||[]).includes(t)).join(' · '))).join('')||'<p>내 프로필에서 취향을 선택해 주세요.</p><button class="hf-close" data-profile>취향 선택하기</button>'}`;
    else if(section==='saved')list.innerHTML=`<div class="hf-section"><b>저장한 곳 다시 보기</b><span></span></div>${saved.map(s=>card(s,'내가 저장한 장소')).join('')||'<p>아직 저장한 장소가 없어요.</p>'}`;
    else list.innerHTML='<p class="hf-sub">공식 행사 소식을 확인하고 있어요.</p>';
    root.querySelector('.hf-close').onclick=()=>{generation++;root.classList.remove('open')};
    root.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{section=b.dataset.section;open()});
    const bind=()=>{root.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{generation++;root.classList.remove('open');selectStore(Number(b.dataset.id))});root.querySelector('[data-profile]')?.addEventListener('click',()=>{root.classList.remove('open');window.HongdaeExperience?.openProfile()})};
    bind();root.classList.add('open');
    if(section==='today'){
      try{
        const data=await Promise.all(['data/feed-events.json','data/hongik-exhibitions.json'].map(url=>fetch(url).then(r=>r.json())));
        if(token!==generation)return;
        const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul'}).format(new Date());
        const events=data.flatMap(d=>d.events||[]).filter(e=>e.dateEnd>=today && e.link && /^https:\/\//.test(e.link)).sort((a,b)=>a.dateStart.localeCompare(b.dateStart));
        list.innerHTML=`<div class="hf-section"><b>업체 이벤트 & 홍익대 전시</b><span></span></div>${events.map(e=>`<article class="hf-card"><div class="hf-card-main"><div class="hf-name">${escape(e.title)}</div><div class="hf-meta">${escape(e.dateStart)} ~ ${escape(e.dateEnd)} · ${escape(e.location)}</div><p class="hf-sub">${escape(e.description||'')}</p><a href="${escape(e.link)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:12px;color:#ff8a7a">공식 공지 보기 ↗</a></div></article>`).join('')||'<p class="hf-sub" style="margin-bottom:18px">공식 공지로 확인된 진행·예정 행사가 아직 없어요. 매주 월요일 확인해요.</p>'}<div class="hf-section"><b>계절 메뉴로 둘러보기</b><span></span></div>${season.slice(0,5).map(s=>card(s,seasonalMenu(s))).join('')}`;bind();
      }catch{if(token===generation)list.innerHTML='<p>행사 소식을 불러오지 못했어요. 잠시 후 다시 열어 주세요.</p>'}
    }
  }
  window.HongdaeFeed={open};
})();
