// guard.js — PRO CARNET / rail technique PAY
// Autorité unique : session créée uniquement après validation réelle du PIN par Supabase.
// Les données locales du carnet sont isolées par identité PRO CARNET vérifiée.
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
  const CARNET_LEGACY_STORAGE_KEY="digiy_pay_baptiste_reel_v2";

  const SESSION_KEYS=[
    "DIGIY_PAY_SESSION",
    "DIGIY_PAY_PIN_SESSION",
    "DIGIY_SESSION_PAY",
    "digiy_pay_session",
    "digiy_pay_guard_session",
    "digiy_guard_pay_session"
  ];

  const LEGACY_KEYS=[
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

  const now=()=>Date.now();
  const parseJSON=raw=>{try{return JSON.parse(raw)}catch(_){return null}};
  const normalizePhone=value=>{
    const digits=String(value||"").replace(/\D/g,"");
    if(!digits)return "";
    if(digits.startsWith("221")&&digits.length===12)return digits;
    if(digits.length===9)return "221"+digits;
    return digits.slice(0,15);
  };
  const normalizeSlug=value=>String(value||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-").replace(/[^a-z0-9-_]/g,"").replace(/-+/g,"-").replace(/^[-_]+|[-_]+$/g,"");
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
        if(url.searchParams.has(key)){
          url.searchParams.delete(key);
          changed=true;
        }
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
    const text=String(value||"");
    for(let i=0;i<text.length;i++){
      hash^=text.charCodeAt(i);
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

      const scopedKey=CARNET_LEGACY_STORAGE_KEY+"::"+scopeHash(MODULE+"|"+phone);
      const nativeGet=proto.getItem;
      const nativeSet=proto.setItem;
      const nativeRemove=proto.removeItem;
      const nativeClear=proto.clear;

      const scopedRaw=nativeGet.call(local,scopedKey);
      const legacyRaw=nativeGet.call(local,CARNET_LEGACY_STORAGE_KEY);
      if(scopedRaw===null&&legacyRaw!==null){
        nativeSet.call(local,scopedKey,legacyRaw);
      }
      if(legacyRaw!==null){
        nativeRemove.call(local,CARNET_LEGACY_STORAGE_KEY);
      }

      proto.getItem=function(key){
        if(this===local&&String(key)===CARNET_LEGACY_STORAGE_KEY){
          return nativeGet.call(this,scopedKey);
        }
        return nativeGet.call(this,key);
      };
      proto.setItem=function(key,value){
        if(this===local&&String(key)===CARNET_LEGACY_STORAGE_KEY){
          return nativeSet.call(this,scopedKey,value);
        }
        return nativeSet.call(this,key,value);
      };
      proto.removeItem=function(key){
        if(this===local&&String(key)===CARNET_LEGACY_STORAGE_KEY){
          return nativeRemove.call(this,scopedKey);
        }
        return nativeRemove.call(this,key);
      };
      proto.clear=function(){
        if(this===local){
          return nativeRemove.call(this,scopedKey);
        }
        return nativeClear.call(this);
      };

      window.__DIGIY_CARNET_STORAGE_SCOPE_INSTALLED=true;
      window.DIGIY_CARNET_STORAGE_SCOPE={version:"carnet-storage-scope-v1-20260722",key:scopedKey};
      return true;
    }catch(_){
      return false;
    }
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
    installCarnetStorageScope(clean);
    return clean;
  }

  function clearSessions(){
    [...new Set([...SESSION_KEYS,...LEGACY_KEYS])].forEach(key=>{
      try{
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }catch(_){}
    });
    current=null;
    try{
      delete window.DIGIY_PAY_HUB_PHONE;
      delete window.DIGIY_ACCESS;
    }catch(_){}
  }

  function hide(){try{document.documentElement.style.visibility="hidden"}catch(_){}}
  function show(){try{document.documentElement.style.visibility=""}catch(_){}}
  function isPinPage(){return /(?:^|\/)pin\.html$/i.test(location.pathname||"")}
  function buildPinUrl(){
    try{
      const url=new URL(PIN_PATH,location.href);
      SENSITIVE_PARAMS.forEach(key=>url.searchParams.delete(key));
      return url.origin===location.origin?url.pathname+url.search+url.hash:url.toString();
    }catch(_){
      return "./pin.html";
    }
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
    const res=await fetch(SUPABASE_URL+"/rest/v1/rpc/"+name,{
      method:"POST",
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:"Bearer "+SUPABASE_KEY,
        "Content-Type":"application/json",
        Accept:"application/json"
      },
      body:JSON.stringify(body||{})
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
        const first=txt.replace(/^\(/,"").split(",")[0].replace(/^\"|\"$/g,"").trim();
        return ["true","t","1"].includes(first);
      }
      return false;
    }
    if(raw&&typeof raw==="object"){
      return ["ok","access","access_ok","has_access","allowed","active","is_active","subscribed","valid","success"].some(key=>raw[key]===true);
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
    }catch(_){
      return String(target||"./");
    }
  }

  window.DIGIY_GUARD={
    VERSION:"carnet-guard-storage-scope-v7-20260722",
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
    installCarnetStorageScope
  };

  cleanUrl();
  if(isPinPage()){
    show();
    return;
  }

  const earlySession=readStored();
  if(earlySession)installCarnetStorageScope(earlySession);
  hide();
  ready({redirect:true}).catch(goPin);
})();
