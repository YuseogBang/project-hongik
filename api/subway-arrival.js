export default async function handler(req, res) {
  try {
    const station = (req.query.station || '홍대입구').toString();
    const apiKey = process.env.SEOUL_API_KEY;

    if (!apiKey) {
      // 키가 아직 설정 안 됐을 때도 앱이 에러로 죽지 않고, 배너에 안내 문구가 뜨도록 200으로 응답
      res.status(200).json({
        ok: false,
        error: 'SEOUL_API_KEY 환경변수가 설정되지 않았어요. Vercel 프로젝트 설정에서 추가해주세요.'
      });
      return;
    }

    // 0, 20 = 0번째부터 20개까지 (홍대입구역은 노선이 여러 개라 넉넉하게 20개 요청)
    const url = `http://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/0/20/${encodeURIComponent(station)}`;

    const upstream = await fetch(url);
    const data = await upstream.json();

    // 서울시 API는 에러도 200 OK로 내려주고 errorMessage 필드로 구분함
    const code = data?.errorMessage?.code;
    if (code && code !== 'INFO-000') {
      res.status(200).json({
        ok: false,
        error: data.errorMessage.message || `서울시 API 오류 (${code})`
      });
      return;
    }

    const rawList = data.realtimeArrivalList || [];
    const list = rawList.map(t => ({
      subwayId: t.subwayId,       // 노선 코드 (예: 1002 = 2호선)
      trainLineNm: t.trainLineNm, // "성수행 - 신촌 방면" 같은 상세 문구
      arvlMsg2: t.arvlMsg2,       // "전역 도착", "3분 후" 등 요약 상태
      arvlMsg3: t.arvlMsg3,       // 도착지 방면
      arvlCd: t.arvlCd,           // 0=전역도착, 1=도착, 2=출발, 3=전전역 등
      barvlDt: t.barvlDt,         // 도착까지 남은 초
      updnLine: t.updnLine,       // 상행/하행 또는 내선/외선
      statnNm: t.statnNm,         // 역명
    }));

    // 짧게 캐싱 — 같은 20초 창 안에 여러 사용자가 봐도 서울시 API를 매번 다시 부르지 않게 함
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    res.status(200).json({ ok: true, station, list, fetchedAt: Date.now() });

  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e) });
  }
}
