const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const langs=['fr','en','es','pt','de','it','nl','ar','wo','zh'];

const engine=fs.readFileSync('assets/js/world8.js','utf8');
const pin=fs.readFileSync('pin.html','utf8');
const live=fs.readFileSync('app/world8-voice-live.html','utf8');
const fallback=fs.readFileSync('app/index.html','utf8');
new vm.Script(engine);
const catalogue=[...engine.matchAll(/^\s*"([a-z_.]+)":\s*\[/gm)].map(m=>m[1]);
assert.equal(catalogue.length,88,'88 source labels must remain');

function engineFor(code) {
  const store={};
  const win={location:{search:'?lang='+code},localStorage:{
    getItem(k){return store[k]||null},setItem(k,v){store[k]=v}
  }};
  vm.runInNewContext(engine,{window:win,URLSearchParams},{timeout:2000});
  return {api:win.DIGIY_WORLD8,store};
}
for(const code of langs) {
 const {api,store}=engineFor(code);
 assert.equal(api.getLang(),code,code+': should retain chosen language');
 assert.equal(api.getDir(),code==='ar'?'rtl':'ltr');
 for(const key of catalogue){
   const output=api.t(key,{pocket:'PRO',amount:'42',income:'100',expenses:'40',net:'60'});
   assert.ok(output&&!output.startsWith('[world8:'),code+' missing '+key);
 }
 api.setLang('fr');
 assert.equal(store.digiy_carnet_ui_lang_v1,'fr');
}
for(const code of ['wo','zh']) {
  const {api}=engineFor(code);
  assert.notEqual(api.t('app.title'),'Mon activité','real translation for '+code);
  assert.notEqual(api.t('client_due.title'),'Dettes clients','real client balance translation');
  assert.match(api.t('wallet.balance',{pocket:'PRO'}),/PRO/);
}
for(const [name,html] of [['live',live],['fallback',fallback]]) {
  const pick=(html.match(/<select[^>]+id="world8Lang"[\s\S]*?<\/select>/)||[])[0];
  assert.ok(pick,name+': active selector missing');
  const opts=[...pick.matchAll(/<option value="([a-z]+)"/g)].map(m=>m[1]);
  assert.deepEqual(opts,langs,name+': selector must include all 10 languages');
  assert.match(html,/world8\.js\?v=world10-20261117-pro-carnet-v1/);
  assert.match(html,/document\.documentElement\.dir=api\.getDir\(\)/);
  assert.match(html,/renderLanguageOnly\(\)/);
}

const pinSelect=(pin.match(/<select[^>]+id="pinLang"[\s\S]*?<\/select>/)||[])[0];
assert.ok(pinSelect,'PIN language selector missing');
assert.deepEqual([...pinSelect.matchAll(/<option value="([a-z]+)"/g)].map(m=>m[1]),langs);
assert.match(pin,/target\.searchParams\.set\("lang",lang\)/);
assert.match(pin,/DIGIY_GUARD\.loginWithPin\(phone,pin\)/);
assert.match(pin,/DIGIY_GUARD\.clearSession\(\)/);
assert.match(pin,/type="password"[^>]*maxlength="4"/);
const scripts=[...pin.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(v=>v.trim());
for(const script of scripts)new vm.Script(script);
const inner=scripts.find(t=>t.includes('const LANGS='));
assert.ok(inner,'PIN UI i18n script missing');
for(const code of ['wo','zh']) {
 const store={};
 const ids=Object.fromEntries(['pinLang','accessBadge','phoneLabel','pinLabel','submitBtn','recoveryLink','pinNote','status','loginForm','phone','pin'].map(id=>[id,{id,textContent:'',className:'',value:id==='phone'?'221771234567':id==='pin'?'1234':'',href:'',disabled:false,listeners:{},
 addEventListener(type,fn){this.listeners[type]=fn}}]));
 const doc={documentElement:{lang:'fr',dir:'ltr'},getElementById(id){return ids[id]}};
 let loginCalls=0;
 const win={DIGIY_GUARD:{cleanUrl(){},clearSession(){},normalizePhone(v){return String(v).replace(/\D/g,'')},async loginWithPin(){loginCalls++;return{ok:true}}}};
 const location={href:'https://pro-carnet.digiylyfe.com/pin.html?lang='+code,search:'?lang='+code,replace(url){this.replacement=url}};
 const ctx={window:win,document:doc,location,URL,URLSearchParams,
 localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=v}},
 sessionStorage:{removeItem(){},setItem(){}}};
 vm.runInNewContext(inner,ctx,{timeout:1500});
 assert.equal(ids.pinLang.value,code,code+': PIN selector should reflect chosen language');
 assert.equal(doc.documentElement.lang,code==='zh'?'zh-CN':code);
 assert.equal(store.digiy_carnet_ui_lang_v1,code);
 assert.notEqual(ids.phoneLabel.textContent,'📱 Ton numéro de téléphone');
 assert.ok(new URL(ids.recoveryLink.href).searchParams.get('lang')===code);
 ids.loginForm.listeners.submit({preventDefault(){}});
 // Async handler resolves after Promise microtasks; tested below after turn.
 assert.ok(loginCalls===1,code+': auth flow should still invoke guard once');
}
console.log('PRO CARNET: 10 UI languages, all 88 keys, both app entries, PIN language retention OK');
