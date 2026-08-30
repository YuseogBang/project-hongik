/* 2026-08-30: 디자인 캔버스("홍대맵 유저 저니" s03 "조건을 좁힌다")에서 제안한 필터 시트 고도화.
   결과 수 실시간 표시 + 취향 태그 빠른 필터 + 로컬·인디/명예학식 토글 + 조건 저장(프리셋).
   * 실제 데이터가 없는 항목(1인 예산, 대기시간, "지금 영업중")은 지어내지 않기 위해 넣지 않았습니다.
   * 필터를 계산·적용하는 실제 로직은 main.html에 이미 있는 activeDetailFilters / toggleDetailFilter /
     indieOnly / getFilteredStores를 그대로 재사용합니다 — 이 파일은 그 위에 새 화면(바텀시트)만 얹습니다.
   * window.HongdaeExperience.openFilters를 덮어써서, 카테고리 바의 "필터" 버튼을 누르면 이 화면이 뜨게 합니다
     (experience-ui.js의 기존 openFilters는 그대로 두되, 이 파일이 나중에 로드되면서 더 나은 버전으로 교체함). */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .fs-count{margin:2px 0 18px;border:1px solid #e8362a;border-radius:14px;background:rgba(232,54,42,.1);padding:12px 14px;display:flex;align-items:center;gap:10px}
    .fs-count b{color:#f5ece7}
    .fs-badge{font:700 11px 'DM Mono',monospace;color:#fff;background:#e8362a;border-radius:6px;padding:4px 8px;flex:none}
    .fs-section{margin:0 0 22px}
    .fs-section h4{margin:0 0 11px;font:800 11.5px 'DM Mono',monospace;color:#8a5f66;letter-spacing:.08em}
    .fs-chips{display:flex;flex-wrap:wrap;gap:7px}
    .fs-chip{font:500 12.5px Pretendard,sans-serif;padding:8px 13px;border-radius:99px;border:1px solid #7a2534;background:#3d0f16;color:#c39298;cursor:pointer}
    .fs-chip.on{border-color:transparent;background:#e8362a;color:#fff;font-weight:600}
    .fs-switch-row{display:flex;align-items:center;gap:11px;padding:9px 0}
    .fs-switch{width:36px;height:20px;border-radius:99px;background:#4f151e;position:relative;flex:none;cursor:pointer;display:block;border:none;padding:0}
    .fs-switch.on{background:#e8362a}
    .fs-switch span{position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#8a5f66;transition:transform .15s}
    .fs-switch.on span{background:#fff;transform:translateX(16px)}
    .fs-switch-label{font:500 13.5px Pretendard,sans-serif;color:#f5ece7;flex:1;text-align:left;background:none;border:none;cursor:pointer;padding:0}
    .fs-presets{display:flex;gap:8px;flex-wrap:wrap}
    .fs-preset{flex:1;min-width:110px;border:1px solid #7a2534;border-radius:13px;background:#3d0f16;padding:11px 13px;text-align:left;color:#f5ece7;cursor:pointer;position:relative}
    .fs-preset b{display:block;font:700 12.5px Pretendard,sans-serif}
    .fs-preset small{display:block;margin-top:4px;font:400 10.5px 'DM Mono',monospace;color:#8a5f66}
    .fs-preset .fs-del{position:absolute;top:6px;right:8px;background:none;border:none;color:#8a5f66;font-size:13px;cursor:pointer;padding:2px 4px}
    .fs-preset-add{width:44px;flex:none;border:1px dashed #7a2534;border-radius:13px;background:rgba(232,54,42,.05);display:flex;align-items:center;justify-content:center;font:600 18px Pretendard,sans-serif;color:#ff8a7a;cursor:pointer}
    .fs-cta{position:sticky;bottom:-28px;margin:6px -20px -28px;padding:14px 20px calc(20px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(43,7,12,0),#2b070c 34%)}
    .fs-cta button{width:100%;height:54px;border-radius:16px;border:none;background:#e8362a;color:#fff;font:700 16.5px Pretendard,sans-serif;box-shadow:0 8px 26px rgba(232,54,42,.45);cursor:pointer}
    .fs-reset{border:none;background:none;font:600 13px Pretendard,sans-serif;color:#ff8a7a;cursor:pointer}
  `;
  document.head.append(style);

  const $ = (s, r = document) => r.querySelector(s);
  const presetsKey = 'hongdaeFilterPresets';
  const readPresets = () => { try { return JSON.parse(localStorage.getItem(presetsKey) || '[]'); } catch { return []; } };
  const writePresets = (list) => localStorage.setItem(presetsKey, JSON.stringify(list));
  const escapeHtml = (v) => String(v || '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const close = () => $('.xp-overlay')?.classList.remove('open');

  function ensureOverlay() {
    let overlay = $('.xp-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div'); overlay.className = 'xp-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.body.append(overlay); return overlay;
  }

  // "조건 N개" 배지 — 지금 켜져 있는 세부 필터 칩 수. indieOnly는 기본값이 켜짐이라 별도 조건으로 세지 않음.
  function conditionCount() { return activeDetailFilters.size; }

  function toggleTasteTag(tag) {
    const key = 'tag:' + tag;
    if (activeDetailFilters.has(key)) activeDetailFilters.delete(key); else activeDetailFilters.add(key);
    applyDetailFilterState();
    renderSheet();
  }

  function toggleStudentZone() {
    const on = activeDetailFilters.has('cert:hallOfFame') || activeDetailFilters.has('cert:affiliate');
    if (on) { activeDetailFilters.delete('cert:hallOfFame'); activeDetailFilters.delete('cert:affiliate'); }
    else { activeDetailFilters.add('cert:hallOfFame'); activeDetailFilters.add('cert:affiliate'); }
    applyDetailFilterState();
    renderSheet();
  }

  function applyPreset(preset) {
    activeDetailFilters.clear();
    (preset.filters || []).forEach((k) => activeDetailFilters.add(k));
    if (typeof preset.indieOnly === 'boolean' && preset.indieOnly !== indieOnly) {
      indieOnly = preset.indieOnly;
      localStorage.setItem('indieOnly', indieOnly ? '1' : '0');
    }
    applyDetailFilterState();
    renderSheet();
    if (typeof showToast === 'function') showToast(`"${preset.name}" 조건을 적용했어요`);
  }

  function savePreset() {
    if (activeDetailFilters.size === 0) { if (typeof showToast === 'function') showToast('저장할 조건을 먼저 골라주세요'); return; }
    const name = (window.prompt('이 조건에 이름을 붙여주세요 (예: 혼밥 점심)', '') || '').trim();
    if (!name) return;
    const list = readPresets();
    list.unshift({ name, filters: [...activeDetailFilters], indieOnly, savedCount: getFilteredStores().length });
    writePresets(list.slice(0, 8));
    renderSheet();
  }

  function deletePreset(index) {
    const list = readPresets();
    list.splice(index, 1);
    writePresets(list);
    renderSheet();
  }

  function resetAll() {
    clearDetailFilters();
    renderSheet();
  }

  function renderSheet() {
    const overlay = ensureOverlay();
    const total = stores.filter((s) => !(indieOnly && isFranchise(s))).length;
    const filtered = activeDetailFilters.size > 0 ? getFilteredStores().length : total;
    const presets = readPresets();
    const studentZoneOn = activeDetailFilters.has('cert:hallOfFame') || activeDetailFilters.has('cert:affiliate');
    const tagPool = [...new Set([...userTastes, ...TASTE_TAGS])];

    overlay.innerHTML = `
      <div class="xp-sheet">
        <div class="xp-handle"></div>
        <div class="xp-top">
          <span class="xp-kicker">조건 고르기</span>
          <button class="fs-reset" data-reset>초기화</button>
          <button class="xp-close" aria-label="닫기">✕</button>
        </div>
        <div class="fs-count"><span style="flex:1;font:500 12.5px Pretendard,sans-serif;color:#c39298">지금 조건이면 <b>${total}곳 → ${filtered}곳</b></span>${conditionCount() > 0 ? `<span class="fs-badge">조건 ${conditionCount()}</span>` : ''}</div>

        <div class="fs-section">
          <h4>취향 · 내 프로필에서 가져옴</h4>
          <div class="fs-chips">
            ${tagPool.map((t) => `<button class="fs-chip ${activeDetailFilters.has('tag:' + t) ? 'on' : ''}" data-tag="${escapeHtml(t)}">${escapeHtml(t)}${activeDetailFilters.has('tag:' + t) ? ' ✓' : ''}</button>`).join('')}
          </div>
        </div>

        <div class="fs-section">
          <h4>사실 · 데이터로 확인된 것만</h4>
          <div class="fs-switch-row">
            <button class="fs-switch ${indieOnly ? 'on' : ''}" data-toggle="indie"><span></span></button>
            <button class="fs-switch-label" data-toggle="indie">로컬·인디만 (프랜차이즈 제외)</button>
          </div>
          <div class="fs-switch-row">
            <button class="fs-switch ${studentZoneOn ? 'on' : ''}" data-toggle="student"><span></span></button>
            <button class="fs-switch-label" data-toggle="student">홍대생 명예학식 · 총학생회 제휴</button>
          </div>
        </div>

        <div class="fs-section">
          <h4>저장한 조건</h4>
          <div class="fs-presets">
            ${presets.map((p, i) => `<button class="fs-preset" data-preset="${i}"><b>${escapeHtml(p.name)}</b><small>조건 ${(p.filters || []).length} · 저장 당시 ${p.savedCount ?? '-'}곳</small><span class="fs-del" data-del-preset="${i}" title="삭제">✕</span></button>`).join('')}
            <button class="fs-preset-add" data-save-preset>＋</button>
          </div>
        </div>

        <div class="fs-cta"><button data-view-results>${filtered}곳 보기</button></div>
      </div>`;

    $('.xp-close', overlay).onclick = close;
    $('[data-reset]', overlay).onclick = resetAll;
    overlay.querySelectorAll('[data-tag]').forEach((b) => b.onclick = () => toggleTasteTag(b.dataset.tag));
    overlay.querySelectorAll('[data-toggle="indie"]').forEach((b) => b.onclick = () => { toggleIndieOnly(document.getElementById('chip-indie')); renderSheet(); });
    overlay.querySelectorAll('[data-toggle="student"]').forEach((b) => b.onclick = toggleStudentZone);
    overlay.querySelectorAll('[data-preset]').forEach((b) => b.onclick = (e) => { if (e.target.closest('[data-del-preset]')) return; applyPreset(presets[Number(b.dataset.preset)]); });
    overlay.querySelectorAll('[data-del-preset]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); deletePreset(Number(b.dataset.delPreset)); });
    $('[data-save-preset]', overlay).onclick = savePreset;
    $('[data-view-results]', overlay).onclick = () => { close(); if (window.HongdaeUI?.openResults) HongdaeUI.openResults(); };
  }

  function openFilters() { renderSheet(); $('.xp-overlay').classList.add('open'); }

  window.HongdaeExperience = window.HongdaeExperience || {};
  window.HongdaeExperience.openFilters = openFilters;
})();
