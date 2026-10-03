"""Build browser menu data from the reviewed Hongdae workbook and JSON export.

Usage: python scripts/import-menu-research.py SURVEY.xlsx MENUS.json survey-menu-data.js
"""

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

from openpyxl import load_workbook


def build(workbook_path, menus_path):
    sheet = load_workbook(workbook_path, read_only=True, data_only=True)["업체 목록"]
    rows = list(sheet.values)
    headers = rows[0]
    records = {index + 2: dict(zip(headers, row)) for index, row in enumerate(rows[1:])}
    menus = json.loads(Path(menus_path).read_text(encoding="utf-8"))
    if len(records) != len(menus) or len({str(r["지도 내부 ID"]) for r in records.values()}) != len(records):
        raise ValueError("Row count or internal IDs do not match")

    output = {}
    skipped_uncertain = []
    skipped_without_source = []
    for item in menus:
        row = records.get(item["row"])
        if not row or row["업체명"] != item["name"]:
            raise ValueError(f"Workbook/JSON row mismatch: {item['row']}")
        if item.get("matched_uncertain"):
            skipped_uncertain.append(item["name"])
            continue
        kakao_id = item.get("kakao_id")
        source = row["조사 출처 URL"]
        if not kakao_id or not source:
            skipped_without_source.append(item["name"])
            continue
        parsed = urlparse(source)
        if parsed.hostname != "place.map.kakao.com" or parsed.path.strip("/") != str(kakao_id):
            raise ValueError(f"Kakao source mismatch: {item['name']}")
        checked = row["확인일"]
        if not isinstance(checked, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", checked):
            raise ValueError(f"Missing verification date: {item['name']}")
        menu = []
        for dish in item.get("menu") or []:
            name = dish.get("name")
            price = dish.get("price")
            if not isinstance(name, str) or not name.strip() or (price is not None and (not isinstance(price, int) or price < 0)):
                raise ValueError(f"Invalid menu item: {item['name']}")
            menu.append([name.strip(), price, bool(dish.get("rec"))])
        internal_id = str(row["지도 내부 ID"])
        output[internal_id] = {
            "kakaoId": str(kakao_id),
            "checked": checked,
            "source": source,
            "hours": row["조사 후 운영시간"] if row["조사 후 운영시간"] != "미기재" else None,
            "note": row["조사 비고"] or None,
            "menu": menu,
        }
    return output, skipped_uncertain, skipped_without_source


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    data, uncertain, no_source = build(*sys.argv[1:3])
    Path(sys.argv[3]).write_text(
        "// Generated from the 2026-10-03 research workbook and menu JSON.\n"
        "window.HONGDAE_SURVEY_MENUS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Imported {len(data)} places; held {len(uncertain)} uncertain matches and {len(no_source)} without a Kakao source.")
