const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = $('#state');
let sb;
const placeNames = new Map();
let managedPlaces=[];
const nameOf = id => placeNames.get(Number(id)) || `업체 #${id}`;

async function init() {
  const config = await fetch('/api/auth-config').then(r => r.json()).catch(() => null);
  if (!config?.configured) throw new Error('로그인 서버가 설정되지 않았어요. SUPABASE_SETUP.md를 확인해 주세요.');
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  sb = createClient(config.url, config.anonKey);
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) throw new Error('관리자 계정으로 로그인한 뒤 다시 열어 주세요.');
  const { data:profile, error:profileError } = await sb.from('profiles').select('role,display_name').eq('id', data.user.id).single();
  if (profileError || profile?.role !== 'admin') throw new Error('이 계정에는 관리자 권한이 없어요.');
  state.textContent = `${profile.display_name || data.user.email} 관리자 · 최근 30일 현황`;
  $('#admin').hidden = false;
  await loadPlaces();
  await Promise.all([loadMetrics(), loadReviews(), loadFeedbacks()]);
}

async function loadPlaces() {
  const { data, error } = await sb.from('places').select('id,name,type,status,address,category,lat,lng,tags,source,updated_at').order('updated_at', { ascending:false }).limit(1000);
  if (error) { $('#places').textContent = `장소 조회 실패: ${error.message}`; return; }
  managedPlaces=data||[];
  (data || []).forEach(place => placeNames.set(Number(place.id), place.name));
  $('#places').innerHTML = data.length ? data.map(place => `<div class="row"><b>${escape(place.name)}</b> · ${escape(place.type)} · ${escape(place.status)}<br><small>${escape(place.address || '주소 없음')}</small><div class="actions"><button type="button" data-edit-place="${place.id}">정보·해시태그 수정</button></div></div>`).join('') : '<p class="empty">데이터베이스에 등록된 장소가 없어요. 지도 화면의 정적 장소와 별도입니다.</p>';
}

function editPlace(id){
 const row=managedPlaces.find(p=>p.id===id);if(!row)return;const f=$('#place-form');
 f.dataset.placeId=String(id);for(const key of ['name','type','status','lat','lng','address','category'])if(f.elements[key])f.elements[key].value=row[key]??'';
 for(const key of ['hours','signatureMenu','dong'])f.elements[key].value=row.source?.[key]||'';
 f.elements.tags.value=(row.tags||[]).join(', ');f.elements.franchise.value=row.source?.franchise===true?'yes':row.source?.franchise===false?'no':'unknown';
 $('#place-submit').textContent='변경 저장';$('#place-cancel').hidden=false;f.scrollIntoView({behavior:'smooth',block:'center'});
}
$('#places').addEventListener('click',event=>{const b=event.target.closest('[data-edit-place]');if(b)editPlace(Number(b.dataset.editPlace));});
$('#place-cancel').onclick=()=>{const f=$('#place-form');f.reset();delete f.dataset.placeId;$('#place-submit').textContent='장소 등록';$('#place-cancel').hidden=true;};

async function loadMetrics() {
  const { data, error } = await sb.rpc('admin_interest_summary');
  if (error) { $('#metrics').textContent = `관심도 집계를 불러오지 못했어요: ${error.message}`; return; }
  const rows = data || [];
  const counts = { view:0, save:0, directions:0 };
  const byDay = new Map(), byPlace = new Map();
  rows.forEach(row => {
    const total = Number(row.total);
    counts[row.event_type] = (counts[row.event_type] || 0) + total;
    byDay.set(row.day, (byDay.get(row.day) || 0) + total);
    const current = byPlace.get(row.place_id) || { view:0, save:0, directions:0 };
    current[row.event_type] = (current[row.event_type] || 0) + total;
    byPlace.set(row.place_id, current);
  });
  $('#metrics').innerHTML = [['view','업체 조회'],['save','컬렉션 저장'],['directions','길찾기']].map(([key,label]) => `<div class="stat"><b>${counts[key].toLocaleString('ko-KR')}</b><span>${label}</span></div>`).join('');
  const days = Array.from({ length:30 }, (_, i) => {
    const day = new Date(Date.now() - (29-i)*86400000);
    return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).format(day);
  });
  const max = Math.max(1, ...days.map(day => byDay.get(day) || 0));
  $('#trend').innerHTML = days.map(day => `<div title="${day}: ${byDay.get(day) || 0}회" style="height:${Math.max(3, Math.round((byDay.get(day) || 0) / max * 100))}%"></div>`).join('');
  const top = [...byPlace.entries()].sort((a,b) => Object.values(b[1]).reduce((x,y)=>x+y,0) - Object.values(a[1]).reduce((x,y)=>x+y,0)).slice(0,20);
  $('#top-places').innerHTML = top.length ? top.map(([id,n],index) => `<div class="row"><b>${index+1}. ${escape(nameOf(id))}</b> <small>#${id}</small><br><small>조회 ${n.view} · 저장 ${n.save} · 길찾기 ${n.directions}</small></div>`).join('') : '<p class="empty">아직 로그인 사용자의 관심 기록이 없어요.</p>';
}

async function loadReviews() {
  const { data, error } = await sb.from('place_reviews').select('id,place_id,user_id,rating,body,status,created_at').order('created_at', { ascending:false }).limit(100);
  const host = $('#reviews');
  if (error) { host.textContent = `리뷰 조회 실패: ${error.message}`; return; }
  host.innerHTML = data.length ? `<p class="muted">최근 리뷰 ${data.length}개</p>${data.map(row => `<article class="row"><b>${escape(nameOf(row.place_id))}</b> <small>#${row.place_id} · ${'★'.repeat(row.rating)} · ${escape(row.status)} · ${new Date(row.created_at).toLocaleString('ko-KR')}</small><p>${escape(row.body)}</p><div class="actions"><button type="button" class="secondary" data-status="${row.id}" data-next="${row.status === 'hidden' ? 'published' : 'hidden'}">${row.status === 'hidden' ? '다시 공개' : '숨기기'}</button><button type="button" class="secondary" data-delete="${row.id}">삭제</button></div></article>`).join('')}` : '<p class="empty">아직 리뷰가 없어요.</p>';
  host.querySelectorAll('[data-status]').forEach(button => button.onclick = async () => {
    button.disabled = true;
    const { error:changeError } = await sb.from('place_reviews').update({ status:button.dataset.next }).eq('id', button.dataset.status);
    if (changeError) { button.disabled = false; alert(changeError.message); return; }
    loadReviews();
  });
  host.querySelectorAll('[data-delete]').forEach(button => button.onclick = async () => {
    if (!confirm('이 리뷰를 완전히 삭제할까요?')) return;
    button.disabled = true;
    const { error:deleteError } = await sb.from('place_reviews').delete().eq('id', button.dataset.delete);
    if (deleteError) { button.disabled = false; alert(deleteError.message); return; }
    loadReviews();
  });
}

async function loadFeedbacks() {
  const { data, error } = await sb.from('feedbacks').select('id,type,message,contact,status,created_at').order('created_at', { ascending:false }).limit(100);
  const host = $('#feedbacks');
  if (error) { host.textContent = `제보 조회 실패: ${error.message}`; return; }
  host.innerHTML = data.length ? data.map(row => `<div class="row"><b>[${escape(row.type)}]</b> ${escape(row.message)}<br><small>${escape(row.contact || '연락처 없음')} · ${new Date(row.created_at).toLocaleString('ko-KR')}</small><select data-feedback="${row.id}"><option value="new" ${row.status === 'new' ? 'selected' : ''}>신규</option><option value="reviewing" ${row.status === 'reviewing' ? 'selected' : ''}>검토 중</option><option value="done" ${row.status === 'done' ? 'selected' : ''}>완료</option></select></div>`).join('') : '<p class="empty">아직 제보가 없어요.</p>';
  host.querySelectorAll('[data-feedback]').forEach(select => select.onchange = async () => {
    const { error:changeError } = await sb.from('feedbacks').update({ status:select.value }).eq('id', select.dataset.feedback);
    if (changeError) alert(changeError.message);
  });
}

$('#place-form').onsubmit = async event => {
  event.preventDefault();
  const form = event.currentTarget, fields = new FormData(form);
  const id=Number(form.dataset.placeId)||Date.now();
  const previous=managedPlaces.find(p=>p.id===id);
  const lat=Number(fields.get('lat')),lng=Number(fields.get('lng'));
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<37.543||lat>37.572||lng<126.890||lng>126.939)return alert('홍대·망원 지도 범위 안의 확인된 좌표를 입력해 주세요.');
  const source={...(previous?.source||{}),editorial:true,hours:String(fields.get('hours')||'').trim(),signatureMenu:String(fields.get('signatureMenu')||'').trim(),dong:fields.get('dong')||'',franchise:fields.get('franchise')==='yes'?true:fields.get('franchise')==='no'?false:null};
  const row={id,name:String(fields.get('name')).trim(),type:fields.get('type'),status:fields.get('status'),lat,lng,address:fields.get('address')||null,category:fields.get('category')||null,tags:[...new Set(String(fields.get('tags')||'').split(/[,，\n]/).map(t=>t.trim().replace(/^#/,'' )).filter(Boolean))],source,updated_at:new Date().toISOString()};
  const {error}=await sb.from('places').upsert(row);
  if(error)return alert(error.message);
  $('#place-cancel').click();await loadPlaces();state.textContent='장소 정보를 저장했어요. 지도에서 새로고침하면 반영됩니다.';
};

init().catch(error => { state.textContent = error.message; console.error('Admin dashboard failed:', error); });
