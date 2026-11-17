const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const files=['app/world8-voice-live.html','app/index.html'];
const langs=['fr','en','es','pt','de','it','nl','ar','wo','zh'];
const world8=fs.readFileSync('assets/js/world8.js','utf8');
const movement=fs.readFileSync('assets/js/pro-carnet-movement-world10.js','utf8');
new vm.Script(world8);new vm.Script(movement);

function makeApi(lang){
  const data={},win={location:{search:'?lang='+lang},
    localStorage:{getItem(k){return data[k]||null},setItem(k,v){data[k]=v}}};
  vm.runInNewContext(world8,{window:win,URLSearchParams},{timeout:1200});
  const doc={querySelectorAll(){return[]}};
  vm.runInNewContext(movement,{window:win,document:doc},{timeout:1200});
  return{api:win.DIGIY_MOVE10,world:win.DIGIY_WORLD8,win};
}
const keys=['amount','label','mode','type','pocket','source','person','note',
 'income','expense','title_new','title_edit','title_full','notice_pro',
 'notice_perso','notice_full','save','save_edit','label_hint','person_hint',
 'note_hint','amount_invalid','canonical_hint','preset_prefix',
 'choice_income','choice_expense','choice_expense_notice','choice_income_notice',
 'choice_modules','choice_bank','choice_other','choice_empty',
 'choice_category_other','choice_category_modules','reserve_title',
 'reserve_intro','reserve_keep','reserve_take','reserve_advice'];
for(const lang of langs){
 const {api}=makeApi(lang);
 assert.equal(api.lang(),lang);
 assert.deepEqual(Array.from(api.keys),keys,lang+' dictionary keys');
 for(const key of keys){
  const val=api.t(key,{name:'TEST'});
  assert.ok(typeof val==='string'&&val.length>0&&val!==key,lang+' missing '+key);
 }
 assert.ok(api.t('preset_prefix',{name:'TEST'}).includes('TEST'));
 const note='Frais de compte / carte.';
 assert.ok(api.presetNote('lp-frais-banque',note));
 assert.equal(api.presetNote('lp-frais-banque','My custom note'),'My custom note',
  'custom notes must not be changed');
 assert.equal(api.presetNote('mine','My custom note'),'My custom note',
  'custom presets must not be changed');
}
assert.equal(makeApi('wo').api.t('amount'),'Xaalis bi (FCFA)');
assert.equal(makeApi('zh').api.t('amount'),'金额（FCFA）');

for(const file of files){
 const html=fs.readFileSync(file,'utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
   .map(x=>x[1]).filter(x=>x.trim());
 for(const script of scripts)new vm.Script(script,{filename:file});
 assert.match(html,/pro-carnet-movement-world10\.js\?v=20261117-v6/);
 const form=(html.match(/<div class="modal-bg" id="movementModal">[\s\S]*?<div class="modal-bg" id="contactsModal">/)||[])[0];
 assert.ok(form,'must translate the REAL movement popup');
 const labels=[...form.matchAll(/data-move10="([a-z_]+)"/g)].map(x=>x[1]);
 for(const key of ['amount','label','mode','type','pocket','source','person','note',
  'income','expense','canonical_hint'])assert.ok(labels.includes(key),file+' missing '+key);
 for(const key of ['label_hint','person_hint','note_hint'])
  assert.ok(form.includes('data-move10-placeholder="'+key+'"'));
 for(const id of ['moveAmount','moveLabel','moveMode','moveType','movePocket',
  'moveActivity','movePerson','moveNote','moveSaveBtn'])
  assert.ok(form.includes('id="'+id+'"'),file+' missing input '+id);
 assert.match(form,/id="moveAmount" type="number" inputmode="numeric" min="0" step="1"/);
 assert.match(html,/id="btnReserveKeep" type="button" data-move10="reserve_keep"/);
 assert.match(html,/id="btnReserveTake" type="button" data-move10="reserve_take"/);
 assert.match(html,/choiceCategoryLabel\(cat\)/,'intermediate expense list localized');
 assert.match(html,/data-label-preset="\$\{esc\(pr\.id\)\}"/,
  'canonical preset IDs preserved on buttons');
 assert.match(html,/rawLabel===els\.moveLabel\.dataset\.quickDisplay/,
  'original label restored when translated display was unchanged');
 assert.match(html,/rawNote===els\.moveNote\.dataset\.quickDisplayNote/,
  'original note restored when translated display was unchanged');

 const source=scripts.find(x=>x.includes('function openMovement(type,preset,editId)'));
 assert.ok(source);
 const a=source.indexOf('  function refreshMovementLanguage(){');
 const b=source.indexOf('  function choiceCategoryLabel(',a);
 const c=source.indexOf('  function openMovement(type,preset,editId)');
 const d=source.indexOf('  function defaultActivityFor(',c);
 const e=source.indexOf('  els.movementForm.onsubmit=e=>');
 const f=source.indexOf('\n  $("btnAddActivity")',e);
 assert.ok(a>0&&b>a&&c>0&&d>c&&e>0&&f>e,'handler boundaries');
 const helpers=source.slice(a,b)+'\n'+source.slice(c,d);
 const submission=source.slice(e,f);
 new vm.Script(helpers);new vm.Script(submission);

 for(const lang of langs){
  const {api,world,win}=makeApi(lang);
  const textInput={value:'',dataset:{},focus(){}};
  const noteInput={value:'',dataset:{}};
  const elems={movementForm:{reset(){},onsubmit:null},editMovementId:{value:''},
   movePocket:{value:'perso'},moveType:{value:'expense'},moveMode:{value:'Wave'},
   moveAmount:{value:''},moveLabel:textInput,moveActivity:{value:''},movePerson:{value:''},
   moveNote:noteInput,movementNotice:{textContent:''},
   movementModalTitle:{textContent:''},moveSaveBtn:{textContent:''}};
  const preset={id:'lp-frais-banque',label:'Frais bancaire',
   note:'Frais de compte / carte.',type:'expense',pocket:'perso',
   mode:'Wave',activity:'Charges',category:'Retraits / banques'};
  const state={labelPresets:[preset],settings:{pocket:'perso',visibleCount:10},
   labels:[],people:[],movements:[]};
  const title={textContent:'',hidden:true};
  let saves=0;
  const ctx={window:win,document:{querySelectorAll(){return[]}},els:elems,state,
   movementFullEntry:false,
   $:id=>id==='movementModal'?{}:id==='movePresetHeadline'?title:null,
   m10:(key,args)=>api.t(key,args),
   renderModeSelect(){},renderActivitySelect(){},openModal(){},closeModal(){},
   setTimeout(){},pocket:()=>state.settings.pocket,
   cleanMode:(p,m)=>m,
   quickDisplayLabel:p=>lang==='fr'?p.label:world.t('quick.lp-frais-banque'),
   save(){saves++},render(){},uid:()=>'test-id',
   alert(m){throw Error('Unexpected alert: '+m)},Date,Math};
  const runner=helpers+'\n'+
   'function clickPreset(id){const pr=state.labelPresets.find(x=>x.id===id);'+
   'openMovement(pr.type,{pocket:pr.pocket,type:pr.type,mode:pr.mode,'+
   'amount:"",label:pr.label,activity:pr.activity,person:"",note:pr.note,'+
   'quickPresetId:pr.id,quickCanonical:pr.label});}\n'+
   'clickPreset("lp-frais-banque");';
  vm.runInNewContext(runner,ctx,{timeout:1200});
  assert.equal(textInput.dataset.quickCanonical,'Frais bancaire');
  assert.equal(noteInput.dataset.quickCanonicalNote,'Frais de compte / carte.');
  assert.equal(elems.moveMode.value,'Wave');
  assert.equal(elems.movePocket.value,'perso');
  assert.equal(elems.moveAmount.value,'','must not invent financial amount');
  assert.equal(elems.movementModalTitle.textContent,api.t('title_new'));
  assert.equal(elems.moveSaveBtn.textContent,api.t('save'));
  if(lang==='wo')assert.equal(textInput.value,'Fayu bank bi');
  if(lang==='zh')assert.equal(textInput.value,'银行手续费');
  elems.moveAmount.value='15000';
  vm.runInNewContext(submission,ctx,{timeout:1200});
  elems.movementForm.onsubmit({preventDefault(){}});
  assert.equal(state.movements.length,1);
  const saved=state.movements[0];
  assert.equal(saved.amount,15000);
  assert.equal(saved.label,'Frais bancaire',lang+' must store canonical label');
  assert.equal(saved.note,'Frais de compte / carte.',lang+' must store canonical note');
  assert.equal(saved.mode,'Wave');
  assert.equal(saved.pocket,'perso');
  assert.equal(saved.type,'expense');
  assert.equal(saves,1);
 }
}
console.log('PRO CARNET V6: 10 languages tested across real entry modal and accounting submission; values intact');
