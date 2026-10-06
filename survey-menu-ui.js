(() => {
  const source = window.HONGDAE_SURVEY_MENUS || {};
  const escapeHtml = (value) => String(value ?? '').replace(/미기재/g,'정보 확인 필요').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const won = (price) => Number.isInteger(price) ? `${price.toLocaleString('ko-KR')}원` : '가격 정보 확인 필요';
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

  function splitHours(raw) {
    const time='(\\d{1,2}:\\d{2})';
    const range=new RegExp(time+'\\s*[~–—-]\\s*'+time);
    const rows=[];
    for(const segment of String(raw||'').split(/\s*\/\s*/)){
      const opening=segment.match(range);
      const day=(opening?segment.slice(0,opening.index):segment.replace(/휴무.*$/,'')).replace(/[()·]/g,'').trim()||'영업일';
      const br=segment.match(new RegExp('(?:휴게|브레이크\\s*타임|휴식)\\s*[:：]?\\s*'+time+'\\s*[~–—-]\\s*'+time));
      const lo=segment.match(/(?:라스트\s*오더|L\.?O\.?|LO)\s*[:：]?\s*(\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2})*)/i);
      if(!opening && /휴무/.test(segment)){rows.push({day,closed:true});continue;}
      if(!opening){rows.push({day:'안내',note:segment.trim()});continue;}
      const operating=segment.split(/휴게|브레이크\s*타임|휴식|라스트\s*오더|L\.?O\.?/i)[0];
      const sessions=[...operating.matchAll(new RegExp(range.source,'g'))].map(m=>m[1]+'–'+m[2]);
      rows.push({day,open:sessions.join(' / ')||opening[1]+'–'+opening[2],break:br?br[1]+'–'+br[2]:null,last:lo?.[1]||null,uncertain:/(?:휴게|브레이크)/.test(segment)&&!br});
    }
    return rows;
  }
  function hours(store) {
    const record = store.surveyMenu;
    const raw=record?.hours||store.hours;
    const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
    const exception=store.hoursExceptions?.[today];
    const temporary=(store.operatingNote?`<p class="survey-meta">${escapeHtml(store.operatingNote)}</p>`:'')+(exception?`<div class="hours-closed"><b>오늘 운영</b><span>${escapeHtml(exception)}</span></div>`:'');
    if(['conflict','needs-check'].includes(store.hoursState))return `<section class="survey-hours"><div class="survey-eyebrow">영업 안내</div>${temporary}<p class="survey-meta">영업시간 확인 필요${store.hoursState==='conflict'?' · 안내된 시간이 서로 달라요.':''}</p><p class="survey-meta">${store.kakaoUrl?`<a href="${escapeHtml(store.kakaoUrl)}" target="_blank" rel="noopener noreferrer">카카오맵 확인 ↗</a>`:''}${store.naverUrl?` · <a href="${escapeHtml(store.naverUrl)}" target="_blank" rel="noopener noreferrer">네이버맵 확인 ↗</a>`:''}</p></section>`;
    const rows=raw?splitHours(raw):[];
    const table=rows.map(r=>r.closed?`<div class="hours-closed"><b>${escapeHtml(r.day)}</b><span>휴무</span></div>`:r.note?`<p class="survey-meta">${escapeHtml(r.note)}</p>`:`<div class="hours-group"><h5>${escapeHtml(r.day)}</h5><dl><div><dt>영업시간</dt><dd>${escapeHtml(r.open)}</dd></div><div><dt>브레이크타임</dt><dd>${escapeHtml(r.break||'정보 확인 필요')}</dd></div><div><dt>라스트오더</dt><dd>${escapeHtml(r.last||'정보 확인 필요')}</dd></div></dl></div>`).join('');
    const source=record?.source||store.kakaoUrl;
    return `<section class="survey-hours"><div class="survey-eyebrow">영업 안내</div>${temporary}${raw?table:'<p class="survey-meta">영업시간 정보 확인 필요 · 방문 전 매장에 확인해 주세요.</p>'}<p class="survey-meta">${source?`<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">현재 정보 확인 ↗</a>`:''}${['partial','single-source'].includes(store.hoursState)?' · 지도 안내 기준':''}</p></section>`;
  }

  function rows(menu) {
    return menu.map(([name, price, recommended]) => `<div class="survey-row"><span>${escapeHtml(name)}${recommended ? '<small class="survey-rec">★</small>' : ''}</span><b>${won(price)}</b></div>`).join('');
  }
  function board(store) {
    const record = store.surveyMenu;
    if (!record?.menu?.length) {
      const research = store.boardResearch;
      if (!research?.menu && !research?.price) return '';
      return `<section class="survey-board" data-place-menu><div class="survey-eyebrow">MENU BOARD</div><div class="survey-board-head"><strong>메뉴판</strong></div>${research.menu ? `<div class="survey-row"><span>${escapeHtml(research.menu)}</span></div>` : ''}${research.price ? `<div class="survey-row"><span>${escapeHtml(research.price)}</span></div>` : ''}<p class="survey-meta">가격·영업 여부는 방문 전에 확인해 주세요.</p></section>`;
    }
    const count = record.menu.length;
    return `<section class="survey-board" data-place-menu><div class="survey-eyebrow">MENU BOARD</div><div class="survey-board-head"><strong>메뉴판</strong></div>${rows(record.menu.slice(0, 6))}${count > 6 ? `<button type="button" class="survey-more" onclick="openFullMenu(${store.id})">전체 메뉴 보기 →</button>` : ''}<p class="survey-meta">가격·품절 여부는 방문 전에 확인해 주세요. <a href="${escapeHtml(record.menuSource||record.source)}" target="_blank" rel="noopener noreferrer">현재 메뉴 확인 ↗</a></p></section>`;
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
    modal.innerHTML = `<section class="survey-modal-panel"><div class="survey-modal-head"><div><div class="survey-eyebrow">MENU BOARD</div><h2>${escapeHtml(store.name)}</h2></div><button type="button" data-close aria-label="닫기">✕</button></div><p class="survey-meta">가격과 품절 여부는 방문 전 확인해 주세요.</p>${rows(record.menu)}<p class="survey-meta"><a href="${escapeHtml(record.menuSource||record.source)}" target="_blank" rel="noopener noreferrer">현재 메뉴 확인 ↗</a></p></section>`;
    modal.addEventListener('click', (event) => { if (event.target === modal) modal.remove(); });
    modal.querySelector('[data-close]').onclick = () => modal.remove();
    document.body.append(modal);
    modal.querySelector('[data-close]').focus();
    return true;
  }
  window.HongdaeMenus = { attached, hours, board, open, splitHours };
})();
