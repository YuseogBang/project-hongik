"""Convert supplied research and the reviewed two-map audit into app records."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'data/neighbourhood-research-20261006.json').read_text())
audit=json.loads((root/'data/neighbourhood-hours-audit.json').read_text())
lookup={a['name']:a for a in audit}
# Directly read from Naver's expanded weekly schedule; Kakao's hours match.
lookup['책바']['naverSchedule']={'월':['정기휴무'],**{d:['17:30 - 24:00','23:50 라스트오더'] for d in '화수목'},'금':['17:30 - 다음 날 01:30','01:20 라스트오더'],'토':['15:30 - 다음 날 01:30','01:20 라스트오더'],'일':['15:30 - 24:00','23:50 라스트오더']}
# Preserve dated exceptions separately from recurring hours.
exceptions={'레코드시즌':{'2026-10-06':'휴무','2026-10-07':'휴무','2026-10-09':'10:00~23:00'},'아치서재':{f'2026-10-{d:02}':'휴무' for d in range(6,13)},'책방곱셈':{'2026-10-09':'휴무'},'다다다 소잉 스튜디오':{'2026-10-09':'10:00~20:00'}}
conflicts={'마바사','책방곱셈','현대음률','뉴올재즈라운지','백아스튜디오','작가식당','아치서재','공작','레코드시즌','도래노트'}
needs={'밀리언유니버스','쑥고개음반','타마고빈티지'}
partial={'제로헌드레드','식해'}
def norm(v):
 if any(re.match(r'^(?:정기휴무|휴무일?$|한글날 휴무)',x) for x in v):return '휴무'
 s=next((x for x in v if re.search(r'\d{2}:\d{2}',x)), '')
 return ''.join(re.findall(r'\d{2}:\d{2}',s))
def line(day,values):
 if any(re.match(r'^(?:정기휴무|휴무일?$|한글날 휴무)',x) for x in values):return day+' 휴무'
 out=[]
 for v in values:
  times=re.findall(r'\d{2}:\d{2}',v)
  if not times:continue
  if '라스트오더' in v:out.append('라스트오더 '+times[0])
  elif '브레이크' in v or '휴게' in v:out.append('브레이크타임 '+'~'.join(times))
  else:out.append('~'.join(times))
 return day+' '+ ' · '.join(out)
records=[]
for r in rows:
 name=r['업체명'];a=lookup[name];k=a['kakaoSchedule'];n=a.get('naverSchedule',{})
 a['temporaryExceptions']=exceptions.get(name,{})
 if name not in conflicts|needs|partial:
  # Do not silently accept a newly discovered disagreement.
  mismatch=[d for d in '월화수목금토일' if norm(k.get(d,[]))!=norm(n.get(d,[])) and not(name=='다다다 소잉 스튜디오' and d=='금')]
  if mismatch:raise ValueError((name,mismatch))
 state='conflict' if name in conflicts else 'needs-check' if name in needs else 'partial' if name in partial else 'matched'
 schedule={d:n[d] for d in '월화수목금토일' if d in n} if state in ['matched','partial'] else {}
 if name=='다다다 소잉 스튜디오':schedule['금']=['10:00 - 22:00']
 a['decision']=state
 typ='bar' if re.search('바|주점',r['업종']) else 'restaurant' if re.search('음식|식당|한식',r['업종']) else 'cafe' if '카페' in r['업종'] else 'retail'
 menus=[r[f'대표 메뉴{i}'] for i in range(1,4) if r[f'대표 메뉴{i}'] and not re.search('확인|해당 없음',r[f'대표 메뉴{i}'])]
 rec={'kakaoId':str(r['카카오 장소 ID']),'name':name,'neighbourhood':r['통칭 동네'].split()[0],'neighbourhoodLabel':r['통칭 동네'],'dong':r['카카오 법정동'],'type':typ,'category':re.sub(r'\(혼술 후보\)','',r['업종']),'lat':r['위도'],'lng':r['경도'],'address':r['도로명주소'],'kakaoUrl':r['카카오 링크'],'naverUrl':a.get('naverUrl'),'hoursState':state,'hours':' / '.join(line(d,v) for d,v in schedule.items()) if schedule else '영업시간 확인 필요','hoursSource':a.get('naverUrl') if schedule else r['카카오 링크'],'hoursExceptions':a['temporaryExceptions'],'insight':r['장소 특징 한 줄'],'tags':[re.sub(r'\(IG 소개\)','',t.strip()) for t in r['추천 태그(최대5)'].split(',')],'menus':menus,'officialUrl':r['공식 홈페이지'] if str(r['공식 홈페이지']).startswith('http') else None,'instagram':r['공식 인스타그램'] if str(r['공식 인스타그램']).startswith('http') else None,'soloDrinking':name=='공작','branchStatus':'단일 지점 확인' if name=='알맹상점' else '확인 필요','checkedAt':'2026-10-06'}
 if name=='시작의서점':rec['address']='서울 마포구 월드컵로17길 36 (층수 확인 필요)'
 if not isinstance(rec['lat'],(int,float)) or not isinstance(rec['lng'],(int,float)):raise ValueError(name+' coordinates missing')
 records.append(rec)
(root/'data/neighbourhood-hours-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
(root/'neighbourhood-research-data.js').write_text('window.HONGDAE_NEIGHBOURHOOD_RESEARCH = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n')
print('Imported',len(records),'Hours:',{s:sum(r['hoursState']==s for r in records) for s in ['matched','partial','conflict','needs-check']})
