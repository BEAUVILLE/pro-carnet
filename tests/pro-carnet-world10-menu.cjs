const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const engine=fs.readFileSync('assets/js/world8.js','utf8');
const pages=['app/world8-voice-live.html','app/index.html'];
const langs=['fr','en','es','pt','de','it','nl','ar','wo','zh'];
const keys=['title','voice','quick_entry','sources','clients','admin','backup','home','add',
 'desc_sources','desc_entry','desc_voice','desc_clients','desc_add','desc_admin',
 'desc_backup','desc_home','fab_aria','fab_open','quick_aria'];
new vm.Script(engine);

function getApi(code){
  const store={};
  const win={location:{search:'?lang='+code},
    localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=v}}};
  vm.runInNewContext(engine,{window:win,URLSearchParams},{timeout:1500});
  return win.DIGIY_WORLD8;
}
for(const lang of langs){
  const api=getApi(lang);
  assert.equal(api.getLang(),lang);
  for(const key of keys){
    const result=api.t('menu.'+key);
    assert.ok(typeof result==='string'&&result.length>1&&!result.startsWith('[world8:'),lang+' missing menu.'+key);
  }
}
const wo=getApi('wo'),zh=getApi('zh'),ar=getApi('ar');
assert.equal(wo.t('nav.menu'),'Tànneef yi','WO top-right menu must not fall back to French');
assert.equal(zh.t('nav.menu'),'菜单');
assert.equal(ar.t('nav.menu'),'القائمة');
assert.equal(wo.t('menu.title'),'Tànneef yi · PRO CARNET');
assert.notEqual(wo.t('menu.sources'),'Sources');
assert.notEqual(wo.t('menu.backup'),'Sauvegarde');
assert.notEqual(zh.t('menu.backup'),'Sauvegarde');

for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/world8\.js\?v=world10-20261117-perso-frais-v3/,file+' cache invalidation');
 assert.match(html,/menuBtn\.textContent="☰ "\+t\("nav\.menu"/,file+' top menu uses translated dictionary');
 assert.match(html,/\$\("btnMenu"\)\.onclick=\(\)=>openModal\("menuModal"\)/,file+' menu click still works');
 for(const id of ['menuFrais','menuActivities','menuContacts','menuAdmin','menuBackup','fabToggle']){
   assert.ok(html.includes('id="'+id+'"'),file+' missing working menu control '+id);
 }
 const attrs=[...html.matchAll(/data-menu10="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(attrs.length,23,file+' should have 23 localized menu labels');
 assert.ok(attrs.every(x=>keys.includes(x)),file+' uses defined translations only');
 const arias=[...html.matchAll(/data-menu10-aria="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(arias,['quick_aria','fab_aria','fab_open']);
 assert.match(html,/data-menu10-icon="⠿"/,'FAB icon retained');
 assert.match(html,/data-fab="backup"/,'FAB backup command untouched');
 assert.match(html,/data-fab="modules"/,'FAB sources command untouched');
 assert.match(html,/data-close="menuModal"/,'modal close button untouched');

 const from=html.indexOf('    // Le menu modal et le menu flottant partagent le même choix de langue.');
 const to=html.indexOf('    const magicTitle=',from);
 assert.ok(from>0&&to>from,'menu translation call wired into live rerender');
 const segment=html.slice(from,to);
 new vm.Script(segment);

 // Exercise precisely the renderer that patches visible labels and accessible names.
 const el={dataset:{menu10:'sources',menu10Icon:'⠿'},textContent:'⠿ Sources'};
 const el2={dataset:{menu10:'backup',menu10Icon:'💾'},textContent:'💾 Sauvegarde'};
 const aria={dataset:{menu10Aria:'fab_open'},getAttribute(){return 'Ouvrir le menu flottant'},
  setAttribute(k,v){this.name=k;this.label=v}};
 const doc={querySelectorAll(q){return q==='[data-menu10]'?[el,el2]:q==='[data-menu10-aria]'?[aria]:[]}};
 function translateFor(api){
  const t=(key,params,fallback)=>{const val=api.t(key,params);return val.startsWith('[world8:')?fallback:val};
  vm.runInNewContext(segment,{document:doc,t},{timeout:1000});
 }
 translateFor(wo);
 assert.equal(el.textContent,'⠿ Cosaan yi','Wolof FAB sources');
 assert.equal(el2.textContent,'💾 Dencukaay','Wolof FAB backup');
 assert.equal(aria.label,'Ubbil tànneef yi','Wolof accessible menu name');
 translateFor(zh);
 assert.equal(el.textContent,'⠿ 来源','Chinese FAB sources');
 assert.equal(el2.textContent,'💾 备份','Chinese FAB backup');
 translateFor(getApi('fr'));
 assert.equal(el.textContent,'⠿ Sources','switch back to FR');
 assert.equal(el2.textContent,'💾 Sauvegarde','switch back to FR backup');
}
console.log('PRO CARNET menu WORLD10: appel WO + modal + menu flottant + 10 langues et retours OK');
