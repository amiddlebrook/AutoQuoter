import test from "node:test";
import assert from "node:assert/strict";
import {sanitizePricebook} from "../frontend/pricebook.js";
import {CATALOG} from "../src/worker.js";
const sample={hoursPerUnit:10,laborRate:100,materialsPerUnit:500,overheadPercent:20,profitMarkupPercent:25};
test("valid pricebook entries round trip with untrusted objects removed",()=>{
  const p=sanitizePricebook({"hvac:heatpump":sample},CATALOG);
  assert.deepEqual(p["hvac:heatpump"],sample);
  assert.equal(Object.getPrototypeOf(p),null);
  assert.equal(JSON.parse(JSON.stringify(p))["hvac:heatpump"].laborRate,100);
});
test("rejects invalid, malicious or unsupported pricebook entries",()=>{
  for(const bad of [null,[],{"hvac:evil":sample},{"__proto__:toString":sample},{"hvac:heatpump":{...sample,laborRate:"100"}},{"hvac:heatpump":{...sample,profitMarkupPercent:999}},{"hvac:heatpump":{...sample,unknown:1}}]){
    assert.throws(()=>sanitizePricebook(bad,CATALOG));
  }
});
