const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const langs=['fr','en','es','pt','de','it','nl','ar','wo','zh'];
const worldSource=fs.readFileSync('assets/js/world8.js','utf8');
const adminSource=fs.readFileSync('assets/js/pro-carnet-admin-modal-world10.js','utf8');
const paths=['app/world8-voice-live.html','app/index.html'];
new vm.Script(worldSource);new vm.Script(adminSource);

function setup(code,fields=[],placeholders=[]){
  const store={};
  const win={location:{search:'?lang='+code},
    localStorage:{getItem(key){return store[key]||null},setItem(key,val){store[key]=val}}};
  vm.runInNewContext(worldSource,{window:win,URLSearchParams},{timeout:1500});
  const modal={
    querySelectorAll(selector){
      if(selector==='[data-admin10]')return fields;
      if(selector==='[data-admin10-placeholder]')return placeholders;
      return [];
    }
  };
  const document={getElementById(id){return id==='adminModal'?modal:null}};
  vm.runInNewContext(adminSource,{window:win,document},{timeout:1500});
  return{api:win.DIGIY_ADMIN10,win};
}

for(const code of langs){
  const {api}=setup(code);
  assert.equal(api.code(),code);
  for(const key of api.keys){
    const translated=api.t(key,{name:'Test'});
    assert.ok(typeof translated==='string'&&translated.trim().length>0&&translated!==key,
      code+' missing Admin translation '+key);
  }
  assert.ok(api.t('added',{name:'Tabaski'}).includes('Tabaski'));
  assert.ok(api.t('changed',{name:'Tabaski'}).includes('Tabaski'));
  assert.equal(api.category('Un classement personnalisé'),'Un classement personnalisé',
    'Custom category must not be reclassified');
  assert.equal(api.category('Sorties rapides'),api.t('cat_fast'));
  assert.equal(api.category('Retraits / banques'),api.t('cat_bank'));
}
assert.notEqual(setup('wo').api.t('title'),'Réglages');
assert.notEqual(setup('zh').api.t('title'),'Réglages');
assert.equal(setup('wo').api.t('title'),'Saytu');
assert.equal(setup('zh').api.t('title'),'设置');

for(const file of paths){
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/pro-carnet-admin-modal-world10\.js\?v=20261117-admin-modal-v7/);
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(m=>m[1]).filter(s=>s.trim());
  scripts.forEach(s=>new vm.Script(s,{filename:file}));
  const start=html.indexOf('<div class="modal-bg" id="adminModal">');
  const end=html.indexOf('<div class="modal-bg" id="choiceModal">',start);
  assert.ok(start>0&&end>start,file+' true cockpit Admin popup is present');
  const modal=html.slice(start,end);
  const staticKeys=[...modal.matchAll(/data-admin10="([^"]+)"/g)].map(m=>m[1]);
  const placeholderKeys=[...modal.matchAll(/data-admin10-placeholder="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(staticKeys.length>=21,file+' Admin panel contains enough annotated controls');
  assert.deepEqual(placeholderKeys,['module_hint','quick_hint','person_hint']);
  for(const key of ['title','intro','module_pocket','module_name','add_module','quick_name',
    'family','pocket','both','default_mode','screen_group','help','validate',
    'person','add_person','income','expense','cat_mine','cat_fast','cat_modules','cat_bank'])
    assert.ok(staticKeys.includes(key),file+' missing '+key);

  // All select value attributes must remain the ORIGINAL canonical business values.
  const valuesBySelect={
    adminActivityPocket:['pro','perso'],
    adminLabelType:['expense','income'],
    adminLabelPocket:['perso','pro','both'],
    adminLabelMode:['Wave','OM','Cash','Chèque','CB','Virement'],
    adminLabelCategory:['Mes libellés','Sorties rapides','Entrées / modules','Retraits / banques']
  };
  for(const[id,expected] of Object.entries(valuesBySelect)){
    const chunk=modal.match(new RegExp('<select id="'+id+'">([\\s\\S]*?)<\\/select>'));
    assert.ok(chunk,file+' missing '+id);
    assert.deepEqual([...chunk[1].matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]),expected,
      file+' canonical options changed in '+id);
  }
  for(const id of ['btnAddActivity','btnAddLabel','btnAddPerson','adminActivities',
     'adminLabels','adminPeople','adminLabelStatus','adminModal']){
    assert.ok(html.includes('id="'+id+'"'),file+' must preserve functioning element '+id);
  }

  const inline=scripts.find(s=>s.includes('function renderAdmin(){'));
  assert.ok(inline);
  assert.match(inline,/window\.DIGIY_ADMIN10\?\.apply\(\)/,'language switch must translate live popup');
  assert.match(inline,/renderAdmin\(\);\n    if\(lastAdminMessage\)/,
    'language switch must re-render dynamic rows and status');
  assert.match(inline,/if\(\$\("editLabelPresetId"\)\?\.value\)/,
    'Edit state should persist across language switches');
  assert.match(inline,/showAdminMessage\("required",null,true\)/);
  assert.match(inline,/showAdminMessage\("duplicate",null,true\)/);
  assert.match(inline,/showAdminMessage\(editId\?"changed":"added",\{name:n\},false\)/);
  assert.match(inline,/confirm\(a10\("confirm_module"\)\)/);
  assert.match(inline,/confirm\(a10\("confirm_label"\)\)/);
  assert.match(inline,/if\(type==="income"&&cat==="Sorties rapides"\)/,
    'Internal category handling must remain canonical');
  assert.match(inline,/if\(type==="expense"&&cat==="Entrées \/ modules"\)/);
  assert.match(inline,/data-del-label-preset=/);
  assert.match(inline,/const item=\{id:editId\|\|uid\("lp"\),pocket:pp,type,label:n,mode,/,
    'Accounting object still stores canonical values');

  const a=inline.indexOf('function renderAdmin(){');
  const b=inline.indexOf(' function renderActivitiesModal(){',a);
  assert.ok(a>=0&&b>a);
  const renderer=inline.slice(a,b);

  for(const lang of langs){
    const fieldEls=staticKeys.map(key=>({key,textContent:'FR',
      getAttribute(){return this.key}}));
    const placeholders=placeholderKeys.map(key=>({key,value:'',
      getAttribute(){return this.key},
      setAttribute(attr,value){if(attr==='placeholder')this.value=value}}));
    const {api,win}=setup(lang,fieldEls,placeholders);
    api.apply();
    for(const el of fieldEls)assert.equal(el.textContent,api.t(el.key),lang+' '+el.key);
    for(const el of placeholders)assert.equal(el.value,api.t(el.key),lang+' '+el.key);

    const state={activities:[{id:'act-1',name:'Boutique',pocket:'pro'}],
      labelPresets:[{id:'lp-frais-banque',label:'Frais bancaire',category:'Retraits / banques',
        pocket:'perso',type:'expense',mode:'Wave'}],
      people:['Moi-même']};
    const before=JSON.stringify(state);
    const els={adminActivities:{innerHTML:''},adminLabels:{innerHTML:''},adminPeople:{innerHTML:''}};
    const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;');
    const ctx={state,els,window:win,a10:(key,params)=>api.t(key,params),
      quickDisplayLabel:pr=>pr.label,esc};
    vm.runInNewContext(renderer+'\nrenderAdmin();',ctx,{timeout:1000});
    assert.equal(JSON.stringify(state),before,'rendering must never mutate financial presets '+lang);
    assert.ok(els.adminActivities.innerHTML.includes(api.t('delete')));
    assert.ok(els.adminLabels.innerHTML.includes(api.t('edit')));
    assert.ok(els.adminLabels.innerHTML.includes(api.t('cat_bank')));
    assert.ok(els.adminLabels.innerHTML.includes('Frais bancaire'),
      'Stored label remains original user/business label');
    assert.ok(els.adminPeople.innerHTML.includes(api.t('delete')));
  }
}
console.log('PRO CARNET V7: real cockpit Admin fields, dynamic buttons, prompts, statuses and canonical option values — 10 languages OK');
