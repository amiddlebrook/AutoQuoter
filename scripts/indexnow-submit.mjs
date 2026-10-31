import {execFileSync} from "node:child_process";
import {HOST,BASE,KEY,changedPublicPages} from "./indexnow-urls.mjs";
async function submit(){
 let files=[];
 try{files=execFileSync("git",["diff","--name-only","HEAD^","HEAD"],{encoding:"utf8"}).split(/\r?\n/).filter(Boolean);}
 catch{console.log("INDEXNOW_SKIPPED no diff");return;}
 const urls=changedPublicPages(files);
 if(!urls.length){console.log("INDEXNOW_SKIPPED no changed public pages");return;}
 const location=BASE+"/"+KEY+".txt";
 const proof=await fetch(location,{signal:AbortSignal.timeout(10000)});
 if(!proof.ok||(await proof.text()).trim()!==KEY){console.log("INDEXNOW_NOT_SENT key not accessible");return;}
 for(const u of urls){const r=await fetch(u,{method:"HEAD",signal:AbortSignal.timeout(10000)});if(!r.ok){console.log("INDEXNOW_NOT_SENT URL inaccessible",u);return;}}
 const response=await fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({host:HOST,key:KEY,keyLocation:location,urlList:urls}),signal:AbortSignal.timeout(15000)});
 console.log("INDEXNOW_HTTP",response.status,"CHANGED_URLS",urls.join(" "));
 console.log(response.status===200||response.status===202?"INDEXNOW_RECEIVED_NOT_INDEXED":"INDEXNOW_NOT_CONFIRMED");
}
submit().catch(error=>console.log("INDEXNOW_NOT_CONFIRMED",error.name||"network error"));
