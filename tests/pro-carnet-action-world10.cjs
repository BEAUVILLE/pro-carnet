const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('action.html','utf8');
const engine=fs.readFileSync('assets/js/pro-carnet-secondary-world10.js','utf8');
const langs=['fr','en','es','pt','de','it','nl','ar','wo','zh'];
new vm.Script(engine);
const inlines=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());
inlines.forEach(source=>new vm.Script(source));
const action=inlines.find(source=>source.includes('function adminPayloadFromAction('));
assert.ok(action,'action parser and proof script');

function block(start,end){
  const i=action.indexOf(start),j=action.indexOf(end,i+1);
  assert.ok(i>=0&&j>i,'immutable source boundaries: '+start);
  return action.slice(i,j);
}
function fnv(source){
  let n=2166136261;
  for(let i=0;i<source.length;i++){n^=source.charCodeAt(i);n=Math.imul(n,16777619)>>>0}
  return n.toString(16).padStart(8,'0');
}
assert.equal(fnv(block('function norm(v)','function set(m)')),'4487f8a2',
 'Parser, transaction builder and accounting proof must be unchanged');
assert.equal(fnv(block('function getPaySession()','async function validate()')),'4e11a812',
 'Session lookup, RPC payload and cashbook insertion must be unchanged');
assert.match(html,/rec\.lang='fr-FR'/,'French-only voice recognition must be explicit');
assert.match(html,/data-pro10="act\.voiceNotice"/,'language limitation must be visible');
assert.match(html,/pro-carnet-secondary-world10\.js\?v=20261117-action-v3/);
assert.match(html,/window\.DIGIY_SESSION\?\.require\?\.\("\.\/pin\.html"\)/,'existing session guard preserved');
assert.match(html,/id="pro10Controls"/,'language picker mounted');
const originalSamples=['recette boutique 10000 Wave','dépense emballage 3000 cash',
 'recette course DRIVER 20000 Wave','acompte logement LOC 20000 Wave','Awa doit 15000',
 'dépense essence 6700 cash'];
assert.deepEqual([...html.matchAll(/data-t="([^"]+)"/g)].map(m=>m[1]),originalSamples,
 'French parser samples remain canonical');

async function simulate(code){
  const store={};
  const uiKeys=[...html.matchAll(/data-pro10="([^"]+)"/g)].map(m=>m[1]);
  const elements=uiKeys.map(key=>({key,textContent:'',getAttribute(){return key}}));
  const buttons=originalSamples.map(text=>({dataset:{t:text},onclick:null}));
  const nodes={txt:{value:'recette course DRIVER 20000 Wave'},
    state:{textContent:''},proof:{textContent:'',classList:{add(){this.visible=true},remove(){this.visible=false}}},
    listen:{textContent:''},prepare:{onclick:null},copy:{onclick:null},clear:{onclick:null},
    validate:{onclick:null}};
  let mount,selector;
  const doc={
    readyState:'loading',documentElement:{lang:'fr',dir:'ltr'},
    addEventListener(type,callback){if(type==='DOMContentLoaded')mount=callback},
    querySelectorAll(q){if(q==='[data-pro10]')return elements;
      if(q==='[data-t]')return buttons;
      if(q==='[data-pro10-placeholder]'||q==='[data-pro10-aria]')return [];
      throw Error('Unexpected selector '+q)},
    getElementById(id){
      if(id==='pro10Controls')return {appendChild(el){selector=el}};
      if(id==='pro10Lang')return selector||null;
      return nodes[id]||null;
    },
    createElement(tag){
      if(tag==='select')return {value:'',children:[],style:{},setAttribute(){},
        addEventListener(type,fn){this.onchange=fn},appendChild(el){this.children.push(el)}};
      return {value:'',textContent:''};
    }
  };
  const rpcCalls=[];
  const win={
    location:{search:'?lang='+code},
    localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=v}},
    DIGIY_SESSION:{require(){return{slug:'test-pro',phone:'221771112233'}}},
    DIGIY_SUPABASE_URL:'https://unit-test.invalid',
    DIGIY_SUPABASE_ANON_KEY:'test-publishable',
    supabase:{createClient(){return {async rpc(name,params){
      rpcCalls.push({name,params});return{data:{ok:true},error:null}
    }}}}
  };
  const context={window:win,document:doc,URLSearchParams,
    localStorage:win.localStorage,navigator:{clipboard:{writeText:async()=>{}}},prompt(){},
    Date,Math,console};
  vm.runInNewContext(engine,context,{timeout:1000});
  vm.runInNewContext(action,context,{timeout:1000});
  mount();

  assert.equal(selector.children.length,10,code+': exactly ten languages');
  assert.deepEqual(Array.from(selector.children.map(el=>el.value)),langs);
  assert.equal(selector.value,code);
  assert.equal(doc.documentElement.lang,code==='zh'?'zh-CN':code);
  assert.equal(doc.documentElement.dir,code==='ar'?'rtl':'ltr');
  assert.equal(store.digiy_carnet_ui_lang_v1,code);
  assert.ok(elements.every(el=>el.textContent.length>0),code+': translated static UI');
  const notice=elements.find(el=>el.key==='act.voiceNotice');
  assert.ok(notice&&notice.textContent.length>35,'voice limitation');
  if(['wo','zh'].includes(code)){
    assert.notEqual(elements.find(el=>el.key==='act.speak').textContent,'Dis l’argent.');
    assert.notEqual(notice.textContent,code==='wo'?'Dictée et analyse des phrases : français uniquement pour l’instant. Les exemples et les preuves restent en français.':'');
  }
  assert.equal(nodes.txt.value,'recette course DRIVER 20000 Wave','text input is original sample');
  assert.ok(nodes.listen.textContent,'no speech API should show a localized warning');

  nodes.txt.value='';
  await nodes.validate.onclick();
  assert.equal(rpcCalls.length,0,'empty amount must not call RPC');

  nodes.txt.value='recette course DRIVER 20000 Wave';
  await nodes.validate.onclick();
  assert.equal(rpcCalls.length,1,'exactly one mock insertion attempt');
  const call=rpcCalls[0];
  assert.equal(call.name,'digiy_pay_pro_insert_movement','real RPC name preserved');
  assert.equal(call.params.p_slug,'test-pro');
  assert.equal(call.params.p_phone,'221771112233');
  const data=call.params.p_payload;
  assert.equal(data.amount_xof,20000,'amount independent of language');
  assert.equal(data.channel,'wave','channel independent of language');
  assert.equal(data.label,'Recette DRIVER','stored label must not translate');
  assert.equal(data.source_module,'DRIVER','module identifier unchanged');
  assert.equal(data.status,'posted','canonical status unchanged');
  assert.equal(data.direction,'in');
  assert.equal(data.meta.validation_humaine,true);
  assert.ok(nodes.proof.textContent.includes('PREUVE PAY — DIGIYLYFE'),
    'accounting receipt must remain canonical');
  const log=JSON.parse(store.DIGIY_PAY_ACTIONS);
  assert.equal(log[0].amount,20000);
  assert.equal(log[0].category,'Recette DRIVER','local backup canonical');
  assert.equal(log[0].insertedInMovements,true);
  assert.equal(log[0].note,'recette course DRIVER 20000 Wave','source text unchanged');

  win.DIGIY_PRO10.setLang('fr');
  assert.equal(nodes.txt.value,'recette course DRIVER 20000 Wave','switching language must not rewrite input');
  assert.equal(elements.find(el=>el.key==='act.speak').textContent,'Dis l’argent.');
  assert.equal(doc.documentElement.dir,'ltr');
}
(async()=>{for(const code of langs)await simulate(code);
 console.log('ACTION PAY WORLD10: ten languages, voice notice, unchanged RPC amount/proof/data — OK');
})().catch(err=>{console.error(err);process.exitCode=1});
