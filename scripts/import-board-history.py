"""Merge a supplied historical board workbook without summing overlapping mentions."""
import json,re,sys
from pathlib import Path
from openpyxl import load_workbook
norm=lambda s:re.sub(r'[^a-z0-9가-힣]','',re.sub(r'\([^)]*\)','',str(s)).lower())
base=lambda s:re.sub(r'(홍대점|홍대본점|상수점|본점)$','',norm(s))
road=lambda s:re.search(r'([가-힣0-9]+(?:로|길))\s*(\d+(?:-\d+)?)',str(s))
def roadkey(s):
 m=road(s);return ''.join(m.groups()) if m else ''
def usable(s):return s is not None and str(s).strip() and not re.search(r'미조회|미기재|확인 불가|검색되지 않음',str(s))
path=Path('data/hongdae-board-venues.json');records=json.loads(path.read_text());stores=json.loads(Path(sys.argv[2]).read_text());book=load_workbook(sys.argv[1],data_only=True)
honor_names={norm(r[1]) for r in list(book['자주 언급 업체'].values)[1:] if r[1]}
nextid=max([r['id'] for r in records]+[1790040000000])+1;added=updated=matched=0
for sheet in ['맛집게시판 업체','자유게시판 업체']:
 for index,values in enumerate(list(book[sheet].values)[1:],2):
  if not values[0]:continue
  if any(src.get("file")==Path(sys.argv[1]).name and src.get("sheet")==sheet and src.get("row")==index for r in records for src in r.get("sources",[])):continue
  name,category,address,hours,menu,price,rating,mentions,frequent,summary,evidence,note=values
  candidates=[r for r in records if norm(r['name'])==norm(name)]
  if not candidates:
   candidates=[r for r in records if base(r['name'])==base(name) and roadkey(address) and roadkey(r.get('address'))==roadkey(address)]
  # Alias is recorded in the workbook and the existing place has the same road address.
  if not candidates and norm(name)=='제제집':candidates=[r for r in records if '제제집' in r['name'] and roadkey(r.get('address'))==roadkey(address)]
  if len(candidates)==1:r=candidates[0];updated+=1
  else:
   places=[s for s in stores if norm(s['name'])==norm(name) or (base(s['name'])==base(name) and roadkey(address) and roadkey(s.get('address'))==roadkey(address))]
   place=places[0] if len(places)==1 else None
   r={'id':place['id'] if place else nextid,'existing':bool(place),'name':name,'category':category,'address':'','hours':'','menu':'','price':'','mentions':0,'sheet':sheet,'row':index,'status':place.get('status','unverified') if place else 'unverified'}
   if not place:nextid+=1
   else:matched+=1
   records.append(r);added+=1
  r['hallOfFame']=r.get('hallOfFame',False) or norm(name) in honor_names
  if r['hallOfFame']:r['hallOfFameBasis']='2024.06–2026.06 자주 언급 업체 시트 · 서로 다른 글 3회 이상'
  source={'name':name,'file':Path(sys.argv[1]).name,'sheet':sheet,'row':index,'periodStart':'2024-06-01','periodEnd':'2026-06-30','checked':'2026-10-04','mentions':mentions,'summary':summary,'evidence':evidence,'note':note,'hours':hours,'menu':menu,'price':price}
  r.setdefault('sources',[]).append(source)
  for k,v in [('category',category),('address',address),('hours',hours),('menu',menu),('price',price)]:
   if usable(v):r[k]=str(v)
  r['mentions']=max(r.get('mentions') or 0,mentions or 0)
  r['mentionBasis']='자료별 최대 언급 수 (중복 합산 안 함)'
  r['checked']='2026-10-04'
  r['period']='2024.06–2026.06'
path.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'total':len(records),'added':added,'mergedRows':updated,'newRowsMatchedToMap':matched,'sourceRows':sum(len(r.get('sources',[])) for r in records)},ensure_ascii=False))
