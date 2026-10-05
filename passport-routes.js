(() => {
  const VISITED_KEY = 'hongdaePassportVisited';
  const chapters = [
    { id: 'art', title: { ko: '손에 물감 묻는 날', en: 'Art supply day', zh: '沾上颜料的一天' }, types: ['artsupply'] },
    { id: 'live', title: { ko: '공연장 맨 앞줄', en: 'Front row at a live show', zh: '现场演出的第一排' }, types: ['liveclub'] },
    { id: 'night', title: { ko: '밤의 홍대 입문', en: 'Hongdae after dark', zh: '弘大夜生活入门' }, types: ['club'] }
  ];
  const copy = {
    ko: { passport:'🦋 홍대병 도감', passportNav:'🦋 도감', routeNav:'코스 추천', passportIntro:'‘가봤어요’는 본인이 남기는 개인 방문 기록이며 이 기기에만 저장됩니다. 업체가 확인한 공식 방문 인증은 아닙니다.', visited:'가봤어요', mark:'가봤어요 표시', progress:'내 방문 기록', close:'닫기', route:'내 홍대 코스', routeIntro:'관심사·동행·이동 범위를 고르면 등록된 태그와 장소 설명으로 코스를 만들어요. 선택하면 아래 코스가 바로 바뀌어요. 출발은 홍대입구역.', visitor:'처음 온 여행자', visitorDesc:'홍대의 공연·예술 공간부터', explorer:'새로운 곳 찾는 여행자', explorerDesc:'프랜차이즈 밖의 로컬 장소', student:'늘 다니던 길 밖으로', studentDesc:'내 취향에 맞는 새로운 장소', noTaste:'먼저 취향을 고르면 아직 가보지 않은 장소로 코스를 만들어요.', chooseTaste:'내 취향 고르기', routeNote:'등록 장소와 직선거리로 만든 탐색 순서입니다. 영업 여부·도보 시간·가격은 방문 전에 확인해 주세요.', start:'첫 장소 지도에서 보기', reason:'추천 이유', empty:'조건에 맞는 장소가 아직 없어요.' },
    en: { passport:'🦋 Hongdae Passport', passportNav:'🦋 Passport', routeNav:'Route ideas', passportIntro:'“Visited” is your personal log saved on this device. It is not an officially verified visit.', visited:'Visited', mark:'Mark visited', progress:'My visit log', close:'Close', route:'My Hongdae route', routeIntro:'Choose how you want to explore. We order tagged places by proximity.', visitor:'First-time visitor', visitorDesc:'Live music and creative spaces', explorer:'Beyond the chains', explorerDesc:'Local places beyond familiar brands', student:'Off your usual path', studentDesc:'New places matching your tastes', noTaste:'Choose your tastes first to build a route to places you have not visited.', chooseTaste:'Choose my tastes', routeNote:'An exploration order based on place tags and straight-line distance. Check opening hours, walking time and prices before you go.', start:'View first place on map', reason:'Why this place', empty:'No matching places yet.' },
    zh: { passport:'🦋 弘大探索图鉴', passportNav:'🦋 图鉴', routeNav:'路线推荐', passportIntro:'“去过”是保存在此设备的个人记录，并非商家核实的到访认证。', visited:'去过', mark:'标记去过', progress:'我的到访记录', close:'关闭', route:'我的弘大路线', routeIntro:'选择探索方式。路线按地点标签和距离排序。', visitor:'初次到访', visitorDesc:'演出与创意空间', explorer:'寻找新地方', explorerDesc:'连锁店之外的本地空间', student:'走出熟悉路线', studentDesc:'符合个人喜好的新地点', noTaste:'请先选择喜好，再推荐尚未去过的地点。', chooseTaste:'选择我的喜好', routeNote:'根据地点标签和直线距离生成探索顺序。营业时间、步行时间和价格请出发前确认。', start:'在地图上查看第一站', reason:'推荐原因', empty:'暂时没有符合条件的地点。' }
  };
  const language = () => copy[typeof currentLang === 'undefined' ? 'ko' : currentLang] || copy.ko;
  const badgeCopy = {
    ko: { earned:'획득', locked:'도전 중', badges:'획득한 배지', logged:'기록됨', achievement:'새 배지 획득!' },
    en: { earned:'Earned', locked:'In progress', badges:'Badges earned', logged:'Logged', achievement:'New badge earned!' },
    zh: { earned:'已获得', locked:'挑战中', badges:'已获徽章', logged:'已记录', achievement:'获得新徽章！' }
  };
  const badgeText = () => badgeCopy[typeof currentLang === 'undefined' ? 'ko' : currentLang] || badgeCopy.ko;
  const chapterIcon = { art:'🎨', live:'🎸', night:'🌙' };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const visitedIds = () => { try { return new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || '[]').map(Number)); } catch { return new Set(); } };
  const passportPlaces = () => stores.filter((place) => place.status !== 'closed' && (place.tags || []).includes('홍대병'));
  // Kakao category refresh can change type; keep passport chapters based on stable place identity and labels.
  const chapterPlaces = (chapter) => passportPlaces().filter((place) => {
    const label = `${place.name} ${place.category || ''}`;
    if (chapter.id === 'art') return place.type === 'artsupply' || /화방|미술용품|문구/.test(label);
    if (chapter.id === 'live') return /라이브|재즈|공연/.test(label);
    return !/화방|미술용품|문구|라이브|재즈|공연/.test(label);
  });
  const progress = () => ({ visited: passportPlaces().filter((place) => visitedIds().has(place.id)).length, total: passportPlaces().length });
  const radians = (degrees) => degrees * Math.PI / 180;
  function meters(a, b) {
    if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(a.lng) || !Number.isFinite(b.lat) || !Number.isFinite(b.lng)) return Infinity;
    const lat = radians(b.lat - a.lat), lng = radians(b.lng - a.lng);
    const h = Math.sin(lat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(lng / 2) ** 2;
    return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  const style = document.createElement('style');
  style.textContent = `
    .hs-overlay{position:fixed;inset:0;z-index:950;display:none;align-items:flex-end;justify-content:center;padding:12px;background:rgba(12,2,5,.75);font-family:Pretendard,sans-serif}.hs-overlay.open{display:flex}
    .hs-panel{width:min(100%,500px);max-height:min(86vh,780px);overflow:auto;padding:22px;border:1px solid var(--border);border-radius:24px;background:var(--bg);color:var(--text);box-shadow:0 20px 60px rgba(0,0,0,.4)}
    .hs-head{display:flex;align-items:center;gap:12px}.hs-head h2{flex:1;font-size:21px;margin:0}.hs-close{padding:8px 11px;border:1px solid var(--border);border-radius:99px;background:var(--surface);color:var(--text);font:700 12px Pretendard,sans-serif}
    .hs-intro{margin:12px 0 16px;color:var(--muted);font-size:12px;line-height:1.6}.hs-progress{height:7px;margin:10px 0 19px;border-radius:99px;background:var(--surface2);overflow:hidden}.hs-progress span{display:block;height:100%;background:var(--accent)}
    .hs-chapter{margin:15px 0}.hs-chapter h3{font-size:15px;margin:0 0 8px}.hs-chapter h3 small{float:right;color:var(--muted);font-size:11px}.hs-place{display:flex;align-items:center;gap:10px;margin:7px 0;padding:12px;border:1px solid var(--border);border-radius:14px;background:var(--surface)}.hs-place-info{flex:1;min-width:0}.hs-place-name{display:block;color:var(--text);font:700 13px Pretendard,sans-serif;cursor:pointer}.hs-place small{display:block;margin-top:4px;color:var(--muted);font-size:11px}.hs-stamp{flex:none;padding:8px 10px;border:1px solid var(--border);border-radius:99px;background:transparent;color:var(--muted);font:700 11px Pretendard,sans-serif}.hs-stamp.on{border-color:var(--accent);background:var(--accent);color:#fff}
    [data-route-questions] select{max-width:100%;padding:8px;border-radius:9px;border:1px solid var(--border);background:var(--surface);color:var(--text);font:13px Pretendard,sans-serif}[data-route-questions] label{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .hs-modes{display:grid;gap:9px}.hs-mode{width:100%;text-align:left;padding:15px;border:1px solid var(--border);border-radius:15px;background:var(--surface);color:var(--text);font:700 14px Pretendard,sans-serif}.hs-mode small{display:block;margin-top:5px;color:var(--muted);font-size:11px;font-weight:500}.hs-mode.on{border-color:var(--accent);box-shadow:inset 3px 0 var(--accent)}.hs-route-step{width:100%;display:flex;gap:11px;align-items:flex-start;margin:8px 0;padding:13px;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--text);text-align:left;font:700 13px Pretendard,sans-serif}.hs-route-step b{color:var(--accent2)}.hs-route-step span{min-width:0}.hs-route-step small{display:block;margin-top:5px;color:var(--muted);font-size:11px;font-weight:500}.hs-cta{width:100%;margin-top:13px;padding:13px;border:0;border-radius:12px;background:var(--accent);color:#fff;font:700 13px Pretendard,sans-serif}
    .hs-panel{background:linear-gradient(155deg,#321017 0%,var(--bg) 38%)}.hs-summary{display:flex;align-items:center;gap:14px;padding:15px 16px;border:1px solid #925363;border-radius:18px;background:radial-gradient(circle at 88% 5%,rgba(255,198,106,.17),transparent 48%),#421721}.hs-summary-mark{width:60px;height:60px;flex:none;display:grid;place-items:center;border:3px double #ffcf86;border-radius:50%;background:linear-gradient(145deg,#e94137,#7a1830);box-shadow:0 0 0 4px rgba(255,205,136,.12),0 8px 20px rgba(0,0,0,.25);color:#fff;font:900 23px Pretendard,sans-serif}.hs-summary strong{display:block;font-size:17px}.hs-summary small{display:block;margin-top:5px;color:#f3c8c2;font-size:11px}.hs-summary .hs-progress{margin:9px 0 0}.hs-summary .hs-progress span{background:linear-gradient(90deg,#f45748,#ffd27a)}
    .hs-chapter{padding:14px;border:1px solid #75424b;border-radius:18px;background:rgba(67,21,30,.72)}.hs-chapter-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}.hs-chapter-head h3{margin:2px 0 3px;font-size:15px}.hs-chapter-head small{display:block;color:#cda8a6;font-size:11px}.hs-chapter-kicker{color:#ffba8e;font-size:9px;font-weight:900;letter-spacing:.14em}.hs-chapter-state{margin-left:auto;flex:none;padding:5px 8px;border:1px solid #896368;border-radius:99px;color:#c7a5a7;font-size:10px;font-weight:800}.hs-chapter-state.on{border-color:#ffd27a;background:rgba(255,210,122,.16);color:#ffd27a}.hs-medal{position:relative;width:55px;height:55px;flex:none;display:grid;place-items:center;border:3px double #896870;border-radius:50%;background:linear-gradient(145deg,#5e3540,#2b1520);box-shadow:inset 0 3px 9px rgba(0,0,0,.28);filter:saturate(.55)}.hs-medal:before{content:'✦';position:absolute;top:-8px;right:-5px;color:#b8959a;font-size:16px}.hs-medal span{font-size:25px}.hs-medal.earned{border-color:#ffe0a0;background:linear-gradient(145deg,#ffcf70,#e84e3a 55%,#9c2441);box-shadow:0 0 0 4px rgba(255,209,122,.14),0 8px 20px rgba(250,113,61,.27);filter:none;animation:hs-badge-pop .48s ease-out}.hs-medal.earned:before{color:#ffe3a2}.hs-chapter-track{height:5px;margin:0 0 12px;border-radius:99px;background:#65343e;overflow:hidden}.hs-chapter-track span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#f45748,#ffd27a)}
    .hs-place{margin:7px 0;padding:11px;border-color:#7d4a54;background:#35151d}.hs-place.visited{border-color:#d99565;background:linear-gradient(100deg,rgba(166,65,54,.25),#35151d)}.hs-mini-badge{width:31px;height:31px;flex:none;display:grid;place-items:center;border:1px solid #946873;border-radius:50%;background:#4e2730;color:#cfadb1;font-size:15px}.hs-mini-badge.on{border-color:#ffda92;background:linear-gradient(145deg,#ffd279,#d93f37);color:#5b1a22;box-shadow:0 2px 10px rgba(255,188,97,.32)}.hs-place-name{appearance:none;background:transparent!important;border:0!important;padding:0!important;text-align:left!important;color:var(--text)!important;line-height:1.35}.hs-place-name:hover{text-decoration:underline}.hs-stamp{white-space:nowrap}.hs-stamp.on{background:#8d2837;border-color:#e7a770}.hs-achievement{margin:0 0 14px;padding:14px;border:1px solid #ffd27a;border-radius:14px;background:linear-gradient(115deg,#7d2633,#bf4e2b);color:#fff5dc;text-align:center;font-weight:900;box-shadow:0 8px 24px rgba(255,158,75,.3);animation:hs-badge-pop .45s ease-out}@keyframes hs-badge-pop{from{transform:scale(.7) rotate(-8deg);opacity:.2}to{transform:scale(1) rotate(0);opacity:1}}@media(prefers-reduced-motion:reduce){.hs-medal.earned,.hs-achievement{animation:none}}
    @media(min-width:701px){.hs-overlay{align-items:center}}
  `;
  document.head.append(style);
  const root = document.createElement('div');
  root.className = 'hs-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.addEventListener('click', (event) => { if (event.target === root) close(); });
  function close() { root.classList.remove('open'); }
  function show(content) {
    window.HongdaeDiscovery?.close?.();
    document.querySelector('.map-result-sheet')?.classList.remove('open');
    document.body.classList.remove('map-results-open');
    if (document.querySelector('#sidebar')?.classList.contains('open')) closeSidebar();
    root.innerHTML = `<section class="hs-panel">${content}</section>`;
    root.classList.add('open');
    root.querySelector('.hs-close').onclick = close;
    root.querySelector('.hs-close').focus();
  }
  const head = (title) => `<div class="hs-head"><h2>${escapeHtml(title)}</h2><button type="button" class="hs-close">${escapeHtml(language().close)} ✕</button></div>`;
  function openPassport() {
    const t = language(), b = badgeText(), visited = visitedIds(), p = progress();
    const earned = chapters.filter((chapter) => { const places = chapterPlaces(chapter); return places.length > 0 && places.every((place) => visited.has(place.id)); }).length;
    const sections = chapters.map((chapter, index) => {
      const places = chapterPlaces(chapter);
      const done = places.filter((place) => visited.has(place.id)).length;
      const complete = places.length > 0 && done === places.length;
      return `<section class="hs-chapter"><div class="hs-chapter-head"><div class="hs-medal ${complete ? 'earned' : ''}" aria-hidden="true"><span>${chapterIcon[chapter.id]}</span></div><div><span class="hs-chapter-kicker">CHAPTER ${String(index + 1).padStart(2,'0')}</span><h3>${escapeHtml(chapter.title[currentLang] || chapter.title.ko)}</h3><small>${done}/${places.length}</small></div><span class="hs-chapter-state ${complete ? 'on' : ''}">${escapeHtml(complete ? b.earned : b.locked)}</span></div><div class="hs-chapter-track"><span style="width:${places.length ? Math.round(done / places.length * 100) : 0}%"></span></div>${places.map((place) => { const logged = visited.has(place.id); return `<div class="hs-place ${logged ? 'visited' : ''}"><span class="hs-mini-badge ${logged ? 'on' : ''}" aria-hidden="true">${logged ? '★' : '◇'}</span><div class="hs-place-info"><button type="button" class="hs-place-name" data-place="${place.id}">${escapeHtml(place.name)}</button><small>${escapeHtml(place.dong || '홍대')} · ${escapeHtml(place.category || place.type)}</small></div><button type="button" class="hs-stamp ${logged ? 'on' : ''}" data-stamp="${place.id}" aria-pressed="${logged}">${escapeHtml(logged ? b.logged : t.mark)}</button></div>`; }).join('')}</section>`;
    }).join('');
    show(`${head(t.passport)}<p class="hs-intro">${escapeHtml(t.passportIntro)}</p><div class="hs-summary"><div class="hs-summary-mark" aria-hidden="true">${earned}✦</div><div style="flex:1;min-width:0"><strong>${escapeHtml(b.badges)} ${earned}/${chapters.length}</strong><small>${escapeHtml(t.progress)} ${p.visited}/${p.total}</small><div class="hs-progress"><span style="width:${p.total ? Math.round(p.visited / p.total * 100) : 0}%"></span></div></div></div>${sections}`);
    root.querySelectorAll('[data-stamp]').forEach((button) => button.onclick = () => {
      const ids = visitedIds(), id = Number(button.dataset.stamp);
      const before = chapters.filter((chapter) => { const places = chapterPlaces(chapter); return places.length > 0 && places.every((place) => ids.has(place.id)); }).length;
      if (ids.has(id)) ids.delete(id); else ids.add(id);
      localStorage.setItem(VISITED_KEY, JSON.stringify([...ids]));
      openPassport();
      const after = chapters.filter((chapter) => { const places = chapterPlaces(chapter); return places.length > 0 && places.every((place) => ids.has(place.id)); }).length;
      if (after > before) { const banner = document.createElement('div'); banner.className = 'hs-achievement'; banner.setAttribute('role','status'); banner.textContent = `✦ ${badgeText().achievement} ✦`; root.querySelector('.hs-panel')?.prepend(banner); }
    });
    root.querySelectorAll('[data-place]').forEach((button) => button.onclick = () => { close(); selectStore(Number(button.dataset.place)); });
  }

  const modes = [
    { id:'visitor', title:'visitor', detail:'visitorDesc' },
    { id:'explorer', title:'explorer', detail:'explorerDesc' },
    { id:'student', title:'student', detail:'studentDesc' }
  ];
  const preferred = (place) => (place.tags || []).filter((tag) => userTastes.includes(tag));
  function baseScore(place, mode, visited) {
    const tags = place.tags || [];
    const taste = preferred(place).length;
    if (mode === 'visitor') return (tags.includes('홍대병') ? 7 : 0) + (['artsupply','liveclub'].includes(place.type) ? 5 : 0) + taste;
    if (mode === 'explorer') return (tags.includes('로컬단골') ? 6 : 0) + (tags.includes('노포') ? 5 : 0) + (tags.includes('홍대병') ? 2 : 0) + taste;
    return taste * 5 + (!visited.has(place.id) ? 4 : 0) + (tags.includes('홍대병') ? 1 : 0);
  }
  const routeThemes = {
    all:{title:'취향대로 둘러보기',pattern:null},
    geek:{title:'덕후 루트',pattern:/애니메|피규어|굿즈|만화|보드게임/},
    vintage:{title:'빈티지 & 구제 루트',pattern:/빈티지|구제|중고의류/},
    books:{title:'독립출판 & 바이닐 투어',pattern:/독립출판|독립서점|책방|바이닐|LP|음반|레코드/},
    music:{title:'라이브 & 음악 루트',pattern:/라이브|재즈|공연|음악|LP|바이닐/}
  };
  const initialPreferences=window.HongdaeRecommendations?.profile();
  let routeAnswers = {theme:'all',stops:3,walk:initialPreferences?.walk||1200,company:initialPreferences?.company||'solo',newOnly:initialPreferences?.explore==='new',food:false};
  window.addEventListener('hongdae:preferences-change',()=>{const p=window.HongdaeRecommendations.profile();routeAnswers={...routeAnswers,walk:p.walk,company:p.company,newOnly:p.explore==='new'};});
  let routeVariation = 0;
  const themeMatches = place => (routeAnswers.theme==='geek' && (place.tags||[]).includes('덕후')) || !routeThemes[routeAnswers.theme]?.pattern || routeThemes[routeAnswers.theme].pattern.test(`${place.name} ${(place.tags||[]).join(' ')} ${place.insight||''} ${/^기타/.test(place.category||'')?'':place.category||''}`);
  function buildRoute(mode) {
    const visited = visitedIds();
    const candidates = stores.filter(place => (!window.HongdaeRecommendations || window.HongdaeRecommendations.eligible(place)) && place.status !== 'closed' && Number.isFinite(place.lat) && Number.isFinite(place.lng) && !isFranchise(place) && (!routeAnswers.newOnly || !visited.has(place.id)) && (mode !== 'student' || !visited.has(place.id)) && (themeMatches(place) || (routeAnswers.food && place.type === 'restaurant')));
    const route = [], start = {lat:37.556670,lng:126.923610};
    for (let step=0;step<routeAnswers.stops;step++) {
      const anchor=route.at(-1)||start;
      const wantsFood=routeAnswers.food && step===routeAnswers.stops-1;
      const ranked=candidates.filter(place=>!route.some(p=>p.id===place.id) && meters(anchor,place)<=routeAnswers.walk && (wantsFood ? place.type==='restaurant' : themeMatches(place))).map(place=>{
        const companyTag=routeAnswers.company==='solo'?'혼밥':routeAnswers.company==='date'?'데이트':'시끌벅적';
        const variety=((place.id%997+routeVariation*137)%997)/997*6;
        return {place,score:baseScore(place,mode,visited)+(window.HongdaeRecommendations?.score(place)||0)+(place.tags||[]).includes(companyTag)*3+preferred(place).length*2-meters(anchor,place)/350+variety};
      }).sort((a,b)=>b.score-a.score || a.place.id-b.place.id);
      if(!ranked.length)break;
      route.push(ranked[0].place);
    }
    return route;
  }
  function reason(place, mode) {
    const tags = preferred(place);
    const personalReasons=window.HongdaeRecommendations?.explain(place)||[];
    if(personalReasons.length)return personalReasons.join(' · ');
    if (routeAnswers.theme !== 'all' && themeMatches(place)) return `${routeThemes[routeAnswers.theme].title}${tags.length ? ' · #'+tags.join(' #') : ''}`;
    if (mode === 'student' && tags.length) return `#${tags.join(' #')}`;
    const source = (place.tags || []).find((tag) => mode === 'visitor' ? tag === '홍대병' : mode === 'explorer' ? ['로컬단골','노포'].includes(tag) : tag === '홍대병');
    return source ? `#${source}` : place.category || place.type;
  }
  function routeChoice(name,title,options){return `<fieldset class="route-choice"><legend>${escapeHtml(title)}</legend><input type="hidden" name="${name}" value="${escapeHtml(routeAnswers[name])}"><div>${options.map(([value,label])=>`<button type="button" data-answer="${name}" data-value="${escapeHtml(value)}" aria-pressed="${String(routeAnswers[name])===String(value)}">${escapeHtml(label)}</button>`).join('')}</div></fieldset>`;}
  function openRoute(mode = 'visitor') {
    const t = language(), route = buildRoute(mode);
    const modeButtons = modes.map((item) => `<button type="button" class="hs-mode ${mode === item.id ? 'on' : ''}" data-mode="${item.id}" aria-pressed="${mode === item.id}">${escapeHtml(t[item.title])}<small>${escapeHtml(t[item.detail])}</small></button>`).join('');
    const steps = route.map((place, index) => `<button type="button" class="hs-route-step" data-place="${place.id}"><b>${index + 1}</b><span>${escapeHtml(place.name)}<small>${escapeHtml(place.dong || '홍대')} · ${escapeHtml(place.category || place.type)} · ${escapeHtml(t.reason)}: ${escapeHtml(reason(place, mode))}</small></span></button>`).join('');
    const questions = `<button type="button" class="hs-action" data-choose-taste>내 취향 선택·수정 (선택)</button><form data-route-questions style="display:grid;gap:12px;margin-top:16px;font:13px Pretendard,sans-serif">
      ${routeChoice('theme','무엇을 찾아볼까요?',Object.entries(routeThemes).map(([id,v])=>[id,v.title]))}
      ${routeChoice('stops','몇 곳이 좋을까요?',[[2,'2곳'],[3,'3곳'],[4,'4곳']])}
      ${routeChoice('company','누구와 함께하나요?',[['solo','🙋 혼자'],['date','💕 데이트'],['friends','👯 친구들과']])}
      ${routeChoice('walk','얼마나 걸어볼까요?',[[600,'가까운 골목 · 600m'],[1200,'동네 산책 · 1.2km'],[2200,'넓게 탐험 · 2.2km']])}
      <label><input type="checkbox" name="newOnly" ${routeAnswers.newOnly?'checked':''}> 가봤어요 표시한 곳 제외</label>
      <label><input type="checkbox" name="food" ${routeAnswers.food?'checked':''}> 마지막에 식사 한 곳 추가</label>
      <button type="submit" class="hs-cta">이 조건으로 코스 만들기</button>
    </form>`;
    show(`${head(t.route)}<p class="hs-intro">${escapeHtml(t.routeIntro)}</p><div class="hs-modes">${modeButtons}</div>${questions}${mode === 'student' && !userTastes.length && routeAnswers.theme === 'all' ? `<p class="hs-intro">${escapeHtml(t.noTaste)}</p><button type="button" class="hs-cta" data-choose-taste>${escapeHtml(t.chooseTaste)}</button>` : `<div style="margin-top:18px">${steps || `<p class="hs-intro">${escapeHtml(t.empty)}</p>`}</div>`}<p class="hs-intro">${escapeHtml(t.routeNote)}</p>${route.length < routeAnswers.stops ? '<p class="hs-intro">등록 정보와 이동 범위에 맞는 장소가 부족해 가능한 곳만 표시해요.</p>' : ''}<button type="button" class="hs-cta" data-other>다른 코스 보기</button>${route.length ? `<button type="button" class="hs-cta" data-start>${escapeHtml(t.start)}</button>` : ''}`);
    root.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{const name=button.dataset.answer;routeAnswers[name]=['stops','walk'].includes(name)?Number(button.dataset.value):button.dataset.value;routeVariation=0;openRoute(mode);root.querySelector(`[data-answer="${name}"][aria-pressed="true"]`)?.focus();});
    root.querySelectorAll('[data-route-questions] input[type="checkbox"]').forEach(input=>input.onchange=()=>{routeAnswers[input.name]=input.checked;routeVariation=0;openRoute(mode);root.querySelector(`[name="${input.name}"]`)?.focus();});

    root.querySelector('[data-route-questions]').onsubmit = event => { event.preventDefault(); const f=event.currentTarget.elements; routeAnswers={theme:f.theme.value,stops:Number(f.stops.value),walk:Number(f.walk.value),company:f.company.value,newOnly:f.newOnly.checked,food:f.food.checked}; routeVariation=0; openRoute(mode); };
    root.querySelector('[data-other]').onclick=()=>{routeVariation++;openRoute(mode);};
    root.querySelectorAll('[data-mode]').forEach((button) => button.onclick = () => openRoute(button.dataset.mode));
    root.querySelectorAll('[data-place]').forEach((button) => button.onclick = () => { close(); selectStore(Number(button.dataset.place)); });
    root.querySelector('[data-start]')?.addEventListener('click', () => { close(); selectStore(route[0].id); });
    root.querySelectorAll('[data-choose-taste]').forEach(button=>button.addEventListener('click', () => { close(); window.HongdaeRecommendations?.open({destination:'course'}); }));
  }
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.addEventListener('DOMContentLoaded', () => {
    document.body.append(root);

  });
  window.HongdaeSpecial = { openPassport, openRoute, progress, buildRoute, close };
})();
