(() => {
  let client = null;
  let profile = null;
  const $ = (selector) => document.querySelector(selector);

  function notice(message) {
    if (typeof showToast === 'function') showToast(message);
    else window.alert(message);
  }

  function renderAccount() {
    const button = $('#account-button');
    if (!button) return;
    button.textContent = client && profile ? (profile.display_name || '내 계정').slice(0, 8) : '로그인';
    button.title = client && profile ? '내 컬렉션' : '로그인';
  }

  async function loadProfile(user) {
    const { data } = await client.from('profiles').select('id, display_name, role').eq('id', user.id).single();
    profile = data || null;
    renderAccount();
    const adminLink = $('#admin-menu-link');
    if (adminLink) adminLink.hidden = !profile || profile.role !== 'admin';
  }

  async function openDialog() {
    let dialog = $('#account-dialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'account-dialog';
      dialog.style.cssText = 'position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(0,0,0,.6);padding:20px';
      dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.remove(); });
      document.body.appendChild(dialog);
    }
    if (!client) {
      dialog.innerHTML = '<section style="max-width:360px;width:100%;padding:24px;border-radius:16px;background:#3d0f16;border:1px solid #7a2534;color:#f5ece7"><b>로그인 준비 중</b><p style="color:#c39298;font-size:13px;line-height:1.6">관리자가 Supabase 연결을 완료하면 개인 컬렉션을 사용할 수 있어요.</p><button onclick="this.closest(\'#account-dialog\').remove()">닫기</button></section>';
      return;
    }
    if (!profile) {
      dialog.innerHTML = `<section style="max-width:360px;width:100%;padding:24px;border-radius:16px;background:#3d0f16;border:1px solid #7a2534;color:#f5ece7">
        <h2 style="margin:0 0 8px">홍대맵 로그인</h2>
        <p style="color:#c39298;font-size:13px;line-height:1.6">아래 계정으로 바로 로그인할 수 있어요.</p>
        <div style="display:grid;gap:10px;margin-top:12px">
          <button id="login-google" style="padding:12px;border:0;border-radius:8px;background:#fff;color:#1f1f1f;font-weight:700">Google로 계속하기</button>
          <button id="login-kakao" style="padding:12px;border:0;border-radius:8px;background:#fee500;color:#191600;font-weight:700">카카오로 계속하기</button>
          <button id="login-naver" style="padding:12px;border:0;border-radius:8px;background:#03c75a;color:#fff;font-weight:700">네이버로 계속하기</button>
        </div>
        <button type="button" id="dialog-close" style="margin-top:14px;width:100%;padding:8px;background:transparent;border:0;color:#c39298">닫기</button>
      </section>`;
      $('#dialog-close').onclick = () => dialog.remove();
      const signIn = (provider) => async () => {
        const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: location.href } });
        if (error) notice(error.message);
      };
      $('#login-google').onclick = signIn('google');
      $('#login-kakao').onclick = signIn('kakao');
      // 네이버는 Supabase 기본 제공 목록에 없어서, Supabase 대시보드에 'custom:naver'라는 이름으로
      // Custom OAuth Provider를 등록해야 이 버튼이 동작합니다. (SUPABASE_SETUP.md 참고)
      $('#login-naver').onclick = signIn('custom:naver');
      return;
    }
    const { data: collections } = await client.from('collections').select('id,title,emoji,collection_places(count)').order('created_at');
    dialog.innerHTML = `<section style="max-width:420px;width:100%;padding:24px;border-radius:16px;background:#3d0f16;border:1px solid #7a2534;color:#f5ece7"><div style="display:flex;justify-content:space-between;gap:12px"><h2 style="margin:0">내 컬렉션</h2><button id="sign-out">로그아웃</button></div><div style="margin:16px 0">${(collections || []).map(c => `<div style="padding:10px 0;border-bottom:1px solid #7a2534">${c.emoji} <b>${escapeHtml(c.title)}</b> <span style="color:#c39298;font-size:12px">${c.collection_places[0]?.count || 0}곳</span></div>`).join('') || '<p style="color:#c39298">아직 만든 컬렉션이 없어요.</p>'}</div><form id="collection-form" style="display:flex;gap:8px"><input name="title" required maxlength="60" placeholder="예: 데이트 후보" style="min-width:0;flex:1;padding:10px;border-radius:8px;border:1px solid #7a2534;background:#2b070c;color:#fff"><button style="padding:10px;border:0;border-radius:8px;background:#e8362a;color:#fff">만들기</button></form></section>`;
    $('#sign-out').onclick = async () => { await client.auth.signOut(); profile = null; dialog.remove(); renderAccount(); };
    $('#collection-form').onsubmit = async (event) => {
      event.preventDefault();
      const title = new FormData(event.currentTarget).get('title').trim();
      const { error } = await client.from('collections').insert({ title });
      if (error) return notice(error.message);
      openDialog();
    };
  }

  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]); }

  async function init() {
    const config = await fetch('/api/auth-config').then(r => r.json()).catch(() => null);
    if (!config?.configured) return renderAccount();
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client = createClient(config.url, config.anonKey);
    const { data: { user } } = await client.auth.getUser();
    if (user) await loadProfile(user);
    client.auth.onAuthStateChange(async (_event, session) => {
      profile = null;
      if (session?.user) await loadProfile(session.user);
      else renderAccount();
    });
  }

  window.HongdaePlatform = {
    openDialog,
    async syncDefaultSave(placeId, saved) {
      if (!client || !profile) return;
      const { data: collection, error: collectionError } = await client.from('collections').select('id').eq('owner_id', profile.id).eq('title', '저장한 가게').maybeSingle();
      if (collectionError) return;
      let collectionId = collection?.id;
      if (!collectionId) {
        const { data, error } = await client.from('collections').insert({ title:'저장한 가게', emoji:'♥' }).select('id').single();
        if (error) return;
        collectionId = data.id;
      }
      if (saved) await client.from('collection_places').upsert({ collection_id:collectionId, place_id:placeId });
      else await client.from('collection_places').delete().eq('collection_id', collectionId).eq('place_id', placeId);
    },
    async importPlaces(places) {
      if (!client || profile?.role !== 'admin') return notice('관리자 로그인 후 사용할 수 있어요.');
      const rows = places.map(p => ({ id:p.id, name:p.name, type:p.type, status:p.status || 'unverified', lat:p.lat, lng:p.lng, address:p.address, category:p.category, tags:p.tags || [], source:{ kakaoId:p.kakaoId || null, kakaoUrl:p.kakaoUrl || null } }));
      const { error } = await client.from('places').upsert(rows);
      notice(error ? error.message : `${rows.length}개 매장을 데이터베이스에 반영했어요.`);
    }
  };
  window.addEventListener('DOMContentLoaded', init);
})();
