/**
 * AutoQuoter offline audiovisual tutorial. Actual app UI + real estimateQuote engine.
 * Sample records are explicitly marked illustrative. No external AI or paid API.
 * Dependencies: playwright, espeak-ng, ffmpeg. Run on GitHub Actions Ubuntu.
 */
import {createServer} from "node:http";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {join,resolve,extname} from "node:path";
import {spawnSync} from "node:child_process";
import {chromium} from "playwright";
import {CATALOG,STATE_INDEX,estimateQuote} from "../src/worker.js";
const root=resolve("frontend"),tmp=resolve(".demo-build"),out=resolve("frontend/videos");
mkdirSync(tmp,{recursive:true});mkdirSync(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".xml":"application/xml",".txt":"text/plain"};
const respond=(res,obj,status=200)=>{res.writeHead(status,{"Content-Type":"application/json; charset=utf-8"});res.end(JSON.stringify(obj));};
const server=createServer(async(req,res)=>{
 const u=new URL(req.url,"http://127.0.0.1");const path=u.pathname;
 if(path==="/api/catalog")return respond(res,{catalog:CATALOG,states:Object.keys(STATE_INDEX).sort()});
 if(path==="/api/health")return respond(res,{status:"ok",engine:"real-estimateQuote-local-demo"});
 if(path==="/api/quote"&&req.method==="POST"){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   try{return respond(res,estimateQuote(JSON.parse(Buffer.concat(chunks).toString("utf8"))));}catch(e){return respond(res,{error:e.message},422);}
 }
 if(path.startsWith("/api/"))return respond(res,{error:"not found"},404);
 const filename=path==="/"?"/index.html":path;
 const absolute=resolve(root,"."+filename);
 if(!absolute.startsWith(root+"/")){res.writeHead(403);return res.end();}
 try{res.writeHead(200,{"Content-Type":mime[extname(absolute)]||"application/octet-stream"});res.end(readFileSync(absolute));}
 catch{res.writeHead(404);res.end("Missing");}
});
const scenes=[
 ["Introduction","Welcome to AutoQuoter. This free contractor estimating worksheet covers six trade categories. It performs straightforward arithmetic, not artificial intelligence or real-time price research. In the tutorial you will learn how to select a job, calculate using example figures, switch to your own contractor-provided costs, save estimates locally, export data, and learn what the software does not offer. Every project and client label you see is invented for this tutorial."],
 ["Explore the studio","Start by selecting Quote Studio from the navigation. Choose a trade and one of its available job presets. The built-in catalogue is a planning starting point; material allowances and hourly rates are invented sample numbers, not a fair-market quote. All fifty states and Washington DC are selectable, but the state multipliers are also approximate rather than a real location price feed."],
 ["Illustrative quote","In our demonstration, we select a heat-pump replacement, Colorado, quantity one and standard scheduling. We give the project an explicit sample name so that no real customer appears in the video. Calculate estimate shows a low, typical and high planning range, and a breakdown of labor, materials, overhead and cost-based profit markup. The range is subjective; it is not a statistical confidence interval."],
 ["Use your own prices","A serious estimate must use costs that an operator has verified. Enable the switch labeled Calculate using my rates and costs. Enter the assumed labor hours per unit, actual cost or billable rate per hour, the material allowance per unit, the overhead percent, and cost-based markup. When entering custom rates, the application does not add the broad state multiplier again. Complexity and scheduling still adjust labor."],
 ["Calculate custom estimate","Our intentionally made-up example uses ten labor hours at one hundred dollars per hour, five hundred dollars in materials, twenty percent overhead and twenty-five percent markup. The resulting typical calculation is two thousand two hundred fifty dollars, composed of one thousand labor, five hundred materials, three hundred overhead, and four hundred fifty markup. Those are demonstration inputs only, not professional pricing advice."],
 ["Save job pricing","Save this job's rates to preserve the numbers in this browser for the selected service. Other job presets are not overwritten. These settings do not synchronize to another device, and they are not remotely backed up. The pricebook input values are transmitted to the calculation Worker only when you calculate, rather than persisted as user data in a server database."],
 ["Save a planning estimate","Once satisfied with the cost inputs, save the estimate. Add a reference title and a non-sensitive client label if useful. AutoQuoter keeps these labels in the browser; the calculation endpoint does not receive them. Never put credit-card details, secrets, or regulated client information into local browser storage."],
 ["Browse saved estimates","Open Estimates to search saved records, duplicate a quote, print a summary or change its local status from draft to sent, accepted or declined. A status you select yourself does not prove the customer signed, was invoiced, or paid. This is a planning pipeline, not a payment processor or shared CRM."],
 ["Insights without invented sales","The Insights page aggregates your own browser-saved estimates. When you mark a quote accepted, the total changes locally. This is not externally validated revenue. There are no fake lead counts, website visitors, earned payments or simulated historical customers in the production analytics."],
 ["Export and backup","In Settings, export your estimates to CSV or download a JSON backup that can be restored later. Downloaded files remain with you; they are not copied to a vendor account. You can also clear saved local records. Printing relies on your browser's native print or Save as PDF function, not a cloud PDF service."],
 ["Free pricing education","AutoQuoter also includes a separate free contractor markup and margin calculator. Remember that a twenty percent cost-based markup creates a gross margin of approximately sixteen point seven percent, not twenty percent. There is an explanatory worked example and a direct link back to Quote Studio. Never assume an illustrative rate is a current local contractor quote."],
 ["Compare alternatives","The public alternatives page points to Joist, Contractor Plus, Service M Eight, Jobber, and Housecall Pro. Those platforms offer features that AutoQuoter does not, such as billing, customer accounts, scheduling and payments. They may be better if your business needs a full field service platform. This transparent comparison helps choose the right tool instead of pretending AutoQuoter does everything."],
 ["Assisted setup proposition","The free calculator remains available without a subscription. A separate page is testing interest in paid assistance configuring a pricebook using the buyer's own numbers. Pricing and fulfillment are not yet commercially validated, and the public inquiry link is not a secure customer portal. Do not submit customer identities, confidential costs or passwords in a public issue."],
 ["Conclusion","To start, open the free quote studio, choose a trade and service, supply your real numbers if available, calculate, review the breakdown, and save or export. Verify materials, permits, taxes, scope and access before you present a customer price. This walkthrough demonstrates functional software with clearly fictional sample inputs. It does not claim customers, purchases or payments. Thank you for exploring AutoQuoter."]
];
function run(cmd,args){const r=spawnSync(cmd,args,{encoding:"utf8",maxBuffer:2e6});if(r.status!==0)throw Error(cmd+" failed: "+String(r.stderr).slice(-1500));return(r.stdout||"").trim();}
function len(path){return Number(run("ffprobe",["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",path]));}
function time(s){const t=Math.round(s*1000),h=Math.floor(t/3600000),m=Math.floor(t%3600000/60000),q=Math.floor(t%60000/1000);return [h,m,q].map(n=>String(n).padStart(2,"0")).join(":")+"."+String(t%1000).padStart(3,"0");}
let browser;
try{
 await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
 const base="http://127.0.0.1:"+server.address().port;
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:720},acceptDownloads:true});
 await page.goto(base+"/");
 async function banner(text){
   await page.evaluate(text=>{
     let b=document.getElementById("__screencast_disclaimer");
     if(!b){b=document.createElement("div");b.id="__screencast_disclaimer";b.style.cssText="position:fixed;z-index:2147483647;top:12px;right:12px;pointer-events:none;background:#09283d;color:#89ffe4;border:2px solid #20caaf;border-radius:7px;padding:10px 13px;font:700 13px system-ui";document.body.append(b);}
     b.textContent="SAMPLE DEMO — NOT A REAL CUSTOMER";
     let label=document.getElementById("__screencast_scene");
     if(!label){label=document.createElement("div");label.id="__screencast_scene";label.style.cssText="position:fixed;pointer-events:none;z-index:2147483647;left:0;right:0;bottom:0;padding:14px 20px;text-align:center;background:#06162eeb;color:#fff;border-top:3px solid #15bca8;font:700 22px system-ui";document.body.append(label);}
     label.textContent=text;
   },text);
 }
 const actions=async i=>{
   if(i===1){await page.goto(base+"/#studio");await page.locator("#tradeTabs button").first().waitFor();await page.locator("#task").selectOption("heatpump");}
   if(i===2){await page.locator("#projectName").fill("DEMO — sample heat pump job");await page.locator("#clientName").fill("Demo reference only");await page.locator("#calculateButton").click();await page.locator("#quoteMedian").innerText();}
   if(i===3){await page.locator("#useCustomRates").check();await page.locator("#customHours").fill("10");await page.locator("#customRate").fill("100");await page.locator("#customMaterials").fill("500");await page.locator("#customOverhead").fill("20");await page.locator("#customMarkup").fill("25");}
   if(i===4){await page.locator("#calculateButton").click();await page.locator("#quoteMedian").getByText("$2,250").waitFor();}
   if(i===5)await page.locator("#savePricebook").click();
   if(i===6)await page.locator("#saveQuote").click();
   if(i===7)await page.goto(base+"/#estimates");
   if(i===8){await page.locator("#estimatesBody select[data-action=status]").first().selectOption("accepted");await page.goto(base+"/#insights");}
   if(i===9)await page.goto(base+"/#settings");
   if(i===10)await page.goto(base+"/pricing-guide.html");
   if(i===11)await page.goto(base+"/compare.html");
   if(i===12)await page.goto(base+"/custom-setup.html");
   if(i===13)await page.goto(base+"/#studio");
 };
 const concat=[],vtt=["WEBVTT",""],transcript=[];let offset=0;
 for(let i=0;i<scenes.length;i++){
   await actions(i);const [label,voice]=scenes[i];await banner((i+1)+"/"+scenes.length+" · "+label);
   await page.waitForTimeout(100);
   const stem=String(i).padStart(2,"0"),png=join(tmp,stem+".png"),wav=join(tmp,stem+".wav"),clip=join(tmp,stem+".mp4");
   await page.screenshot({path:png,animations:"disabled"});
   run("espeak-ng",["-v","en-us","-s","140","-w",wav,voice]);
   const seconds=len(wav)+1.1;
   run("ffmpeg",["-hide_banner","-loglevel","error","-y","-loop","1","-framerate","12","-i",png,"-i",wav,"-vf","scale=1280:720:flags=lanczos","-c:v","libx264","-preset","veryfast","-tune","stillimage","-crf","31","-pix_fmt","yuv420p","-r","12","-c:a","aac","-b:a","48k","-ar","44100","-af","apad","-t",String(seconds),clip]);
   concat.push("file '"+clip+"'");const sentences=voice.split(/(?<=[.!?])\s+/),total=sentences.reduce((n,s)=>n+s.length,0);let point=offset;
   for(const sentence of sentences){const portion=(seconds-.6)*sentence.length/total;vtt.push(time(point)+" --> "+time(point+portion),sentence,"");point+=portion;}
   offset+=seconds;transcript.push("SCENE "+(i+1)+" — "+label+"\n"+voice);
   process.stdout.write("Rendered "+(i+1)+"/"+scenes.length+": "+label+"\n");
 }
 writeFileSync(join(tmp,"concat.txt"),concat.join("\n")+"\n");
 const full=join(out,"autoquoter-full-walkthrough.mp4");
 run("ffmpeg",["-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",join(tmp,"concat.txt"),"-c","copy","-movflags","+faststart",full]);
 writeFileSync(join(out,"autoquoter-full-walkthrough.vtt"),vtt.join("\n"));
 writeFileSync(join(out,"walkthrough-transcript.txt"),transcript.join("\n\n")+"\n");
 // Short promo is an excerpt of the real narrated walkthrough, not a simulated sales testimonial.
 run("ffmpeg",["-hide_banner","-loglevel","error","-y","-i",full,"-t","48","-c","copy","-movflags","+faststart",join(out,"autoquoter-48s-preview.mp4")]);
 const bytes=readFileSync(full).length;
 if(bytes<10000||bytes>24*1024*1024)throw Error("Full video exceeds free asset maximum: "+bytes);
 process.stdout.write("VIDEO_READY seconds="+Math.round(offset)+" bytes="+bytes+"\n");
}finally{
 if(browser)await browser.close();
 await new Promise(ok=>server.close(ok));
}
