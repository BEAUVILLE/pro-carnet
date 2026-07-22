// guard.js — PRO CARNET / rail technique PAY
// Build: carnet-minimal-fixes-v11-20260722
// PIN stable inchangé : digiy_verify_pin reste l’unique autorité d’ouverture.
(function(){
  "use strict";

  const MODULE="PAY";
  const MODULE_ALIASES=[
    "PAY","pay",
    "CARNET","carnet",
    "PRO_CARNET","pro_carnet",
    "DIGIY_CARNET","digiy_carnet"
  ];
  const TTL=8*60*60*1000;
  const SKEW=60*1000;
  const PIN_PATH=window.DIGIY_LOGIN_URL||"./pin.html";
  const SUPABASE_URL=window.DIGIY_SUPABASE_URL||"https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_KEY=window.DIGIY_SUPABASE_ANON_KEY||window.DIGIY_SUPABASE_ANON||"sb_publishable_tGHItRgeWDmGjnd0CK1DVQ_BIep4Ug3";

  const CARNET_STORAGE_KEY="digiy_pay_baptiste_reel_v2";
  const SCOPED_BUSINESS_KEYS=[
    CARNET_STORAGE_KEY,
    "digiy_pay_baptiste_before_restore",
    "digiy_pay_frais_v1",
    "DIGIY_PAY_ACTIONS",
    "DIGIY_PAY_PENDING_ACTION",
    "digiy_pay_fiche"
  ];

  const SESSION_KEYS=[
    "DIGIY_PAY_SESSION",
    "DIGIY_PAY_PIN_SESSION",
    "DIGIY_SESSION_PAY",
    "digiy_pay_session",
    "digiy_pay_guard_session",
    "digiy_guard_pay_session"
  ];

  const LEGACY_SESSION_KEYS=[
    "digiy_guard_session","DIGIY_PIN_SESSION","DIGIY_ACCESS","DIGIY_SESSION","digiy_session",
    "DIGIY_PAY_PRO_SESSION","digiy_session_pay","digiy_guard_session:PAY",
    "digiy_pay_slug","digiy_pay_phone","digiy_pay_last_slug","digiy_pay_last_phone",
    "DIGIY_PAY_HUB_PHONE","DIGIY_PAY_SLUG","DIGIY_PAY_COMPTE","DIGIY_PAY_PHONE",
    "digiy_last_slug","DIGIY_SLUG","pay_slug","compte","digiy_phone","DIGIY_PHONE","pay_phone","phone"
  ];

  const SENSITIVE_PARAMS=[
    "phone","tel","p_phone","owner_phone","owner_id","subscription_phone","checkout_phone","pay_phone",
    "pin","pin4","code","token","session","session_token","access","auth","ok","unlocked","pin_ok",
    "slug","compte","module","return","redirect","redirect_url","url","from","v"
  ];

  let current=null;
  let bootPromise=null;
  let sb=null;
  let expiryTimer=null;

  const now=()=>Date.now();
  const parseJSON=raw=>{try{return JSON.parse(raw)}catch(_){return null}};
  const normalizePhone=value=>{
    const digits=String(value||"").replace(/\D/g,"");
    if(!digits)return "";
    if(digits.startsWith("221")&&digits.length===12)return digits;
    if(digits.length===9)return "221"+digits;
    return digits.slice(0,15);
  };
  const normalizeSlug=value=>String(value||"").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-_]/g,"")
    .replace(/-+/g,"-").replace(/^[-_]+|[-_]+$/g,"");
  const parseTime=value=>{
    if(value===null||value===undefined||value==="")return 0;
    if(typeof value==="number"&&Number.isFinite(value))return value<100000000000?value*1000:value;
    const str=String(value).trim();
    if(!str)return 0;
    if(/^\d+$/.test(str)){
      const n=Number(str);
      return Number.isFinite(n)?(n<100000000000?n*1000:n):0;
    }
    const d=Date.parse(str);
    return Number.isFinite(d)?d:0;
  };

  function cleanUrl(){
    try{
      const url=new URL(location.href);
      let changed=false;
      SENSITIVE_PARAMS.forEach(key=>{
        if(url.searchParams.has(key)){url.searchParams.delete(key);changed=true}
      });
      if(changed)history.replaceState({},document.title,url.pathname+url.search+url.hash);
    }catch(_){}
  }

  function isValid(session){
    if(!session||typeof session!=="object")return false;
    const moduleCode=String(session.module||session.module_code||"").trim().toUpperCase();
    const phone=normalizePhone(session.phone||"");
    const access=session.access===true||session.access_ok===true||session.pin_session_ok===true;
    const validated=parseTime(session.validated_at||session.verified_at||0);
    const expires=parseTime(session.expires_at||session.expiresAt||0);
    const t=now();
    if(moduleCode!==MODULE)return false;
    if(phone.length<9||!access||!validated||!expires)return false;
    if(validated>t+SKEW)return false;
    if(t-validated>=TTL)return false;
    if(expires<=t)return false;
    if(expires>validated+TTL+SKEW)return false;
    return true;
  }

  function canonical(session){
    const validated=parseTime(session.validated_at||session.verified_at||0);
    return {
      module:MODULE,
      public_name:"PRO CARNET",
      slug:normalizeSlug(session.slug||session.reference||session.identifiant||""),
      phone:normalizePhone(session.phone||""),
      access:true,
      access_ok:true,
      pin_session_ok:true,
      validated_at:validated,
      verified_at:validated,
      expires_at:parseTime(session.expires_at||session.expiresAt||0)
    };
  }

  function readStored(){
    for(const key of SESSION_KEYS){
      for(const store of [sessionStorage,localStorage]){
        try{
          const parsed=parseJSON(store.getItem(key)||"");
          if(isValid(parsed))return canonical(parsed);
        }catch(_){}
      }
    }
    return null;
  }

  function scopeHash(value){
    let hash=2166136261;
    for(const ch of String(value||"")){
      hash^=ch.charCodeAt(0);
      hash=Math.imul(hash,16777619);
    }
    return (hash>>>0).toString(36);
  }

  function installCarnetStorageScope(session){
    if(window.__DIGIY_CARNET_STORAGE_SCOPE_INSTALLED)return true;
    const phone=normalizePhone(session?.phone||"");
    if(phone.length<9)return false;

    try{
      const local=window.localStorage;
      const proto=window.Storage&&window.Storage.prototype;
      if(!local||!proto)return false;

      const suffix="::"+scopeHash(MODULE+"|"+phone);
      const scopedMap=new Map(SCOPED_BUSINESS_KEYS.map(key=>[key,key+suffix]));
      const nativeGet=proto.getItem;
      const nativeSet=proto.setItem;
      const nativeRemove=proto.removeItem;
      const nativeClear=proto.clear;

      scopedMap.forEach((scopedKey,legacyKey)=>{
        const scopedRaw=nativeGet.call(local,scopedKey);
        const legacyRaw=nativeGet.call(local,legacyKey);
        if(scopedRaw===null&&legacyRaw!==null)nativeSet.call(local,scopedKey,legacyRaw);
        if(legacyRaw!==null)nativeRemove.call(local,legacyKey);
      });

      proto.getItem=function(key){
        const raw=String(key);
        return this===local&&scopedMap.has(raw)
          ? nativeGet.call(this,scopedMap.get(raw))
          : nativeGet.call(this,key);
      };
      proto.setItem=function(key,value){
        const raw=String(key);
        return this===local&&scopedMap.has(raw)
          ? nativeSet.call(this,scopedMap.get(raw),value)
          : nativeSet.call(this,key,value);
      };
      proto.removeItem=function(key){
        const raw=String(key);
        return this===local&&scopedMap.has(raw)
          ? nativeRemove.call(this,scopedMap.get(raw))
          : nativeRemove.call(this,key);
      };
      proto.clear=function(){
        if(this===local){
          scopedMap.forEach(scopedKey=>nativeRemove.call(this,scopedKey));
          return;
        }
        return nativeClear.call(this);
      };

      window.__DIGIY_CARNET_STORAGE_SCOPE_INSTALLED=true;
      window.DIGIY_CARNET_STORAGE_SCOPE={
        version:"carnet-storage-scope-v3-20260722",
        phone_hash:scopeHash(phone),
        keys:Object.fromEntries(scopedMap)
      };

      addEventListener("storage",event=>{
        const scopedKeys=[...scopedMap.values()];
        if(event.storageArea===local&&scopedKeys.includes(event.key)){
          if(event.key===scopedMap.get(CARNET_STORAGE_KEY)){
            const banner=document.getElementById("digiyCrossTabNotice");
            if(banner)banner.hidden=false;
            setTimeout(()=>location.reload(),350);
          }
        }
        if(SESSION_KEYS.includes(String(event.key||""))&&!readStored())goPin();
      });

      return true;
    }catch(error){
      console.error("[PRO CARNET STORAGE]",error);
      return false;
    }
  }

  function readCarnetState(){
    try{
      const state=parseJSON(localStorage.getItem(CARNET_STORAGE_KEY)||"");
      return state&&typeof state==="object"?state:null;
    }catch(_){return null}
  }

  function money(value){
    return Math.round(Math.abs(Number(value||0))).toLocaleString("fr-FR").replace(/\u202f/g," ")+" F";
  }
  function signedMoney(value,positiveSign=false){
    const n=Number(value||0);
    if(n<0)return "− "+money(n);
    if(n>0&&positiveSign)return "+ "+money(n);
    return money(n);
  }
  function movementValue(m){
    return m&&m.type==="expense"?-Number(m.amount||0):Number(m?.amount||0);
  }
  function isToday(ts){
    const d=new Date(ts),n=new Date();
    return Number.isFinite(d.getTime())&&d.toDateString()===n.toDateString();
  }

  function installFinancialDisplayFixes(){
    if(window.__DIGIY_CARNET_FINANCIAL_FIXES)return;
    window.__DIGIY_CARNET_FINANCIAL_FIXES=true;

    const apply=()=>{
      if(!/(?:^|\/)(?:index\.html)?$/i.test(location.pathname||""))return;
      const state=readCarnetState();
      if(!state||!Array.isArray(state.movements))return;
      const pocket=state.settings?.pocket==="perso"?"perso":"pro";
      const eyeOpen=state.settings?.eyeOpen!==false;
      const list=state.movements.filter(m=>(m.pocket==="perso"?"perso":"pro")===pocket);
      const balance=list.reduce((sum,m)=>sum+movementValue(m),0);
      const day=list.filter(m=>isToday(m.ts));
      const dayIn=day.filter(m=>m.type==="income").reduce((sum,m)=>sum+Number(m.amount||0),0);
      const dayOut=day.filter(m=>m.type==="expense").reduce((sum,m)=>sum+Number(m.amount||0),0);
      const dayNet=dayIn-dayOut;
      const allIn=list.filter(m=>m.type==="income").reduce((sum,m)=>sum+Number(m.amount||0),0);
      const allOut=list.filter(m=>m.type==="expense").reduce((sum,m)=>sum+Number(m.amount||0),0);
      const reserve=list.reduce((sum,m)=>{
        const label=String(m.label||"").trim().toLowerCase();
        if(m.type==="expense"&&label==="mise en réserve")return sum+Number(m.amount||0);
        if(m.type==="income"&&label==="reprise réserve")return sum-Number(m.amount||0);
        return sum;
      },0);

      const set=(id,text)=>{
        const el=document.getElementById(id);
        if(el&&el.textContent!==text)el.textContent=text;
      };

      if(eyeOpen){
        set("balanceNumber",signedMoney(balance));
        set("todayMini","Aujourd’hui "+signedMoney(dayNet,true));
        set("sumDay","+ "+money(dayIn));
        set("sumWeek","− "+money(dayOut));
        set("sumMonth",signedMoney(dayNet,true));
        set("journalMini","Entrées "+money(allIn)+" · Sorties "+money(allOut)+" · Net "+signedMoney(allIn-allOut,true));

        if(pocket==="pro"){
          const waveIn=day.filter(m=>m.mode==="Wave"&&m.type==="income").reduce((s,m)=>s+Number(m.amount||0),0);
          const waveOut=day.filter(m=>m.mode==="Wave"&&m.type==="expense").reduce((s,m)=>s+Number(m.amount||0),0);
          set("modeOneValue",money(waveIn));
          set("modeTwoValue",money(waveOut));
        }else{
          const cashNet=day.filter(m=>m.mode==="Cash").reduce((s,m)=>s+movementValue(m),0);
          const waveNet=day.filter(m=>m.mode==="Wave").reduce((s,m)=>s+movementValue(m),0);
          set("modeOneValue",signedMoney(cashNet,true));
          set("modeTwoValue",signedMoney(waveNet,true));
        }
      }

      let reserveEl=document.getElementById("digiyReserveRead");
      const host=document.querySelector(".balance .mini");
      if(!reserveEl&&host){
        reserveEl=document.createElement("span");
        reserveEl.id="digiyReserveRead";
        reserveEl.className="pill";
        host.appendChild(reserveEl);
      }
      if(reserveEl){
        reserveEl.textContent=eyeOpen?"Réserve "+signedMoney(reserve):"Réserve ••• F";
      }

      document.querySelectorAll(".module-row").forEach(row=>{
        const title=row.querySelector(".module-title")?.textContent?.trim();
        const meta=row.querySelector(".meta");
        if(!title||!meta||!/^Total\s*:/i.test(meta.textContent||""))return;
        const total=list.filter(m=>String(m.activity||"")===title).reduce((s,m)=>s+movementValue(m),0);
        const suffix=(meta.textContent||"").includes("·")?" · "+(meta.textContent||"").split("·").slice(1).join("·").trim():"";
        meta.textContent="Total : "+(eyeOpen?signedMoney(total):"••• F")+suffix;
      });

      const presets=Array.isArray(state.labelPresets)?state.labelPresets:[];
      document.querySelectorAll("[data-label-preset]").forEach(button=>{
        const preset=presets.find(item=>String(item?.id||"")===String(button.getAttribute("data-label-preset")||""));
        if(!preset)return;
        const label=String(preset.label||"").trim();
        const wrongPocket=preset.pocket&&preset.pocket!=="both"&&preset.pocket!==pocket;
        const internalTransfer=/^retrait\b/i.test(label);
        button.hidden=wrongPocket||internalTransfer;
        if(internalTransfer)button.title="Transfert interne masqué : il ne doit pas gonfler les entrées.";
      });
    };

    const start=()=>{
      apply();
      setInterval(apply,900);
      document.addEventListener("click",()=>setTimeout(apply,120));
      addEventListener("storage",()=>setTimeout(apply,80));
    };
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
    else start();
  }

  function installSimpleUi(){
    const apply=()=>{
      if(!/(?:^|\/)(?:index\.html)?$/i.test(location.pathname||""))return;
      if(!document.getElementById("digiy-carnet-simple-ui-v2")){
        const style=document.createElement("style");
        style.id="digiy-carnet-simple-ui-v2";
        style.textContent=`
          #btnMenu,#btnPayVoiceFloat,#fabWrap,[data-pay-voice]{display:none!important}
          .magic-actions{grid-template-columns:repeat(4,1fr)!important}
          .topline{justify-content:flex-start!important}
          .topline .title{flex:1!important}
          .topline::after{content:"";display:block;width:54px;min-width:54px;height:44px}
          #digiyBackupAccess{position:fixed;right:14px;bottom:94px;z-index:48;min-height:48px;border:0;border-radius:999px;padding:0 16px;background:linear-gradient(135deg,#f4d27a,#22c55e);color:#102014;font-weight:1000;box-shadow:0 12px 28px rgba(0,0,0,.28)}
          #digiyCrossTabNotice{position:fixed;left:12px;right:12px;top:12px;z-index:99;padding:12px;border-radius:16px;background:#fff7df;color:#172016;text-align:center;font-weight:1000;box-shadow:0 12px 30px rgba(0,0,0,.30)}
        `;
        document.head.appendChild(style);
      }

      if(!document.getElementById("digiyCrossTabNotice")){
        const notice=document.createElement("div");
        notice.id="digiyCrossTabNotice";
        notice.hidden=true;
        notice.textContent="Le carnet a changé dans un autre onglet. Actualisation sécurisée…";
        document.body.appendChild(notice);
      }

      if(!document.getElementById("digiyBackupAccess")){
        const button=document.createElement("button");
        button.id="digiyBackupAccess";
        button.type="button";
        button.textContent="💾 Sauvegarde";
        button.addEventListener("click",()=>{
          const modal=document.getElementById("backupModal");
          if(modal){
            modal.classList.add("open");
            document.body.classList.add("modal-open");
          }else{
            location.href="./session.html";
          }
        });
        document.body.appendChild(button);
      }

      const backupModal=document.getElementById("backupModal");
      const modalBody=backupModal?.querySelector(".modal-body");
      if(modalBody&&!document.getElementById("digiyLocalOnlyWarning")){
        const warning=document.createElement("div");
        warning.id="digiyLocalOnlyWarning";
        warning.className="notice";
        warning.textContent="Tes chiffres sont enregistrés dans ce téléphone. Aucune copie cloud automatique. Télécharge une sauvegarde JSON chaque semaine.";
        modalBody.prepend(warning);
      }
    };

    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});
    else apply();
  }

  function persist(session){
    const clean=canonical(session);
    if(!isValid(clean))return null;
    const raw=JSON.stringify(clean);
    SESSION_KEYS.forEach(key=>{
      try{
        sessionStorage.setItem(key,raw);
        localStorage.setItem(key,raw);
      }catch(_){}
    });
    if(clean.slug){
      try{
        sessionStorage.setItem("digiy_pay_slug",clean.slug);
        localStorage.setItem("digiy_pay_slug",clean.slug);
      }catch(_){}
    }
    try{
      sessionStorage.setItem("digiy_pay_phone",clean.phone);
      sessionStorage.setItem("DIGIY_PAY_HUB_PHONE",clean.phone);
      localStorage.removeItem("digiy_pay_phone");
      localStorage.removeItem("DIGIY_PAY_HUB_PHONE");
    }catch(_){}
    current=clean;
    window.DIGIY_PAY_HUB_PHONE=clean.phone;
    window.DIGIY_ACCESS=Object.assign({},clean);
    if(!isPinPage())installCarnetStorageScope(clean);
    scheduleExpiry(clean);
    return clean;
  }

  function clearSessions(){
    [...new Set([...SESSION_KEYS,...LEGACY_SESSION_KEYS])].forEach(key=>{
      try{
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }catch(_){}
    });
    current=null;
    if(expiryTimer){clearTimeout(expiryTimer);expiryTimer=null}
    try{
      delete window.DIGIY_PAY_HUB_PHONE;
      delete window.DIGIY_ACCESS;
    }catch(_){}
  }

  function scheduleExpiry(session){
    if(expiryTimer)clearTimeout(expiryTimer);
    const delay=Math.max(0,parseTime(session?.expires_at)-now());
    expiryTimer=setTimeout(()=>{
      clearSessions();
      goPin();
    },Math.min(delay+250,2147483000));
  }

  function hide(){try{document.documentElement.style.visibility="hidden"}catch(_){}}
  function show(){try{document.documentElement.style.visibility=""}catch(_){}}
  function isPinPage(){return /(?:^|\/)pin\.html$/i.test(location.pathname||"")}
  function buildPinUrl(){
    try{
      const url=new URL(PIN_PATH,location.href);
      SENSITIVE_PARAMS.forEach(key=>url.searchParams.delete(key));
      return url.origin===location.origin?url.pathname+url.search+url.hash:url.toString();
    }catch(_){return "./pin.html"}
  }
  function goPin(){location.replace(buildPinUrl())}

  function getSb(){
    if(sb)return sb;
    if(!window.supabase?.createClient)return null;
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
      auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:"digiy-carnet-guard"}
    });
    return sb;
  }

  async function rpc(name,body){
    const res=await fetch(SUPABASE_URL+"/rest/v1/rpc/"+encodeURIComponent(name),{
      method:"POST",
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:"Bearer "+SUPABASE_KEY,
        "Content-Type":"application/json",
        Accept:"application/json"
      },
      body:JSON.stringify(body||{}),
      cache:"no-store"
    });
    return {ok:res.ok,data:await res.json().catch(()=>null)};
  }

  function boolResult(data){
    const raw=Array.isArray(data)?data[0]:data;
    if(raw===true||raw===1)return true;
    if(typeof raw==="string"){
      const txt=raw.trim().toLowerCase();
      if(["true","t","1","yes","ok"].includes(txt))return true;
      if(txt.startsWith("(")){
        const first=txt.replace(/^\(/,"").split(",")[0].replace(/^"|"$/g,"").trim();
        return ["true","t","1"].includes(first);
      }
      return false;
    }
    if(raw&&typeof raw==="object"){
      return ["ok","access","access_ok","has_access","allowed","active","is_active","subscribed","valid","success"]
        .some(key=>raw[key]===true);
    }
    return false;
  }

  function accessBodies(phone){
    return MODULE_ALIASES.map(moduleCode=>({p_phone:phone,p_module:moduleCode}));
  }

  async function checkAccess(phone){
    const p=normalizePhone(phone);
    if(!p)return false;
    for(const name of ["digiy_has_module_access_from_abos","digiy_has_access"]){
      for(const body of accessBodies(p)){
        try{
          const result=await rpc(name,body);
          if(result.ok&&boolResult(result.data))return true;
        }catch(_){}
      }
    }
    return false;
  }

  async function verifyPin(phone,pin){
    const p=normalizePhone(phone);
    const code=String(pin||"").replace(/\D/g,"");
    if(p.length<9||code.length!==4){
      return {ok:false,error:"Vérifie le téléphone et les 4 chiffres du code."};
    }

    for(const moduleCode of MODULE_ALIASES){
      try{
        const result=await rpc("digiy_verify_pin",{
          p_phone:p,
          p_module:moduleCode,
          p_pin:code
        });
        if(!result.ok||!boolResult(result.data))continue;

        const row=Array.isArray(result.data)?result.data[0]:result.data;
        const t=now();
        const saved=persist({
          module:MODULE,
          phone:p,
          slug:row&&typeof row==="object"?(row.slug||row.identifiant||""):"",
          access:true,
          validated_at:t,
          expires_at:t+TTL
        });
        return saved?{ok:true,session:saved}:{ok:false,error:"Session refusée."};
      }catch(_){}
    }

    return {ok:false,error:"Code incorrect ou accès indisponible."};
  }

  async function loginWithPin(identifier,pin,explicitPhone){
    return verifyPin(explicitPhone||identifier||"",pin);
  }

  async function boot(options={}){
    cleanUrl();
    const stored=readStored();
    if(stored){
      persist(stored);
      show();
      return {ok:true,session:{...stored},source:"verified_pin_session"};
    }
    clearSessions();
    if(options.redirect!==false&&!isPinPage())goPin();
    else show();
    return {ok:false,session:null,reason:"pin_required"};
  }

  function ready(options={}){
    if(!bootPromise)bootPromise=boot(options).finally(()=>{bootPromise=null});
    return bootPromise;
  }

  async function requireSession(options={}){
    const result=await ready({redirect:options.redirect!==false});
    if(result.ok&&result.session)return result.session;
    if(options.redirect!==false&&!isPinPage())location.replace(options.to||buildPinUrl());
    return null;
  }

  function getSession(){
    return current&&isValid(current)?{...current}:readStored();
  }

  function logout(redirect=true){
    clearSessions();
    cleanUrl();
    if(redirect!==false)goPin();
  }

  function buildUrl(target,params={}){
    try{
      const url=new URL(target||location.href,location.href);
      SENSITIVE_PARAMS.forEach(key=>url.searchParams.delete(key));
      Object.entries(params).forEach(([key,value])=>{
        if(SENSITIVE_PARAMS.includes(key))return;
        const v=String(value??"").trim();
        if(v)url.searchParams.set(key,v);
        else url.searchParams.delete(key);
      });
      return url.origin===location.origin?url.pathname+url.search+url.hash:url.toString();
    }catch(_){return String(target||"./")}
  }

  window.DIGIY_GUARD={
    VERSION:"carnet-minimal-fixes-v11-20260722",
    module:MODULE,
    MODULE_CODE:MODULE,
    ready,boot,requireSession,getSession,
    getSlug:()=>normalizeSlug(getSession()?.slug||""),
    getPhone:()=>normalizePhone(getSession()?.phone||""),
    getModule:()=>MODULE,
    isAuthenticated:()=>!!getSession(),
    normalizePhone,normalizeSlug,
    verifyPin,loginWithPin,checkAccess,
    logout,clearSession:clearSessions,clearAll:clearSessions,
    buildPinUrl,goPin,buildUrl,
    go:(target,mode)=>mode==="replace"?location.replace(buildUrl(target)):location.assign(buildUrl(target)),
    cleanUrl,getSb,
    installCarnetStorageScope,installSimpleUi,installFinancialDisplayFixes
  };

  cleanUrl();
  if(isPinPage()){
    show();
    return;
  }

  installSimpleUi();
  const earlySession=readStored();
  if(earlySession)installCarnetStorageScope(earlySession);
  installFinancialDisplayFixes();
  hide();
  ready({redirect:true}).catch(goPin);
})();