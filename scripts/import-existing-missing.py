"""Adjudicate map evidence conservatively and produce repeatable app records."""
import json,re
from datetime import date
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parents[1]
audit=json.loads((root/'data/existing-missing-audit.json').read_text())
def parse(raw):
 out={};dated={};day=None
 for line in raw.splitlines():
  m=re.search(r'- generic: (매일|[월화수목금토일])(?:\((\d+/\d+)\))?$',line)
  if m:
   day=m[1];out[day]=[]
   if m[2]:dated[day]='2026-'+ '-'.join(f'{int(x):02}' for x in m[2].split('/'))
   continue
  v=re.search(r'- (?:generic|text): (.+)$',line)
  if day and v and (re.search(r'\d{2}:\d{2}',v[1]) or re.match(r'^(?:정기휴무|휴무(?:일)?$|한글날 휴무)',v[1])):out[day].append(v[1])
 if '매일' in out:out={d:out['매일'] for d in '월화수목금토일'}
 return out,dated
def norm(values):
 if any(re.match(r'^(?:정기휴무|휴무(?:일)?$|한글날 휴무)',v) for v in values):return '휴무'
 for v in values:
  if not re.search('브레이크|휴게|라스트',v):
   times=re.findall(r'\d{2}:\d{2}',v)
   if len(times)==2:return '~'.join(times)
 return ''
def line(day,values):
 value=norm(values)
 if value=='휴무':return day+' 휴무'
 parts=[value] if value else []
 for v in values:
  times=re.findall(r'\d{2}:\d{2}',v)
  if re.search('브레이크|휴게',v) and len(times)==2:parts.append('브레이크타임 '+'~'.join(times))
  elif '라스트' in v and times:parts.append('라스트오더 '+times[0])
 return day+' '+' · '.join(parts) if parts else ''
def road(s):
 m=re.search(r'(?:서울(?:특별시)?\s*)?마포구\s+([^\s]+(?:로|길))\s+(\d+(?:-\d+)?)',s or '')
 return (m[1],m[2]) if m else None
records=[]
for a in audit:
 n=a['name'];k,kdates=parse(a.get('kakaoHours',''));nv,ndates=parse(a.get('naverHours',''))
 if not k:k=a.get('kakaoSchedule',{})
 if not nv:
  nv=a.get('naverSchedule',{})
  ndates={'월화수목금토일'[date.fromisoformat(stamp).weekday()]:stamp for stamp in a.get('temporaryExceptions',{})}
 expected=road(a.get('expectedAddress') or a.get('kakaoAddress'))
 mismatch=bool(expected and road(a.get('naverAddress')) and expected!=road(a['naverAddress']))
 moved=bool(a.get('expectedAddress') and road(a.get('kakaoAddress')) and road(a['expectedAddress'])!=road(a['kakaoAddress']))
 common=[d for d in '월화수목금토일' if norm(k.get(d,[])) and norm(nv.get(d,[])) and d not in ndates]
 conflicts=[d for d in common if norm(k[d])!=norm(nv[d])]
 state='conflict' if conflicts else 'matched' if len(common)==7 else 'partial' if common else 'single-source' if any(norm(v) for v in k.values()) else 'needs-check'
 chosen=k
 source=a['kakaoUrl']
 if nv and not conflicts and not mismatch:
  chosen={**k,**{d:list(dict.fromkeys(v+[x for x in k.get(d,[]) if re.search('브레이크|휴게|라스트',x)])) for d,v in nv.items() if d not in ndates}}
  source=a.get('naverUrl') or source
  if state=='needs-check':state='single-source'
 # A club's 24-hour listing does not prove its actual party schedule.
 if n in ['인클','어썸','엑스엑스']:state='needs-check';chosen={}
 if n in ['에꼴리','매거진랜드']:state='conflict'
 if n in ['일용할커피','엑스엑스']:mismatch=True
 if moved or mismatch:state='needs-check';chosen={}
 rec={'id':a['id'],'kakaoId':str(a['kakaoId']),'checkedAt':'2026-10-06','kakaoUrl':a['kakaoUrl'],'naverUrl':a.get('naverUrl'),'hoursState':state,'hoursSource':source,'hours':' / '.join(filter(None,(line(d,chosen[d]) for d in '월화수목금토일' if d in chosen))) if state not in ['conflict','needs-check'] else '영업시간 확인 필요'}
 if state not in ['conflict','needs-check'] and not rec['hours']:rec['hours']='영업시간 확인 필요';rec['hoursState']='needs-check'
 exceptions={date:norm(nv.get(d,[])) for d,date in ndates.items() if norm(nv.get(d,[]))}
 if exceptions:rec['hoursExceptions']=exceptions
 if n.startswith(('제시뮤직','그라운드합주실')):
  # Their addresses were matched with Kakao; only Naver supplies schedules.
  pairs=re.findall(r'(\d{2}:\d{2}) - (?:다음 날 )?(\d{2}:\d{2})',a.get('naverHours',''))
  if not pairs and n.startswith('그라운드합주실'):pairs=[('00:00','24:00')]
  if not pairs and n.startswith('제시뮤직'):pairs=[('09:00','02:00') if '홍대' in n else ('10:00','01:00')]
  if pairs:rec.update(hours=('24시간 예약 운영' if pairs[0]==('00:00','24:00') else '매일 '+'~'.join(pairs[0])),hoursState='single-source',hoursSource=a['naverUrl'])
  if n.startswith('제시뮤직 홍대'):rec['operatingNote']='명절·성탄절 휴무 · 예약 전 확인해 주세요.'
 if n=='밀키하우스':rec.update(temporarilyClosed=True,operatingNote='임시 휴업 · 재개 여부는 매장에 확인해 주세요.')
 if n=='매거진랜드':rec.update(type='retail',category='서점')
 if mismatch or moved:rec['locationNeedsCheck']=True;rec['operatingNote']='현재 위치와 운영시간 확인 필요 · 지도마다 주소가 달라요.'
 if a.get('verifiedMenu'):menu=a['verifiedMenu'];rec['menuSource']=a['menuSource']
 else:
  menu=[]
  for name,price in re.findall(r'- strong: ([^\n]+)\n\s*- paragraph: ([\d,]+)원',a.get('kakaoMenu','')):
   menu.append([name,int(price.replace(',','')),False])
  if not menu:menu=a.get('menu',[])
  if menu:rec['menuSource']=a['kakaoUrl']
 if menu:rec['menu']=menu[:4]
 a.update(kakaoSchedule=k,naverSchedule=nv,decision=rec['hoursState'],locationNeedsCheck=bool(mismatch or moved),temporaryExceptions=exceptions,menu=menu[:4],operatingNote=rec.get('operatingNote'))
 for key in ['kakaoHours','naverHours','kakaoMenu','naverMenu','kakaoHeader','naverCandidates']:a.pop(key,None)
 records.append(rec)
for a in json.loads((root/'data/unlinked-missing-audit.json').read_text()):
 rec={'id':a['id'],'kakaoId':None,'checkedAt':'2026-10-06','hours':'영업시간 확인 필요','hoursState':'needs-check','naverUrl':a.get('naverUrl')}
 if a.get('addressMatched'):rec.update(hours='매일 12:00~21:00',hoursState='single-source',hoursSource=a['naverUrl'],menu=a['verifiedMenu'],menuSource=a['naverUrl'])
 records.append(rec)
(root/'existing-research-data.js').write_text('window.HONGDAE_EXISTING_RESEARCH = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n')
(root/'data/existing-missing-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
print('Reviewed existing places',len(records),'Hours:',dict(Counter(x['hoursState'] for x in records)),'Menus:',sum(bool(x.get('menu')) for x in records),'Location holds:',sum(bool(x.get('locationNeedsCheck')) for x in records))
