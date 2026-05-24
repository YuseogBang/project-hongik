
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>홍대 상권 분석 플랫폼</title>
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=0837551521646a85388e11c7360953a9&libraries=services,clusterer"></script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0e0e10;
    --surface: #18181c;
    --surface2: #222228;
    --border: #2e2e38;
    --accent: #6c5ce7;
    --accent2: #00cec9;
    --danger: #e17055;
    --warn: #fdcb6e;
    --success: #00b894;
    --text: #e8e8f0;
    --muted: #8888a0;
    --card-r: 10px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans KR', sans-serif; background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  /* TOP BAR */
  .topbar {
    display: flex; align-items: center; gap: 16px;
    padding: 0 20px; height: 52px;
    background: var(--surface); border-bottom: 1px solid var(--border);
    flex-shrink: 0; z-index: 100;
  }
  .logo { font-weight: 700; font-size: 15px; letter-spacing: -0.3px; }
  .logo span { color: var(--accent); }
  .badge-live { font-size: 10px; background: var(--accent); color: #fff; padding: 2px 8px; border-radius: 99px; font-family: 'DM Mono', monospace; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .stat-pill { font-size: 11px; font-family: 'DM Mono', monospace; background: var(--surface2); border: 1px solid var(--border); border-radius: 99px; padding: 4px 12px; color: var(--muted); }
  .stat-pill b { color: var(--text); }
  .btn-add { font-size: 12px; background: var(--accent); color: #fff; border: none; border-radius: 6px; padding: 6px 14px; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-weight: 500; }
  .btn-add:hover { background: #7d6ef0; }

  /* LAYOUT */
  .layout { display: flex; flex: 1; overflow: hidden; }

  /* SIDEBAR */
  .sidebar {
    width: 300px; flex-shrink: 0;
    background: var(--surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .sidebar-top { padding: 14px 14px 10px; border-bottom: 1px solid var(--border); }
  .search-box {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
    padding: 7px 10px; margin-bottom: 10px;
  }
  .search-box input { background: none; border: none; color: var(--text); font-size: 13px; width: 100%; font-family: 'Noto Sans KR', sans-serif; outline: none; }
  .search-box input::placeholder { color: var(--muted); }
  .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { font-size: 11px; padding: 4px 10px; border-radius: 99px; border: 1px solid var(--border); color: var(--muted); background: transparent; cursor: pointer; transition: all .15s; font-family: 'Noto Sans KR', sans-serif; }
  .chip.on { border-color: var(--accent); color: var(--accent); background: rgba(108,92,231,.15); }

  .store-list { flex: 1; overflow-y: auto; padding: 8px; }
  .store-list::-webkit-scrollbar { width: 4px; }
  .store-list::-webkit-scrollbar-track { background: transparent; }
  .store-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .store-item {
    padding: 10px 12px; border-radius: var(--card-r);
    border: 1px solid var(--border); margin-bottom: 6px;
    cursor: pointer; background: var(--surface2); transition: all .15s;
  }
  .store-item:hover { border-color: var(--accent); }
  .store-item.active { border-color: var(--accent); background: rgba(108,92,231,.1); }
  .store-item.closed-item { opacity: .5; }
  .item-top { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .item-name { font-size: 13px; font-weight: 500; flex: 1; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .dot-open { background: var(--success); box-shadow: 0 0 6px var(--success); }
  .dot-closed { background: var(--danger); }
  .dot-risk { background: var(--warn); box-shadow: 0 0 6px var(--warn); }
  .item-meta { font-size: 11px; color: var(--muted); display: flex; gap: 8px; margin-bottom: 6px; font-family: 'DM Mono', monospace; }
  .score-row { display: flex; align-items: center; gap: 8px; }
  .score-bar { flex: 1; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 2px; transition: width .4s; }
  .score-num { font-size: 10px; font-family: 'DM Mono', monospace; color: var(--muted); min-width: 24px; text-align: right; }

  /* MAP */
  .map-wrap { flex: 1; position: relative; }
  #map { width: 100%; height: 100%; }

  /* MAP OVERLAY BUTTONS */
  .map-controls {
    position: absolute; top: 12px; left: 12px; z-index: 10;
    display: flex; flex-direction: column; gap: 6px;
  }
  .map-btn {
    background: var(--surface); border: 1px solid var(--border);
    color: var(--text); font-size: 11px; padding: 6px 12px;
    border-radius: 6px; cursor: pointer; font-family: 'Noto Sans KR', sans-serif;
    transition: all .15s; white-space: nowrap;
  }
  .map-btn:hover { background: var(--surface2); }
  .map-btn.on { border-color: var(--accent2); color: var(--accent2); }

  /* LEGEND */
  .legend {
    position: absolute; bottom: 20px; left: 12px; z-index: 10;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--card-r); padding: 10px 12px;
    font-size: 11px; color: var(--muted);
  }
  .legend-title { font-weight: 500; color: var(--text); margin-bottom: 8px; font-size: 12px; }
  .legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* DETAIL PANEL */
  .detail {
    width: 290px; flex-shrink: 0;
    background: var(--surface); border-left: 1px solid var(--border);
    overflow-y: auto; display: flex; flex-direction: column;
  }
  .detail::-webkit-scrollbar { width: 4px; }
  .detail::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .detail-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--muted); font-size: 13px; gap: 10px; padding: 20px; text-align: center;
  }
  .detail-empty .icon { font-size: 32px; opacity: .3; }

  .detail-header { padding: 16px; border-bottom: 1px solid var(--border); }
  .detail-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .detail-sub { font-size: 12px; color: var(--muted); display: flex; gap: 8px; align-items: center; }
  .status-badge { font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 500; }
  .badge-open { background: rgba(0,184,148,.2); color: var(--success); }
  .badge-closed { background: rgba(225,112,85,.2); color: var(--danger); }
  .badge-risk { background: rgba(253,203,110,.2); color: var(--warn); }

  .detail-body { padding: 14px; display: flex; flex-direction: column; gap: 14px; }
  .section-title { font-size: 10px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }

  .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .metric { background: var(--surface2); border-radius: 8px; padding: 10px 12px; }
  .metric-val { font-size: 20px; font-weight: 700; font-family: 'DM Mono', monospace; }
  .metric-lbl { font-size: 10px; color: var(--muted); margin-top: 2px; }
  .metric-val.good { color: var(--success); }
  .metric-val.bad { color: var(--danger); }
  .metric-val.warn { color: var(--warn); }

  .insight-card {
    background: var(--surface2); border-radius: 8px; padding: 12px;
    border-left: 3px solid var(--accent); font-size: 12px; color: var(--muted); line-height: 1.7;
  }
  .insight-card.danger { border-color: var(--danger); }
  .insight-card.warn { border-color: var(--warn); }
  .insight-label { font-size: 11px; font-weight: 500; color: var(--text); margin-bottom: 5px; }

  .compare-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
  .compare-row:last-child { border: none; }
  .compare-label { color: var(--muted); }
  .compare-val { font-family: 'DM Mono', monospace; font-size: 11px; }
  .up { color: var(--success); }
  .down { color: var(--danger); }

  .ai-btn {
    width: 100%; padding: 10px; border-radius: 8px;
    border: 1px solid var(--accent); background: rgba(108,92,231,.1);
    color: var(--accent); font-size: 12px; font-weight: 500;
    cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all .15s;
  }
  .ai-btn:hover { background: rgba(108,92,231,.25); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.7);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 24px; width: 380px; max-height: 90vh; overflow-y: auto;
  }
  .modal h4 { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
  .form-group { margin-bottom: 12px; }
  .form-group label { font-size: 11px; color: var(--muted); display: block; margin-bottom: 5px; }
  .form-group input, .form-group select, .form-group textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); border-radius: 6px; padding: 8px 10px; font-size: 13px;
    font-family: 'Noto Sans KR', sans-serif; outline: none;
    transition: border-color .15s;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
  .form-group select option { background: var(--surface2); }
  .form-group textarea { height: 80px; resize: vertical; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .modal-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
  .btn-cancel { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 6px; padding: 8px 16px; cursor: pointer; font-size: 12px; font-family: 'Noto Sans KR', sans-serif; }
  .btn-confirm { background: var(--accent); border: none; color: #fff; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-size: 12px; font-family: 'Noto Sans KR', sans-serif; font-weight: 500; }

  /* KAKAO MAP CUSTOM MARKER */
  .custom-marker {
    position: relative; cursor: pointer;
  }
  .marker-circle {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; border: 2px solid rgba(255,255,255,.3);
    box-shadow: 0 2px 8px rgba(0,0,0,.4);
    transition: transform .15s;
  }
  .marker-label {
    position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
    white-space: nowrap; font-size: 10px; font-weight: 500;
    background: rgba(14,14,16,.85); color: #e8e8f0;
    padding: 2px 6px; border-radius: 4px;
  }

  /* LOADING */
  .loading {
    position: absolute; inset: 0; background: var(--bg);
    display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 50; gap: 12px;
  }
  .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }
  .loading-dots { display: flex; gap: 6px; }
  .loading-dot:nth-child(2) { animation-delay: .2s; }
  .loading-dot:nth-child(3) { animation-delay: .4s; }
  @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
  .loading p { font-size: 13px; color: var(--muted); }

  /* SEARCH RESULT INFO WINDOW */
  .kakao-infobox {
    background: #18181c; border: 1px solid #2e2e38; border-radius: 8px;
    padding: 10px 14px; min-width: 160px; font-family: 'Noto Sans KR', sans-serif;
  }
  .kakao-infobox .ib-name { font-size: 13px; font-weight: 600; color: #e8e8f0; margin-bottom: 4px; }
  .kakao-infobox .ib-addr { font-size: 11px; color: #8888a0; }
</style>
</head>
<body>

<!-- TOP BAR -->
<div class="topbar">
  <div class="logo"><span>홍대</span> 상권 분석</div>
  <div class="badge-live">LIVE</div>
  <div class="topbar-right">
    <div class="stat-pill">영업중 <b id="cnt-open">-</b></div>
    <div class="stat-pill">폐점 <b id="cnt-closed">-</b></div>
    <div class="stat-pill">평균 생존 <b id="avg-months">-</b>개월</div>
    <button class="btn-add" onclick="openModal()">+ 업소 추가</button>
  </div>
</div>

<div class="layout">

  <!-- SIDEBAR -->
  <div class="sidebar">
    <div class="sidebar-top">
      <div class="search-box">
        <svg width="14" height="14" fill="none" stroke="#8888a0" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="search-input" placeholder="업소명 검색..." oninput="filterList()">
      </div>
      <div class="filter-chips">
        <button class="chip on" onclick="setFilter('all',this)">전체</button>
        <button class="chip" onclick="setFilter('restaurant',this)">음식점</button>
        <button class="chip" onclick="setFilter('cafe',this)">카페</button>
        <button class="chip" onclick="setFilter('bar',this)">주점</button>
        <button class="chip" onclick="setFilter('closed',this)">폐점만</button>
      </div>
    </div>
    <div class="store-list" id="store-list"></div>
  </div>

  <!-- MAP -->
  <div class="map-wrap">
    <div class="loading" id="loading">
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
      <p>카카오맵 불러오는 중...</p>
    </div>
    <div id="map"></div>

    <div class="map-controls">
      <button class="map-btn on" id="btn-markers" onclick="toggleMarkers()">📍 마커 표시</button>
      <button class="map-btn" id="btn-heatmap" onclick="toggleHeatmap()">🔥 밀도 보기</button>
      <button class="map-btn" onclick="searchNearby()">🔍 주변 음식점 검색</button>
      <button class="map-btn" onclick="resetView()">⌂ 홍대 중심</button>
    </div>

    <div class="legend">
      <div class="legend-title">범례</div>
      <div class="legend-row"><div class="legend-dot" style="background:#00b894;box-shadow:0 0 6px #00b894"></div>영업중</div>
      <div class="legend-row"><div class="legend-dot" style="background:#e17055"></div>폐점</div>
      <div class="legend-row"><div class="legend-dot" style="background:#fdcb6e;box-shadow:0 0 6px #fdcb6e"></div>주의</div>
      <div class="legend-row"><div class="legend-dot" style="background:#6c5ce7;box-shadow:0 0 6px #6c5ce7"></div>생존력 80+</div>
    </div>
  </div>

  <!-- DETAIL PANEL -->
  <div class="detail" id="detail-panel">
    <div class="detail-empty" id="detail-empty">
      <div class="icon">📊</div>
      <div>업소를 선택하면<br>상세 분석이 나타납니다</div>
    </div>
    <div id="detail-content" style="display:none"></div>
  </div>

</div>

<!-- ADD MODAL -->
<div class="modal-overlay" id="modal" style="display:none">
  <div class="modal">
    <h4>✏️ 업소 정보 입력</h4>
    <div class="form-group">
      <label>상호명 *</label>
      <input type="text" id="f-name" placeholder="예: 홍대포차">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>업종</label>
        <select id="f-type">
          <option value="restaurant">음식점</option>
          <option value="cafe">카페</option>
          <option value="bar">주점</option>
          <option value="retail">소매</option>
        </select>
      </div>
      <div class="form-group">
        <label>상태</label>
        <select id="f-status">
          <option value="open">영업중</option>
          <option value="closed">폐점</option>
          <option value="risk">주의</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>네이버 평점 (0~5)</label>
        <input type="number" id="f-rating" min="0" max="5" step="0.1" placeholder="4.2">
      </div>
      <div class="form-group">
        <label>영업 기간 (개월)</label>
        <input type="number" id="f-months" placeholder="24">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>리뷰 수</label>
        <input type="number" id="f-reviews" placeholder="150">
      </div>
      <div class="form-group">
        <label>월 임대료 추정 (만원)</label>
        <input type="number" id="f-rent" placeholder="350">
      </div>
    </div>
    <div class="form-group">
      <label>재학생 인사이트 메모</label>
      <textarea id="f-insight" placeholder="예: 점심엔 줄 서지만 평일 저녁은 한산함. 회전율 낮아 보임."></textarea>
    </div>
    <div class="form-group">
      <label>폐점 추정 원인</label>
      <select id="f-reason">
        <option value="">해당없음</option>
        <option value="traffic">유동인구 부족</option>
        <option value="quality">품질/경쟁력 문제</option>
        <option value="rent">임대료 부담</option>
        <option value="location">입지 불리</option>
        <option value="trend">트렌드 이탈</option>
      </select>
    </div>
    <div style="font-size:11px;color:var(--muted);background:var(--surface2);border-radius:6px;padding:8px 10px;">
      💡 지도에서 위치를 클릭하면 자동으로 좌표가 입력됩니다. 또는 아래에서 직접 입력하세요.
    </div>
    <div class="form-row" style="margin-top:10px">
      <div class="form-group">
        <label>위도 (자동입력)</label>
        <input type="number" id="f-lat" placeholder="37.5570" step="0.0001">
      </div>
      <div class="form-group">
        <label>경도 (자동입력)</label>
        <input type="number" id="f-lng" placeholder="126.9245" step="0.0001">
      </div>
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">취소</button>
      <button class="btn-confirm" onclick="addStore()">추가하기</button>
    </div>
  </div>
</div>

<script>
// ── DATA ──────────────────────────────────────────────
const TYPES = { restaurant:'음식점', cafe:'카페', bar:'주점', retail:'소매' };
const STATUS = { open:'영업중', closed:'폐점', risk:'주의' };
const REASONS = { traffic:'유동인구 부족', quality:'품질/경쟁력', rent:'임대료 부담', location:'입지 불리', trend:'트렌드 이탈' };

let stores = [
  { id:1, name:'연남동감자탕', type:'restaurant', status:'open', lat:37.5591, lng:126.9215, rating:4.1, reviews:210, months:38, rent:280, score:72, insight:'평일 저녁도 꾸준한 단골. 가성비 인식 강함. 2호선 접근성 좋음', reason:null },
  { id:2, name:'홍익돈부리', type:'restaurant', status:'closed', lat:37.5578, lng:126.9268, rating:3.2, reviews:45, months:14, rent:320, score:38, insight:'입구에서 잘 안 보이는 위치. 메뉴 단순해 재방문 유인 낮음', reason:'traffic' },
  { id:3, name:'블루보틀 홍대', type:'cafe', status:'open', lat:37.5564, lng:126.9237, rating:4.4, reviews:890, months:28, rent:500, score:88, insight:'인스타 성지. 줄 서도 찍으러 옴. SNS 유입 강력', reason:null },
  { id:4, name:'밤세운포차', type:'bar', status:'closed', lat:37.5558, lng:126.9251, rating:3.8, reviews:120, months:9, rent:250, score:44, insight:'심야엔 잘 됐지만 월~수 유동이 너무 없었음. 주중 적자 누적', reason:'traffic' },
  { id:5, name:'안녕브런치', type:'cafe', status:'open', lat:37.5572, lng:126.9223, rating:4.6, reviews:560, months:22, rent:380, score:91, insight:'SNS 노출 최적화. 예쁜 메뉴 중심. 웨이팅 상시 운영', reason:null },
  { id:6, name:'홍대곱창골목', type:'restaurant', status:'open', lat:37.5548, lng:126.9265, rating:4.3, reviews:340, months:72, rent:200, score:84, insight:'20년 넘은 골목 자체가 콘텐츠. 저녁 전용이지만 안정적', reason:null },
  { id:7, name:'피자조각집', type:'restaurant', status:'closed', lat:37.5585, lng:126.9280, rating:3.5, reviews:78, months:11, rent:290, score:42, insight:'점심 수요 없는 골목. 테이크아웃 불편 위치. 주차 불가', reason:'location' },
  { id:8, name:'버블티천국', type:'cafe', status:'risk', lat:37.5561, lng:126.9245, rating:3.9, reviews:95, months:18, rent:310, score:55, insight:'경쟁 버블티 3개 200m 내. 차별점 없음. 매출 하락 중', reason:null },
  { id:9, name:'노래방황제', type:'bar', status:'open', lat:37.5543, lng:126.9230, rating:4.0, reviews:280, months:96, rent:180, score:78, insight:'8년째. 홍대 고유 노래방 문화. 심야 강점. 재학생 단골', reason:null },
  { id:10, name:'우육면관', type:'restaurant', status:'open', lat:37.5555, lng:126.9258, rating:4.5, reviews:420, months:36, rent:340, score:87, insight:'줄 서는 맛집 공식. 오픈런 있음. 블로그/유튜브 바이럴', reason:null },
  { id:11, name:'퓨전타코', type:'restaurant', status:'closed', lat:37.5569, lng:126.9210, rating:2.9, reviews:32, months:7, rent:270, score:28, insight:'맛 자체가 문제. 블로그 홍보와 실제 맛 괴리. 재방문 없음', reason:'quality' },
  { id:12, name:'핫도그명가', type:'restaurant', status:'open', lat:37.5566, lng:126.9242, rating:4.0, reviews:190, months:60, rent:220, score:76, insight:'테이크아웃 특화. 유동인구 많은 골목 입지. 회전율 최고', reason:null },
  { id:13, name:'양식파스타', type:'restaurant', status:'risk', lat:37.5580, lng:126.9275, rating:3.6, reviews:65, months:20, rent:360, score:48, insight:'점심 특수 없는 위치. 저녁만으론 임대료 버티기 힘들어 보임', reason:null },
  { id:14, name:'제주막걸리바', type:'bar', status:'open', lat:37.5553, lng:126.9225, rating:4.3, reviews:310, months:33, rent:230, score:82, insight:'막걸리 특화로 차별화 성공. 20대 SNS 타깃. 인스타 릴스 바이럴', reason:null },
  { id:15, name:'감성커피로스터스', type:'cafe', status:'open', lat:37.5575, lng:126.9233, rating:4.7, reviews:620, months:19, rent:420, score:90, insight:'스페셜티 포지셔닝. 커피 마니아 층 고정 확보. 굿즈 판매 병행', reason:null },
  { id:16, name:'옛날통닭', type:'restaurant', status:'closed', lat:37.5547, lng:126.9270, rating:3.3, reviews:55, months:8, rent:300, score:35, insight:'트렌디한 경쟁점에 밀림. 인테리어/SNS 전략 부재. 40대 타깃 한계', reason:'trend' },
];

let map, markers = [], clusterer, overlay, showMarkers = true;
let currentFilter = 'all', searchText = '', selectedId = null;
let addingMode = false;

// ── MAP INIT ──────────────────────────────────────────
window.kakao && kakao.maps.load(() => {
  const container = document.getElementById('map');
  const HONGDAE = new kakao.maps.LatLng(37.5563, 126.9241);
  map = new kakao.maps.Map(container, { center: HONGDAE, level: 4 });

  document.getElementById('loading').style.display = 'none';

  // Click on map to set location when modal is open
  kakao.maps.event.addListener(map, 'click', e => {
    if (document.getElementById('modal').style.display !== 'none') {
      document.getElementById('f-lat').value = e.latLng.getLat().toFixed(6);
      document.getElementById('f-lng').value = e.latLng.getLng().toFixed(6);
    }
  });

  renderAll();
  updateStats();
});

// ── RENDER ────────────────────────────────────────────
function renderAll() {
  renderMarkers();
  renderList();
}

function getScoreColor(score) {
  if (score >= 75) return '#00b894';
  if (score >= 50) return '#fdcb6e';
  return '#e17055';
}

function renderMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
  if (overlay) { overlay.setMap(null); overlay = null; }

  stores.forEach(s => {
    const pos = new kakao.maps.LatLng(s.lat, s.lng);

    // Color based on status + score
    let color = s.status === 'open' ? '#00b894' : s.status === 'closed' ? '#e17055' : '#fdcb6e';
    if (s.status === 'open' && s.score >= 80) color = '#6c5ce7';

    const content = `
      <div style="position:relative;text-align:center;cursor:pointer" onclick="selectStore(${s.id})">
        <div style="
          width:${selectedId===s.id?34:26}px;height:${selectedId===s.id?34:26}px;
          border-radius:50%;background:${color};
          display:flex;align-items:center;justify-content:center;
          border:${selectedId===s.id?'3px solid #fff':'2px solid rgba(255,255,255,.4)'};
          box-shadow:0 2px 10px rgba(0,0,0,.5)${s.score>=80?',0 0 12px '+color:''}">
          <span style="font-size:${selectedId===s.id?13:11}px">${
            s.type==='restaurant'?'🍜':s.type==='cafe'?'☕':s.type==='bar'?'🍺':'🏪'
          }</span>
        </div>
        <div style="
          position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
          white-space:nowrap;font-size:9px;font-weight:600;
          background:rgba(14,14,16,.9);color:#e8e8f0;
          padding:2px 5px;border-radius:3px;font-family:sans-serif">
          ${s.name}
        </div>
      </div>`;

    const marker = new kakao.maps.CustomOverlay({
      position: pos, content, yAnchor: 1.3, zIndex: selectedId===s.id?10:1
    });
    if (showMarkers) marker.setMap(map);
    markers.push(marker);
  });
}

function renderList() {
  const list = document.getElementById('store-list');
  const filtered = stores.filter(s => {
    const matchFilter = currentFilter === 'all' || s.type === currentFilter || (currentFilter === 'closed' && s.status === 'closed');
    const matchSearch = s.name.includes(searchText);
    return matchFilter && matchSearch;
  });

  list.innerHTML = filtered.length === 0 ? `<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">검색 결과 없음</div>` :
    filtered.map(s => {
      const scoreColor = getScoreColor(s.score);
      return `
      <div class="store-item ${s.status==='closed'?'closed-item':''} ${selectedId===s.id?'active':''}" onclick="selectStore(${s.id})">
        <div class="item-top">
          <div class="status-dot dot-${s.status}"></div>
          <div class="item-name">${s.name}</div>
          <div style="font-size:10px;color:var(--muted)">${TYPES[s.type]||s.type}</div>
        </div>
        <div class="item-meta">
          <span>★ ${s.rating}</span>
          <span>${s.months}개월</span>
          <span>리뷰 ${s.reviews}</span>
        </div>
        <div class="score-row">
          <div class="score-bar"><div class="score-fill" style="width:${s.score}%;background:${scoreColor}"></div></div>
          <div class="score-num" style="color:${scoreColor}">${s.score}</div>
        </div>
      </div>`;
    }).join('');
}

function updateStats() {
  document.getElementById('cnt-open').textContent = stores.filter(s=>s.status==='open').length;
  document.getElementById('cnt-closed').textContent = stores.filter(s=>s.status==='closed').length;
  const avg = Math.round(stores.reduce((a,s)=>a+s.months,0)/stores.length);
  document.getElementById('avg-months').textContent = avg;
}

// ── SELECT STORE ──────────────────────────────────────
function selectStore(id) {
  selectedId = id;
  const s = stores.find(x=>x.id===id);
  renderMarkers();
  renderList();

  // Pan map to store
  if (map) map.panTo(new kakao.maps.LatLng(s.lat, s.lng));

  // Show detail
  document.getElementById('detail-empty').style.display = 'none';
  const dc = document.getElementById('detail-content');
  dc.style.display = 'block';

  const scoreColor = getScoreColor(s.score);
  const avgRating = (stores.filter(x=>x.type===s.type).reduce((a,x)=>a+x.rating,0) / stores.filter(x=>x.type===s.type).length).toFixed(1);
  const rankMonths = [...stores].sort((a,b)=>b.months-a.months).findIndex(x=>x.id===s.id)+1;
  const rentClass = s.rent > 400 ? 'bad' : s.rent > 250 ? 'warn' : 'good';

  dc.innerHTML = `
    <div class="detail-header">
      <div class="detail-name">${s.name}</div>
      <div class="detail-sub">
        ${TYPES[s.type]||s.type}
        <span class="status-badge badge-${s.status}">${STATUS[s.status]}</span>
        ${s.score>=80?'<span style="font-size:10px;color:#6c5ce7">★ 우수업소</span>':''}
      </div>
    </div>
    <div class="detail-body">

      <div>
        <div class="section-title">핵심 지표</div>
        <div class="metrics">
          <div class="metric"><div class="metric-val ${s.rating>=4.2?'good':s.rating>=3.5?'warn':'bad'}">★${s.rating}</div><div class="metric-lbl">네이버 평점</div></div>
          <div class="metric"><div class="metric-val">${s.months}m</div><div class="metric-lbl">운영 기간</div></div>
          <div class="metric"><div class="metric-val">${s.reviews}</div><div class="metric-lbl">리뷰 수</div></div>
          <div class="metric"><div class="metric-val" style="color:${scoreColor}">${s.score}</div><div class="metric-lbl">생존력 점수</div></div>
        </div>
      </div>

      ${s.rent ? `
      <div>
        <div class="section-title">임대료 분석</div>
        <div class="metrics">
          <div class="metric"><div class="metric-val ${rentClass}">${s.rent}만</div><div class="metric-lbl">월 임대료 추정</div></div>
          <div class="metric"><div class="metric-val ${s.rent > s.rating * 80 ? 'bad' : 'good'}">${(s.rent/s.months).toFixed(1)}</div><div class="metric-lbl">월평균 임대부담</div></div>
        </div>
      </div>` : ''}

      <div>
        <div class="section-title">재학생 인사이트</div>
        <div class="insight-card ${s.status==='closed'?'danger':s.status==='risk'?'warn':''}">
          <div class="insight-label">${s.status==='closed'?'🔴 폐점 분석':s.status==='risk'?'🟡 위험 신호':'🟢 운영 현황'}</div>
          ${s.insight}
          ${s.reason ? `<div style="margin-top:8px;font-size:11px;color:#e17055">▸ 폐점 원인: ${REASONS[s.reason]}</div>` : ''}
        </div>
      </div>

      <div>
        <div class="section-title">상권 내 비교</div>
        <div class="compare-row"><span class="compare-label">동종 업종 평균 평점</span><span class="compare-val ${s.rating>=avgRating?'up':'down'}">${avgRating} 대비 ${s.rating>=avgRating?'▲':'▼'} ${Math.abs(s.rating-avgRating).toFixed(1)}</span></div>
        <div class="compare-row"><span class="compare-label">운영 기간 순위</span><span class="compare-val">${rankMonths}위 / ${stores.length}개</span></div>
        <div class="compare-row"><span class="compare-label">리뷰 활성도</span><span class="compare-val ${s.reviews>200?'up':'down'}">${s.reviews>200?'활발':'낮음'} (${s.reviews}개)</span></div>
        <div class="compare-row"><span class="compare-label">생존력 점수</span><span class="compare-val" style="color:${scoreColor}">${s.score}점 / 100</span></div>
      </div>

      <button class="ai-btn" onclick="sendPrompt('${s.name} 업소 분석: 업종=${TYPES[s.type]||s.type}, 상태=${STATUS[s.status]}, 평점=${s.rating}, 운영기간=${s.months}개월, 리뷰수=${s.reviews}, 생존력점수=${s.score}, 재학생인사이트=\\'${s.insight}\\'. 이 데이터를 바탕으로 이 업소의 상권 내 경쟁력과 향후 전망, 부동산 가치 측면에서의 분석을 해줘.')">🤖 AI 심층 분석 요청 ↗</button>
    </div>
  `;
}

// ── FILTER / SEARCH ───────────────────────────────────
function setFilter(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
  btn.classList.add('on');
  renderList();
}
function filterList() {
  searchText = document.getElementById('search-input').value.trim();
  renderList();
}

// ── MAP CONTROLS ──────────────────────────────────────
function toggleMarkers() {
  showMarkers = !showMarkers;
  markers.forEach(m => showMarkers ? m.setMap(map) : m.setMap(null));
  document.getElementById('btn-markers').classList.toggle('on', showMarkers);
}

function toggleHeatmap() {
  const btn = document.getElementById('btn-heatmap');
  btn.classList.toggle('on');
  // Visual feedback — heatmap would need kakao heatmap library
  if (btn.classList.contains('on')) {
    alert('💡 실제 서비스에서는 카카오 히트맵 API로 업소 밀도를 시각화합니다.\n현재는 마커 밀집도로 확인하세요.');
  }
}

function searchNearby() {
  if (!map) return;
  const ps = new kakao.maps.services.Places();
  const center = map.getCenter();
  ps.keywordSearch('홍대 음식점', (data, status) => {
    if (status !== kakao.maps.services.Status.OK) return;
    data.slice(0,5).forEach(place => {
      const pos = new kakao.maps.LatLng(place.y, place.x);
      const infowindow = new kakao.maps.InfoWindow({
        content: `<div class="kakao-infobox"><div class="ib-name">${place.place_name}</div><div class="ib-addr">${place.road_address_name||place.address_name}</div></div>`,
        removable: true
      });
      const marker2 = new kakao.maps.Marker({ position: pos, map });
      kakao.maps.event.addListener(marker2, 'click', () => infowindow.open(map, marker2));
      markers.push(marker2);
    });
  }, { location: center, radius: 500 });
}

function resetView() {
  if (map) map.setCenter(new kakao.maps.LatLng(37.5563, 126.9241));
  if (map) map.setLevel(4);
}

// ── MODAL ─────────────────────────────────────────────
function openModal() {
  document.getElementById('modal').style.display = 'flex';
  // Default to Hongdae center
  document.getElementById('f-lat').value = '37.5563';
  document.getElementById('f-lng').value = '126.9241';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }

function addStore() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) return alert('상호명을 입력해주세요.');
  const lat = parseFloat(document.getElementById('f-lat').value) || 37.5563;
  const lng = parseFloat(document.getElementById('f-lng').value) || 126.9241;
  const rating = parseFloat(document.getElementById('f-rating').value) || 3.5;
  const months = parseInt(document.getElementById('f-months').value) || 12;
  const reviews = parseInt(document.getElementById('f-reviews').value) || 0;
  const rent = parseInt(document.getElementById('f-rent').value) || 300;
  const status = document.getElementById('f-status').value;

  // Auto-calculate score
  const ratingScore = (rating / 5) * 30;
  const reviewScore = Math.min(reviews / 500, 1) * 20;
  const monthScore = Math.min(months / 60, 1) * 25;
  const rentScore = Math.max(0, (500 - rent) / 500) * 15;
  const score = Math.round(ratingScore + reviewScore + monthScore + rentScore + 10);

  const newStore = {
    id: Date.now(), name, type: document.getElementById('f-type').value,
    status, lat, lng, rating, reviews, months, rent,
    score: status === 'closed' ? Math.min(score, 50) : score,
    insight: document.getElementById('f-insight').value || '아직 인사이트 없음',
    reason: document.getElementById('f-reason').value || null,
  };
  stores.push(newStore);
  closeModal();
  renderAll();
  updateStats();
  selectStore(newStore.id);
}
</script>
</body>
</html>
