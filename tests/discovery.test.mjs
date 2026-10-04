import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const subwaySource=fs.readFileSync('api/subway-arrival.js','utf8').replace('export default ','');
async function subway(upstream){const ctx={process:{env:{SEOUL_API_KEY:'test-only'}},AbortSignal,Date,fetch:async()=>({ok:true,json:async()=>upstream})};vm.createContext(ctx);vm.runInContext(subwaySource,ctx);let body;const res={status(){return this},json(v){body=v},setHeader(){}};await ctx.handler({query:{}},res);return body;}
test('Seoul top-level RESULT authentication error is not a successful empty list',async()=>{const b=await subway({RESULT:{CODE:'ERROR-100',MESSAGE:'인증 실패'}});assert.equal(b.ok,false);assert.equal(b.error,'인증 실패');});
test('Arrival data retains actual line and arrival state',async()=>{const b=await subway({errorMessage:{code:'INFO-000'},realtimeArrivalList:[{subwayId:'1002',arvlMsg2:'3분 후',barvlDt:'180'}]});assert.equal(b.ok,true);assert.equal(b.list[0].barvlDt,'180');assert.equal(b.emptyReason,null);});
test('Empty source has an explicit state',async()=>{const b=await subway({RESULT:{CODE:'INFO-200',MESSAGE:'해당하는 데이터가 없습니다.'}});assert.equal(b.ok,true);assert.equal(b.list.length,0);assert.match(b.emptyReason,/데이터/);});
function routes(){const handlers={};const el={setAttribute(){},classList:{add(){},remove(){},contains(){return false}},querySelector:s=>handlers[s]??=( {focus(){},addEventListener(){}}),querySelectorAll:()=>[],addEventListener(){}};const ctx={window:{},document:{createElement:()=>({...el}),head:{append(){}},body:{...el},querySelector:()=>null,addEventListener(){}},localStorage:{getItem:()=> '[]'},currentLang:'ko',userTastes:[],isFranchise:()=>false,stores:[
{id:1,name:'구제 가게',type:'retail',category:'빈티지',tags:['빈티지'],lat:37.557,lng:126.924},
{id:2,name:'독립책방',type:'retail',tags:['독립출판'],lat:37.5571,lng:126.924},
{id:3,name:'레코드',type:'retail',tags:['바이닐'],lat:37.5572,lng:126.924},
{id:4,name:'식당',type:'restaurant',tags:['혼밥'],lat:37.5573,lng:126.924},
{id:5,name:'폐업 음반',status:'closed',type:'retail',tags:['바이닐'],lat:37.5573,lng:126.924}
]};vm.createContext(ctx);vm.runInContext(fs.readFileSync('passport-routes.js','utf8'),ctx);return {api:ctx.window.HongdaeSpecial,handlers};}
test('Book and vinyl route stays on-theme and excludes closed venues',()=>{const {api,handlers}=routes();api.openRoute('explorer');handlers['[data-route-questions]'].onsubmit({preventDefault(){},currentTarget:{elements:{theme:{value:'books'},stops:{value:'3'},walk:{value:'1200'},company:{value:'solo'},newOnly:{checked:false},food:{checked:false}}}});assert.deepEqual(Array.from(api.buildRoute('explorer'),p=>p.id).sort(),[2,3]);});
test('Theme shortage is not padded with irrelevant shops',()=>{const {api,handlers}=routes();api.openRoute('explorer');handlers['[data-route-questions]'].onsubmit({preventDefault(){},currentTarget:{elements:{theme:{value:'vintage'},stops:{value:'4'},walk:{value:'1200'},company:{value:'solo'},newOnly:{checked:false},food:{checked:false}}}});assert.deepEqual(Array.from(api.buildRoute('explorer'),p=>p.id),[1]);});
test('Missing map key preserves the Kakao renderer',async()=>{const originalMap=function(){};const ctx={window:{kakao:{maps:{Map:originalMap}}},fetch:async()=>({json:async()=>({cartoKey:null})}),AbortSignal};vm.createContext(ctx);vm.runInContext(fs.readFileSync('clean-map.js','utf8'),ctx);await ctx.window.HongdaeMap.ready();assert.equal(ctx.window.HongdaeMap.Map,originalMap);});

test('Root-level Seoul errors are detected',async()=>{const b=await subway({status:500,code:'INFO-100',message:'인증키가 유효하지 않습니다.'});assert.equal(b.ok,false);assert.match(b.error,/인증키/);});

test('Unknown Seoul payload is not treated as successful empty arrivals',async()=>{const b=await subway({status:500,error:'upstream problem'});assert.equal(b.ok,false);assert.deepEqual(Array.from(b.responseFields),['status','error']);});
test('Entering station and arriving at previous station have different labels',()=>{const html=fs.readFileSync('main.html','utf8');const source=html.slice(html.indexOf('function subwayArrivalTimeLabel('),html.indexOf('async function fetchSubwayArrival('));const ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);assert.equal(ctx.subwayArrivalTimeLabel({arvlCd:'0',barvlDt:'0'}),'진입 중');assert.equal(ctx.subwayArrivalTimeLabel({arvlCd:'5',barvlDt:'0'}),'전역 도착');});
