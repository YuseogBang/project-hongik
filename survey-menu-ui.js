(() => {
  const source = window.HONGDAE_SURVEY_MENUS || {};
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const won = (price, label) => Number.isInteger(price) ? `${price.toLocaleString('ko-KR')}원` : label || '가격 미기재';
  let attached = 0;
  stores.forEach((store) => {
    const record = source[String(store.id)];
    if (!record || (store.kakaoId && String(store.kakaoId) !== record.kakaoId)) return;
    store.surveyMenu = record;
    if (!store.kakaoId) {
      store.kakaoId = record.kakaoId;
      store.kakaoUrl = record.source;
    }
    attached++;
  });

  const style = document.createElement('style');
  style.textContent = `
    .survey-hours,.survey-board{margin-top:10px;padding:14px;border:1px solid var(--border);border-radius:16px;background:#fffaf5;color:#41232a;font-family:Pretendard,sans-serif}
    .survey-eyebrow{font-size:10px;font-weight:900;letter-spacing:.12em;color:#a44436}.survey-board-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:4px 0 10px}.survey-board-head strong{font-size:17px}.survey-board-head small{font-size:11px;color:#876b6d}
    .survey-row{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:9px 0;border-bottom:1px dotted #dac5bd}.survey-row:last-child{border-bottom:0}.survey-row span{min-width:0;font-size:12px;line-height:1.4}.survey-row b{flex:none;color:#9a3b2e;font-size:12px;white-space:nowrap}.survey-rec{display:inline-block;margin-left:5px;padding:1px 5px;border-radius:99px;background:#ffe2cf;color:#a24532;font-size:9px;font-weight:800}
    .survey-more{width:100%;margin-top:11px;padding:10px;border:1px solid #a85a55;border-radius:11px;background:#fff3e9;color:#8a3c35;font:800 12px Pretendard,sans-serif}.survey-meta{margin:9px 0 0;color:#876b6d;font-size:10px;line-height:1.5}.survey-meta a{color:#9a3b2e;text-decoration:underline}
    .survey-modal{position:fixed;inset:0;z-index:2500;display:flex;align-items:flex-end;padding:12px;background:rgba(33,8,12,.65);font-family:Pretendard,sans-serif}.survey-modal-panel{width:min(100%,560px);max-height:88vh;overflow:auto;margin:auto auto 0;padding:20px;border-radius:24px 24px 16px 16px;background:#fffaf5;color:#41232a;box-shadow:0 -12px 36px rgba(25,0,0,.28)}.survey-modal-head{display:flex;align-items:center;gap:10px}.survey-modal-head h2{flex:1;margin:0;font-size:20px}.survey-modal-head button{padding:7px 11px;border:0;border-radius:99px;background:#f3e6e1;color:#5e2a31;font:700 14px Pretendard,sans-serif}
    @media(min-width:701px){.survey-modal{align-items:center}.survey-modal-panel{margin:auto;border-radius:24px}}
  `;
  document.head.append(style);

  function hours(store) {
    const record = store.surveyMenu;
    if (!record?.hours) return '';
    return `<section class="survey-hours"><div class="survey-eyebrow">영업시간</div><div style="margin-top:6px;font-size:12px;line-height:1.55">${escapeHtml(record.hours)}</div><p class="survey-meta">${escapeHtml(record.checked)} 카카오맵 표시 기준 · 공휴일·임시휴무는 방문 전에 확인해 주세요. <a href="${escapeHtml(record.source)}" target="_blank" rel="noopener noreferrer">현재 정보 확인 ↗</a></p>${record.note ? `<p class="survey-meta">${escapeHtml(record.note)}</p>` : ''}</section>`;
  }
  function rows(menu) {
    return menu.map(([name, price, recommended, priceLabel]) => `<div class="survey-row"><span>${escapeHtml(name)}${recommended ? '<small class="survey-rec">★</small>' : ''}</span><b>${won(price, priceLabel)}</b></div>`).join('');
  }
  function board(store) {
    const record = store.surveyMenu;
    if (!record?.menu?.length) {
      const research = store.boardResearch;
      if (!research?.menu && !research?.price) return '';
      return `<section class="survey-board" data-place-menu><div class="survey-eyebrow">BOARD RESEARCH · 2026-10-04</div><div class="survey-board-head"><strong>메뉴판</strong></div>${research.menu ? `<div class="survey-row"><span>${escapeHtml(research.menu)}</span></div>` : ''}${research.price ? `<div class="survey-row"><span>${escapeHtml(research.price)}</span></div>` : ''}<p class="survey-meta">제공된 게시판 업체 정리 기준입니다. 현재 가격·영업 여부는 카카오맵과 매장에서 확인해 주세요.</p></section>`;
    }
    const count = record.menu.length;
    return `<section class="survey-board" data-place-menu><div class="survey-eyebrow">MENU BOARD</div><div class="survey-board-head"><strong>메뉴판</strong></div>${rows(record.menu.slice(0, 6))}${count > 6 ? `<button type="button" class="survey-more" onclick="openFullMenu(${store.id})">전체 메뉴 보기 →</button>` : ''}<p class="survey-meta">가격·품절 여부는 방문 전에 확인해 주세요. <a href="${escapeHtml(record.source)}" target="_blank" rel="noopener noreferrer">현재 메뉴 확인 ↗</a></p></section>`;
  }
  function open(store) {
    const record = store.surveyMenu;
    if (!record?.menu?.length) return false;
    document.getElementById('place-menu-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'place-menu-modal';
    modal.className = 'survey-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', `${store.name} 메뉴판`);
    modal.innerHTML = `<section class="survey-modal-panel"><div class="survey-modal-head"><div><div class="survey-eyebrow">MENU BOARD</div><h2>${escapeHtml(store.name)}</h2></div><button type="button" data-close aria-label="닫기">✕</button></div><p class="survey-meta">가격과 품절 여부는 방문 전 확인해 주세요.</p>${rows(record.menu)}<p class="survey-meta"><a href="${escapeHtml(record.source)}" target="_blank" rel="noopener noreferrer">카카오맵에서 현재 메뉴 확인 ↗</a></p></section>`;
    modal.addEventListener('click', (event) => { if (event.target === modal) modal.remove(); });
    modal.querySelector('[data-close]').onclick = () => modal.remove();
    document.body.append(modal);
    modal.querySelector('[data-close]').focus();
    return true;
  }
  window.HongdaeMenus = { attached, hours, board, open };
})();
