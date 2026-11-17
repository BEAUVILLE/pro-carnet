const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const world8=fs.readFileSync("assets/js/world8.js","utf8");
const pages=["app/world8-voice-live.html","app/index.html"];
const langs=["fr","en","es","pt","de","it","nl","ar","wo","zh"];
const labels=["lp-frais-banque","lp-prelevement-fr","lp-credit-tel","lp-ecole",
  "lp-voiture","lp-gasoil-pro","lp-internet-pro","lp-orange","lp-ravitaillement",
  "lp-seneau","lp-senelec","lp-vetements","lp-wifi","lp-woyofal"];
const keys=["subtitle","voice","voice_desc","entry","entry_desc","income","income_desc",
  "expense","expense_desc","reserve","reserve_desc","history","history_desc",
  "fees_heading","cat_fast","cat_bank","cat_generic","empty","notice_pro","notice_perso",
  ...labels];

new vm.Script(world8);
function api(code){
  const values={};
  const win={location:{search:"?lang="+code},localStorage:{
    getItem(k){return values[k]||null},setItem(k,v){values[k]=v}
  }};
  vm.runInNewContext(world8,{window:win,URLSearchParams},{timeout:2000});
  return win.DIGIY_WORLD8;
}
for(const lang of langs){
  const t=api(lang);
  assert.equal(t.getLang(),lang);
  for(const key of keys){
    const val=t.t("quick."+key);
    assert.ok(typeof val==="string"&&val.trim()&&val!=="[world8:quick."+key+"]",
      lang+" translation missing: "+key);
  }
}
const wo=api("wo"),zh=api("zh"),fr=api("fr"),en=api("en");
assert.notEqual(wo.t("quick.fees_heading"),fr.t("quick.fees_heading"));
assert.notEqual(zh.t("quick.fees_heading"),fr.t("quick.fees_heading"));
assert.notEqual(wo.t("quick.lp-frais-banque"),fr.t("quick.lp-frais-banque"));
assert.notEqual(zh.t("quick.lp-frais-banque"),fr.t("quick.lp-frais-banque"));
assert.equal(wo.t("quick.lp-seneau"),"SEN’EAU");
assert.equal(wo.t("quick.lp-senelec"),"Senelec");
assert.equal(wo.t("quick.lp-orange"),"Orange");
assert.equal(en.t("quick.lp-ecole"),"School");
assert.equal(zh.t("quick.lp-credit-tel"),"手机充值");

function runCards(html,t){
 const from=html.indexOf("  // Traduire uniquement les libellés de nos préréglages d'origine.");
 const to=html.indexOf("  function renderQuickLabels(){",from);
 assert.ok(from>=0&&to>from,"isolated rendering helpers must exist");
 const snippet=html.slice(from,to);
 new vm.Script(snippet);
 const state={labelPresets:[
  {id:"lp-frais-banque",pocket:"perso",type:"expense",label:"Frais bancaire",
   category:"Retraits / banques",mode:"Wave",amount:15000},
  {id:"lp-credit-tel",pocket:"perso",type:"expense",label:"Crédit téléphone",
   category:"Sorties rapides",mode:"Wave"},
  {id:"my-custom",pocket:"perso",type:"expense",label:"Dépense libre du client",
   category:"Ma catégorie",mode:"Cash"},
  {id:"lp-ecole",pocket:"perso",type:"expense",label:"Mes frais école personnalisés",
   category:"Sorties rapides",mode:"Wave"}
 ]};
 const original=JSON.stringify(state);
 const grid={innerHTML:""};
 const esc=str=>String(str).replace(/[&<>"']/g,c=>({
   "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[c]);
 const ctx={
  state,$:id=>{assert.equal(id,"magicExpenseList");return grid},
  t:(key,params,fallback)=>{const value=t.t(key,params);return value.startsWith("[world8:")?fallback:value},
  esc,cleanMode:(p,m)=>m,pocket:()=>"perso",Set,Object
 };
 vm.runInNewContext(snippet+"\nrenderHomeShortcuts();",ctx,{timeout:1000});
 assert.equal(JSON.stringify(state),original,"rendering must never mutate accounting presets");
 assert.match(grid.innerHTML,/data-label-preset="lp-frais-banque"/,"original id is preserved");
 assert.match(grid.innerHTML,/data-label-preset="lp-credit-tel"/);
 assert.match(grid.innerHTML,/data-label-preset="my-custom"/);
 assert.match(grid.innerHTML,/Dépense libre du client/,"user-defined expense is not retranslated");
 assert.match(grid.innerHTML,/Ma catégorie/,"user-defined category is unchanged");
 assert.match(grid.innerHTML,/Mes frais école personnalisés/,
   "modified built-in fee is preserved, not overwritten with default translation");
 assert.ok(grid.innerHTML.includes(esc(t.t("quick.lp-frais-banque"))),"built-in bank fee translated");
 assert.ok(grid.innerHTML.includes(esc(t.t("quick.lp-credit-tel"))),"built-in mobile credit translated");
 assert.ok(grid.innerHTML.includes(esc(t.t("quick.cat_bank"))),"bank category translated");
 assert.ok(grid.innerHTML.includes(esc(t.t("quick.cat_fast"))),"fast expense category translated");
 assert.match(grid.innerHTML,/ · Wave/,"payment channel kept as stored");
 return grid.innerHTML;
}
for(const file of pages){
 const html=fs.readFileSync(file,"utf8");
 assert.match(html,/world8\.js\?v=world10-20261117-perso-frais-v3/,"force latest dictionary on devices");
 const attrs=[...html.matchAll(/data-quick10="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(attrs.length,14,"fourteen translated magic panel elements");
 assert.ok(attrs.every(v=>keys.includes(v)),"no unknown quick translation keys");
 assert.match(html,/document\.querySelectorAll\("\[data-quick10\]"\)/);
 const start=html.indexOf("  function renderLanguageOnly(){");
 const end=html.indexOf("  if(els.world8Lang)els.world8Lang.onchange=",start);
 assert.ok(start>0&&end>start);
 assert.match(html.slice(start,end),/renderHomeShortcuts\(\);/,
   "changing UI language must rerender quick expense cards");
 assert.match(html,/els\.frontNotice\.textContent=t\(p==="pro"\?"quick\.notice_pro":"quick\.notice_perso"/,
   "public PERSO notice must be translated while re-rendering");
 assert.match(html,/data-label-preset="\$\{esc\(pr\.id\)\}"/,
   "expense shortcut links still use original stable preset ID");
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());
 scripts.forEach(s=>new vm.Script(s));
 const wolof=runCards(html,wo),chinese=runCards(html,zh),french=runCards(html,fr);
 assert.notEqual(wolof,chinese,"WO and ZH cards should differ");
 assert.notEqual(wolof,french,"WO and FR cards should differ");
 assert.match(french,/Frais bancaire/);
}
console.log("PRO CARNET PERSO WORLD10: magic panel and fast expenses in 10 languages; original preset IDs, labels, amounts and channels intact");
