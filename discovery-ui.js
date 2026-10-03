(() => {
  const themes = [
    { title: '조용한 카페', detail: '대화하거나 쉬어가기 좋은 공간', type: 'cafe', tag: '조용한' },
    { title: '혼자 먹는 한 끼', detail: '혼자 들르기 좋은 음식점', type: 'restaurant', tag: '혼밥' },
    { title: '홍대의 밤', detail: '술과 함께 머무는 장소', type: 'bar', tag: '술안주' }
  ];
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
    .discovery-intro{color:var(--muted);font-size:12px;line-height:1.55;margin:0 0 14px}.discovery-theme{width:100%;display:block;text-align:left;margin:8px 0;padding:16px;border:1px solid var(--border);border-radius:15px;background:var(--surface);color:var(--text);font:700 15px Pretendard,sans-serif}.discovery-theme small{display:block;margin-top:6px;color:var(--muted);font-size:11px;font-weight:500}.discovery-theme span{float:right;color:var(--accent2);font-size:12px}
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
  root.setAttribute('aria-label', '큐레이션과 내 취향');
  root.addEventListener('click', (event) => { if (event.target === root) close(); });

  function close() { root.classList.remove('open'); }
  function open(nextTab = 'curation') {
    tab = nextTab;
    selectedTheme = null;
    draftTastes = [...userTastes];
    render();
    root.classList.add('open');
    root.querySelector('.discovery-close')?.focus();
  }
  function render() {
    const header = `<div class="discovery-head"><h2>${selectedTheme ? escapeHtml(selectedTheme.title) : '내 홍대 찾기'}</h2><button class="discovery-close" type="button" aria-label="닫기">닫기 ✕</button></div>`;
    let body;
    if (selectedTheme) {
      const matches = stores.filter((store) => store.status !== 'closed' && store.type === selectedTheme.type && (store.tags || []).includes(selectedTheme.tag));
      body = `<p class="discovery-intro" style="margin-top:14px">등록된 장소의 유형과 태그로 모은 ${matches.length}곳입니다. 방문 전 영업 여부를 확인해 주세요.</p><div class="discovery-list">${matches.length ? matches.map((store) => `<button type="button" class="discovery-place" data-place="${store.id}">${escapeHtml(store.name)}<small>${escapeHtml(store.dong || '홍대')} · ${escapeHtml(store.category || store.type)}</small></button>`).join('') : '<p class="discovery-intro">조건에 맞는 장소가 아직 없어요.</p>'}</div><button type="button" class="discovery-apply" data-back>다른 모음 보기</button>`;
    } else {
      body = `<div class="discovery-tabs"><button type="button" data-tab="curation" class="${tab === 'curation' ? 'on' : ''}">테마별 장소</button><button type="button" data-tab="taste" class="${tab === 'taste' ? 'on' : ''}">내 취향 선택</button></div>`;
      if (tab === 'curation') body += `<p class="discovery-intro">실제 등록된 장소를 태그 기준으로 모았습니다. 홍익인 추천 콘텐츠는 확인된 자료가 등록되면 별도로 표시됩니다.</p>${themes.map((theme, index) => `<button type="button" class="discovery-theme" data-theme="${index}">${escapeHtml(theme.title)} <span>장소 보기 →</span><small>${escapeHtml(theme.detail)}</small></button>`).join('')}`;
      else body += `<p class="discovery-intro">원하는 취향을 골라 주세요. 이 기기에 저장되고 추천 순위에 반영됩니다.</p><div class="discovery-tags">${TASTE_TAGS.map((tag) => `<button type="button" data-taste="${escapeHtml(tag)}" class="${draftTastes.includes(tag) ? 'on' : ''}" aria-pressed="${draftTastes.includes(tag)}">${escapeHtml(tag)}</button>`).join('')}</div><button type="button" class="discovery-apply" data-apply>취향 저장하고 장소 보기</button>`;
    }
    root.innerHTML = `<section class="discovery-panel">${header}${body}</section>`;
    root.querySelector('.discovery-close').onclick = close;
    root.querySelectorAll('[data-tab]').forEach((button) => button.onclick = () => { tab = button.dataset.tab; render(); });
    root.querySelectorAll('[data-theme]').forEach((button) => button.onclick = () => { selectedTheme = themes[Number(button.dataset.theme)]; render(); });
    root.querySelector('[data-back]')?.addEventListener('click', () => { selectedTheme = null; render(); });
    root.querySelectorAll('[data-place]').forEach((button) => button.onclick = () => { close(); selectStore(Number(button.dataset.place)); });
    root.querySelectorAll('[data-taste]').forEach((button) => button.onclick = () => { const tag = button.dataset.taste; draftTastes = draftTastes.includes(tag) ? draftTastes.filter((item) => item !== tag) : [...draftTastes, tag]; render(); });
    root.querySelector('[data-apply]')?.addEventListener('click', () => { if (!draftTastes.length) return window.alert('취향을 하나 이상 골라주세요.'); userTastes = draftTastes; localStorage.setItem('userTastes', JSON.stringify(userTastes)); close(); showTasteView(); HongdaeUI.openResults(); });
  }
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.querySelector('#category-bar');
    if (!bar) return;
    const entry = document.createElement('div');
    entry.className = 'discovery-entry';
    entry.innerHTML = '<button type="button" data-open-curation>테마별 장소</button><button type="button" data-open-taste>내 취향 선택</button>';
    bar.append(entry);
    entry.querySelector('[data-open-curation]').onclick = () => open('curation');
    entry.querySelector('[data-open-taste]').onclick = () => open('taste');
    document.body.append(root);
  });
  window.HongdaeDiscovery = { open };
})();
