/* Minimal browser-only educational math; no analytics or network requests. */
const container=document.querySelector("#mkCalculator");
if(container){
 const fields=["Hours","Rate","Materials","Overhead","Markup"];
 const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v);
 function compute(){
   const values=fields.map(n=>Number(document.querySelector("#mk"+n).value));
   const [hours,rate,materials,overhead,markup]=values;
   const invalid=values.some((n,i)=>!Number.isFinite(n)||n<0||n>([2000,10000,1000000,100,200][i]));
   const output=document.querySelector("#mkPrice"),detail=document.querySelector("#mkBreakdown"),err=document.querySelector("#mkError");
   if(invalid){err.textContent="Enter valid nonnegative values within each field's limits.";output.textContent="—";detail.textContent="";return;}
   err.textContent="";
   const labor=hours*rate,cost=labor+materials,overheadCost=cost*overhead/100,base=cost+overheadCost,profit=base*markup/100,total=base+profit;
   output.textContent=money(total);
   detail.textContent="Labor "+money(labor)+" + materials "+money(materials)+" = direct cost "+money(cost)+". Overhead "+money(overheadCost)+" + markup "+money(profit)+". Gross margin on price: "+(total>0?(profit/total*100).toFixed(2):"0.00")+"%.";
 }
 fields.forEach(n=>document.querySelector("#mk"+n).addEventListener("input",compute));
 compute();
}