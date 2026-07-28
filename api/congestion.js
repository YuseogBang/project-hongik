export default async function handler(req, res) {
  const KEY  = "63585a686179757337376252786e47";
  const AREA = "홍대 관광특구";

  const url =
    `http://openapi.seoul.go.kr:8088/${KEY}/json/citydata_ppltn/1/5/` +
    encodeURIComponent(AREA);

  try {
    const r = await fetch(url);
    const data = await r.json();
    const info = data?.["SeoulRtd.citydata_ppltn"]?.[0];

    if (!info || !info.AREA_CONGEST_LVL) {
      res.status(200).json({ ok: false, raw: data });
      return;
    }

    const forecast = (info.FCST_PPLTN || []).slice(0, 4).map((f) => ({
      time:  f.FCST_TIME,
      level: f.FCST_CONGEST_LVL,
    }));

    res.setHeader("Cache-Control", "s-maxage=120");
    res.status(200).json({
      ok:      true,
      area:    info.AREA_NM,
      level:   info.AREA_CONGEST_LVL,
      message: info.AREA_CONGEST_MSG,
      updated: info.PPLTN_TIME,
      forecast,
    });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e) });
  }
}
