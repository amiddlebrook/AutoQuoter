// CSP-safe first-party inquiry UI. No third-party trackers.
const $=id=>document.getElementById(id);
const form=$("leadForm");
if(form)form.addEventListener("submit",async event=>{
 event.preventDefault();$("leadSubmit").disabled=true;$("leadMessage").textContent="Sending…";
 try{
  const fields={company:$("leadCompany").value.trim(),email:$("leadEmail").value.trim(),problem:$("leadProblem").value.trim(),jobs:$("leadJobs").value.trim(),budget:$("leadBudget").value,consent:$("leadConsent").checked,website:$("leadWebsite").value,source:"setup"};
  const res=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(fields)});
  const data=await res.json();if(!res.ok)throw Error(data.error||"Submission failed");
  form.hidden=true;$("leadReceipt").hidden=false;
  if(data.id&&data.deleteCode)$("leadReference").textContent=data.id+":"+data.deleteCode;
  $("leadMessage").textContent="";
 }catch(e){$("leadMessage").textContent=e.message||"Unable to send inquiry";}finally{$("leadSubmit").disabled=false;}
});
const del=$("deleteForm");
if(del)del.addEventListener("submit",async event=>{
 event.preventDefault();
 const [id,code,...rest]=$("deleteRef").value.trim().split(":");
 if(!id||!code||rest.length){$("deleteStatus").textContent="Enter the full ID:code reference.";return;}
 try{
  const res=await fetch("/api/leads/delete",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,code})});
  const data=await res.json();if(!res.ok)throw Error(data.error||"Deletion unavailable");
  $("deleteStatus").textContent="Deletion request processed. If valid, the associated inquiry was removed.";del.reset();
 }catch(e){$("deleteStatus").textContent=e.message;}
});
const admin=$("adminForm");
if(admin)admin.addEventListener("submit",async event=>{
 event.preventDefault();$("adminStatus").textContent="Checking token…";$("inquiries").replaceChildren();
 const token=$("adminSecret").value;
 try{
  const res=await fetch("/api/leads/admin",{headers:{"authorization":"Bearer "+token}});
  const data=await res.json();if(!res.ok)throw Error(data.error||"Access denied");
  $("adminStatus").textContent=data.items.length+" unverified inquiries (maximum 100)";
  for(const row of data.items){
   const box=document.createElement("article");box.className="mk-card";
   const title=document.createElement("h3");title.textContent=(row.company||"Unspecified") +" · "+new Date(row.created_at).toLocaleString();
   const description=document.createElement("p");description.textContent=row.problem;
   const meta=document.createElement("p");meta.textContent="Jobs: "+row.jobs+" | Interest: "+row.budget+" | Source: "+row.source;
   const link=document.createElement("a");link.href="mailto:"+encodeURIComponent(row.email);link.textContent="Reply to "+row.email;
   const remove=document.createElement("button");remove.type="button";remove.className="mk-cta alt";remove.textContent="Delete";
   remove.addEventListener("click",async()=>{
    if(!confirm("Delete this inquiry?"))return;
    const res=await fetch("/api/leads/admin/delete",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+token},body:JSON.stringify({id:row.id})});
    if(res.ok)box.remove();else $("adminStatus").textContent="Deletion failed.";
   });
   box.append(title,description,meta,link,document.createTextNode(" "),remove);$("inquiries").append(box);
  }
 }catch(e){$("adminStatus").textContent=e.message;}
});
