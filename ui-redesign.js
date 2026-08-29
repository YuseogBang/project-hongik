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
      if (action === 'map') { closeDetail(); closeSidebar(); }
      if (action === 'feed') openCuratedFeed();
      if (action === 'save') showBookmarks();
      if (action === 'me') HongdaePlatform.openDialog();
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
    button.addEventListener('click', toggleSidebar);
    bar.append(button);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addNavigation();
    addFilterButton();
    updateSaveDot();
  });

  const originalToggleBookmark = window.toggleBookmark;
  window.toggleBookmark = function (id) {
    originalToggleBookmark(id);
    updateSaveDot();
  };
})();
