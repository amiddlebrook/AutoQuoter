export const STATE_INDEX = Object.freeze({
AL:0.87,AK:1.30,AZ:1.02,AR:0.86,CA:1.32,CO:1.10,CT:1.23,DE:1.06,DC:1.28,FL:0.98,GA:0.95,HI:1.44,ID:0.97,IL:1.12,IN:0.95,IA:0.92,KS:0.90,KY:0.90,LA:0.92,ME:1.08,MD:1.19,MA:1.29,MI:1.00,MN:1.14,MS:0.84,MO:0.94,MT:1.01,NE:0.92,NV:1.13,NH:1.13,NJ:1.28,NM:0.92,NY:1.30,NC:0.93,ND:0.99,OH:0.96,OK:0.88,OR:1.16,PA:1.06,RI:1.17,SC:0.90,SD:0.90,TN:0.92,TX:0.99,UT:1.03,VT:1.10,VA:1.10,WA:1.22,WV:0.85,WI:1.01,WY:1.02
});

export const CATALOG = Object.freeze({
  hvac:{label:"HVAC & climate",icon:"thermometer-sun",rate:108,presets:{
    diagnostic:{label:"System diagnostic",unit:"visit",hours:1.5,materials:28,description:"Troubleshooting and performance assessment"},
    ac:{label:"Central A/C replacement",unit:"system",hours:14,materials:3550,description:"Typical replacement; ductwork excluded"},
    heatpump:{label:"Heat pump replacement",unit:"system",hours:18,materials:4650,description:"Typical air-source system replacement"},
    minisplit:{label:"Single-zone mini-split install",unit:"system",hours:12,materials:2450,description:"Basic installation with short line set"},
    furnace:{label:"Gas furnace replacement",unit:"system",hours:12,materials:2100,description:"Standard-efficiency replacement"}
  }},
  plumbing:{label:"Plumbing",icon:"droplets",rate:100,presets:{
    fixture:{label:"Faucet / fixture replacement",unit:"fixture",hours:2.5,materials:165,description:"Accessible standard fixture"},
    heater:{label:"Tank water heater replacement",unit:"unit",hours:6,materials:1050,description:"Standard residential tank"},
    drain:{label:"Drain clearing",unit:"visit",hours:2,materials:45,description:"Accessible non-sewer drain"},
    repipe:{label:"Supply line repipe",unit:"bathroom",hours:14,materials:800,description:"Accessible supply pipe allowance"}
  }},
  electrical:{label:"Electrical",icon:"zap",rate:108,presets:{
    outlet:{label:"Replace outlet / switch",unit:"device",hours:1.5,materials:38,description:"Existing box and wiring"},
    circuit:{label:"New branch circuit",unit:"circuit",hours:7,materials:290,description:"Typical accessible cable route"},
    panel:{label:"200A panel replacement",unit:"panel",hours:16,materials:1600,description:"Service upgrades / utility fees excluded"},
    ev:{label:"EV charger installation",unit:"charger",hours:7,materials:540,description:"Short run, existing panel capacity"}
  }},
  roofing:{label:"Roofing",icon:"house",rate:96,presets:{
    patch:{label:"Roof leak repair",unit:"repair",hours:5,materials:280,description:"Localized shingle repair"},
    shingles:{label:"Asphalt shingle replacement",unit:"roof square (100 sq ft)",hours:3,materials:390,description:"Standard pitch; no decking repairs"},
    gutter:{label:"Gutter replacement",unit:"10 linear ft",hours:1.25,materials:105,description:"Standard aluminum gutter"},
    inspection:{label:"Roof inspection",unit:"visit",hours:2,materials:15,description:"Visual condition assessment"}
  }},
  landscaping:{label:"Landscaping",icon:"sprout",rate:72,presets:{
    cleanup:{label:"Yard cleanup",unit:"visit",hours:5,materials:115,description:"Basic debris handling"},
    sod:{label:"Sod installation",unit:"100 sq ft",hours:3.5,materials:130,description:"Light soil preparation"},
    fence:{label:"Wood privacy fence",unit:"10 linear ft",hours:5,materials:250,description:"Standard 6-foot fencing"},
    mulch:{label:"Mulch installation",unit:"cubic yard",hours:2,materials:82,description:"Material and spreading"}
  }},
  remodeling:{label:"Remodeling",icon:"paintbrush",rate:89,presets:{
    paint:{label:"Interior painting",unit:"100 sq ft wall area",hours:2.5,materials:65,description:"Basic prep and two coats"},
    floor:{label:"LVP flooring",unit:"100 sq ft",hours:7,materials:325,description:"Subfloor preparation excluded"},
    bathroom:{label:"Standard bathroom refresh",unit:"bathroom",hours:80,materials:4550,description:"Cosmetic work, no layout changes"},
    kitchen:{label:"Kitchen refresh",unit:"kitchen",hours:110,materials:8600,description:"Surfaces and fixtures, no structural work"}
  }}
});

const COMPLEXITY = Object.freeze({simple:0.85,standard:1,complex:1.35});
const URGENCY = Object.freeze({flexible:1,soon:1.12,emergency:1.30});
const round = x => Math.round(x * 100) / 100;
const isObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
function numberInRange(value,min,max,name,integer=false){
  if(typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))){
    throw new QuoteError(name + " must be " + (integer?"an integer ":"a number ") + "between " + min + " and " + max);
  }
  return value;
}
export class QuoteError extends Error{
  constructor(message){super(message);this.name="QuoteError";}
}

export function estimateQuote(input){
  if(!isObject(input)) throw new QuoteError("Expected a JSON object");
  const trade = typeof input.trade === "string" ? input.trade.toLowerCase() : "";
  const category = CATALOG[trade];
  if(!category) throw new QuoteError("Select a supported trade");
  const task = typeof input.task === "string" ? input.task : "";
  const preset = Object.hasOwn(category.presets,task) ? category.presets[task] : null;
  if(!preset) throw new QuoteError("Select a supported job");
  const state = typeof input.state === "string" ? input.state.trim().toUpperCase() : "";
  if(!Object.hasOwn(STATE_INDEX,state)) throw new QuoteError("Select a valid US state or DC");
  const complexity = input.complexity ?? "standard";
  const urgency = input.urgency ?? "flexible";
  if(!Object.hasOwn(COMPLEXITY,complexity)) throw new QuoteError("Invalid complexity");
  if(!Object.hasOwn(URGENCY,urgency)) throw new QuoteError("Invalid schedule");
  const quantity = numberInRange(input.quantity ?? 1,1,100,"Quantity",true);
  const addedMaterials = numberInRange(input.addedMaterials ?? 0,0,100000,"Additional materials");
  // A priced job can use explicitly supplied contractor inputs. No market-rate claims.
  // The API does not persist either these values or customer-identifying details.
  const custom = input.pricing;
  if (custom !== undefined) {
    if (!isObject(custom)) throw new QuoteError("Pricing must be an object");
    const fields=["hoursPerUnit","laborRate","materialsPerUnit","overheadPercent","profitMarkupPercent"];
    if (Object.keys(custom).length!==fields.length||fields.some(field=>!Object.hasOwn(custom,field))) {
      throw new QuoteError("Complete all five custom pricing fields");
    }
    numberInRange(custom.hoursPerUnit,0.1,2000,"Labor hours per unit");
    numberInRange(custom.laborRate,0,10000,"Hourly labor rate");
    numberInRange(custom.materialsPerUnit,0,1000000,"Materials per unit");
    numberInRange(custom.overheadPercent,0,100,"Overhead percent");
    numberInRange(custom.profitMarkupPercent,0,200,"Profit markup percent");
  }
  const locationFactor = STATE_INDEX[state];
  const laborRate = round(custom ? custom.laborRate : category.rate * locationFactor);
  const estimatedHours = round((custom ? custom.hoursPerUnit : preset.hours) * quantity * COMPLEXITY[complexity]);
  const labor = round(estimatedHours * laborRate * URGENCY[urgency]);
  const materials = round((custom ? custom.materialsPerUnit * quantity : preset.materials * quantity * (0.85+locationFactor*0.15)) + addedMaterials);
  const directCost = round(labor + materials);
  const overheadPercent = custom ? custom.overheadPercent : 18;
  const profitMarkupPercent = custom ? custom.profitMarkupPercent : 12;
  const overhead = round(directCost * overheadPercent / 100);
  const margin = round((directCost + overhead) * profitMarkupPercent / 100);
  const typical = round(directCost + overhead + margin);
  return {
    id:crypto.randomUUID(),createdAt:new Date().toISOString(),
    model:custom?"contractor-entered-v1":"assumption-based-v1",
    pricingSource:custom?"contractor-entered":"illustrative",
    trade,tradeLabel:category.label,task,taskLabel:preset.label,state,quantity,unit:preset.unit,
    complexity,urgency,addedMaterials,
    low:Math.round(typical*0.78),median:Math.round(typical),high:Math.round(typical*1.28),
    breakdown:{hours:estimatedHours,hourlyRate:laborRate,labor,materials,directCost,overhead,margin,overheadPercent,profitMarkupPercent},
    methodology:custom?
      "Contractor-entered hours, hourly rate and material allowance; chosen complexity and urgency; contractor-entered overhead and markup. Low/high is a subjective -22%/+28% planning range, not statistical confidence.":
      "Illustrative labor and material allowances, coarse state multiplier, complexity and scheduling factors, plus 18% overhead and 12% cost-based profit markup. Low/high is a subjective planning range of -22%/+28%.",
    disclaimer:"Planning estimate only. Not a bid or binding offer, verified local market price, live wage index, or fair-market certification. No taxes, permits, specialty equipment, hidden conditions or site inspection. Validate before giving a customer a price."
  };
}
const json = (data,status=200,headers={}) => new Response(JSON.stringify(data),{status,headers:{
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff",...headers
}});
const security = {
  "x-content-type-options":"nosniff",
  "referrer-policy":"strict-origin-when-cross-origin",
  "x-frame-options":"DENY",
  "permissions-policy":"camera=(), microphone=(), geolocation=()",
  "content-security-policy":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
};
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    try {
      if(url.pathname.startsWith("/api/")){
        if(request.method==="GET" && url.pathname==="/api/health")return json({status:"ok",engine:"cloudflare-worker",dataSource:"illustrative or contractor-entered inputs; no verified market pricing"});
        if(request.method==="GET" && url.pathname==="/api/catalog")return json({catalog:CATALOG,states:Object.keys(STATE_INDEX).sort()});
        if(url.pathname==="/api/quote"){
          if(request.method!=="POST")return json({error:"Method not allowed"},405,{allow:"POST"});
          if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return json({error:"Expected application/json"},415);
          const length=Number(request.headers.get("content-length")||"0");
          if(length>8192)return json({error:"Request too large"},413);
          const text=await request.text();
          if(text.length>8192)return json({error:"Request too large"},413);
          let data;
          try{data=JSON.parse(text);}catch{return json({error:"Invalid JSON"},400);}
          return json(estimateQuote(data));
        }
        return json({error:"Endpoint not found"},404);
      }
      if(request.method!=="GET"&&request.method!=="HEAD")return new Response("Method not allowed",{status:405,headers:{allow:"GET, HEAD"}});
      if(["/dashboard.html","/analytics.html","/market-trends.html","/integrations.html"].includes(url.pathname)){
        const target="/#"+(url.pathname==="/dashboard.html"?"overview":url.pathname==="/market-trends.html"?"insights":url.pathname==="/integrations.html"?"settings":"insights");
        return Response.redirect(url.origin+target,302);
      }
      if(!env.ASSETS)return new Response("Assets binding missing",{status:503});
      const response=await env.ASSETS.fetch(request);
      const headers=new Headers(response.headers);
      for(const [key,value] of Object.entries(security))headers.set(key,value);
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }catch(err){
      if(err instanceof QuoteError)return json({error:err.message},422);
      console.error("AutoQuoter request failed",err);
      return json({error:"Unexpected server error"},500);
    }
  }
};