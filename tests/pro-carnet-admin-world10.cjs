const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const admin=fs.readFileSync('admin.html','utf8');
const brain=fs.readFileSync('brain-admin.html','utf8');
const core=fs.readFileSync('assets/js/pro-carnet-secondary-world10.js','utf8');
const world8=fs.readFileSync('assets/js/world8.js','utf8');
const codes=['fr','en','es','pt','de','it','nl','ar','wo','zh'];
new vm.Script(core);new vm.Script(world8);

for(const [name,page] of [['admin',admin],['brain',brain]]){
 assert.match(page,/pro-carnet-secondary-world10\.js\?v=20261117-admin-v4/);
 assert.match(page,/id="pro10Controls"/,name+': language selector mount');
 const srcs=[...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 srcs.forEach(src=>new vm.Script(src));
 const attrs=[...page.matchAll(/data-pro10="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(attrs.length>=18,name+': at least 18 translated visible UI controls');
 assert.ok(attrs.every(x=>/^(?:a|b|mov)\.[A-Za-z0-9_.]+$/.test(x)));
 assert.match(page,/href="\.\/pin\.html"|href="\.\/index\.html"/,'navigation must remain intact');
}
assert.match(admin,/clientDueLang/);
const debtSelector=(admin.match(/<select id="clientDueLang"[\s\S]*?<\/select>/)||[])[0];
assert.ok(debtSelector,'active customer-debt language selector');
assert.deepEqual([...debtSelector.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]),codes,
 'customer debts must have ten languages, not eight');
assert.match(admin,/window\.DIGIY_PRO10\?\.setLang\?\.\(select\.value\)/,
 'customer-debt language changes must synchronize the main interface');
assert.match(admin,/window\.DIGIY_WORLD8\?\.setLang\?\.\(lang\)/,
 'main language must update debt panel');
assert.match(admin,/refreshClientDueLanguage\(\)/);
assert.match(admin,/digiy_pay_pro_insert_movement|digiy_pay_pro_/,
 'PAY transactional calls remain present');
assert.match(admin,/btnLogout.*addEventListener\("click"/s,
 'logout event must remain in place');
assert.match(brain,/data-brain-preset="commerce"/);
assert.match(brain,/data-brain-preset="driver"/);
assert.match(brain,/data-brain-preset="loc"/);
assert.match(brain,/data-brain-preset="resto"/);
assert.match(brain,/data-brain-preset="prudence"/);
assert.match(brain,/data-brain-preset="empty"/);
assert.match(brain,/i18n\.t\("b\.metaCount", \{count\}\)/,
 'protected session counter is localized, not changed');
assert.match(brain,/getBrainKeysToClear\(CTX\.slug\)/,
 'local-data removal logic must remain protected by its original command');
assert.match(brain,/value="XOF"/);
assert.match(brain,/value="EUR"/);
assert.match(brain,/value="USD"/);

function engine(code){
 const store={};
 const fakeWindow={location:{search:'?lang='+code},
  localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=v}}};
 let ready;
 const select={children:[],value:'',style:{},setAttribute(){},
  addEventListener(type,handler){this.onChange=handler},appendChild(node){this.children.push(node)}};
 const host={appendChild(n){assert.strictEqual(n,select)}};
 const nodes=Array.from([...admin.matchAll(/data-pro10="([^"]+)"/g)],m=>({
  key:m[1],textContent:'',
  getAttribute(k){return this.key},
  setAttribute(){}
 }));
 const fakeDoc={readyState:'loading',documentElement:{lang:'fr',dir:'ltr'},
  addEventListener(type,fn){if(type==='DOMContentLoaded')ready=fn},
  querySelectorAll(css){return css==='[data-pro10]'?nodes:[]},
  getElementById(id){return id==='pro10Controls'?host:id==='pro10Lang'?select:null},
  createElement(type){return type==='select'?select:{value:'',textContent:''}}
 };
 const context={window:fakeWindow,document:fakeDoc,URLSearchParams};
 vm.runInNewContext(core,context,{timeout:1300});
 assert.equal(typeof ready,'function');
 ready();
 assert.equal(fakeWindow.DIGIY_PRO10.getLang(),code);
 assert.equal(select.children.length,10);
 assert.deepEqual(Array.from(select.children.map(x=>x.value)),codes);
 assert.equal(select.value,code);
 assert.equal(fakeDoc.documentElement.lang,code==='zh'?'zh-CN':code);
 assert.equal(fakeDoc.documentElement.dir,code==='ar'?'rtl':'ltr');
 assert.equal(store.digiy_carnet_ui_lang_v1,code);
 assert.ok(nodes.every(x=>x.textContent.length>0),'every annotated label needs a translation '+code);
 return{api:fakeWindow.DIGIY_PRO10,nodes,document:fakeDoc};
}
for(const code of codes){
 const {api}=engine(code);
 for(const k of ['a.brand','a.protected','a.tariffs','a.code','a.space','a.exit',
 'a.kicker','a.hero1','a.hero2','a.hero3','a.heroLead','a.drafts',
 'a.addMovement','a.verify','a.formula','b.brand','b.save','b.kicker',
 'b.hero1','b.hero2','b.lead','b.quick','b.pCommerce','b.pDriver',
 'b.pLoc','b.pResto','b.pCaution','b.pSimple','b.metaProtected','b.metaOpen']){
  const text=api.t(k);
  assert.ok(text&&text!==k&&!text.startsWith('['),code+' missing '+k);
 }
 assert.ok(api.t('b.metaCount',{count:3}).includes('3'),'counter parameter preserved '+code);
 assert.equal(api.t('mov.home').length>0,true);
 const fake={location:{search:'?lang='+code},localStorage:{getItem(){return null},setItem(){}}};
 vm.runInNewContext(world8,{window:fake,URLSearchParams},{timeout:1300});
 assert.equal(fake.DIGIY_WORLD8.getLang(),code);
 assert.ok(fake.DIGIY_WORLD8.t('client_due.title').length>2);
}
const wo=engine('wo');const zh=engine('zh');
assert.notEqual(wo.api.t('a.brand'),'MON ARGENT — Ajouter');
assert.notEqual(zh.api.t('b.brand'),'MON ARGENT — Réglages utiles');
wo.api.setLang('fr');
assert.equal(wo.document.documentElement.lang,'fr');
assert.equal(wo.api.t('a.brand'),'MON ARGENT — Ajouter');
console.log('PRO CARNET · administration & réglages WORLD10 : 10 langues, dettes clients et navigation OK');
