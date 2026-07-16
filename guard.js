// guard.js — PRO CARNET / rail technique PAY
// Garde stricte : seule une session créée après validation réelle du PIN est acceptée.
(function(){
  "use strict";

  const MODULE="PAY";
  const MODULE_LOWER="pay";
  const TTL=8*60*60*1000;
  const SKEW=60*1000;
  const PIN_PATH=window.DIGIY_LOGIN_URL||"./pin.html";
  const SUPABASE_URL=window.DIGIY_SUPABASE_URL||"https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_KEY=window.DIGIY_SUPABASE_ANON_KEY||window.DIGIY_SUPABASE_ANON||"sb_publishable_tGHItRgeWDmGjnd0CK1DVQ_BIep4Ug3";
  const SESSION_KEYS=[
    "DIGIY_PAY_SESSION","DIGIY_PAY_PIN_SESSION","DIGIY_SESSION_PAY",
    "digiy_pay_session","digiy_pay_guard_session","digiy_guard_pay_session",
    "digiy_guard_session"
  ];
  const IDENTITY_KEYS=["digiy_pay_slug","digiy_pay_phone","digiy_pay_last_slug","digiy_pay_last_phone","DIGIY_PAY_HUB_PHONE"];
  const SENSITIVE_PARAMS=["phone","tel","owner_phone","owner_id","pay_phone","pin","code","token","session","access","auth","ok","unlocked","pin_ok"];

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
    return digits;
  };
  const normalizeSlug=value=>String(value||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-").replace(/[^a-z0-9-_]/g,"").replace(/-+/g,"-").replace(/^[-_]+|[-_]+$/g,"");
  const parseTime=value=>{
    if(value===null||value===undefined||value==="")return 0;
    if(typeof value==="number"&&Number.isFinite(value))return value<100000000000?value*1000:value;
    const str=String(value).trim();
    if(!str)return 0;
    if(/^\d+$/.test(str)){const n=Number(str);return Number.isFinite(n)?(n<100000000000?n*1000:n):0}
    const d=Date.parse(str);return Number.isFinite(d)?d:0;
  };

  function cleanUrl(){
    try{
      const url=new URL(location.href);
      let changed=false;
      SENSITIVE_PARAMS.forEach(key=>{if(url.searchParams.has(key)){url.searchParams.delete(key);changed=true}});
      const slug=normalizeSlug(url.searchParams.get("slug")||"");
      if(slug&&/\d{7,}/.test(slug)){url.searchParams.delete("slug");changed=true}
      if(changed)history.replaceState({},"",url.pathname+url.search+url.hash);
    }catch(_){}
  }

  function isValid(session){
    if(!session||typeof session!=="object")return false;
    const moduleCode=String(session.module||session.module_code||"").trim().toUpperCase();
    const phone=normalizePhone(session.phone||"");
    const access=session.access===true||session.access_ok===true||session.pin_session_ok===true;
    const validated=parseTime(session.validated_at||session.verified_at||session.ts||0);
    const expires=parseTime(session.expires_at||session.expiresAt||0);
    const t=now();
    if(moduleCode!==MODULE)return false;
    if(!phone||phone.length<9||!access||!validated||!expires)return false;
    if(validated>t+SKEW)return false;
    if(t-validated>=TTL)return false;
    if(expires<=t)return false;
    if(expires>validated+TTL+SKEW)return false;
    return true;
  }

  function canonical(session){
    const validated=parseTime(session.validated_at||session.verified_at||session.ts||0);
    return {
      module:MODULE,
      public_name:"PRO CARNET",
      slug:normalizeSlug(session.slug||session.reference||session.référence||""),
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

  function persist(session){
    const clean=canonical(session);
    if(!isValid(clean))return null;
    const raw=JSON.stringify(clean);
    SESSION_KEYS.forEach(key=>{try{sessionStorage.setItem(key,raw);localStorage.setItem(key,raw)}catch(_){}});
    if(clean.slug){try{sessionStorage.setItem("digiy_pay_slug",clean.slug);localStorage.setItem("digiy_pay_slug",clean.slug)}catch(_){}}
    try{
      sessionStorage.setItem("digiy_pay_phone",clean.phone);
      sessionStorage.setItem("DIGIY_PAY_HUB_PHONE",clean.phone);
      localStorage.removeItem("digiy_pay_phone");
      localStorage.removeItem("DIGIY_PAY_HUB_PHONE");
    }catch(_){}
    current=clean;
    window.DIGIY_PAY_HUB_PHONE=clean.phone;
    window.DIGIY_ACCESS=Object.assign({},window.DIGIY_ACCESS||{},clean);
    return clean;
  }

  function clearSessions(){
    SESSION_KEYS.concat(IDENTITY_KEYS).forEach(key=>{
      try{sessionStorage.removeItem(key);localStorage.removeItem(key)}catch(_){}
    });
    current=null;
    try{delete window.DIGIY_PAY_HUB_PHONE;delete window.DIGIY_ACCESS}catch(_){}
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
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:"digiy-carnet-guard"}});
    return sb;
  }

  async function rpc(name,body){
    const res=await fetch(SUPABASE_URL+"/rest/v1/rpc/"+name,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(body||{})});
    return {ok:res.ok,data:await res.json().catch(()=>null)};
  }
  function boolResult(data){
    const raw=Array.isArray(data)?data[0]:data;
    if(raw===true||raw===1)return true;
    if(typeof raw==="string")return ["true","t","1","yes","ok"].includes(raw.trim().toLowerCase());
    if(raw&&typeof raw==="object")return ["ok","access","access_ok","has_access","allowed","active","is_active","subscribed","valid","success"].some(k=>raw[k]===true);
    return false;
  }
  async function checkAccess(phone){
    const p=normalizePhone(phone);if(!p)return false;
    for(const [name,bodies] of [
      ["digiy_has_module_access_from_abos",[{p_phone:p,p_module:MODULE},{p_phone:p,p_module:MODULE_LOWER}]],
      ["digiy_has_access",[{p_phone:p,p_module:MODULE},{p_phone:p,p_module:MODULE_LOWER}]]
    ]){
      for(const body of bodies){try{const r=await rpc(name,body);if(r.ok&&boolResult(r.data))return true}catch(_){}}
    }
    return false;
  }
  async function verifyPin(phone,pin){
    const p=normalizePhone(phone),code=String(pin||"").trim().replace(/\s+/g,"");
    if(!p||!code)return {ok:false,error:"Téléphone ou code manquant."};
    for(const moduleCode of [MODULE,MODULE_LOWER]){
      try{
        const r=await rpc("digiy_verify_pin",{p_phone:p,p_module:moduleCode,p_pin:code});
        if(!r.ok)continue;
        const row=Array.isArray(r.data)?r.data[0]:r.data;
        if(!boolResult(row))continue;
        if(!(await checkAccess(p)))return {ok:false,error:"Accès PRO CARNET non actif."};
        const t=now();
        const saved=persist({module:MODULE,phone:p,slug:row?.slug||row?.identifiant||("pay-"+p),access:true,validated_at:t,expires_at:t+TTL});
        return saved?{ok:true,session:saved,phone:saved.phone,slug:saved.slug}:{ok:false,error:"Session refusée."};
      }catch(_){}
    }
    return {ok:false,error:"Code incorrect."};
  }
  async function loginWithPin(identifier,pin,explicitPhone){
    const phone=normalizePhone(explicitPhone||identifier||"");
    if(!phone)return {ok:false,error:"Téléphone introuvable."};
    return verifyPin(phone,pin);
  }

  async function boot(options={}){
    cleanUrl();
    const stored=readStored();
    if(stored){persist(stored);show();return {ok:true,session:{...stored},source:"verified_pin_session"}}
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
  function getSession(){return current&&isValid(current)?{...current}:readStored()}
  function logout(redirect=true){clearSessions();cleanUrl();if(redirect!==false)goPin()}
  function buildUrl(target,params={}){
    try{
      const url=new URL(target||location.href,location.href);
      SENSITIVE_PARAMS.forEach(key=>url.searchParams.delete(key));
      Object.entries(params).forEach(([key,value])=>{if(SENSITIVE_PARAMS.includes(key))return;const v=String(value??"").trim();if(v)url.searchParams.set(key,v);else url.searchParams.delete(key)});
      return url.origin===location.origin?url.pathname+url.search+url.hash:url.toString();
    }catch(_){return String(target||"./")}
  }

  window.DIGIY_GUARD={
    VERSION:"carnet-guard-strict-pin-v3-20260716",
    module:MODULE,
    MODULE_CODE:MODULE,
    ready,boot,requireSession,getSession,
    getSlug:()=>normalizeSlug(getSession()?.slug||""),
    getPhone:()=>normalizePhone(getSession()?.phone||""),
    getModule:()=>MODULE,
    isAuthenticated:()=>!!getSession(),
    verifyPin,loginWithPin,checkAccess,
    logout,clearSession:clearSessions,clearAll:clearSessions,
    buildPinUrl,goPin,buildUrl,
    go:(target,mode)=>mode==="replace"?location.replace(buildUrl(target)):location.assign(buildUrl(target)),
    cleanUrl,getSb
  };

  cleanUrl();
  if(isPinPage()){show();return}
  hide();
  ready({redirect:true}).catch(goPin);
})();
