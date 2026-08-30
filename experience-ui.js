/* Turns the unused journey mockups into real, local-first product flows. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .xp-overlay{position:fixed;inset:0;z-index:1000;background:rgba(18,4,7,.7);backdrop-filter:blur(8px);display:none;align-items:flex-end;font-family:Pretendard,sans-serif}.xp-overlay.open{display:flex}.xp-sheet{width:100%;max-height:88vh;overflow:auto;background:#2b070c;border:1px solid #7a2534;border-radius:25px 25px 0 0;padding:20px 20px calc(28px + env(safe-area-inset-bottom));color:#f5ece7;box-shadow:0 -20px 48px rgba(0,0,0,.5)}.xp-handle{width:36px;height:4px;border-radius:8px;background:#7a2534;margin:0 auto 20px}.xp-top{position:sticky;top:-20px;z-index:2;display:flex;align-items:center;gap:10px;padding:8px 0;background:#2b070c}.xp-back,.xp-close{height:34px;border:1px solid #7a2534;background:#3d0f16;color:#f5ece7;font:700 12px Pretendard,sans-serif}.xp-back{padding:0 11px;border-radius:99px}.xp-close{margin-left:auto;padding:0 11px;border-radius:99px}.xp-kicker{font:800 10px/1 'DM Mono',monospace;letter-spacing:.1em;color:#ff8a7a}.xp-title{margin:8px 0 7px;font-size:23px;letter-spacing:-.04em}.xp-copy{margin:0;color:#c39298;font-size:13px;line-height:1.6}.xp-progress{display:flex;gap:5px;margin:19px 0}.xp-progress span{height:4px;flex:1;border-radius:99px;background:#4f151e}.xp-progress span.on{background:#e8362a}.xp-choice{width:100%;display:flex;align-items:center;gap:13px;margin-top:10px;padding:16px;border:1px solid #7a2534;border-radius:16px;background:#3d0f16;color:#f5ece7;text-align:left}.xp-choice strong{display:block;font-size:15px}.xp-choice small{display:block;margin-top:4px;color:#c39298;font-size:11px}.xp-choice-mark{margin-left:auto;color:#ff8a7a;font-size:20px}.xp-primary{width:100%;margin-top:18px;padding:15px;border:0;border-radius:15px;background:#e8362a;color:#fff;font:700 15px Pretendard,sans-serif;box-shadow:0 8px 22px rgba(232,54,42,.32)}.xp-secondary{width:100%;margin-top:9px;padding:12px;border:1px solid #7a2534;border-radius:14px;background:transparent;color:#c39298;font:600 13px Pretendard,sans-serif}.xp-filter-summary{margin:4px 0 14px;padding:13px;border:1px solid #7a2534;border-radius:14px;background:#3d0f16}.xp-filter-summary b{color:#f5ece7}.xp-filter-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.xp-filter-actions button{padding:8px 10px;border:1px solid #7a2534;border-radius:99px;background:#4f151e;color:#f5ece7;font:600 11px Pretendard,sans-serif}.xp-filter-actions button.reset{margin-left:auto;color:#ff8a7a}.xp-profile-stats{display:grid;grid-template-columns:repeat(3,1fr);margin:18px 0;border:1px solid #7a2534;border-radius:14px;overflow:hidden}.xp-profile-stats div{padding:12px 6px;text-align:center;border-right:1px solid #7a2534}.xp-profile-stats div:last-child{border-right:0}.xp-profile-stats b{display:block;font-size:17px}.xp-profile-stats span{font-size:10px;color:#c39298}.xp-tags{display:flex;flex-wrap:wrap;gap:6px;margin:13px 0}.xp-tags span{padding:6px 9px;border-radius:99px;background:rgba(232,54,42,.15);color:#ff93a2;font-size:11px}.xp-history{margin-top:17px;border-top:1px solid #4f151e;padding-top:14px}.xp-history h4{margin:0 0 8px;font-size:13px}.xp-history button{width:100%;display:flex;justify-content:space-between;gap:10px;padding:10px 0;border:0;border-bottom:1px solid #4f151e;background:transparent;color:#f5ece7;text-align:left;font:600 12px Pretendard,sans-serif}.xp-history small{color:#8a5f66;font-weight:400}@media(min-width:701px){.xp-overlay{align-items:center;justify-content:center}.xp-sheet{width:400px;border-radius:25px;padding-bottom:28px}.xp-back,.xp-close{cursor:pointer}}`;
  document.head.append(style);

  const $ = (selector, root = document) => root.querySelector(selector);
  const historyKey = 'hongdaeRecentViews';
  const readHistory = () => JSON.parse(localStorage.getItem(historyKey) || '[]');
  const close = () => $('.xp-overlay')?.classList.remove('open');
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function ensureOverlay() {
    let overlay = $('.xp-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div'); overlay.className = 'xp-overlay';
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    document.body.append(overlay); return overlay;
  }

  function recordView(id) {
    const store = stores.find((item) => item.id === id); if (!store) return;
    const next = readHistory().filter((item) => item.id !== id);
    next.unshift({ id, name: store.name, type: store.type, at: Date.now() });
    localStorage.setItem(historyKey, JSON.stringify(next.slice(0, 8)));
  }

  function openTasteJourney() {
    const overlay = ensureOverlay(); let step = 0; const picks = new Set(userTastes);
    const questions = [
      { title:'혼자일 때의 한 끼', copy:'더 자주 찾는 쪽을 골라주세요.', choices:[['혼밥','혼자라도 편안한 자리'],['데이트','누군가와 오래 머물고 싶은 자리']] },
      { title:'공간의 온도', copy:'홍대에서 끌리는 분위기를 골라주세요.', choices:[['조용한','대화와 작업에 집중되는 곳'],['시끌벅적','에너지 있는 밤의 분위기']] },
      { title:'오늘의 기준', copy:'마지막으로 가장 중요한 한 가지를 골라주세요.', choices:[['가성비','부담 없이 자주 가는 곳'],['인스타감성','새롭고 기억에 남는 곳']] }
    ];
    const render = () => { const question = questions[step]; overlay.innerHTML = `<div class="xp-sheet"><div class="xp-handle"></div><div class="xp-top">${step ? '<button class="xp-back" aria-label="이전 질문으로 돌아가기">← 이전</button>' : ''}<span class="xp-kicker">TASTE START · ${step + 1}/3</span><button class="xp-close" aria-label="취향 선택 나가기">나가기 ✕</button></div><h2 class="xp-title">${question.title}</h2><p class="xp-copy">${question.copy}</p><div class="xp-progress">${questions.map((_, index) => `<span class="${index <= step ? 'on' : ''}"></span>`).join('')}</div>${question.choices.map(([tag, description]) => `<button class="xp-choice" data-tag="${tag}"><span><strong>${tag}</strong><small>${description}</small></span><span class="xp-choice-mark">›</span></button>`).join('')}<button class="xp-secondary" data-skip>그냥 둘러볼게요</button></div>`; $('.xp-close', overlay).onclick = close; const back = $('.xp-back', overlay); if (back) back.onclick = () => { step -= 1; render(); }; $('[data-skip]', overlay).onclick = close; overlay.querySelectorAll('[data-tag]').forEach((button) => button.onclick = () => { picks.add(button.dataset.tag); if (step < questions.length - 1) { step += 1; render(); return; } userTastes = [...picks]; localStorage.setItem('userTastes', JSON.stringify(userTastes)); close(); showTasteView(); HongdaeUI.openResults(); }); };
    render(); overlay.classList.add('open');
  }

  function openFilters() {
    const sidebar = $('#sidebar');
    let summary = $('.xp-filter-summary', sidebar);
    if (!summary) { summary = document.createElement('div'); summary.className = 'xp-filter-summary'; sidebar.querySelector('.sidebar-top')?.prepend(summary); }
    const count = getFilteredStores().length;
    summary.innerHTML = `<div style="font-size:12px;color:#c39298">지금 조건이면 <b>${count}곳</b>을 볼 수 있어요.</div><div class="xp-filter-actions"><button data-tag="혼밥">혼자</button><button data-tag="데이트">데이트</button><button data-tag="조용한">조용한</button><button data-tag="가성비">가성비</button><button class="reset" data-reset>초기화</button></div>`;
    summary.querySelectorAll('[data-tag]').forEach((button) => button.onclick = () => { activeDetailFilters.clear(); activeDetailFilters.add(`tag:${button.dataset.tag}`); currentFilter = 'detailFilters'; renderList(); openFilters(); });
    $('[data-reset]', summary).onclick = () => { activeDetailFilters.clear(); boundsFilter = null; currentFilter = 'all'; searchText = ''; const input = $('#search-input'); if (input) input.value = ''; renderList(); openFilters(); };
    if (!sidebar.classList.contains('open')) toggleSidebar();
  }

  function openProfile() {
    if (!userTastes.length) { openTasteJourney(); return; }
    const overlay = ensureOverlay(); const history = readHistory(); const saved = Object.keys(bookmarks || {}).length;
    overlay.innerHTML = `<div class="xp-sheet"><div class="xp-handle"></div><div class="xp-top"><span class="xp-kicker">MY HONGDAE</span><button class="xp-close">✕</button></div><h2 class="xp-title">내 취향 지도</h2><p class="xp-copy">저장과 탐색 기록을 바탕으로 다음 추천이 더 맞아집니다.</p><div class="xp-profile-stats"><div><b>${userTastes.length}</b><span>취향</span></div><div><b>${saved}</b><span>저장</span></div><div><b>${history.length}</b><span>최근 탐색</span></div></div><div class="xp-tags">${userTastes.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('')}</div><button class="xp-primary" data-edit>취향 다시 고르기</button><button class="xp-secondary" data-saved>저장한 가게 보기</button><div class="xp-history"><h4>최근 본 가게</h4>${history.length ? history.slice(0, 4).map((item) => `<button data-store="${item.id}"><span>${escapeHtml(item.name)}</span><small>다시 보기 ›</small></button>`).join('') : '<p class="xp-copy">아직 둘러본 가게가 없어요.</p>'}</div></div>`;
    $('.xp-close', overlay).onclick = close; $('[data-edit]', overlay).onclick = openTasteJourney; $('[data-saved]', overlay).onclick = () => { close(); showBookmarks(); HongdaeUI.openResults(); }; overlay.querySelectorAll('[data-store]').forEach((button) => button.onclick = () => { close(); selectStore(Number(button.dataset.store)); }); overlay.classList.add('open');
  }

  window.HongdaeExperience = { openTasteJourney, openFilters, openProfile, recordView };
})();
