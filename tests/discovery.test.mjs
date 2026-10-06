import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const subwaySource=fs.readFileSync('api/subway-arrival.js','utf8').replace('export default ','');
async function subway(upstream){const ctx={process:{env:{SEOUL_API_KEY:'test-only'}},AbortSignal,Date,fetch:async()=>({ok:true,json:async()=>upstream})};vm.createContext(ctx);vm.runInContext(subwaySource,ctx);let body;const res={status(){return this},json(v){body=v},setHeader(){}};await ctx.handler({query:{}},res);return body;}
test('Seoul top-level RESULT authentication error is not a successful empty list',async()=>{const b=await subway({RESULT:{CODE:'ERROR-100',MESSAGE:'인증 실패'}});assert.equal(b.ok,false);assert.equal(b.error,'인증 실패');});
test('Arrival data retains actual line and arrival state',async()=>{const b=await subway({errorMessage:{code:'INFO-000'},realtimeArrivalList:[{subwayId:'1002',arvlMsg2:'3분 후',barvlDt:'180'}]});assert.equal(b.ok,true);assert.equal(b.list[0].barvlDt,'180');assert.equal(b.emptyReason,null);});
test('Empty source has an explicit state',async()=>{const b=await subway({RESULT:{CODE:'INFO-200',MESSAGE:'해당하는 데이터가 없습니다.'}});assert.equal(b.ok,true);assert.equal(b.list.length,0);assert.match(b.emptyReason,/데이터/);});
function routes(){const handlers={};const el={setAttribute(){},classList:{add(){},remove(){},contains(){return false}},querySelector:s=>handlers[s]??=( {focus(){},addEventListener(){}}),querySelectorAll:()=>[],addEventListener(){}};const ctx={window:{addEventListener(){}},document:{createElement:()=>({...el}),head:{append(){}},body:{...el},querySelector:()=>null,addEventListener(){}},localStorage:{getItem:()=> '[]'},currentLang:'ko',userTastes:[],isFranchise:()=>false,stores:[
{id:1,name:'구제 가게',type:'retail',category:'빈티지',tags:['빈티지'],lat:37.557,lng:126.924},
{id:2,name:'독립책방',type:'retail',tags:['독립출판'],lat:37.5571,lng:126.924},
{id:3,name:'레코드',type:'retail',tags:['바이닐'],lat:37.5572,lng:126.924},
{id:4,name:'식당',type:'restaurant',tags:['혼밥'],lat:37.5573,lng:126.924},
{id:5,name:'폐업 음반',status:'closed',type:'retail',tags:['바이닐'],lat:37.5573,lng:126.924}
]};vm.createContext(ctx);vm.runInContext(fs.readFileSync('passport-routes.js','utf8'),ctx);return {api:ctx.window.HongdaeSpecial,handlers};}
test('Book and vinyl route stays on-theme and excludes closed venues',()=>{const {api,handlers}=routes();api.openRoute('explorer','conditions');handlers['[data-route-questions]'].onsubmit({preventDefault(){},currentTarget:{elements:{theme:{value:'books'},stops:{value:'3'},walk:{value:'1200'},company:{value:'solo'},newOnly:{checked:false},food:{checked:false}}}});assert.deepEqual(Array.from(api.buildRoute('explorer'),p=>p.id).sort(),[2,3]);});
test('Theme shortage is not padded with irrelevant shops',()=>{const {api,handlers}=routes();api.openRoute('explorer','conditions');handlers['[data-route-questions]'].onsubmit({preventDefault(){},currentTarget:{elements:{theme:{value:'vintage'},stops:{value:'4'},walk:{value:'1200'},company:{value:'solo'},newOnly:{checked:false},food:{checked:false}}}});assert.deepEqual(Array.from(api.buildRoute('explorer'),p=>p.id),[1]);});
test('Missing map key preserves the Kakao renderer',async()=>{const originalMap=function(){};const ctx={window:{kakao:{maps:{Map:originalMap}}},fetch:async()=>({json:async()=>({cartoKey:null})}),AbortSignal};vm.createContext(ctx);vm.runInContext(fs.readFileSync('clean-map.js','utf8'),ctx);await ctx.window.HongdaeMap.ready();assert.equal(ctx.window.HongdaeMap.Map,originalMap);});

test('Root-level Seoul errors are detected',async()=>{const b=await subway({status:500,code:'INFO-100',message:'인증키가 유효하지 않습니다.'});assert.equal(b.ok,false);assert.match(b.error,/인증키/);});

test('Unknown Seoul payload is not treated as successful empty arrivals',async()=>{const b=await subway({status:500,error:'upstream problem'});assert.equal(b.ok,false);assert.deepEqual(Array.from(b.responseFields),['status','error']);});
test('Entering station and arriving at previous station have different labels',()=>{const html=fs.readFileSync('main.html','utf8');const source=html.slice(html.indexOf('function subwayArrivalTimeLabel('),html.indexOf('async function fetchSubwayArrival('));const ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);assert.equal(ctx.subwayArrivalTimeLabel({arvlCd:'0',barvlDt:'0'}),'진입 중');assert.equal(ctx.subwayArrivalTimeLabel({arvlCd:'5',barvlDt:'0'}),'전역 도착');});

test('Each district station requests its own Seoul arrival endpoint',async()=>{
  for(const station of ['홍대입구','합정','상수']){
    let requested;const ctx={process:{env:{SEOUL_API_KEY:'test-only'}},AbortSignal,Date,fetch:async url=>{requested=url;return {ok:true,json:async()=>({RESULT:{CODE:'INFO-200'}})}}};
    vm.createContext(ctx);vm.runInContext(subwaySource,ctx);const res={status(){return this},json(){},setHeader(){}};
    await ctx.handler({query:{station}},res);assert.ok(requested.endsWith('/'+encodeURIComponent(station)));
  }
});

test('Historical workbook keeps unique venues, separate evidence, and frequent-place classification',()=>{
 const rows=JSON.parse(fs.readFileSync('data/hongdae-board-venues.json','utf8'));
 assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
 assert.equal(rows.filter(r=>r.hallOfFame).length,42);
 const sources=rows.flatMap(r=>r.sources||[]);assert.equal(sources.length,174);
 for(const row of rows.filter(r=>r.sources?.length)){assert.ok(row.mentions>=Math.max(...row.sources.map(s=>s.mentions||0)));assert.ok(row.sources.every(s=>s.periodStart==='2024-06-01'&&s.periodEnd==='2026-06-30'));}
});

test('Budget meal recommendations exclude sides, drinks, shared dishes and missing prices',()=>{
 const source=fs.readFileSync('discovery-ui.js','utf8');const start=source.indexOf('  const budgetMeals =');const end=source.indexOf('  const themePlaces =',start);const meal=vm.runInNewContext(source.slice(start,end)+';budgetMeals');
 const result=meal({surveyMenu:{menu:[['돈카츠 정식',10000],['라멘',10500],['미니우동',3000],['공기밥 추가',1000],['고기 마요 덮밥',3000],['김치찌개 2인 이상',9000],['국밥',null],['김밥',4500],['감자튀김',4000],['콜라',2000]]}});
 assert.deepEqual(Array.from(result,r=>r[0]),['돈카츠 정식','김밥']);
});

test('Franchise exclusion supports explicit data and case-insensitive names without treating every branch as a chain',()=>{
 const html=fs.readFileSync('main.html','utf8');const source=html.slice(html.indexOf('const FRANCHISE_BRANDS'),html.indexOf('// 클럽/라이브클럽'));const ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);
 assert.equal(ctx.isFranchise({name:'BBQ 홍대점'}),true);
 assert.equal(ctx.isFranchise({name:'제제집 본점'}),false);
 assert.equal(ctx.isFranchise({name:'확인 브랜드',franchise:true}),true);
});

test('Managed database places preserve curated records and apply editor changes only within map bounds',()=>{
 const ctx={window:{},document:{addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('managed-places.js','utf8'),ctx);
 const target=[{id:1,name:'기존',tags:['혼밥'],lat:37.55,lng:126.92}];
 const merge=ctx.window.HongdaeManagedPlaces.merge;
 merge([{id:1,name:'오래된 서버명',tags:[],source:{}}],target);assert.equal(target[0].name,'기존');
 merge([{id:1,name:'관리자 수정',tags:['빈티지'],lat:37.55,lng:126.92,source:{editorial:true,hours:'12:00-20:00',franchise:true}},{id:2,name:'망원 공간',lat:37.555,lng:126.9,source:{}},{id:3,name:'타지역',lat:37.4,lng:127.1,source:{}}],target);
 assert.equal(target[0].name,'관리자 수정');assert.equal(target[0].hours,'12:00-20:00');assert.equal(target[0].franchise,true);assert.equal(target.length,2);
});
test('Guest save and unsave work without a login server',async()=>{
 const html=fs.readFileSync('main.html','utf8');const a=html.indexOf('async function toggleBookmark('),b=html.indexOf('// ── 사라진 가게',a);
 const memory=new Map([['localSaveConsent','1']]);const ctx={bookmarks:{},window:{HongdaePlatform:{whenReady:async()=>{},getUser:()=>null}},localStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},selectedId:null,showToast(){},renderAll(){}};vm.createContext(ctx);vm.runInContext(html.slice(a,b),ctx);
 await ctx.toggleBookmark(5);assert.equal(ctx.bookmarks[5],true);assert.equal(memory.get('bookmarksOwner'),'guest');await ctx.toggleBookmark(5);assert.equal(ctx.bookmarks[5],undefined);
});
test('Failed account save does not pretend to update bookmarks',async()=>{
 const html=fs.readFileSync('main.html','utf8');const a=html.indexOf('async function toggleBookmark('),b=html.indexOf('// ── 사라진 가게',a);
 const ctx={bookmarks:{},window:{HongdaePlatform:{whenReady:async()=>{},getUser:()=>({id:'test'}),syncDefaultSave:async()=>false}},localStorage:{getItem:()=>null,setItem:()=>assert.fail('must not persist failed save')},selectedId:null};vm.createContext(ctx);vm.runInContext(html.slice(a,b),ctx);await ctx.toggleBookmark(5);assert.equal(ctx.bookmarks[5],undefined);
});

test('Data arriving before map readiness cannot create a clusterer for the wrong renderer',()=>{const html=fs.readFileSync('main.html','utf8');const source=html.slice(html.indexOf('function renderMarkers() {'),html.indexOf('// 클러스터 되는 줌 레벨'));const ctx={map:undefined,clusterer:undefined,HongdaeMap:{MarkerClusterer(){throw new Error('Premature cluster creation')}}};vm.createContext(ctx);vm.runInContext(source,ctx);ctx.renderMarkers();assert.equal(ctx.clusterer,undefined);});

function recommendations(seed={}){const values=new Map(Object.entries(seed));const ctx={window:{dispatchEvent(){},addEventListener(){}},document:{addEventListener(){}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},Event:class {},Date};vm.createContext(ctx);vm.runInContext(fs.readFileSync('recommendation-profile.js','utf8'),ctx);return {api:ctx.window.HongdaeRecommendations,values};}
test('Shared preference ranking changes feed priority with the selected mood and explains the match',()=>{const {api}=recommendations();const items=[{id:1,tags:['조용한'],status:'open',type:'cafe'},{id:2,tags:['시끌벅적'],status:'open',type:'bar'},{id:3,tags:['조용한'],status:'closed',type:'cafe'}];api.save({tags:['조용한'],budget:'any',company:'solo',explore:'balanced',walk:1200});assert.deepEqual(Array.from(api.rank(items),s=>s.id),[1]);assert.ok(api.explain(items[0]).includes('#조용한'));api.save({tags:['시끌벅적'],budget:'any',company:'friends',explore:'balanced',walk:600});assert.deepEqual(Array.from(api.rank(items),s=>s.id),[2]);});
test('Budget preference excludes unknown or expensive restaurant meals and preserves non-food exploration',()=>{const {api,values}=recommendations();api.save({tags:['덕후'],budget:'10000',company:'solo',explore:'new',walk:600});assert.equal(api.eligible({type:'restaurant',surveyMenu:{menu:[['라멘',12000],['공기밥',1000]]}}),false);assert.equal(api.eligible({type:'restaurant'}),false);assert.equal(api.eligible({type:'restaurant',surveyMenu:{menu:[['돈카츠',9000]]}}),true);assert.equal(api.eligible({type:'retail'}),true);assert.equal(JSON.parse(values.get('userTastes'))[0],'덕후');assert.equal(api.profile().walk,600);});

test('Hours presentation separates weekday opening, break, last order and closed days',()=>{
 const ctx={window:{},stores:[],document:{createElement:()=>({}),head:{append(){}}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('survey-menu-ui.js','utf8'),ctx);
 const rows=ctx.window.HongdaeMenus.splitHours('월금 11:00~21:00 · 휴게 15:00~17:00 · 라스트오더 20:30 / 일 휴무');
 assert.equal(rows[0].open,'11:00–21:00');assert.equal(rows[0].break,'15:00–17:00');assert.equal(rows[0].last,'20:30');assert.equal(rows[1].closed,true);
 const split=ctx.window.HongdaeMenus.splitHours('매일 11:00~14:00, 17:00~21:00')[0];assert.equal(split.open,'11:00–14:00 / 17:00–21:00');
 const bad=ctx.window.HongdaeMenus.splitHours('매일 12:00~23:00 · 휴게 EEF')[0];assert.equal(bad.break,null);assert.equal(bad.uncertain,true);
});
test('Everyday meal candidates honor price, district, solo and closure without side dishes',()=>{
 const ctx={window:{},document:{addEventListener(){}},stores:[{id:1,type:'restaurant',category:'분식',dong:'망원동',tags:['혼밥'],surveyMenu:{menu:[['김밥',4000],['공기밥',1000],['2인 정식',8000]]}},{id:2,type:'restaurant',dong:'서교동',surveyMenu:{menu:[['돈까스',12000]]}},{id:3,type:'restaurant',status:'closed',surveyMenu:{menu:[['국밥',6000]]}},{id:4,type:'cafe',surveyMenu:{menu:[['샌드위치',5000]]}}],indieOnly:false,isFranchise:()=>false};vm.createContext(ctx);vm.runInContext(fs.readFileSync('meal-picker.js','utf8'),ctx);const c=ctx.window.HongdaeMeals.candidates(7000,'망원동',true);assert.equal(c.length,1);assert.equal(c[0].menu.length,1);assert.equal(c[0].menu[0][0],'김밥');assert.equal(ctx.window.HongdaeMeals.candidates(3000).length,0);assert.equal(ctx.window.HongdaeMeals.candidates(7000,'',false,'한식').length,1);assert.equal(ctx.window.HongdaeMeals.candidates(7000,'',false,'일식').length,0);assert.equal(ctx.window.HongdaeMeals.mealCuisine({category:'음식점'}),'');
});


test('Music enrichment corrects venue classification without inventing DJ sessions or free admission',()=>{
 const ctx={window:{},stores:[]};vm.createContext(ctx);vm.runInContext(fs.readFileSync('music-venues.js','utf8'),ctx);
 const music=ctx.window.HongdaeMusic;
 const evans={id:1784182411172,type:'restaurant',category:'한식',tags:['로컬단골']};music.enrich(evans);
 assert.equal(evans.type,'liveclub');assert.ok(evans.tags.includes('재즈'));assert.ok(evans.tags.includes('라이브음악'));
 assert.match(music.card(evans),/음료 한 잔 별도/);
 const side={id:1786000000018,type:'bar',tags:[]};music.enrich(side);assert.ok(!side.tags.includes('DJ'));assert.ok(!side.tags.includes('라이브음악'));
 assert.match(music.card({id:1784182364776}),/자율 모금/);assert.doesNotMatch(music.card({id:1784182364776}),/무료|0원/);
 assert.equal(music.card({id:1784182411172,status:'closed'}),'');
 music.enrich(evans);assert.equal(evans.tags.filter(t=>t==='재즈').length,1);
});

test('Late night hours exclude break times, midnight closure and closed places',()=>{
 const ctx={window:{},document:{addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('local-map-maintenance.js','utf8'),ctx);const late=ctx.window.HongdaeHoursFilter.isLate;
 assert.equal(late({hours:'월화 18:00~02:00 / 수 휴무'}),true);
 assert.equal(late({hours:'매일 11:00~24:00'}),false);
 assert.equal(late({hours:'매일 11:00~23:00 · 휴게 01:00~02:00'}),false);
 assert.equal(late({hours:'매일 00:30~06:00'}),true);
 assert.equal(late({hours:'24시간',status:'closed'}),false);
 assert.equal(late({hours:'영업시간 확인 필요'}),false);
 assert.equal(late({hours:'11:00~23:00',services:['lateNight']}),false);
});
test('Excluded affiliate services cannot return through managed places',()=>{
 const ctx={window:{HongdaeExcludedPlaceIds:new Set([1786000000055])},document:{addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('managed-places.js','utf8'),ctx);const places=[];
 ctx.window.HongdaeManagedPlaces.merge([{id:1786000000055,name:'로얄짐 1호점',lat:37.55,lng:126.92,source:{editorial:true}}],places);assert.equal(places.length,0);
});

test('Map research applies records without Kakao IDs and retains separate menu sources',()=>{
 const ctx={window:{},stores:[{id:1786000000070},{id:1,kakaoId:'77',lat:37.55}]};vm.createContext(ctx);
 ctx.window.HONGDAE_EXISTING_RESEARCH=[{id:1786000000070,kakaoId:null,hours:'매일 12:00~21:00',hoursState:'single-source',naverUrl:'https://naver.test',menu:[['입장료',18000,false]],menuSource:'https://naver.test/menu'},{id:1,kakaoId:'77',hoursState:'conflict',hours:'영업시간 확인 필요',menuSource:'https://kakao.test/menu'}];
 vm.runInContext(fs.readFileSync('existing-research.js','utf8'),ctx);
 assert.equal(ctx.stores[0].hours,'매일 12:00~21:00');assert.equal(ctx.stores[0].surveyMenu.menuSource,'https://naver.test/menu');assert.equal(ctx.stores[1].lat,37.55);assert.equal(ctx.stores[1].hoursState,'conflict');
});
test('Neighbourhood imports are idempotent and preserve saved IDs and verified coordinates',()=>{
 const ctx={window:{},stores:[{id:8,kakaoId:'27114079',lat:37.5,lng:126.9,tags:[]}]};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync('neighbourhood-research-data.js','utf8'),ctx);vm.runInContext(fs.readFileSync('neighbourhood-research.js','utf8'),ctx);ctx.window.HongdaeNeighbourhoodResearch.enrich(ctx.stores);
 assert.equal(ctx.stores.length,30);assert.equal(ctx.stores[0].id,8);assert.equal(ctx.stores[0].lat,37.5);
 const adjacent=ctx.stores.find(s=>s.name==='아치서재');assert.equal(adjacent.neighbourhood,'망원동');assert.equal(adjacent.dong,'성산동');
 assert.equal(ctx.stores.filter(s=>s.tags.includes('혼술')).length,1);assert.ok(ctx.stores.every(s=>s.isFranchise===undefined));
});
