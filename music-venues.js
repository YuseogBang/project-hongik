(() => {
const venues = [{"id": 1784182411172, "name": "클럽에반스", "genres": ["재즈"], "live": "라이브 연주", "admission": "일–금 15,000원 · 토 20,000원", "note": "음료 한 잔 별도 주문 · 공연에 따라 입장료 변경", "source": "https://clubevans.com/bbs/board.php?bo_table=notice&wr_id=23", "priceBasis": "공식 FAQ의 2025년 1월 기준 안내", "checkedAt": "2026-10-06"}, {"id": 1784182364776, "name": "제비다방", "genres": ["다양한 장르"], "live": "라이브 공연 · 일정 확인", "admission": "관객 자율 모금", "note": "공연별 참여 조건은 일정에서 확인해 주세요.", "source": "https://www.ctrplus.com/jebi", "checkedAt": "2026-10-06"}, {"id": 1784422345325, "name": "롤링홀", "genres": ["록", "인디"], "live": "라이브 공연", "admission": "공연별 티켓 확인", "note": "고정 입장료 미확인 · 선택한 공연의 예매 안내를 확인해 주세요.", "source": "https://www.rollinghall.com/default/temp/temp_basic.php", "checkedAt": "2026-10-06"}, {"id": 1785289557659, "name": "KT&G상상마당 홍대", "genres": ["공연별 상이"], "live": "라이브 공연 · 지하 2층 라이브홀", "admission": "공연별 티켓 확인", "note": "전시·매장 방문과 공연 입장은 별도입니다.", "source": "https://www.sangsangmadang.com/main/HD", "checkedAt": "2026-10-06"}, {"id": 1784182373485, "name": "라이브클럽 빵", "genres": ["모던록", "포크", "싱어송라이터"], "live": "라이브 공연", "admission": "입장료 미확인", "note": "공연 일정과 예매·현매 가격은 공식 계정에서 확인해 주세요.", "source": "https://www.instagram.com/clubbbang/", "evidence": "https://indistreet.com/venues/clubbbang", "sourceStatus": "공연 공지 재게시 확인 · 공식 계정 직접 조회 제한", "checkedAt": "2026-10-06"}, {"id": 1786000000018, "name": "사이드노트 클럽 (라이즈호텔)", "genres": ["선곡별 상이"], "live": "DJ 부스 운영 · 세션 일정 확인 필요", "admission": "입장료 미확인", "note": "칵테일 바 · 미성년자 입장 불가. 특별 이벤트 조건은 별도 확인해 주세요.", "source": "https://rysehotel.com/side-note-club/", "evidence": "https://d3n14jmbdg5y6n.cloudfront.net/wp-content/uploads/2019/02/RYSE_WEDDING.pdf", "checkedAt": "2026-10-06"}, {"id": 1786000000017, "name": "클럽 FF", "genres": ["미확인"], "live": "라이브·DJ 일정 미확인", "admission": "입장료 미확인", "note": "공식 공연 공지에서 장르와 예매·현매 조건 확인이 필요합니다.", "checkedAt": "2026-10-06", "sourceStatus": "공식 최신 공연·요금 안내 미확인"}];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(store) {
 if (store.status === 'closed') return '';
 const info = venues.find(v => v.id === Number(store.id));
 if (!info && !['club','liveclub'].includes(store.type)) return '';
 const data = info || {genres:['미확인'],live:'라이브·DJ 여부 미확인',admission:'입장료 미확인',note:'요일·이벤트별 조건은 업체에 확인해 주세요.'};
 return `<section class="music-conditions"><h3>음악 · 공연</h3><dl><div><dt>음악 장르</dt><dd>${data.genres.map(esc).join(' · ')}</dd></div><div><dt>공연 방식</dt><dd>${esc(data.live)}</dd></div><div><dt>입장료</dt><dd>${esc(data.admission)}</dd></div></dl><p>${esc(data.note)}</p>${data.source ? `<a href="${esc(data.source)}" target="_blank" rel="noopener noreferrer">공연·입장 안내 ↗</a>` : ''}</section>`;
}
function enrich(store) {
 const info=venues.find(v=>v.id===Number(store.id));
 if(!info || store.status==='closed')return store;
 store.music={genres:info.genres,live:info.live,admission:info.admission};
 const additions=info.genres.filter(g=>['재즈','록','인디','모던록','포크','싱어송라이터'].includes(g));
 if(info.live.startsWith('라이브')&&!/미확인/.test(info.live))additions.push('라이브음악');
 if(additions.includes('모던록'))additions.push('록');
 // DJ 부스 보유만으로 실제 DJ 공연을 추정하지 않는다.
 store.tags=[...new Set([...(store.tags||[]),...additions])];
 const liveIds=[1784182411172,1784182364776,1784182373485,1784422345325];
 if(liveIds.includes(Number(store.id))){store.type='liveclub';store.category=info.genres.includes('재즈')?'재즈클럽':'라이브클럽';}
 return store;
}
window.HongdaeMusic = {card, venues, enrich};
if(typeof stores!=='undefined')stores.forEach(enrich);
})();
