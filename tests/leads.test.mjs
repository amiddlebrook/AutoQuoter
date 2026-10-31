import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";
import {validateLead} from "../src/leads.js";
const valid={company:"Example",email:"buyer@example.com",problem:"Need to configure a repeatable job pricebook using our own costs.",jobs:"Five jobs",budget:"unsure",consent:true,website:"",source:"setup"};
test("valid and bounded inquiries",()=>{
 const normalized=validateLead(valid);assert.equal(normalized.email,"buyer@example.com");assert.equal(normalized.spam,false);
 for(const bad of [null,{},[],{...valid,email:"bad"},{...valid,consent:false},{...valid,budget:"million"},{...valid,problem:"tiny"},{...valid,extra:"not allowed"}])assert.throws(()=>validateLead(bad));
 assert.equal(validateLead({...valid,website:"bot field"}).spam,true);
});
const req=(path,opts={})=>new Request("https://autoquoter.example"+path,opts);
test("without a Durable Object binding, inquiry is unavailable rather than pretending it saved",async()=>{
 const r=await worker.fetch(req("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(valid)}),{});
 assert.equal(r.status,503);
 assert.match((await r.json()).error,/unavailable/);
});
test("requires admin secret even when lead storage is bound",async()=>{
 const env={LEADS:{get(){throw Error("must not be called")},idFromName(){throw Error("must not be called")}}};
 const r=await worker.fetch(req("/api/leads/admin"),env);
 assert.equal(r.status,503);
});
test("cross-origin and non-json submissions rejected before storage",async()=>{
 const env={LEADS:{get(){throw Error("must not be called")},idFromName(){throw Error("must not be called")}}};
 const alien=await worker.fetch(req("/api/leads",{method:"POST",headers:{"origin":"https://attacker.example","content-type":"application/json"},body:JSON.stringify(valid)}),env);
 assert.equal(alien.status,403);
 const text=await worker.fetch(req("/api/leads",{method:"POST",headers:{"content-type":"text/plain"},body:"bad"}),env);
 assert.equal(text.status,415);
});
