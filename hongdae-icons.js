(() => {
  const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const icons = {
    student: icon('<path d="M2.5 8.6 12 4.4l9.5 4.2-9.5 4.2Z"/><path d="M6.5 10.6v4.2c0 1.6 2.5 2.7 5.5 2.7s5.5-1.1 5.5-2.7v-4.2M21.5 8.6v5"/>'),
    food: icon('<path d="M5 3.6v4M7.4 3.6v3.6M9.8 3.6v4M5 7.6c0 1.7.9 2.6 2.4 2.6s2.4-.9 2.4-2.6M7.4 10.2v10.2M17.6 3.6c1.7 1.9 2.4 4.1 2.4 6.3 0 1.3-.8 2-2.4 2ZM17.6 11.9v8.5"/>'),
    cafe: icon('<path d="M4.4 8.8h12v4.6a6 6 0 0 1-12 0Z"/><path d="M16.4 10H18a2.6 2.6 0 0 1 0 5.2h-1.6M3 20.4h14.8M8.6 3.2c1.2 1.1 1.2 2.1 0 3.2M12.4 3.2c1.2 1.1 1.2 2.1 0 3.2"/>'),
    bar: icon('<path d="M8.6 3.4h1.8v2.8c0 .9 1 1.3 1 3.1v9.9a1.4 1.4 0 0 1-1.4 1.4H9a1.4 1.4 0 0 1-1.4-1.4V9.3c0-1.8 1-2.2 1-3.1ZM7.6 12.2h3.8M14 9.2h6.2l-.9 10a1.4 1.4 0 0 1-1.4 1.4h-1.6a1.4 1.4 0 0 1-1.4-1.4Z"/>'),
    filter: icon('<path d="M3.6 7h16.8M3.6 12h16.8M3.6 17h16.8"/><circle cx="9" cy="7" r="2.3"/><circle cx="15.2" cy="12" r="2.3"/><circle cx="9.8" cy="17" r="2.3"/>'),
    map: icon('<path d="m9 4.5 6 2.4 5.8-2.4v12.6L15 19.5 9 17.1l-5.8 2.4V6.9Z"/><path d="M9 4.5v12.6M15 6.9v12.6"/>'),
    feed: icon('<rect x="3.4" y="4.4" width="17.2" height="6.6" rx="1.7"/><rect x="3.4" y="13" width="17.2" height="6.6" rx="1.7"/><path d="M6.6 7.7H11M6.6 16.3H11"/>'),
    save: icon('<path d="M6 3.6h12a1.5 1.5 0 0 1 1.5 1.5v15.3L12 15.6l-7.5 4.8V5.1A1.5 1.5 0 0 1 6 3.6Z"/><path d="M9 8.6h6"/>'),
    profile: icon('<circle cx="12" cy="8.6" r="3.7"/><path d="M4.8 20.4c0-3.7 3.2-5.7 7.2-5.7s7.2 2 7.2 5.7"/>')
  };
  window.addEventListener('DOMContentLoaded', () => {
    [['#chip-studentzone','student'],['#chip-restaurant','food'],['#chip-cafe','cafe'],['#chip-bar','bar'],['.chip-filter','filter']].forEach(([s,n]) => { const old=document.querySelector(s)?.querySelector('svg'); if(old) old.outerHTML=icons[n]; });
    document.querySelectorAll('.app-tab').forEach(tab => { const n=({map:'map',feed:'feed',save:'save',me:'profile'})[tab.dataset.tab]; const old=tab.querySelector('svg'); if(n&&old) old.outerHTML=icons[n]; });
  });
})();
