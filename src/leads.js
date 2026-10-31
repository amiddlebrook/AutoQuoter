/**
 * First-party Cloudflare Free inquiry inbox. Stores unverified leads, NOT sales.
 * SQLite-backed Durable Object, 90-day retention, 3 submissions/IP/day,
 * honeypot, self-service deletion code and owner-only admin API.
 */
export const LEAD_TTL_DAYS=90;
const DAY=86400000;
const BUDGETS=new Set(["unsure","under200","200to500","500plus","no-budget"]);
const EMAIL=/^[^\s@<>"]{1,64}@[^\s@<>"]{1,200}\.[^\s@<>"]{2,63}$/;
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const trim=(v,n)=>typeof v==="string"?v.trim().slice(0,n+1):"";
export function validateLead(value){
  if(!value||typeof value!=="object"||Array.isArray(value))throw Error("Expected inquiry fields");
  if(Object.keys(value).length>10||Object.keys(value).some(k=>!["company","email","problem","jobs","budget","consent","website","source"].includes(k)))throw Error("Unexpected inquiry fields");
  const company=trim(value.company,80),email=trim(value.email,254).toLowerCase(),problem=trim(value.problem,1200),jobs=trim(value.jobs,240),website=trim(value.website,100);
  const budget=value.budget??"unsure";
  const source=typeof value.source==="string"&&["setup","pricing","demo"].includes(value.source)?value.source:"setup";
  if(company.length>80||email.length>254||!EMAIL.test(email)||problem.length<30||problem.length>1200||jobs.length>240)throw Error("Enter a valid email and a description of at least 30 characters");
  if(!BUDGETS.has(budget))throw Error("Select a valid budget answer");
  if(value.consent!==true)throw Error("Please agree to receive a reply about this inquiry");
  return {company,email,problem,jobs,budget,source,spam:website.length>0};
}
const FIELDS="id, created_at, company, email, problem, jobs, budget, source";
const hex=buf=>Array.from(new Uint8Array(buf),b=>b.toString(16).padStart(2,"0")).join("");
export class LeadsInbox{
  constructor(state,env){
    this.state=state;
    this.sql=state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY,created_at INTEGER NOT NULL,company TEXT NOT NULL,email TEXT NOT NULL,problem TEXT NOT NULL,jobs TEXT NOT NULL,budget TEXT NOT NULL,source TEXT NOT NULL,ip_day_hash TEXT NOT NULL,delete_hash TEXT NOT NULL)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS inquiry_time ON inquiries(created_at)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS inquiry_ip ON inquiries(ip_day_hash,created_at)");
  }
  async fetch(request){
    const path=new URL(request.url).pathname;
    try{
      if(path==="/add"&&request.method==="POST"){
        const input=await request.json(),lead=validateLead(input.fields);
        if(lead.spam)return json({ok:true,received:true});
        if(typeof input.ipHash!=="string"||!/^[0-9a-f]{64}$/.test(input.ipHash))return json({error:"Invalid submission"},422);
        const now=Date.now(),start=now-now%DAY;
        this.sql.exec("DELETE FROM inquiries WHERE created_at < ?",now-LEAD_TTL_DAYS*DAY);
        const n=this.sql.exec("SELECT count(*) as total FROM inquiries WHERE ip_day_hash = ? AND created_at >= ?",input.ipHash,start).one().total;
        if(n>=3)return json({error:"Daily inquiry limit reached. Try again tomorrow."},429);
        const id=crypto.randomUUID(),code=crypto.randomUUID().replaceAll("-","");
        const hash=hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(id+":"+code)));
        this.sql.exec("INSERT INTO inquiries(id,created_at,company,email,problem,jobs,budget,source,ip_day_hash,delete_hash) VALUES(?,?,?,?,?,?,?,?,?,?)",
          id,now,lead.company,lead.email,lead.problem,lead.jobs,lead.budget,lead.source,input.ipHash,hash);
        return json({ok:true,id,deleteCode:code,message:"Received for review. This is not a paid order."},201);
      }
      if(path==="/admin-list"&&request.method==="GET"){
        this.sql.exec("DELETE FROM inquiries WHERE created_at < ?",Date.now()-LEAD_TTL_DAYS*DAY);
        return json({ok:true,kind:"unverified-inquiries",items:Array.from(this.sql.exec("SELECT "+FIELDS+" FROM inquiries ORDER BY created_at DESC LIMIT 100"))});
      }
      if(path==="/admin-delete"&&request.method==="POST"){
        const {id}=await request.json();
        if(typeof id!=="string"||!/^[-0-9a-f]{36}$/.test(id))return json({error:"Invalid ID"},422);
        this.sql.exec("DELETE FROM inquiries WHERE id = ?",id);
        return json({ok:true});
      }
      if(path==="/self-delete"&&request.method==="POST"){
        const {id,code}=await request.json();
        if(typeof id!=="string"||!/^[-0-9a-f]{36}$/.test(id)||typeof code!=="string"||!/^[0-9a-f]{32}$/.test(code))return json({error:"Invalid deletion reference"},422);
        const hash=hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(id+":"+code)));
        this.sql.exec("DELETE FROM inquiries WHERE id = ? AND delete_hash = ?",id,hash);
        return json({ok:true});
      }
      return json({error:"Not found"},404);
    }catch(error){
      if(/Expected|valid|Unexpected|agree|description|budget|inquiry fields/i.test(error.message||""))return json({error:error.message},422);
      console.error("Lead inbox failure",error?.name||"unknown");
      return json({error:"Unable to process inquiry"},503);
    }
  }
}
export async function leadRequest(request,env,url){
  if(!env?.LEADS)return json({error:"Inquiry storage unavailable. Use the GitHub support link."},503);
  const method=request.method,path=url.pathname;
  if(path==="/api/leads/status"&&method==="GET")return json({accepting:true,kind:"unverified-inquiries",contact:"manual-review",retentionDays:LEAD_TTL_DAYS});
  const adminList=path==="/api/leads/admin",adminDelete=path==="/api/leads/admin/delete",selfDelete=path==="/api/leads/delete";
  if(adminList||adminDelete){
    const token=env.LEADS_ADMIN_TOKEN;
    if(typeof token!=="string"||token.length<24)return json({error:"Admin access is not configured"},503);
    const provided=request.headers.get("authorization")||"",expected="Bearer "+token;
    let different=provided.length^expected.length;
    for(let i=0;i<Math.max(provided.length,expected.length);i++)different|=(provided.charCodeAt(i)||0)^(expected.charCodeAt(i)||0);
    if(different!==0)return json({error:"Forbidden"},403);
    if((adminList&&method!=="GET")||(adminDelete&&method!=="POST"))return json({error:"Method not allowed"},405);
  }else if(method!=="POST")return json({error:"Method not allowed"},405);
  const origin=request.headers.get("origin");
  if(origin&&origin!==url.origin)return json({error:"Cross-origin form submission rejected"},403);
  let body;
  if(method==="POST"){
    if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return json({error:"Expected JSON"},415);
    if(Number(request.headers.get("content-length")||0)>4096)return json({error:"Request too large"},413);
    const raw=await request.text();
    if(raw.length>4096)return json({error:"Request too large"},413);
    try{body=JSON.parse(raw);}catch{return json({error:"Invalid JSON"},400);}
  }
  const operation=adminList?"/admin-list":adminDelete?"/admin-delete":selfDelete?"/self-delete":"/add";
  if(operation==="/add"){
    let fields;try{fields=validateLead(body);}catch(error){return json({error:error.message},422);}
    if(fields.spam)return json({ok:true,received:true});
    const ip=request.headers.get("cf-connecting-ip")||"unknown",day=new Date().toISOString().slice(0,10);
    const ipHash=hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(day+"|"+ip+"|"+url.hostname)));
    body={fields:{...fields,website:"",consent:true},ipHash};
  }
  const stub=env.LEADS.get(env.LEADS.idFromName("autoquoter-inquiry-inbox-v1"));
  return stub.fetch(new Request("https://internal"+operation,{method:operation==="/admin-list"?"GET":"POST",headers:{"content-type":"application/json"},body:operation==="/admin-list"?undefined:JSON.stringify(body)}));
}
