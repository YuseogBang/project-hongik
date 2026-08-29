/* Interface refresh: keeps the existing map and data interactions intact. */
(() => {
  const icons = {
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></svg>',
    feed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>',
    me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round"/></svg>'
  };

  function setActive(tab) {
    document.querySelectorAll('.app-tab').forEach((item) => item.classList.toggle('active', item.dataset.tab === tab));
  }

  function updateSaveDot() {
    const saved = typeof bookmarks !== 'undefined' && Object.keys(bookmarks).length > 0;
    document.querySelector('[data-tab="save"]')?.classList.toggle('has-saves', saved);
  }

  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  function closeSurface() {
    document.querySelector('.map-result-sheet')?.classList.remove('open');
    document.querySelector('.profile-sheet')?.classList.remove('open');
    document.body.classList.remove('map-results-open');
  }

  function openResults() {
    closeSurface();
    const items = getFilteredStores().slice(0, 12);
    const sheet = document.querySelector('.map-result-sheet');
    const title = currentFilter === 'taste' ? '내 취향 순위' : currentFilter === 'bookmarks' ? '저장한 가게' : '지금 볼 만한 가게';
    sheet.querySelector('.map-result-title').textContent = title;
    sheet.querySelector('.map-result-sub').textContent = `${items.length}곳 · 지도를 움직이지 않고 둘러보세요`;
    sheet.querySelector('.result-carousel').innerHTML = items.length ? items.map((store) => {
      const tags = (store.tags || []).slice(0, 3).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('');
      const score = typeof matchPercent === 'function' && userTastes.length ? `<span class="result-match">취향 ${matchPercent(store)}%</span>` : '';
      return `<button class="result-card" data-store-id="${store.id}"><div class="result-card-name"><span>${escapeHtml(store.name)}</span>${score}</div><div class="result-card-meta">${escapeHtml(store.category || TYPES[store.type] || '홍대 가게')} · ${escapeHtml(store.dong || '홍대')}</div><div class="result-card-tags">${tags || '<span>정보 업데이트 중</span>'}</div></button>`;
    }).join('') : '<div style="color:var(--muted);padding:18px">조건에 맞는 가게가 없어요. 필터를 조금 넓혀보세요.</div>';
    sheet.querySelectorAll('[data-store-id]').forEach((card) => card.addEventListener('click', () => {
      const id = Number(card.dataset.storeId);
      closeSurface();
      selectStore(id);
      const store = stores.find((item) => item.id === id);
      if (store && map && window.kakao) map.panTo(new kakao.maps.LatLng(store.lat, store.lng));
    }));
    sheet.classList.add('open');
    document.body.classList.add('map-results-open');
    setActive('map');
  }

  function openProfile() {
    closeSurface();
    if (!userTastes.length) { openTasteModal(); return; }
    const sheet = document.querySelector('.profile-sheet');
    const savedCount = Object.keys(bookmarks || {}).length;
    sheet.querySelector('.profile-sheet-note').textContent = `취향 ${userTastes.length}개 · 저장 ${savedCount}곳`;
    sheet.querySelector('.profile-tastes').innerHTML = userTastes.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('');
    sheet.classList.add('open');
    setActive('me');
  }

  function addSurfaces() {
    if (document.querySelector('.map-result-sheet')) return;
    const results = document.createElement('section');
    results.className = 'map-result-sheet';
    results.innerHTML = '<div class="map-result-head"><strong class="map-result-title">지금 볼 만한 가게</strong><span class="map-result-sub"></span><button class="sheet-close" aria-label="결과 닫기">✕</button></div><div class="result-carousel"></div>';
    results.querySelector('.sheet-close').addEventListener('click', closeSurface);
    document.body.append(results);
    const profile = document.createElement('section');
    profile.className = 'profile-sheet';
    profile.innerHTML = '<div class="profile-sheet-card"><div class="profile-sheet-top"><div class="profile-avatar">나</div><div><div class="profile-sheet-title">내 취향</div><div class="profile-sheet-note"></div></div><button class="sheet-close" aria-label="내 취향 닫기">✕</button></div><div class="profile-tastes"></div><div class="profile-actions"><button class="primary" data-action="taste">취향 조정하기</button><button data-action="saved">저장한 가게 보기</button></div></div>';
    profile.querySelector('.sheet-close').addEventListener('click', closeSurface);
    profile.querySelector('[data-action="taste"]').addEventListener('click', () => { closeSurface(); openTasteModal(); });
    profile.querySelector('[data-action="saved"]').addEventListener('click', () => { showBookmarks(); openResults(); });
    document.body.append(profile);
  }

  function addNavigation() {
    if (document.querySelector('.app-tabs')) return;
    const nav = document.createElement('nav');
    nav.className = 'app-tabs';
    nav.setAttribute('aria-label', '주요 메뉴');
    nav.innerHTML = [['map', '지도'], ['feed', '피드'], ['save', '저장'], ['me', '나']]
      .map(([key, label]) => `<button class="app-tab ${key === 'map' ? 'active' : ''}" data-tab="${key}" aria-label="${label}">${icons[key]}<span>${label}</span></button>`)
      .join('');
    nav.querySelectorAll('.app-tab').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.tab;
      setActive(action);
      if (action === 'map') { closeDetail(); closeSidebar(); closeSurface(); }
      if (action === 'feed') openCuratedFeed();
      if (action === 'save') { showBookmarks(); openResults(); }
      if (action === 'me') {
        if (window.HongdaeExperience?.openProfile) window.HongdaeExperience.openProfile();
        else openProfile();
      }
    }));
    document.body.append(nav);
  }

  function addFilterButton() {
    const bar = document.querySelector('.category-bar');
    if (!bar || document.querySelector('#chip-filter')) return;
    const button = document.createElement('button');
    button.id = 'chip-filter';
    button.className = 'chip chip-filter';
    button.innerHTML = `${icons.filter}<span>필터</span>`;
    button.addEventListener('click', () => {
      if (window.HongdaeExperience?.openFilters) window.HongdaeExperience.openFilters();
      else toggleSidebar();
    });
    bar.append(button);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addNavigation();
    addFilterButton();
    addSurfaces();
    updateSaveDot();
  });

  window.HongdaeUI = { openResults, openProfile };

  const originalToggleBookmark = window.toggleBookmark;
  window.toggleBookmark = function (id) {
    originalToggleBookmark(id);
    updateSaveDot();
  };
})();
