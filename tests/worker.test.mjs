import test from "node:test";
import assert from "node:assert/strict";
import worker,{estimateQuote,CATALOG,STATE_INDEX} from "../src/worker.js";

const sample={trade:"hvac",task:"heatpump",state:"CO",quantity:1,complexity:"standard",urgency:"flexible",addedMaterials:0};
const request=(path,options={})=>new Request("https://autoquoter.example"+path,options);

test("supports six trades and all US states plus DC",()=>{
  assert.equal(Object.keys(CATALOG).length,6);
  assert.equal(Object.keys(STATE_INDEX).length,51);
});
test("price calculations are deterministic and ordered",()=>{
  const a=estimateQuote(sample),b=estimateQuote(sample);
  assert.ok(a.low<a.median&&a.median<a.high);
  assert.equal(a.median,b.median);
  assert.equal(a.breakdown.directCost,a.breakdown.labor+a.breakdown.materials);
});
test("quantity, location and complexity change prices",()=>{
  const baseline=estimateQuote(sample).median;
  assert.ok(estimateQuote({...sample,quantity:2}).median>baseline);
  assert.ok(estimateQuote({...sample,state:"CA"}).median>baseline);
  assert.ok(estimateQuote({...sample,complexity:"complex"}).median>baseline);
  assert.ok(estimateQuote({...sample,urgency:"emergency"}).median>baseline);
});
test("rejects invalid inputs",()=>{
  for(const invalid of [
    {...sample,trade:"not-a-trade"},{...sample,task:"__proto__"},
    {...sample,state:"US"},{...sample,quantity:0},
    {...sample,quantity:1.5},{...sample,addedMaterials:-1},
    {...sample,addedMaterials:"100"},{...sample,complexity:"extreme"},
    {...sample,urgency:"yesterday"},null
  ])assert.throws(()=>estimateQuote(invalid),/./);
});
test("live quote endpoint accepts valid JSON without localhost",async()=>{
  const res=await worker.fetch(request("/api/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(sample)}),{});
  assert.equal(res.status,200);
  const data=await res.json();
  assert.equal(data.trade,"hvac");
  assert.equal(data.state,"CO");
  assert.ok(data.breakdown.hours>0);
  assert.match(data.disclaimer,/not a bid/i);
});
test("returns appropriate errors and methods",async()=>{
  for(const [opts,status] of [
    [{method:"GET"},405],
    [{method:"POST",headers:{"content-type":"text/plain"},body:"hi"},415],
    [{method:"POST",headers:{"content-type":"application/json"},body:"bad"},400],
    [{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...sample,state:"XX"})},422],
    [{method:"POST",headers:{"content-type":"application/json"},body:" ".repeat(8193)},413]
  ])assert.equal((await worker.fetch(request("/api/quote",opts),{})).status,status);
});
test("unknown API returns JSON 404 and health is live",async()=>{
  assert.equal((await worker.fetch(request("/api/not-real"),{})).status,404);
  const healthy=await worker.fetch(request("/api/health"),{});
  assert.equal((await healthy.json()).status,"ok");
});
test("serves assets with security headers",async()=>{
  const env={ASSETS:{fetch:async()=>new Response("<h1>AutoQuoter</h1>",{headers:{"content-type":"text/html"}})}};
  const result=await worker.fetch(request("/"),env);
  assert.equal(result.status,200);
  assert.equal(result.headers.get("x-frame-options"),"DENY");
  assert.match(result.headers.get("content-security-policy"),/frame-ancestors/);
});
test("redirects legacy dashboards into the new workspace",async()=>{
  const res=await worker.fetch(request("/dashboard.html"),{});
  assert.equal(res.status,302);
  assert.equal(res.headers.get("location"),"https://autoquoter.example/#overview");
});