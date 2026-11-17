const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const page=fs.readFileSync('admin.html','utf8');
const engine=fs.readFileSync('assets/js/pro-carnet-secondary-world10.js','utf8');
const langs=['fr','en','es','pt','de','it','nl','ar','wo','zh'];
new vm.Script(engine);
for(const inline of [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean))new vm.Script(inline);
const form=(page.match(/<form class="form" id="payForm">[\s\S]*?<\/form>/)||[])[0];
assert.ok(form,'real PAY entry form required');
assert.match(page,/pro-carnet-secondary-world10\.js\?v=20261117-admin-v4/);
assert.match(page,/data-pro10="f.voiceLimit"/,'show honest French-only voice warning');
assert.match(page,/rec\.lang = "fr-FR"/,'voice recognition must stay French until separately validated');
assert.match(page,/window\.DIGIY_PRO10\?\.t\("f\.savingNow"\)/,'saving status must be translated, not reset to French');

const labelMap={direction:'f.direction',scope:'f.scope',amount:'f.amount',kind:'f.kind',
  channel:'f.channel',category:'f.category',movementDate:'f.date',
  sourceModule:'f.source',sourceId:'f.sourceId',labelText:'f.label',noteText:'f.note'};
for(const [id,key] of Object.entries(labelMap)){
 assert.ok(form.includes('for="'+id+'" data-pro10="'+key+'"'),id+': actual label translated');
}
const expectedSelects={
 direction:['in','out'],scope:['pro','perso','savings'],
 kind:['sale','expense','saving','transfer','other'],
 channel:['wave','cash','orange_money','bank','other'],
 sourceModule:['PAY','RESEAU_DIGIY','DRIVER','COMMERCE','POS','LOC','MARKET','BUILD','RESA','EXPLORE','JOBS','QR_PRO','OTHER']
};
for(const [id,values]of Object.entries(expectedSelects)){
 const re=new RegExp('<select id="'+id+'"[^>]*>([\\s\\S]*?)<\\/select>');
 const m=form.match(re);assert.ok(m,'select '+id);
 const options=[...m[1].matchAll(/<option value="([^"]+)"[^>]*>/g)].map(x=>x[1]);
 assert.deepEqual(options,values,'business value codes must remain identical for '+id);
}
for(const name of ['sourceId','labelText','noteText']){
 assert.match(form,new RegExp('id="'+name+'"[^>]*data-pro10-placeholder="f\\.'),name+' UI placeholder not translated');
}
assert.match(form,/id="amount" type="number" min="1" step="1"/,'numeric amount validation unchanged');
assert.match(form,/id="movementDate" type="date" required/,'date validation unchanged');
assert.match(form,/id="btnSave" type="submit" data-pro10="f.save"/,'save remains explicit manual action');
assert.match(form,/id="btnReset" type="button" data-pro10="f.reset"/,'reset preserved');
const submitted=page.slice(page.indexOf('async function saveMovement'),page.indexOf('\n    function ',page.indexOf('async function saveMovement')+1));
function fnv(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,'0');}
assert.equal(fnv(submitted),'4dc2d911','PAY saving, RPC and validation algorithms must be byte-identical to deployed version');

function simulate(code){
 const store={};
 const win={location:{search:'?lang='+code},localStorage:{
   getItem(k){return store[k]||null},setItem(k,v){store[k]=v}
 }};
 const labels=[...page.matchAll(/data-pro10="([^"]+)"/g)].map(m=>({
   key:m[1],textContent:'',
   getAttribute(){return this.key}
 }));
 const placeholders=[...page.matchAll(/data-pro10-placeholder="([^"]+)"/g)].map(m=>({
   key:m[1],setAttribute(k,v){this.value=v},getAttribute(){return this.key}
 }));
 const selection={value:'',children:[],style:{},
   setAttribute(){},appendChild(e){this.children.push(e)},addEventListener(type,fn){this.change=fn}};
 let ready;
 const doc={documentElement:{lang:'fr',dir:'ltr'},readyState:'loading',
   addEventListener(type,fn){if(type==='DOMContentLoaded')ready=fn},
   querySelectorAll(query){return query==='[data-pro10]'?labels:
     query==='[data-pro10-placeholder]'?placeholders:[]},
   getElementById(id){return id==='pro10Lang'?selection:
     id==='pro10Controls'?{appendChild(e){assert.strictEqual(e,selection)}}:null},
   createElement(type){return type==='select'?selection:{value:'',textContent:''}}
 };
 vm.runInNewContext(engine,{window:win,document:doc,URLSearchParams},{timeout:1800});
 assert.equal(typeof ready,'function');
 ready();
 const api=win.DIGIY_PRO10;
 assert.equal(api.getLang(),code);
 assert.deepEqual(Array.from(selection.children.map(x=>x.value)),langs);
 assert.equal(selection.value,code);
 assert.equal(doc.documentElement.dir,code==='ar'?'rtl':'ltr');
 assert.equal(doc.documentElement.lang,code==='zh'?'zh-CN':code);
 assert.equal(store.digiy_carnet_ui_lang_v1,code);
 for(const node of labels)assert.equal(node.textContent,api.t(node.key),'rendered '+node.key+' '+code);
 for(const node of placeholders)assert.equal(node.value,api.t(node.key),'placeholder '+node.key+' '+code);
 for(const key of ['f.save','f.savingNow','f.voiceLimit','f.scope','f.scopeSavings','f.channel','f.bank',
  'f.date','f.label','f.recent','f.navMore','f.voiceFill','f.noteHint']){
   const str=api.t(key);assert.ok(str!==key&&str.length>2,code+' missing '+key);
 }
 if(code==='wo'||code==='zh'){
  assert.notEqual(api.t('f.save'),'💾 Enregistrer le mouvement');
  assert.notEqual(api.t('f.scope'),'Compte');
  assert.notEqual(api.t('f.voiceLimit'),'La dictée vocale et l’interprétation des phrases fonctionnent uniquement en français pour le moment.');
 }
 api.setLang('fr');
 assert.equal(api.getLang(),'fr');
 assert.equal(store.digiy_carnet_ui_lang_v1,'fr');
}
for(const code of langs)simulate(code);
console.log('PRO CARNET WORLD10 V5 : formulaire PAY, options métier, avertissement vocal et enregistrement protégés');
