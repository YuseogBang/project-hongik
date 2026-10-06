(() => {
  const themes = [
    { title: '🦋 홍대병 체크리스트', detail: '홍대병 태그가 붙은 공간을 한데 모았어요', tag: '홍대병' },
    { title: '🍚 혼밥도 풀코스', detail: '혼밥 태그가 붙은 음식점', type: 'restaurant', tag: '혼밥' },
    { title: '☕ 조용한 척 오래 있기', detail: '조용한 태그가 붙은 카페', type: 'cafe', tag: '조용한' },
    { title: '🍚 만원 이하 한 끼', detail: '등록 메뉴 기준 10,000원 이하 · 점심과 저녁 후보', type: 'restaurant', budget: true },
    { title: '🌙 딱 한 잔만, 진짜?', detail: '술안주 태그가 붙은 주점', type: 'bar', tag: '술안주' },
    { title: '📸 사진 먼저, 주문은 나중', detail: '인스타감성 태그가 붙은 카페', type: 'cafe', tag: '인스타감성' }
  ];
  const budgetMeals = store => (store.surveyMenu?.menu || []).filter(([name,price])=>Number.isFinite(price)&&price>0&&price<=10000&&/라멘|우동|국수|냉면|덮밥|볶음밥|비빔밥|국밥|곰탕|설렁탕|찌개|백반|정식|돈까스|돈카츠|버거|샌드위치|오니기리|주먹밥|김밥|카레|소바|짜장|짬뽕|토스트/.test(name)&&!/추가|공기밥|사이드|감자튀김|음료|2인|3인|4인|인 이상|미니|고기\s*마요|곁들임/.test(name));
  const themePlaces = (theme) => stores.filter((store) => store.status !== 'closed' && !store.temporarilyClosed && !store.locationNeedsCheck && (!indieOnly || !isFranchise(store)) && (!theme.type || store.type === theme.type) && (theme.budget ? budgetMeals(store).length>0 : (store.tags || []).includes(theme.tag)));
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const style = document.createElement('style');
  style.textContent = `
    .discovery-entry{display:flex;gap:7px;flex:none;padding:0 4px 0 8px;border-left:1px solid var(--border)}
    .discovery-entry button{white-space:nowrap;padding:8px 12px;border:1px solid var(--border);border-radius:99px;background:var(--surface);color:var(--text);font:700 12px Pretendard,sans-serif;cursor:pointer}
    .discovery-entry button:first-child{border-color:var(--accent);color:var(--accent2)}
    .discovery-dialog{position:fixed;inset:0;z-index:900;display:none;align-items:flex-end;justify-content:center;padding:12px;background:rgba(12,2,5,.72);font-family:Pretendard,sans-serif}
    .discovery-dialog.open{display:flex}
    .discovery-panel{width:min(100%,460px);max-height:min(82vh,760px);overflow:auto;padding:22px;border:1px solid var(--border);border-radius:24px;background:var(--bg);color:var(--text);box-shadow:0 20px 60px rgba(0,0,0,.4)}
    .discovery-head{display:flex;align-items:center;gap:12px}.discovery-head h2{font-size:21px;margin:0;flex:1}.discovery-close{border:1px solid var(--border);border-radius:99px;padding:7px 10px;background:var(--surface);color:var(--text);font:700 12px Pretendard,sans-serif}
    .discovery-tabs{display:flex;gap:7px;margin:18px 0}.discovery-tabs button{flex:1;padding:11px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--muted);font:700 13px Pretendard,sans-serif}.discovery-tabs button.on{border-color:var(--accent);background:var(--accent);color:#fff}
    .discovery-intro{color:var(--muted);font-size:12px;line-height:1.55;margin:0 0 14px}.discovery-theme{width:100%;display:block;text-align:left;margin:8px 0;padding:16px;border:1px solid var(--border);border-radius:15px;background:var(--surface);color:var(--text);font:700 15px Pretendard,sans-serif}.discovery-theme small{display:block;margin-top:6px;color:var(--muted);font-size:11px;font-weight:500}.discovery-theme span{float:right;color:var(--accent2);font-size:12px;font-weight:800}
    .discovery-tags{display:flex;flex-wrap:wrap;gap:8px}.discovery-tags button{padding:10px 13px;border:1px solid var(--border);border-radius:99px;background:var(--surface);color:var(--text);font:600 12px Pretendard,sans-serif}.discovery-tags button.on{border-color:var(--accent);background:var(--accent);color:#fff}.discovery-apply{width:100%;margin-top:18px;padding:14px;border:0;border-radius:13px;background:var(--accent);color:#fff;font:700 14px Pretendard,sans-serif}.discovery-list{display:grid;gap:8px}.discovery-place{width:100%;text-align:left;padding:13px;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--text);font:700 13px Pretendard,sans-serif}.discovery-place small{display:block;margin-top:5px;color:var(--muted);font-size:11px;font-weight:500}
    @media(min-width:701px){.discovery-dialog{align-items:center}.discovery-entry button:hover,.discovery-theme:hover,.discovery-place:hover{border-color:var(--accent)}}
  `;
  document.head.append(style);

  let tab = 'curation';
  let selectedTheme = null;
  let draftTastes = [];
  const root = document.createElement('div');
  root.className = 'discovery-dialog';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', '테마 탐색');
  root.addEventListener('click', (event) => { if (event.target === root) close(); });

  function close() { root.classList.remove('open'); }
  function open(nextTab = 'curation') {
    if(nextTab==='taste' && window.HongdaeRecommendations){close();window.HongdaeRecommendations.open();return;}
    document.querySelector('.map-result-sheet')?.classList.remove('open');
    document.body.classList.remove('map-results-open');
    if (document.querySelector('#sidebar')?.classList.contains('open')) closeSidebar();
    tab = nextTab;
    selectedTheme = null;
    draftTastes = [...userTastes];
    render();
    root.classList.add('open');
    root.querySelector('.discovery-close')?.focus();
  }
  function render() {
    const header = `<div class="discovery-head"><h2>${selectedTheme ? escapeHtml(selectedTheme.title) : tab === 'taste' ? '내 취향 선택' : '테마 탐색'}</h2><button class="discovery-close" type="button" aria-label="닫기">닫기 ✕</button></div>`;
    let body;
    if (selectedTheme) {
      const matches = themePlaces(selectedTheme);
      body = `<p class="discovery-intro" style="margin-top:14px">${selectedTheme.budget?'1인 식사 메뉴 10,000원 이하 · 현재 가격은 방문 전 확인':'#'+escapeHtml(selectedTheme.tag)}${selectedTheme.type ? ' · ' + escapeHtml(selectedTheme.type === 'restaurant' ? '음식점' : selectedTheme.type === 'cafe' ? '카페' : '주점') : ''} 기준 · 등록된 장소 ${matches.length}곳. 방문 전 영업 여부를 확인해 주세요.</p><div class="discovery-list">${matches.length ? matches.map((store) => `<button type="button" class="discovery-place" data-place="${store.id}">${escapeHtml(store.name)}<small>${escapeHtml(store.dong || '홍대')} · ${escapeHtml(store.category || store.type)}</small>${selectedTheme.budget?`<small style="color:var(--accent2)">${budgetMeals(store).slice(0,2).map(([name,price])=>`${escapeHtml(name)} ${price.toLocaleString('ko-KR')}원`).join(' · ')}</small>`:''}</button>`).join('') : '<p class="discovery-intro">조건에 맞는 장소가 아직 없어요.</p>'}</div><button type="button" class="discovery-apply" data-back>다른 테마 보기</button>`;
    } else {
      body = '';
      if (tab === 'curation') body += `<p class="discovery-intro">무엇을 좋아하는지에 따라 장소를 모아 봐요. 방문 순서를 짜고 싶다면 하단의 코스를 이용하세요.</p>${themes.map((theme, index) => `<button type="button" class="discovery-theme" data-theme="${index}">${escapeHtml(theme.title)} <span>${themePlaces(theme).length}곳 →</span><small>${escapeHtml(theme.detail)}</small></button>`).join('')}<button type="button" class="discovery-theme" data-archive>🪦 사라진 가게<small>홍대의 공간과 추억을 기록해요</small></button><div id="workbook-curation-entry"></div><div id="research-curation-entry"></div>`;
      else body += `<p class="discovery-intro">여기서 고른 취향만 이 기기에 저장됩니다. 지도 추천에 반영되며 언제든 수정할 수 있어요.</p><div class="discovery-tags">${TASTE_TAGS.map((tag) => `<button type="button" data-taste="${escapeHtml(tag)}" class="${draftTastes.includes(tag) ? 'on' : ''}" aria-pressed="${draftTastes.includes(tag)}">${tag === '홍대병' ? '🦋 ' : ''}${escapeHtml(tag)}</button>`).join('')}</div><button type="button" class="discovery-apply" data-apply>취향 저장하고 장소 보기</button>`;
    }
    root.innerHTML = `<section class="discovery-panel">${header}${body}</section>`;
    root.querySelector('.discovery-close').onclick = close;
    root.querySelectorAll('[data-theme]').forEach((button) => button.onclick = () => { selectedTheme = themes[Number(button.dataset.theme)]; render(); });
    root.querySelector('[data-passport]')?.addEventListener('click', () => window.HongdaeSpecial?.openPassport());
    window.HongdaeResearch?.renderEntry(root.querySelector('#research-curation-entry'));
    window.HongdaeWorkbook?.renderEntry(root.querySelector('#workbook-curation-entry'));
    root.querySelector('[data-archive]')?.addEventListener('click',()=>{close();window.HongdaeArchive?.open();});
    root.querySelector('[data-back]')?.addEventListener('click', () => { selectedTheme = null; render(); });
    root.querySelectorAll('[data-place]').forEach((button) => button.onclick = () => { close(); selectStore(Number(button.dataset.place)); });
    root.querySelectorAll('[data-taste]').forEach((button) => button.onclick = () => { const tag = button.dataset.taste; draftTastes = draftTastes.includes(tag) ? draftTastes.filter((item) => item !== tag) : [...draftTastes, tag]; render(); });
    root.querySelector('[data-apply]')?.addEventListener('click', () => { if (!draftTastes.length) return window.alert('취향을 하나 이상 골라주세요.'); userTastes = draftTastes; localStorage.setItem('userTastes', JSON.stringify(userTastes)); close(); showTasteView(); HongdaeUI.openResults(); });
  }
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.addEventListener('DOMContentLoaded', () => {
    document.body.append(root);
  });
  window.HongdaeDiscovery = { open, close };
})();
