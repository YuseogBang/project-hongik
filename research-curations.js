(() => {
  // 사용자가 제공한 2026-10-03 1차 수집 메모. 현재 영업 정보로 검증하지 않았다.
  const collections = {
    mangwon: {title:'🌿 망원·이웃 골목 탐색', date:'2026-10-04', source:'',
      note:'카카오맵에서 확인한 장소의 영업시간·메뉴·특징입니다. 일부 장소는 합정·서교·상수·성산동에 있어 주소를 확인해 주세요.',
      places:(window.HONGDAE_MANGWON_RESEARCH?.places || []).map(record => [record.name, record.address, record.hours || '미기재', record.menu.map(row=>row[0]).join(', ') || record.features, record.source, record.type, record.tags, record])
    },
    ramen: {
      title: '🍜 라멘 한 그릇',
      date: '2025-09-02',
      note: '주소가 적힌 2025-09-02 게시물의 8곳입니다. 운영시간·메뉴·가격은 게시 당시 정보이며 현재 미확인입니다.',
      source: 'https://www.instagram.com/p/DOHmEZ5EhiH/',
      places: [
        ['니시무라멘 연남본점','마포구 동교로 265 4층','월·화·목 11:00-15:30 / 금~일 11:00-20:00 / 수 휴무','교카이파이탄(서울한정) 12,000원 · 부추시오라멘 12,000원'],
        ['하쿠텐라멘','마포구 동교로 266-12 반지하','매일 11:30-21:00 (LO 20:30)','이에케라멘 10,000원 · 매운이에케라멘 10,500원'],
        ['거북이의꿈 본점','마포구 성미산로 190-31 지1층','화~일 11:30-21:00 (LO 20:30) / 월 휴무','카이센 마제소바 16,000원 · 카메미소라멘 11,000원'],
        ['무겐스위치','마포구 동교로 242-13','매일 11:30-21:00 (LO 20:30)','풀토핑라멘 11,000원 · 이에케라멘 9,500원'],
        ['라멘롱시즌','마포구 동교로34길 21 지1층','화~일 11:30-20:00 (LO 19:30) / 월 휴무','곤부스이 츠케멘 11,000원 · 이리코 시오 라멘 10,000원'],
        ['566라멘','마포구 연남로3길 33 1층','매일 11:00-20:30 (LO 20:00)','大라멘 12,000원 · 大 시루나시 지로 12,000원'],
        ['라멘 무메이','마포구 동교로27길 12 103호','11:30-20:00 (LO 19:30) / 토 휴무','파이탄 쇼유 라멘 9,000원 · 아부라소바 8,000원'],
        ['마시타야','마포구 와우산로29라길 26','매일 11:00-17:30 (LO 17:00)','블랙라멘 11,000원 · 시오라멘 11,000원']
      ]
    },
    bar: {
      title: '🍸 혼술 자리 찾기',
      date: '2026-10-03',
      note: '2026-10-03 사용자 수집 메모의 3곳입니다. 주소·운영시간이 비어 있는 곳도 포함되며 현재 영업 여부는 미확인입니다.',
      source: '',
      places: [
        ['야닝','마포구 양화로6길 99-11 3층','12:30-01:00 / 화 휴무','칵테일·하이볼·나쵸·카나페 / 가격 미기재'],
        ['블렌딩바 연남','마포구 동교로38길 33-9','미기재','미기재'],
        ['실락원','미기재','미기재','미기재']
      ]
    }
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const normalize = (value) => String(value || '').replace(/[^0-9a-zA-Z가-힣]/g, '').toLowerCase();
  const roadKey = (address) => {
    const match = String(address).match(/([가-힣0-9]+(?:로|길))\s*([0-9]+(?:-[0-9]+)?)(?:\s|$)/);
    return match ? normalize(match[1] + match[2]) : '';
  };
  function matchingPlace(results, name, address, expectedId) {
    const wantedName = normalize(name), wantedRoad = roadKey(address);
    return results.find((place) => {
      if (expectedId && String(place.id) !== String(expectedId)) return false;
      const foundName = normalize(place.place_name), foundRoad = roadKey(place.road_address_name || place.address_name);
      if(name==='망원시장' && /상인회|협회|사무실/.test(place.place_name))return false;
      return Number(place.x)>=126.890 && Number(place.x)<=126.939 && Number(place.y)>=37.543 && Number(place.y)<=37.572 && (foundName === wantedName || foundName.includes(wantedName) || wantedName.includes(foundName)) && (!wantedRoad || wantedRoad === foundRoad);
    });
  }
  function searchKakao(name, address, expectedId) {
    return new Promise((resolve) => {
      if (!window.kakao?.maps?.services?.Places) return resolve({ error: '카카오 지도를 불러오지 못했어요.' });
      const query = `${name} 마포구`;
      let settled = false;
      const finish = result => { if (settled) return; settled = true; clearTimeout(timer); resolve(result); };
      const timer = setTimeout(() => finish({error:'장소 검색이 지연되고 있어요. 잠시 후 다시 열어 주세요.'}), 8000);
      new kakao.maps.services.Places().keywordSearch(query, (data, status) => {
        if (status === kakao.maps.services.Status.ERROR) return finish({ error: '카카오 검색을 잠시 이용할 수 없어요.' });
        finish({ place: matchingPlace(status === kakao.maps.services.Status.OK ? data : [], name, address, expectedId) });
      }, { size: 15 });
    });
  }
  function addToMap(place, item, kind, collection) {
    const [, , hours, menu] = item;
    let store = stores.find((entry) => String(entry.kakaoId) === String(place.id));
    if (!store) {
      const address = place.road_address_name || place.address_name;
      const dong = (place.address_name || '').match(/(서교동|연남동|합정동|상수동|동교동|망원동)/)?.[1] || '홍대';
      store = { id: -Number(place.id), kakaoId: place.id, name: place.place_name,
        type: item[5] || (kind === 'ramen' ? 'restaurant' : 'bar'), status: 'unverified',
        lat: Number(place.y), lng: Number(place.x), address, dong, category: place.category_name,
        kakaoUrl: place.place_url, naverUrl: `https://map.naver.com/p/search/${encodeURIComponent(place.place_name + ' ' + address)}`,
        rating: null, reviews: null, months: null, rent: null, score: null, tags: [],
        insight: '카카오 장소 검색에서 위치를 확인했습니다. 현재 영업 여부는 방문 전에 확인해 주세요.' };
      stores.push(store);
      if (!item[7] && typeof renderAll === 'function') renderAll();
    }
    if(kind === "mangwon"){store.tags=[...new Set([...(store.tags||[]),...(item[6]||[])])];store.researchSource=item[4];store.researchChecked=collection.date;}
    store.curationGroups = [...new Set([...(store.curationGroups || []), kind])];
    if (!store.signatureMenu && menu !== '미기재') {
      store.signatureMenu = menu;
      store.menuSourceNote = `${collection.date} 게시 당시 정보 · 현재 미확인`;
    }
    if (!store.hours && hours !== '미기재') {
      store.hours = hours;
      store.hoursNote = `${collection.date} 게시 당시 정보 · 현재 미확인`;
    }
    const record = item[7];
    if (record) {
      store.hours = record.hours || '';
      store.hoursNote = `${record.checked} 카카오맵 표시 기준`;
      store.signatureMenu = record.menu.map(row => row[0]);
      store.insight = record.features;
      store.researchNote = record.note;
      store.surveyMenu = {...record, note: `10/4~10/10 표시 기준 · ${record.note}`};
    }
    return store;
  }
  const style = document.createElement('style');
  style.textContent = `
    .hr-overlay{position:fixed;inset:0;z-index:940;display:none;align-items:flex-end;justify-content:center;padding:12px;background:rgba(12,2,5,.72);font-family:Pretendard,sans-serif}.hr-overlay.open{display:flex}
    .hr-panel{width:min(100%,500px);max-height:85vh;overflow:auto;padding:22px;border:1px solid var(--border);border-radius:24px;background:var(--bg);color:var(--text)}
    .hr-head{display:flex;align-items:center;gap:10px}.hr-head h2{flex:1;margin:0;font-size:21px}.hr-close{padding:8px 11px;border:1px solid var(--border);border-radius:99px;background:var(--surface);color:var(--text);font:700 12px Pretendard,sans-serif}
    .hr-note{margin:13px 0;color:var(--muted);font-size:12px;line-height:1.6}.hr-place{display:block;width:100%;text-align:left;margin:8px 0;padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--surface);color:var(--text);font:700 14px Pretendard,sans-serif}.hr-place small{display:block;margin-top:5px;color:var(--muted);font-size:11px;font-weight:500}.hr-source{display:inline-block;margin:3px 0 12px;color:var(--accent2);font-size:11px}
    @media(min-width:701px){.hr-overlay{align-items:center}}
  `;
  document.head.append(style);
  const root = document.createElement('div');
  root.className = 'hr-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.addEventListener('click', (event) => { if (event.target === root) close(); });
  function close() { requestId++; root.classList.remove('open'); }
  let requestId = 0;
  async function open(kind) {
    const collection = collections[kind];
    if (!collection) return;
    window.HongdaeDiscovery?.close?.();
    const token = ++requestId;
    root.innerHTML = `<section class="hr-panel"><div class="hr-head"><h2>${escapeHtml(collection.title)}</h2><button type="button" class="hr-close">닫기 ✕</button></div><p class="hr-note">카카오 지도에서 장소를 대조하고 있어요.</p></section>`;
    root.classList.add('open');
    root.querySelector('.hr-close').onclick = close;
    const found = [], missing = [];
    for (const item of collection.places) {
      const existing = item[7] && stores.find(store => String(store.kakaoId) === String(item[7].kakaoId));
      if (existing) { found.push(existing); continue; }
      const result = await searchKakao(item[0], item[1], item[7]?.kakaoId);
      if (token !== requestId) return;
      if (result.error) { root.querySelector('.hr-note').textContent = result.error; return; }
      if (result.place) found.push(addToMap(result.place, item, kind, collection));
      else missing.push(item[0]);
    }
    if (typeof renderAll === 'function') renderAll();
    const unique = [...new Map(found.map((store) => [store.id, store])).values()].filter(store=>!indieOnly||!isFranchise(store));
    root.innerHTML = `<section class="hr-panel"><div class="hr-head"><h2>${escapeHtml(collection.title)}</h2><button type="button" class="hr-close">닫기 ✕</button></div><p class="hr-note">카카오 장소 검색으로 상호·주소를 대조한 ${unique.length}곳입니다. 누르면 기존 식당과 같은 장소 카드가 열립니다. 영업시간·메뉴는 ${escapeHtml(collection.date)} 표시 기준이며 방문 전에 확인해 주세요.</p>${collection.source ? `<a class="hr-source" href="${collection.source}" target="_blank" rel="noopener noreferrer">수집 게시물 보기 ↗</a>` : ''}${unique.map((store) => `<button type="button" class="hr-place" data-store="${store.id}">${escapeHtml(store.name)}<small>${escapeHtml(store.address)} · 장소 카드 보기 →</small></button>${store.researchSource?`<a class="hr-source" href="${escapeHtml(store.researchSource)}" target="_blank" rel="noopener noreferrer">카카오맵 상세 ↗</a>`:""}`).join('')}${missing.length ? `<p class="hr-note">카카오 검색에서 대조되지 않아 보류: ${escapeHtml(missing.join(', '))}</p>` : ''}</section>`;
    root.querySelector('.hr-close').onclick = close;
    root.querySelectorAll('[data-store]').forEach((button) => button.onclick = () => { close(); selectStore(Number(button.dataset.store)); });
  }
  function renderEntry(host) {
    if (!host) return;
    host.innerHTML = `<p class="discovery-intro" style="margin-top:20px">카카오 지도에서 대조해 보는 큐레이션</p><button type="button" class="discovery-theme" data-research="ramen">🍜 라멘 한 그릇 <span>검색 →</span><small>주소가 있는 라멘집 8곳</small></button><button type="button" class="discovery-theme" data-research="bar">🍸 혼술 자리 찾기 <span>검색 →</span><small>수집 메모의 바 3곳</small></button><button type="button" class="discovery-theme" data-research="mangwon">🌿 망원·이웃 골목 탐색 <span>검색 →</span><small>카카오맵으로 확인한 주점·식당·서점·소품 공간 ${collections.mangwon.places.length}곳</small></button>`;
    host.querySelectorAll('[data-research]').forEach((button) => button.onclick = () => open(button.dataset.research));
  }
  let loading;
  function loadMangwon() {
    if (loading) return loading;
    loading = (async () => {
      for (const item of collections.mangwon.places) {
        const existing = stores.find(store => String(store.kakaoId) === item[7].kakaoId);
        if (existing) {
          addToMap({id:existing.kakaoId, place_name:existing.name, x:existing.lng, y:existing.lat,
            road_address_name:existing.address, address_name:existing.address, place_url:item[7].source}, item, 'mangwon', collections.mangwon);
          continue;
        }
        const result = await searchKakao(item[0], item[1], item[7].kakaoId);
        if (result.error) break;
        if (result.place) addToMap(result.place, item, 'mangwon', collections.mangwon);
      }
      if (typeof renderAll === 'function') renderAll();
    })();
    return loading;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.body.append(root);
    if (window.kakao?.maps?.load) kakao.maps.load(() => loadMangwon());
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  window.HongdaeResearch = { renderEntry, open, close, loadMangwon, matchingPlace };
})();
