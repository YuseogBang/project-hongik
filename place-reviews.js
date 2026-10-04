(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const style = document.createElement('style');
  style.textContent = `.place-reviews{font-family:Pretendard,sans-serif;padding:18px;border:1px solid var(--border,#e2c8c4);border-radius:16px;background:var(--surface,#fff8f4);color:var(--text,#3d0f16)}.place-reviews h3{margin:0 0 8px;font-size:17px}.place-reviews p{font-size:12px;line-height:1.5}.place-reviews .pr-muted{color:var(--muted,#865e63)}.place-reviews textarea{width:100%;box-sizing:border-box;min-height:84px;margin:10px 0;padding:11px;border:1px solid #ae7a79;border-radius:10px;background:#fff;color:#341317;font:13px Pretendard,sans-serif;resize:vertical}.place-reviews button{cursor:pointer;font:700 12px Pretendard,sans-serif}.place-reviews .pr-primary{padding:9px 14px;border:0;border-radius:10px;background:#e8362a;color:#fff}.place-reviews .pr-secondary{padding:8px 11px;border:1px solid #aa7c7b;border-radius:10px;background:transparent;color:inherit}.place-reviews .pr-stars{display:flex;gap:5px}.place-reviews .pr-stars button{border:0;background:transparent;color:#ab8f8c;font-size:28px;padding:0 2px}.place-reviews .pr-stars button.on{color:#e8362a}.place-reviews .pr-item{border-top:1px solid #d6bdb9;padding:12px 0}.place-reviews .pr-item:first-child{border-top:0}.place-reviews .pr-item p{margin:7px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}.place-reviews .pr-error{color:#b92c23}`;
  document.head.append(style);
  let currentPlace = null;
  let currentRows = [];
  let rating = 5;

  async function logInterest(placeId, eventType) {
    await Promise.race([
      window.HongdaePlatform?.whenReady() || Promise.resolve(),
      new Promise(resolve => setTimeout(resolve, 8000))
    ]);
    const sb = window.HongdaePlatform?.getClient();
    const user = window.HongdaePlatform?.getUser();
    if (!sb || !user || !Number.isSafeInteger(Number(placeId))) return;
    if (eventType === 'view') {
      const key = `hongdae-interest-view-${placeId}`;
      const previous = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - previous < 30 * 60 * 1000) return;
      sessionStorage.setItem(key, String(Date.now()));
    }
    const { error } = await sb.from('place_interest_events').insert({ place_id:Number(placeId), event_type:eventType });
    if (error) console.warn('Interest event was not recorded:', error.message);
  }

  async function mount(placeId) {
    currentPlace = Number(placeId);
    const host = document.querySelector(`[data-place-reviews="${currentPlace}"]`);
    if (!host) return;
    host.innerHTML = '<h3>방문자 리뷰</h3><p class="pr-muted">리뷰를 불러오는 중이에요.</p>';
    await Promise.race([
      window.HongdaePlatform?.whenReady() || Promise.resolve(),
      new Promise(resolve => setTimeout(resolve, 8000))
    ]);
    if (currentPlace !== Number(placeId) || !host.isConnected) return;
    const sb = window.HongdaePlatform?.getClient();
    if (!sb) {
      host.innerHTML = '<h3>방문자 리뷰</h3><p class="pr-error">리뷰 서버가 아직 연결되지 않았어요.</p>';
      return;
    }
    // Count people, not collection entries: the same person can save to several lists.
    sb.rpc('place_save_count', {requested_place_id:Number(placeId)}).then(({data,error})=>{
      if (error || !host.isConnected || currentPlace !== Number(placeId)) return;
      const total=Number(data); if(!Number.isSafeInteger(total) || total<0)return;
      let label=host.parentElement.querySelector('[data-save-count]');
      if(!label){label=document.createElement('p');label.dataset.saveCount='';label.style.cssText='margin:12px 0;font:700 12px Pretendard,sans-serif;color:var(--muted)';host.before(label);}
      label.textContent=`♥ ${total.toLocaleString('ko-KR')}명이 저장했어요`;
      label.title='로그인 사용자 기준 · 여러 컬렉션에 저장해도 한 명으로 집계';
    }).catch(()=>{});
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let result;
    try { result = await sb.from('place_reviews').select('id,user_id,rating,body,status,created_at').eq('place_id', currentPlace).order('created_at', { ascending:false }).limit(50).abortSignal(controller.signal); }
    catch (error) { result = { error }; }
    clearTimeout(timer);
    if (currentPlace !== Number(placeId) || !host.isConnected) return;
    if (result.error) {
      host.innerHTML = '<h3>방문자 리뷰</h3><p class="pr-error">리뷰를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p><button type="button" class="pr-secondary">다시 시도</button>';
      host.querySelector('button').onclick = () => mount(placeId);
      return;
    }
    currentRows = result.data || [];
    render(host);
  }

  function render(host) {
    const user = window.HongdaePlatform?.getUser();
    const own = currentRows.find(row => row.user_id === user?.id);
    if (own) rating = own.rating;
    host.innerHTML = `<h3>방문자 리뷰 <small>(${currentRows.filter(r => r.status === 'published').length})</small></h3>
      <p class="pr-muted">직접 다녀온 경험을 남겨 주세요. 업체당 리뷰는 하나씩 작성할 수 있어요.</p>
      ${user ? `<form data-review-form><div class="pr-stars" role="group" aria-label="별점">${[1,2,3,4,5].map(n => `<button type="button" data-rating="${n}" aria-label="${n}점" class="${n <= rating ? 'on' : ''}">★</button>`).join('')}</div><textarea name="body" minlength="5" maxlength="500" required placeholder="메뉴, 분위기, 다시 가고 싶은 이유를 적어 주세요.">${own ? escape(own.body) : ''}</textarea><div style="display:flex;gap:8px"><button class="pr-primary" type="submit">${own ? '리뷰 수정' : '리뷰 등록'}</button>${own ? '<button class="pr-secondary" type="button" data-delete>삭제</button>' : ''}</div><p class="pr-error" data-error role="alert"></p></form>` : '<button type="button" class="pr-primary" data-login>로그인하고 리뷰 쓰기</button>'}
      <div style="margin-top:16px">${currentRows.filter(row => row.status === 'published').length ? currentRows.filter(row => row.status === 'published').map(row => `<article class="pr-item"><strong>${row.user_id === user?.id ? '내 리뷰' : '방문자'} · ${'★'.repeat(row.rating)}${'☆'.repeat(5-row.rating)}</strong> <small class="pr-muted">${new Date(row.created_at).toLocaleDateString('ko-KR')}</small><p>${escape(row.body)}</p></article>`).join('') : '<p class="pr-muted">아직 리뷰가 없어요. 첫 경험을 남겨 주세요.</p>'}</div>`;
    host.querySelector('[data-login]')?.addEventListener('click', () => window.HongdaePlatform.openDialog());
    host.querySelectorAll('[data-rating]').forEach(button => button.onclick = () => {
      rating = Number(button.dataset.rating);
      host.querySelectorAll('[data-rating]').forEach(b => b.classList.toggle('on', Number(b.dataset.rating) <= rating));
    });
    host.querySelector('[data-review-form]')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const body = form.elements.body.value.trim();
      if (body.length < 5 || body.length > 500) return setError(form, '리뷰는 5~500자로 적어 주세요.');
      const button = form.querySelector('[type=submit]'); button.disabled = true;
      const sb = window.HongdaePlatform.getClient();
      const user = window.HongdaePlatform.getUser();
      const row = { place_id:currentPlace, user_id:user.id, rating, body };
      const { error } = own ? await sb.from('place_reviews').update({ rating, body }).eq('id', own.id).eq('user_id', user.id) : await sb.from('place_reviews').insert(row);
      button.disabled = false;
      if (error) return setError(form, '저장하지 못했어요. 로그인 상태와 리뷰 서버 설정을 확인해 주세요.');
      mount(currentPlace);
    });
    host.querySelector('[data-delete]')?.addEventListener('click', async () => {
      if (!window.confirm('내 리뷰를 삭제할까요?')) return;
      const { error } = await window.HongdaePlatform.getClient().from('place_reviews').delete().eq('id', own.id).eq('user_id', user.id);
      if (error) return setError(host, '삭제하지 못했어요. 다시 시도해 주세요.');
      rating = 5; mount(currentPlace);
    });
  }
  function setError(host, message) { const node = host.querySelector('[data-error]'); if (node) node.textContent = message; }
  window.addEventListener('hongdae-auth-changed', () => { if (currentPlace != null && document.querySelector(`[data-place-reviews="${currentPlace}"]`)) mount(currentPlace); });
  window.HongdaeReviews = { mount, logInterest };
})();
