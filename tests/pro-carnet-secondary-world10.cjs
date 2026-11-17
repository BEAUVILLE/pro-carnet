const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const core=fs.readFileSync('assets/js/pro-carnet-secondary-world10.js','utf8');
const frais=fs.readFileSync('frais.html','utf8');
const session=fs.readFileSync('session.html','utf8');
const langs=['fr','en','es','pt','de','it','nl','ar','wo','zh'];
new vm.Script(core);
for(const [file,html] of [['frais',frais],['session',session]]){
  assert.match(html,/pro-carnet-secondary-world10\.js\?v=20261117-v2/,file+' missing shared runtime');
  assert.match(html,/id="pro10Controls"/,file+' missing language mount');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(s=>s.trim());
  for(const source of scripts)new vm.Script(source,{filename:file+'.html'});
  assert.match(html,/DIGIY_GUARD\.requireSession\(\{redirect:true,to:"\.\/pin\.html"\}\)/,file+' security guard unchanged');
  assert.match(html,/digiy_pay_baptiste_reel_v2/,file+' account data key unchanged');
  const keys=[...html.matchAll(/data-pro10(?:-placeholder|-aria)?="([^"]+)"/g)].map(x=>x[1]);
  assert.ok(keys.length>=7,file+' must translate interface controls');
}
assert.match(frais,/data-label="\$\{item\.replace\(\/"\/g,"&quot;"\)\}"/,'canonical label data attribute preserved');
assert.match(frais,/label=l\.dataset\.label\|\|""/,'stored movement label remains original');
assert.match(frais,/data-mode="\$\{item\}"/,'canonical payment method retained');
assert.match(frais,/state\.movements\.push\(movement\)/,'saving still present');
assert.match(frais,/localStorage\.setItem\(KEY,JSON\.stringify\(state\)\)/,'saving key unchanged');
assert.match(session,/DIGIY_GUARD\.logout\(true\)/,'logout guard kept');
assert.match(session,/account_scope:"verified-local-device"/,'local export payload preserved');
assert.match(session,/JSON\.stringify\(payload,null,2\)/,'JSON backup unchanged');

function setup(code,html){
 let mounted=false;
 const storage={};
 const nodes=[...html.matchAll(/data-pro10="([^"]+)"/g)].map(m=>({key:m[1],getAttribute(name){return this.key},textContent:'value'}));
 const placeholders=[...html.matchAll(/data-pro10-placeholder="([^"]+)"/g)].map(m=>({key:m[1],getAttribute(){return this.key},setAttribute(k,v){this.value=v}}));
 const selectHost={appendChild(e){this.select=e}};
 const select={id:'',value:'',children:[],style:{},setAttribute(){},appendChild(e){this.children.push(e)},addEventListener(type,fn){this.handler=fn}};
 const doc={documentElement:{lang:'fr',dir:'ltr'},readyState:'loading',
  addEventListener(type,fn){if(type==='DOMContentLoaded')this.ready=fn},
  querySelectorAll(q){return q==='[data-pro10]'?nodes:q==='[data-pro10-placeholder]'?placeholders:[]},
  getElementById(id){return id==='pro10Controls'?selectHost:id==='pro10Lang'?select:null},
  createElement(tag){return tag==='select'?select:{value:'',textContent:''}}
 };
 const win={location:{search:'?lang='+code},localStorage:{getItem(k){return storage[k]||null},setItem(k,v){storage[k]=v}}};
 vm.runInNewContext(core,{window:win,document:doc,URLSearchParams},{timeout:1500});
 assert.equal(typeof doc.ready,'function','must mount on DOM ready');
 doc.ready();
 assert.equal(select.children.length,10,'exactly 10 language options');
 assert.deepEqual(Array.from(select.children.map(x=>x.value)),langs);
 assert.equal(select.value,code,code+': language picker');
 assert.equal(doc.documentElement.lang,code==='zh'?'zh-CN':code);
 assert.equal(doc.documentElement.dir,code==='ar'?'rtl':'ltr');
 assert.equal(storage.digiy_carnet_ui_lang_v1,code,'shared active language key');
 assert.ok(nodes.every(el=>el.textContent&&el.textContent!==el.key),code+': all annotated labels translated');
 assert.ok(placeholders.every(el=>el.value&&el.value!==el.key),code+': all annotated placeholders translated');
 return {api:win.DIGIY_PRO10,select,doc,storage};
}
for(const code of langs){
 const f=setup(code,frais),s=setup(code,session);
 assert.equal(f.api.getLang(),code);
 assert.equal(s.api.getLang(),code);
 assert.equal(f.api.label('Wave'),'Wave','payment brand unchanged');
 assert.equal(f.api.label('Senelec'),'Senelec','provider brand unchanged');
 assert.equal(f.api.label('SEN’EAU'),'SEN’EAU','provider brand unchanged');
 assert.equal(f.api.t('saved',{pocket:'PRO',mode:'Wave'}).includes('PRO'),true);
 assert.equal(f.api.t('saved',{pocket:'PRO',mode:'Wave'}).includes('Wave'),true);
 f.api.setLang('fr');
 assert.equal(f.storage.digiy_carnet_ui_lang_v1,'fr','selection persists');
 assert.equal(f.doc.documentElement.dir,'ltr');
}
for(const code of ['wo','zh']){
 const f=setup(code,frais);
 assert.notEqual(f.api.label('Client'),'Client','translated display category');
 assert.notEqual(f.api.t('errAmount'),'Pose un montant supérieur à zéro.');
 const s=setup(code,session);
 assert.notEqual(s.api.t('closeConfirm'),'Fermer la session ? Tes mouvements resteront dans ce téléphone.');
}
const ar=setup('ar',session);assert.equal(ar.doc.documentElement.dir,'rtl');
console.log('PRO CARNET WORLD10 : saisie rapide + session, 10 langues, catégories métier préservées — OK');
