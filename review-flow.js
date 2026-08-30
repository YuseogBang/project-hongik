/* 2026-08-30: 디자인 캔버스("홍대맵 유저 저니" s07 "다녀온 뒤", 4a안 "태그 우선 리뷰")에서 제안한
   방문 후 리뷰 플로우. journey-features.js에 있던 1단계짜리 리뷰 카드(뭐 좋았는지 태그 + 점수를
   한 화면에서 동시에 고르던 방식)를 "태그(뭐가 좋았나요) → 아쉬운 점 → 한 줄" 3단계로 바꿉니다.
   * journey-features.js 파일 자체는 건드리지 않고, 이 파일이 나중에 로드되면서 그 카드(.jf-card)를
     지우고 새 3단계 카드(.rf-card)로 바꿔치기하는 방식이라 안전합니다.
   * 기존과 같은 localStorage 키(hongdaeTagReviews)를 그대로 써서, 이전에 남긴 기록도 계속 보입니다. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .rf-card{margin-top:18px;border:1px solid #7a2534;border-radius:16px;background:#3d0f16;padding:16px 18px}
    .rf-top{display:flex;align-items:center;gap:10px;margin-bottom:14px}
    .rf-top b{flex:1;font:800 15px Pretendard,sans-serif;color:#f5ece7}
    .rf-step{font:500 11px 'DM Mono',monospace;color:#8a5f66}
    .rf-copy{margin:0 0 13px;font:400 12.5px/1.6 Pretendard,sans-serif;color:#c39298}
    .rf-scores{display:flex;gap:8px;margin-bottom:16px}
    .rf-score{flex:1;height:56px;border-radius:13px;border:1px solid #7a2534;background:#4f151e;color:#c39298;cursor:pointer;font:700 14px Pretendard,sans-serif}
    .rf-score.on{border-color:#e8362a;background:rgba(232,54,42,.18);color:#f5ece7}
    .rf-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}
    .rf-chip{font:600 12.5px Pretendard,sans-serif;padding:9px 14px;border-radius:99px;border:1px solid #7a2534;background:#4f151e;color:#c39298;cursor:pointer}
    .rf-chip.on{border-color:transparent;background:#e8362a;color:#fff}
    .rf-note{width:100%;box-sizing:border-box;margin-top:4px;min-height:70px;border-radius:12px;border:1px solid #7a2534;background:#2b070c;color:#f5ece7;font:400 13.5px/1.6 Pretendard,sans-serif;padding:11px 13px;resize:vertical}
    .rf-actions{display:flex;gap:9px;margin-top:16px}
    .rf-actions button{border:none;border-radius:14px;font:700 14.5px Pretendard,sans-serif;cursor:pointer;height:46px}
    .rf-back{flex:none;width:70px;background:#4f151e;color:#c39298}
    .rf-next{flex:1;background:#e8362a;color:#fff}
    .rf-skip{margin-top:10px;width:100%;text-align:center;background:none;border:none;color:#8a5f66;font:500 12.5px Pretendard,sans-serif;cursor:pointer}
    .rf-done{font:500 13px Pretendard,sans-serif;color:#8a5f66;margin-top:10px}
  `;
  document.head.append(style);

  const reviewKey = 'hongdaeTagReviews';
  const getReviews = () => { try { return JSON.parse(localStorage.getItem(reviewKey) || '[]'); } catch { return []; } };
  const setReviews = (list) => localStorage.setItem(reviewKey, JSON.stringify(list));

  const POS_TAGS = ['가성비', '응대', '웨이팅', '혼밥', '분위기', '맛'];
  const NEG_TAGS = ['웨이팅 길었어요', '양이 적어요', '가격이 아쉬워요', '응대가 아쉬워요', '시끄러웠어요'];

  function renderCard(id) {
    const host = document.getElementById('detail-content');
    if (!id || !host) return;
    // journey-features.js의 예전 1단계 카드가 먼저 그려져 있으면 지우고 새 카드로 교체
    host.querySelector('.jf-card')?.remove();
    if (host.querySelector('.rf-card')) return; // 이미 이번 방문에 대해 새 카드가 떠있으면 중복 삽입 방지

    const store = (typeof stores !== 'undefined' ? stores.find((s) => s.id === id) : null);
    const prior = getReviews().filter((r) => r.id === id);
    const state = { step: 1, score: null, posTags: new Set(), negTags: new Set(), note: '' };

    const box = document.createElement('section');
    box.className = 'rf-card';
    host.append(box);

    function render() {
      if (state.step === 1) {
        box.innerHTML = `
          <div class="rf-top"><b>다녀오셨나요?</b><span class="rf-step">1 / 3</span></div>
          <p class="rf-copy">또 갈 만했는지, 뭐가 좋았는지 골라주세요. 다음 사람 추천에 그대로 쓰여요.</p>
          <div class="rf-scores">
            <button class="rf-score ${state.score === 'again' ? 'on' : ''}" data-score="again">또 간다</button>
            <button class="rf-score ${state.score === 'okay' ? 'on' : ''}" data-score="okay">보통</button>
            <button class="rf-score ${state.score === 'no' ? 'on' : ''}" data-score="no">아니다</button>
          </div>
          <div class="rf-chips">${POS_TAGS.map((t) => `<button class="rf-chip ${state.posTags.has(t) ? 'on' : ''}" data-pos="${t}">${t}${state.posTags.has(t) ? ' ✓' : ''}</button>`).join('')}</div>
          <div class="rf-actions"><button class="rf-next" data-next>다음 · 아쉬운 점</button></div>
          ${prior.length ? `<p class="rf-done">내 기록 ${prior.length}건</p>` : ''}`;
        box.querySelectorAll('[data-score]').forEach((b) => b.onclick = () => { state.score = b.dataset.score; render(); });
        box.querySelectorAll('[data-pos]').forEach((b) => b.onclick = () => { const t = b.dataset.pos; state.posTags.has(t) ? state.posTags.delete(t) : state.posTags.add(t); render(); });
        box.querySelector('[data-next]').onclick = () => {
          if (!state.score) { if (typeof showToast === 'function') showToast('먼저 한 가지를 골라주세요'); return; }
          state.step = 2; render();
        };
      } else if (state.step === 2) {
        box.innerHTML = `
          <div class="rf-top"><b>아쉬운 점이 있었나요?</b><span class="rf-step">2 / 3</span></div>
          <p class="rf-copy">없으면 건너뛰어도 괜찮아요.</p>
          <div class="rf-chips">${NEG_TAGS.map((t) => `<button class="rf-chip ${state.negTags.has(t) ? 'on' : ''}" data-neg="${t}">${t}${state.negTags.has(t) ? ' ✓' : ''}</button>`).join('')}</div>
          <div class="rf-actions"><button class="rf-back" data-back>이전</button><button class="rf-next" data-next>다음 · 한 줄</button></div>
          <button class="rf-skip" data-skip-note>바로 보내기</button>`;
        box.querySelectorAll('[data-neg]').forEach((b) => b.onclick = () => { const t = b.dataset.neg; state.negTags.has(t) ? state.negTags.delete(t) : state.negTags.add(t); render(); });
        box.querySelector('[data-back]').onclick = () => { state.step = 1; render(); };
        box.querySelector('[data-next]').onclick = () => { state.step = 3; render(); };
        box.querySelector('[data-skip-note]').onclick = () => submit();
      } else {
        box.innerHTML = `
          <div class="rf-top"><b>한 줄로 남겨주세요</b><span class="rf-step">3 / 3</span></div>
          <p class="rf-copy">안 써도 지금까지 고른 내용은 그대로 저장돼요.</p>
          <textarea class="rf-note" maxlength="200" placeholder="예: 혼자 가기 편하고 국물이 맑아서 해장으로 좋았어요">${state.note}</textarea>
          <div class="rf-actions"><button class="rf-back" data-back>이전</button><button class="rf-next" data-submit>보내기</button></div>`;
        const textarea = box.querySelector('.rf-note');
        textarea.oninput = () => { state.note = textarea.value; };
        box.querySelector('[data-back]').onclick = () => { state.step = 2; render(); };
        box.querySelector('[data-submit]').onclick = () => submit();
      }
    }

    function submit() {
      const tags = [...state.posTags, ...state.negTags];
      const all = getReviews();
      all.unshift({ id, score: state.score, tags, note: state.note || '', at: Date.now() });
      setReviews(all);
      if (state.score === 'again' && typeof TASTE_TAGS !== 'undefined' && typeof userTastes !== 'undefined') {
        let changed = false;
        state.posTags.forEach((t) => { if (TASTE_TAGS.includes(t) && !userTastes.includes(t)) { userTastes.push(t); changed = true; } });
        if (changed) localStorage.setItem('userTastes', JSON.stringify(userTastes));
      }
      if (typeof showToast === 'function') showToast('내 취향 기록에 반영했어요');
      box.remove();
      renderCard(id); // 방금 남긴 기록을 "내 기록 N건"에 반영해 다시 그려줌
    }

    render();
  }

  // 이 파일은 main.html 하단 <script> 목록에서 experience-ui.js·journey-features.js보다
  // 뒤에 로드되므로, 이 시점엔 이미 window.HongdaeExperience.recordView가 만들어져 있습니다.
  // (DOMContentLoaded를 기다리면 오히려 다른 파일과 실행 순서가 꼬일 수 있어 즉시 감쌉니다.)
  if (window.HongdaeExperience) {
    const base = window.HongdaeExperience.recordView;
    window.HongdaeExperience.recordView = (id) => { base(id); setTimeout(() => renderCard(id), 0); };
  }
})();
