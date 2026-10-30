/** Strict, safe normalization of browser-local pricebooks for export/import. */
export const PRICE_LIMITS=Object.freeze({
  hoursPerUnit:[0.1,2000],
  laborRate:[0,10000],
  materialsPerUnit:[0,1000000],
  overheadPercent:[0,100],
  profitMarkupPercent:[0,200]
});
export function sanitizePricebook(source,catalog){
  if(!source||typeof source!=="object"||Array.isArray(source))throw Error("Pricebook must be an object");
  if(!catalog||typeof catalog!=="object")throw Error("Quote catalog not loaded");
  const entries=Object.entries(source);
  if(entries.length>100)throw Error("Pricebook exceeds 100 job presets");
  const normalized=Object.create(null);
  for(const [key,value] of entries){
    const parts=key.split(":");
    if(parts.length!==2||!Object.hasOwn(catalog,parts[0])||!Object.hasOwn(catalog[parts[0]].presets,parts[1]))throw Error("Unknown pricebook job: "+key.slice(0,60));
    if(!value||typeof value!=="object"||Array.isArray(value))throw Error("Invalid pricing for "+key);
    const fields=Object.keys(PRICE_LIMITS);
    if(Object.keys(value).length!==fields.length||fields.some(k=>!Object.hasOwn(value,k)))throw Error("Incomplete pricebook row for "+key);
    const row={};
    for(const field of fields){
      const n=value[field],[min,max]=PRICE_LIMITS[field];
      if(typeof n!=="number"||!Number.isFinite(n)||n<min||n>max)throw Error("Invalid "+field+" for "+key);
      row[field]=n;
    }
    normalized[key]=row;
  }
  return normalized;
}
