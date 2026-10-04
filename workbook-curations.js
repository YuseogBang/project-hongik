(() => {
  const DATA_URL = './data/hongdae-board-venues.json';
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const normalize = (value) => String(value || '').replace(/[^0-9a-zA-Z가-힣]/g, '').toLowerCase();
  const roadKey = (value) => {
    const match = String(value || '').match(/([가-힣0-9]+(?:로|길))\s*([0-9]+(?:-[0-9]+)?)(?:\s|$)/);
    return match ? normalize(match[1] + match[2]) : '';
  };
  const usable = (value) => value && !/확인 불가|미기재|검색되지 않음|미조회/.test(value);
  const cleanName = (name) => String(name).replace(/\s*\([^)]*게시글[^)]*\)/g, '').trim();
  const group = (row) => /클럽|공연장|방탈출|보드게임/.test(row.category) ? '문화·놀이' : /술집|주점|바\b|호프|맥주|이자카야|포차/.test(row.category) ? '주점' : /카페|커피|디저트|베이커리|제과/.test(row.category) ? '카페' : '식사';
  const mapType = (row) => /클럽/.test(row.category) ? 'club' : /공연장/.test(row.category) ? 'liveclub' : /방탈출|보드게임/.test(row.category) ? 'play' : group(row) === '주점' ? 'bar' : group(row) === '카페' ? 'cafe' : 'restaurant';
  let dataPromise, records = [], query = '', selectedGroup = '전체', shown = 35, honorOnly = false;
  const style = document.createElement('style');
  style.textContent = `
    .wb-overlay{position:fixed;inset:0;z-index:970;display:none;align-items:flex-end;justify-content:center;padding:12px;background:rgba(12,2,5,.72);font-family:Pretendard,sans-serif}.wb-overlay.open{display:flex}
    .wb-panel{width:min(100%,550px);max-height:87vh;display:flex;flex-direction:column;padding:20px;border:1px solid var(--border);border-radius:24px;background:var(--bg);color:var(--text)}.wb-head{display:flex;align-items:center;gap:12px}.wb-head h2{flex:1;margin:0;font-size:21px}.wb-close{padding:8px 11px;border:1px solid var(--border);border-radius:99px;background:var(--surface);color:var(--text);font:700 12px Pretendard,sans-serif}
    .wb-intro,.wb-status{color:var(--muted);font-size:11px;line-height:1.55}.wb-intro{margin:12px 0}.wb-search{width:100%;box-sizing:border-box;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--text);font:500 13px Pretendard,sans-serif}.wb-tabs{display:flex;gap:6px;margin:11px 0}.wb-tabs button{flex:1;padding:8px 5px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--muted);font:700 11px Pretendard,sans-serif}.wb-tabs button.on{border-color:var(--accent);background:var(--accent);color:#fff}.wb-results{overflow:auto;min-height:0}.wb-place{width:100%;display:block;margin:7px 0;padding:13px;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--text);text-align:left;font:700 14px Pretendard,sans-serif}.wb-place small{display:block;margin-top:5px;color:var(--muted);font-size:11px;font-weight:500;line-height:1.45}.wb-place em{float:right;color:var(--accent2);font-size:10px;font-style:normal}.wb-more{width:100%;padding:11px;border:1px solid var(--border);border-radius:11px;background:var(--surface2);color:var(--text);font:700 12px Pretendard,sans-serif}
    @media(min-width:701px){.wb-overlay{align-items:center}}
  `;
  document.head.append(style);
  const root = document.createElement('div');
  root.className = 'wb-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.addEventListener('click', (event) => { if (event.target === root) close(); });
  function close() { root.classList.remove('open'); }
  function attach(row, store) {
    store.boardResearch = row;
    if(row.hallOfFame&&store.status!=='closed'){store.certifications=Array.from(new Set([...(store.certifications||[]),'홍대생 명예학식']));store.hallOfFameBasis=row.hallOfFameBasis;}
    if (!store.hours && usable(row.hours)) {
      store.hours = row.hours;
      store.hoursNote = '게시판 업체 정리 · 2026-10-04 조사, 방문 전 확인';
    }
    if (!store.signatureMenu && usable(row.menu)) {
      store.signatureMenu = row.menu;
      store.menuSourceNote = '게시판 업체 정리 · 2026-10-04 조사';
    }
  }
  async function load() {
    if (!dataPromise) dataPromise = fetch(DATA_URL).then((response) => {
      if (!response.ok) throw new Error('업체 목록을 불러오지 못했어요.');
      return response.json();
    }).then((rows) => {
      records = rows;
      rows.filter((row) => row.existing).forEach((row) => {
        const store = stores.find((entry) => entry.id === row.id);
        if (store) attach(row, store);
      });
      if(typeof renderAll==='function')renderAll();
      return rows;
    }).catch((error) => { dataPromise = null; throw error; });
    return dataPromise;
  }
  function matchesPlace(place, row) {
    const wanted = normalize(cleanName(row.name));
    const found = normalize(place.place_name);
    const nameMatches = found === wanted || (wanted.length >= 4 && (found.includes(wanted) || wanted.includes(found)));
    const wantedRoad = roadKey(row.address);
    const foundRoad = roadKey(place.road_address_name || place.address_name);
    return nameMatches && (!wantedRoad || wantedRoad === foundRoad);
  }
  function searchKakao(row) {
    return new Promise((resolve) => {
      if (!window.kakao?.maps?.services?.Places) return resolve({ error: '카카오 지도를 불러오지 못했어요.' });
      new kakao.maps.services.Places().keywordSearch(`${cleanName(row.name)} 마포구`, (places, status) => {
        if (status === kakao.maps.services.Status.ERROR) return resolve({ error: '카카오 장소 검색을 잠시 이용할 수 없어요.' });
        resolve({ place: (status === kakao.maps.services.Status.OK ? places : []).find((place) => matchesPlace(place, row)) });
      }, { size: 15 });
    });
  }
  async function choose(row, button) {
    if (row.status === 'closed') return;
    const existing = stores.find((store) => store.id === row.id);
    if (existing) { close(); window.HongdaeDiscovery?.close?.(); selectStore(existing.id); return; }
    button.disabled = true;
    const previous = button.innerHTML;
    button.textContent = `${row.name} · 카카오 지도에서 확인 중…`;
    const result = await searchKakao(row);
    if (!root.classList.contains('open')) return;
    if (!result.place) {
      button.innerHTML = previous;
      button.disabled = false;
      root.querySelector('.wb-status').textContent = result.error || `${row.name}: 상호와 주소가 일치하는 카카오 장소를 찾지 못해 지도 등록을 보류했어요.`;
      return;
    }
    const place = result.place;
    let store = stores.find((entry) => String(entry.kakaoId) === String(place.id));
    if (!store) {
      const address = place.road_address_name || place.address_name;
      store = { id:row.id, name:place.place_name, type:mapType(row),
        status:'unverified', lat:Number(place.y), lng:Number(place.x), address,
        dong:(place.address_name || '').match(/(서교동|연남동|합정동|상수동|동교동)/)?.[1] || '홍대',
        category:place.category_name || row.category, kakaoId:place.id, kakaoUrl:place.place_url,
        naverUrl:`https://map.naver.com/p/search/${encodeURIComponent(place.place_name + ' ' + address)}`,
        rating:null, reviews:null, months:null, rent:null, score:null, tags:[],
        insight:'게시판 추천 업체입니다. 카카오 장소 검색으로 상호와 주소를 대조했습니다. 방문 전에 영업 여부를 확인해 주세요.' };
      stores.push(store);
      if (typeof renderAll === 'function') renderAll();
    }
    attach(row, store);
    close(); window.HongdaeDiscovery?.close?.(); selectStore(store.id);
  }
  function renderList() {
    const filtered = records.filter((row) => (!honorOnly || row.hallOfFame) && (selectedGroup === '전체' || group(row) === selectedGroup) && normalize(`${row.name} ${row.category} ${row.menu}`).includes(normalize(query))).sort((a,b)=>(b.mentions||0)-(a.mentions||0)||a.name.localeCompare(b.name,'ko'));
    const host = root.querySelector('.wb-results');
    host.innerHTML = `<p class="wb-status">${filtered.length}곳 · 언급 글 수 순 · 영업시간과 메뉴는 2026-10-04 조사 자료</p>${filtered.slice(0, shown).map((row) => `<button type="button" class="wb-place" data-row="${row.id}" ${row.status === 'closed' ? 'disabled' : ''}>${escapeHtml(row.name)}<em>${row.status === 'closed' ? '폐업 기록' : row.mentions ? `${row.mentions}회 언급(자료별 최대)` : '게시판 수집'}</em><small>${escapeHtml(row.category)} · ${escapeHtml(row.address || '주소 미확인')}</small></button>`).join('')}${filtered.length > shown ? '<button type="button" class="wb-more">더 보기</button>' : ''}`;
    host.querySelectorAll('[data-row]').forEach((button) => button.onclick = () => choose(records.find((row) => row.id === Number(button.dataset.row)), button));
    host.querySelector('.wb-more')?.addEventListener('click', () => { shown += 35; renderList(); });
  }
  function render() {
    root.innerHTML = `<section class="wb-panel"><div class="wb-head"><h2>🍽️ ${honorOnly?'홍대생 명예학식':'홍대생 맛집 게시판'}</h2><button type="button" class="wb-close">닫기 ✕</button></div><p class="wb-intro">사용자가 제공한 게시판 정리 ${records.length}곳입니다. 새 장소는 누를 때 카카오 검색으로 상호와 주소를 대조합니다. 중복 기간의 언급 수는 합산하지 않았습니다. 명예학식은 자주 언급 업체 시트의 3회 이상 기준입니다.</p><input class="wb-search" type="search" placeholder="업체·메뉴 검색" aria-label="업체와 메뉴 검색"><div class="wb-tabs">${['전체','식사','카페','주점','문화·놀이'].map((item) => `<button type="button" data-group="${item}" class="${selectedGroup === item ? 'on' : ''}">${item}</button>`).join('')}</div><p class="wb-status" role="status"></p><div class="wb-results"></div></section>`;
    root.querySelector('.wb-close').onclick = close;
    root.querySelector('.wb-search').value = query;
    root.querySelector('.wb-search').oninput = (event) => { query = event.target.value; shown = 35; renderList(); };
    root.querySelectorAll('[data-group]').forEach((button) => button.onclick = () => { selectedGroup = button.dataset.group; shown = 35; render(); });
    renderList();
  }
  async function open(onlyHonor=false) {
    honorOnly=onlyHonor;
    window.HongdaeDiscovery?.close?.();
    window.HongdaeResearch?.close?.();
    root.classList.add('open');
    root.innerHTML = '<section class="wb-panel"><p class="wb-intro">게시판 업체 목록을 불러오는 중…</p></section>';
    try { await load(); if (root.classList.contains('open')) render(); }
    catch (error) { root.innerHTML = `<section class="wb-panel"><div class="wb-head"><h2>업체 목록</h2><button type="button" class="wb-close">닫기 ✕</button></div><p class="wb-intro">${escapeHtml(error.message)}</p></section>`; root.querySelector('.wb-close').onclick = close; }
  }
  function renderEntry(host) {
    if (!host) return;
    host.innerHTML = '<button type="button" class="discovery-theme" data-board>🍽️ 홍대생 맛집 게시판 <span>추가 자료 포함 →</span><small>제공된 엑셀의 업체·메뉴·영업시간을 찾아보세요</small></button>';
    host.querySelector('[data-board]').onclick = open;
  }
  document.addEventListener('DOMContentLoaded', () => document.body.append(root));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  load().catch(() => {});
  window.HongdaeWorkbook = { open, openHonor:()=>open(true), close, renderEntry, load };
})();
