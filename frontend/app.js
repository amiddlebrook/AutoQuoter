const STORAGE_KEY="autoquoter-v2-estimates";
const SETTINGS_KEY="autoquoter-v2-settings";
const VALID_STATUS=["draft","sent","accepted","declined"];
const STATE_NAMES={
AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"
};
const TRADE_MARKS={hvac:"◈",plumbing:"◉",electrical:"ϟ",roofing:"⌂",landscaping:"❀",remodeling:"▥"};
const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(value)||0);
const fmtDate=value=>new Date(value).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
function load(key,fallback){
  try{const parsed=JSON.parse(localStorage.getItem(key));return parsed??fallback;}catch{return fallback;}
}
function validateRow(row){
  return row&&typeof row==="object"&&!Array.isArray(row)&&
    typeof row.id==="string"&&row.id.length<=100&&
    typeof row.createdAt==="string"&&!Number.isNaN(Date.parse(row.createdAt))&&
    typeof row.trade==="string"&&
    typeof row.taskLabel==="string"&&row.taskLabel.length<=120&&
    typeof row.state==="string"&&row.state.length===2&&
    typeof row.median==="number"&&Number.isFinite(row.median)&&row.median>=0&&
    typeof row.low==="number"&&Number.isFinite(row.low)&&row.low>=0&&
    typeof row.high==="number"&&Number.isFinite(row.high)&&row.high>=row.low&&
    row.breakdown&&typeof row.breakdown==="object"&&
    typeof row.breakdown.labor==="number"&&Number.isFinite(row.breakdown.labor)&&
    typeof row.breakdown.materials==="number"&&Number.isFinite(row.breakdown.materials)&&
    (!row.projectName||typeof row.projectName==="string"&&row.projectName.length<=80)&&
    (!row.clientName||typeof row.clientName==="string"&&row.clientName.length<=80)&&
    VALID_STATUS.includes(row.status);
}
const stored=load(STORAGE_KEY,[]);
const quotes=Array.isArray(stored)?stored.filter(validateRow).slice(0,500):[];
let catalog=null,activeQuote=null;
let settings=load(SETTINGS_KEY,{});
if(!settings||typeof settings!=="object"||Array.isArray(settings))settings={};
function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(quotes));return true;}
  catch{toast("Browser storage is full or unavailable. Export your data.");return false;}
}
function toast(message){
  const box=$("#toast");box.textContent=message;box.classList.remove("hidden");
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>box.classList.add("hidden"),4000);
}
function pageName(page){return {overview:"Overview",studio:"Quote studio",estimates:"Estimates",insights:"Insights",settings:"Settings"}[page]||"Overview";}
function navigate(){
  const target=location.hash.slice(1);
  const page=["overview","studio","estimates","insights","settings"].includes(target)?target:"overview";
  $$(".view").forEach(el=>el.classList.toggle("hidden",el.id!=="view-"+page));
  $$("[data-nav]").forEach(el=>{const active=el.dataset.nav===page;el.classList.toggle("active",active);if(active)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");});
  $("#currentPage").textContent=pageName(page);
  if(page==="estimates")renderEstimates();
  if(page==="insights")renderInsights();
  window.scrollTo({top:0,behavior:"instant"});
}
function go(page){location.hash=page;if(location.hash==="#"+page)navigate();}
function option(value,label){const el=document.createElement("option");el.value=value;el.textContent=label;return el;}
function selectTrade(trade){
  if(!catalog||!catalog[trade])return;
  $("#trade").value=trade;
  const tabs=$("#tradeTabs");tabs.replaceChildren();
  Object.entries(catalog).forEach(([key,item])=>{
    const b=document.createElement("button");b.type="button";b.className="trade-tab"+(key===trade?" active":"");
    b.innerHTML="<span aria-hidden='true'>"+escapeHtml(TRADE_MARKS[key]||"◈")+"</span>"+escapeHtml(item.label);
    b.setAttribute("aria-pressed",String(key===trade));b.addEventListener("click",()=>selectTrade(key));tabs.append(b);
  });
  const task=$("#task");const prev=task.value;task.replaceChildren();
  Object.entries(catalog[trade].presets).forEach(([key,job])=>task.append(option(key,job.label)));
  if(Object.hasOwn(catalog[trade].presets,prev))task.value=prev;
  updateJob();
}
function updateJob(){
  if(!catalog)return;
  const trade=$("#trade").value,task=$("#task").value,job=catalog[trade]?.presets?.[task];
  $("#jobDescription").textContent=job?.description||"";
  $("#unitLabel").textContent=job?"("+job.unit+")":"(units)";
}
function renderResult(q){
  $("#resultEmpty").classList.add("hidden");$("#resultContent").classList.remove("hidden");
  $("#resultBadge").classList.add("ready");$("#resultBadge").textContent="Calculated";
  $("#quoteJobLabel").textContent=q.taskLabel;$("#quoteLocation").textContent=(STATE_NAMES[q.state]||q.state)+" · "+q.quantity+" "+q.unit;
  $("#quoteMedian").textContent=money(q.median);$("#quoteLow").textContent=money(q.low);$("#quoteHigh").textContent=money(q.high);
  $("#quoteRange").textContent=money(q.low)+" – "+money(q.high)+" planning range";
  const b=q.breakdown;
  const rows=[
    ["Labor ("+b.hours+" hrs × "+money(b.hourlyRate)+"/hr)",b.labor],
    ["Materials and allowance",b.materials],
    ["Overhead (18%)",b.overhead],
    ["Profit allowance (12%)",b.margin]
  ];
  const wrap=$("#quoteBreakdown");wrap.replaceChildren();
  rows.forEach(([label,value])=>{const row=document.createElement("div");row.className="cost-row";const l=document.createElement("span"),r=document.createElement("strong");l.textContent=label;r.textContent=money(value);row.append(l,r);wrap.append(row);});
  const total=document.createElement("div");total.className="cost-row total";total.innerHTML="<span>Typical planning total</span><strong>"+escapeHtml(money(q.median))+"</strong>";wrap.append(total);
  $("#saveQuote").textContent=quotes.some(x=>x.id===q.id)?"Saved ✓":"Save estimate";
}
function showError(message){const target=$("#quoteError");target.textContent=message;target.classList.remove("hidden");}
async function calculate(event){
  event.preventDefault();$("#quoteError").classList.add("hidden");
  const data={
    trade:$("#trade").value,task:$("#task").value,state:$("#state").value,
    quantity:Number($("#quantity").value),complexity:$("#complexity").value,urgency:$("#urgency").value,
    addedMaterials:Number($("#addedMaterials").value||0)
  };
  const button=$("#calculateButton");button.disabled=true;button.textContent="Calculating…";
  try{
    const response=await fetch("/api/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)});
    const result=await response.json();
    if(!response.ok)throw Error(result.error||"Unable to calculate estimate");
    result.projectName=$("#projectName").value.trim().slice(0,80);
    result.clientName=$("#clientName").value.trim().slice(0,80);
    result.status="draft";activeQuote=result;renderResult(result);
    toast("Estimate calculated. Save it to keep a local copy.");
  }catch(error){showError(error.message||"Network error. Try again.");}
  finally{button.disabled=false;button.textContent="Calculate estimate ↗";}
}
function saveActive(){
  if(!activeQuote){toast("Calculate an estimate first.");return;}
  if(quotes.some(q=>q.id===activeQuote.id)){toast("This estimate is already saved.");return;}
  const clone=JSON.parse(JSON.stringify(activeQuote));
  quotes.unshift(clone);
  if(quotes.length>500)quotes.pop();
  persist();renderAll();$("#saveQuote").textContent="Saved ✓";toast("Estimate saved in this browser.");
}
function renderAll(){
  $("#navCount").textContent=quotes.length;
  $("#statTotal").textContent=quotes.length;
  $("#statActive").textContent=quotes.filter(q=>q.status==="draft"||q.status==="sent").length;
  $("#statWon").textContent=quotes.filter(q=>q.status==="accepted").length;
  $("#statAverage").textContent=money(quotes.length?quotes.reduce((sum,q)=>sum+q.median,0)/quotes.length:0);
  const recent=$("#recentList");recent.replaceChildren();
  if(!quotes.length){recent.innerHTML="<div class='empty-block'><strong>No estimates yet</strong>Build your first estimate to populate this workspace.<br><br><button class='btn btn-outline' data-go='studio'>Create estimate ↗</button></div>";}
  else quotes.slice(0,5).forEach(q=>{
    const row=document.createElement("div");row.className="recent-row";
    row.innerHTML="<span class='recent-icon'>"+escapeHtml(TRADE_MARKS[q.trade]||"◈")+"</span><div><div class='recent-name'>"+escapeHtml(q.projectName||q.taskLabel)+"</div><div class='recent-sub'>"+escapeHtml(STATE_NAMES[q.state]||q.state)+" · "+escapeHtml(fmtDate(q.createdAt))+"</div></div><div class='recent-amount'><strong>"+escapeHtml(money(q.median))+"</strong><small>"+escapeHtml(q.status)+"</small></div>";
    recent.append(row);
  });
  renderEstimates();renderInsights();
}
function renderEstimates(){
  const search=$("#searchQuotes").value.trim().toLowerCase();
  const status=$("#filterStatus").value;
  const list=quotes.filter(q=>(status==="all"||q.status===status)&&
    [q.projectName,q.clientName,q.taskLabel,q.trade,q.state].some(value=>String(value||"").toLowerCase().includes(search)));
  $("#quoteCountTitle").textContent=quotes.length+" saved estimate"+(quotes.length===1?"":"s");
  $("#showingQuotes").textContent="Showing "+list.length+" of "+quotes.length+" estimates";
  const body=$("#estimatesBody");body.replaceChildren();
  if(!list.length){body.innerHTML="<tr><td class='table-empty' colspan='6'>No estimates match. Create a new quote or change the filters.</td></tr>";return;}
  list.forEach(q=>{
    const tr=document.createElement("tr");
    const safeId=escapeHtml(q.id);
    tr.innerHTML="<td><strong>"+escapeHtml(q.projectName||q.taskLabel)+"</strong><span class='subline'>"+escapeHtml(q.clientName||"No client reference")+"</span></td>"+
      "<td>"+escapeHtml(q.tradeLabel||q.trade)+"<span class='subline'>"+escapeHtml(STATE_NAMES[q.state]||q.state)+"</span></td>"+
      "<td><strong>"+escapeHtml(money(q.median))+"</strong><span class='subline'>"+escapeHtml(money(q.low))+" – "+escapeHtml(money(q.high))+"</span></td>"+
      "<td>"+escapeHtml(fmtDate(q.createdAt))+"</td>"+
      "<td><select class='status-select' data-action='status' data-id='"+safeId+"' aria-label='Estimate status'>"+
        VALID_STATUS.map(s=>"<option value='"+s+"'"+(s===q.status?" selected":"")+">"+s[0].toUpperCase()+s.slice(1)+"</option>").join("")+"</select></td>"+
      "<td><div class='row-actions'><button class='row-action' data-action='print' data-id='"+safeId+"' aria-label='Print estimate'>Print</button><button class='row-action' data-action='copy' data-id='"+safeId+"' aria-label='Duplicate estimate'>Copy</button><button class='row-action danger' data-action='delete' data-id='"+safeId+"' aria-label='Delete estimate'>×</button></div></td>";
    body.append(tr);
  });
}
function addBars(target,values){
  const root=$(target);root.replaceChildren();const max=Math.max(1,...values.map(item=>item.count));
  if(!values.some(item=>item.count)){root.innerHTML="<div class='empty-block'>No saved estimates to chart yet.</div>";return;}
  values.forEach(item=>{
    const line=document.createElement("div");line.className="bar-row";
    const top=document.createElement("div");top.className="bar-row-top";
    const label=document.createElement("span");label.textContent=item.label;
    const count=document.createElement("strong");count.textContent=String(item.count);
    top.append(label,count);
    const track=document.createElement("div");track.className="bar-track";
    const fill=document.createElement("div");fill.className="bar-fill";fill.style.width=(item.count/max*100)+"%";track.append(fill);
    line.append(top,track);root.append(line);
  });
}
function renderInsights(){
  const open=quotes.filter(q=>q.status==="draft"||q.status==="sent");
  const accepted=quotes.filter(q=>q.status==="accepted");
  $("#insightTotal").textContent=quotes.length;
  $("#insightPipeline").textContent=money(open.reduce((sum,q)=>sum+q.median,0));
  $("#insightWon").textContent=money(accepted.reduce((sum,q)=>sum+q.median,0));
  addBars("#tradeChart",Object.entries(catalog||{}).map(([key,item])=>({label:item.label,count:quotes.filter(q=>q.trade===key).length})));
  addBars("#statusChart",VALID_STATUS.map(status=>({label:status[0].toUpperCase()+status.slice(1),count:quotes.filter(q=>q.status===status).length})));
}
function printQuote(q){
  if(!q){toast("Calculate an estimate first.");return;}
  const b=q.breakdown;
  const rows=[["Labor",b.labor],["Materials",b.materials],["Overhead",b.overhead],["Profit allowance",b.margin],["Typical total",q.median]];
  $("#printArea").innerHTML="<div class='print-band'><h1>"+escapeHtml(settings.companyName||"AutoQuoter")+"</h1><div>Planning estimate · "+escapeHtml(fmtDate(q.createdAt))+"</div></div>"+
    "<h2>"+escapeHtml(q.projectName||q.taskLabel)+"</h2><p>"+escapeHtml(q.clientName||"")+"</p>"+
    "<p>"+escapeHtml(q.tradeLabel)+" · "+escapeHtml(q.taskLabel)+" · "+escapeHtml(STATE_NAMES[q.state]||q.state)+" · "+escapeHtml(q.quantity)+" "+escapeHtml(q.unit)+"</p>"+
    "<p><strong>Planning range: "+escapeHtml(money(q.low))+" – "+escapeHtml(money(q.high))+"</strong></p>"+
    "<table>"+rows.map(item=>"<tr><td>"+escapeHtml(item[0])+"</td><td>"+escapeHtml(money(item[1]))+"</td></tr>").join("")+"</table>"+
    "<small>"+escapeHtml(q.disclaimer||"Planning estimate only; not a binding bid. Taxes, permits and unknown conditions excluded.")+"</small>";
  window.print();
}
function quoteText(q){
  const b=q.breakdown;
  return [
    (q.projectName||q.taskLabel)+" — "+(q.clientName||"AutoQuoter"),
    q.tradeLabel+" / "+q.taskLabel+" / "+q.state+" / "+q.quantity+" "+q.unit,
    "Typical estimate: "+money(q.median),
    "Planning range: "+money(q.low)+" to "+money(q.high),
    "Labor: "+money(b.labor)+"; Materials: "+money(b.materials),
    "Overhead: "+money(b.overhead)+"; Profit: "+money(b.margin),
    q.disclaimer
  ].join("\n");
}
async function copySummary(q){
  if(!q)return;
  try{await navigator.clipboard.writeText(quoteText(q));toast("Estimate summary copied.");}
  catch{toast("Clipboard unavailable. Try Print / PDF.");}
}
function triggerDownload(name,content,type){
  const blob=new Blob([content],{type});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportJson(){
  triggerDownload("autoquoter-backup-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify({version:2,exportedAt:new Date().toISOString(),quotes},null,2),"application/json");
  toast("JSON backup downloaded.");
}
function csvCell(value){
  let s=String(value??"");
  if(/^[=+\-@\t\r]/.test(s))s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
}
function exportCsv(){
  const columns=["id","createdAt","projectName","clientName","trade","taskLabel","state","status","quantity","low","median","high","labor","materials","overhead","margin"];
  const body=[columns.join(",")].concat(quotes.map(q=>columns.map(col=>csvCell(["labor","materials","overhead","margin"].includes(col)?q.breakdown[col]:q[col])).join(","))).join("\r\n");
  triggerDownload("autoquoter-estimates.csv",body,"text/csv;charset=utf-8");
}
async function importJson(event){
  const file=event.target.files?.[0];event.target.value="";
  if(!file)return;
  if(file.size>5_000_000){toast("Backup is too large (max 5 MB).");return;}
  try{
    const parsed=JSON.parse(await file.text());
    if(parsed.version!==2||!Array.isArray(parsed.quotes))throw Error("Not a supported AutoQuoter backup");
    if(parsed.quotes.length>500)throw Error("A backup can contain at most 500 records");
    if(!parsed.quotes.every(validateRow))throw Error("The backup contains invalid records");
    const ids=new Set(quotes.map(q=>q.id));let added=0;
    for(const row of parsed.quotes){if(!ids.has(row.id)){quotes.push(row);ids.add(row.id);added++;}}
    quotes.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
    if(quotes.length>500)quotes.length=500;
    persist();renderAll();toast("Restored "+added+" new estimates.");
  }catch(error){toast("Import failed: "+error.message);}
}
function onTableClick(event){
  const button=event.target.closest("button[data-action]");if(!button)return;
  const q=quotes.find(row=>row.id===button.dataset.id);if(!q)return;
  if(button.dataset.action==="print")printQuote(q);
  if(button.dataset.action==="copy"){const clone={...q,id:crypto.randomUUID(),createdAt:new Date().toISOString(),status:"draft",projectName:(q.projectName||q.taskLabel)+" (copy)"};quotes.unshift(clone);if(quotes.length>500)quotes.pop();persist();renderAll();toast("Estimate duplicated.");}
  if(button.dataset.action==="delete"&&confirm("Delete this estimate from this browser?")){quotes.splice(quotes.indexOf(q),1);persist();renderAll();toast("Estimate deleted.");}
}
function onStatusChange(event){
  if(event.target.dataset.action!=="status")return;
  const q=quotes.find(row=>row.id===event.target.dataset.id);
  if(!q||!VALID_STATUS.includes(event.target.value))return;
  q.status=event.target.value;persist();renderAll();toast("Estimate status updated.");
}
function settingsMessage(message){$("#settingsMessage").textContent=message;toast(message);}
function wireEvents(){
  document.body.addEventListener("click",event=>{const btn=event.target.closest("[data-go]");if(btn)go(btn.dataset.go);});
  $("#quoteForm").addEventListener("submit",calculate);
  $("#task").addEventListener("change",updateJob);
  $("#resetQuote").addEventListener("click",()=>{
    $("#quoteForm").reset();selectTrade("hvac");$("#quoteError").classList.add("hidden");
    activeQuote=null;$("#resultContent").classList.add("hidden");$("#resultEmpty").classList.remove("hidden");$("#resultBadge").classList.remove("ready");$("#resultBadge").textContent="Awaiting input";toast("Quote form reset.");
  });
  $("#saveQuote").addEventListener("click",saveActive);
  $("#printQuote").addEventListener("click",()=>printQuote(activeQuote));
  $("#copyQuote").addEventListener("click",()=>copySummary(activeQuote));
  $("#searchQuotes").addEventListener("input",renderEstimates);
  $("#filterStatus").addEventListener("change",renderEstimates);
  $("#estimatesBody").addEventListener("click",onTableClick);
  $("#estimatesBody").addEventListener("change",onStatusChange);
  $("#exportCsv").addEventListener("click",exportCsv);
  $("#insightsExport").addEventListener("click",exportCsv);
  $("#exportJson").addEventListener("click",exportJson);
  $("#importJson").addEventListener("change",importJson);
  $("#saveSettings").addEventListener("click",()=>{
    const value=$("#companyName").value.trim().slice(0,70);
    settings.companyName=value;
    try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{toast("Cannot save preference: browser storage disabled.");return;}
    showCompany();settingsMessage("Workspace name saved.");
  });
  $("#clearData").addEventListener("click",()=>{
    if(!quotes.length){toast("No saved estimates to delete.");return;}
    if(!confirm("Permanently delete all "+quotes.length+" locally stored estimates? This cannot be undone."))return;
    quotes.splice(0);persist();renderAll();settingsMessage("Local estimates cleared.");
  });
  window.addEventListener("hashchange",navigate);
}
function showCompany(){
  const value=typeof settings.companyName==="string"?settings.companyName.slice(0,70):"";
  $("#companyLabel").textContent=value||"My workspace";
  $("#companyName").value=value;
}
async function init(){
  $("#year").textContent=new Date().getFullYear();
  $("#todayLabel").textContent=new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  const hour=new Date().getHours();
  $("#overviewHeading").innerHTML=(hour<12?"Good morning":hour<17?"Good afternoon":"Good evening")+", <span>let's get pricing.</span>";
  showCompany();wireEvents();
  try{
    const response=await fetch("/api/catalog");
    if(!response.ok)throw Error("API unavailable");
    const data=await response.json();catalog=data.catalog;
    for(const [key,item] of Object.entries(catalog))$("#trade").append(option(key,item.label));
    const states=Object.keys(STATE_NAMES).sort();
    $("#state").replaceChildren();
    states.forEach(key=>$("#state").append(option(key,STATE_NAMES[key]+" ("+key+")")));
    $("#state").value="CO";selectTrade("hvac");
  }catch(error){
    showError("The quote API could not be reached. Check the Worker deployment and reload the page.");
    $("#calculateButton").disabled=true;$("#calculateButton").textContent="Quote engine unavailable";
  }
  renderAll();navigate();
}
init();