export const HOST="autoquoter.averymiddlebrook2014.workers.dev";
export const BASE="https://"+HOST;
export const KEY="8a9bd2047bb730e4c2bc84eef226635e";
const SKIP=new Set(["lead-admin.html","lead-delete.html","analytics.html","dashboard.html","integrations.html","market-trends.html"]);
export function changedPublicPages(changed){
 const out=new Set();
 for(const p of changed){
  if(p==="frontend/index.html"){out.add(BASE+"/");continue;}
  if(p.startsWith("frontend/")&&p.endsWith(".html")){
   const leaf=p.slice("frontend/".length);
   if(!SKIP.has(leaf))out.add(BASE+"/"+leaf);
  }
 }
 return [...out].sort();
}
