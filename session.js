/* DIGIY PAY — session.js
   Rôle : lire la session PAY locale, nettoyer l’URL visible,
   fournir window.DIGIY_SESSION aux pages PAY.
   Ce fichier doit rester du JavaScript pur. Aucun HTML ici.
*/
(function(){
  "use strict";

  const VERSION = "pay-session-js-clean-final-20260602";
  const MODULE = "PAY";

  const SENSITIVE_KEYS = [
    "phone","tel","p_phone","owner_phone","subscription_phone","checkout_phone",
    "pin","pin4","token","session_token","slug","compte","module","return","redirect",
    "redirect_url","url","from","v"
  ];

  const SESSION_JSON_KEYS = [
    "digiy_pay_session",
    "DIGIY_PAY_SESSION",
    "DIGIY_PAY_PRO_SESSION",
    "DIGIY_PAY_PIN_SESSION",
    "DIGIY_SESSION_PAY",
    "DIGIY_PIN_SESSION",
    "DIGIY_ACCESS",
    "digiy_session_pay",
    "digiy_guard_session:PAY",
    "digiy_guard_session",
    "DIGIY_SESSION",
    "digiy_session"
  ];

  const SLUG_KEYS = [
    "digiy_pay_slug",
    "digiy_pay_last_slug",
    "DIGIY_PAY_SLUG",
    "DIGIY_PAY_COMPTE",
    "digiy_last_slug",
    "DIGIY_SLUG",
    "pay_slug",
    "compte"
  ];

  const PHONE_KEYS = [
    "digiy_pay_phone",
    "digiy_pay_last_phone",
    "DIGIY_PAY_PHONE",
    "digiy_phone",
    "DIGIY_PHONE",
    "pay_phone",
    "phone"
  ];

  function readStore(key){
    try{
      const s = sessionStorage.getItem(key);
      if(s) return s;
    }catch(_){}
    try{
      const l = localStorage.getItem(key);
      if(l) return l;
    }catch(_){}
    return "";
  }

  function writeStore(key, value, localToo){
    if(value == null || String(value).trim() === "") return;
    const v = String(value).trim();
    try{ sessionStorage.setItem(key, v); }catch(_){}
    if(localToo){
      try{ localStorage.setItem(key, v); }catch(_){}
    }
  }

  function removeStore(key){
    try{ sessionStorage.removeItem(key); }catch(_){}
    try{ localStorage.removeItem(key); }catch(_){}
  }

  function parseJson(raw){
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(_){ return null; }
  }

  function normPhone(v){
    const d = String(v || "").replace(/[^\d]/g, "");
    if(!d) return "";
    if(d.length === 9) return "221" + d;
    return d.slice(0, 15);
  }

  function normSlug(v){
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function firstRaw(keys){
    for(const key of keys){
      const value = readStore(key);
      if(String(value || "").trim()) return value;
    }
    return "";
  }

  function normalizeCandidate(obj){
    if(!obj || typeof obj !== "object") return {};

    const sources = [
      obj,
      obj.session,
      obj.state,
      obj.data,
      obj.payload,
      obj.guard_state,
      obj.user,
      obj.account
    ].filter(Boolean);

    const out = {
      module: MODULE,
      slug: "",
      compte: "",
      phone: "",
      access: false,
      ok: false,
      raw: obj
    };

    for(const src of sources){
      out.slug =
        out.slug ||
        normSlug(src.slug || src.compte || src.account_slug || src.workspace_slug || src.pay_slug || "");

      out.compte =
        out.compte ||
        normSlug(src.compte || src.slug || src.account_slug || src.workspace_slug || src.pay_slug || "");

      out.phone =
        out.phone ||
        normPhone(src.phone || src.tel || src.owner_phone || src.user_phone || src.pay_phone || "");

      if(
        src.access_ok === true ||
        src.access === true ||
        src.has_access === true ||
        src.ok === true ||
        src.valid === true ||
        src.pin_session_ok === true ||
        src.verified === true
      ){
        out.access = true;
        out.ok = true;
      }
    }

    if(out.slug && !out.compte) out.compte = out.slug;
    if(out.compte && !out.slug) out.slug = out.compte;

    return out;
  }

  function getFromJsonKeys(){
    for(const key of SESSION_JSON_KEYS){
      const parsed = normalizeCandidate(parseJson(readStore(key)));
      if(parsed.slug || parsed.phone || parsed.access || parsed.ok) return parsed;
    }
    return {};
  }

  function getFromSimpleKeys(){
    const slug = normSlug(firstRaw(SLUG_KEYS));
    const phone = normPhone(firstRaw(PHONE_KEYS));
    if(!slug && !phone) return {};
    return {
      module: MODULE,
      slug,
      compte: slug,
      phone,
      access: true,
      ok: true,
      raw: {}
    };
  }

  function getFromUrl(){
    try{
      const u = new URL(location.href);
      const slug = normSlug(u.searchParams.get("slug") || u.searchParams.get("compte") || "");
      const phone = normPhone(u.searchParams.get("phone") || u.searchParams.get("tel") || "");
      if(!slug && !phone) return {};
      return {
        module: MODULE,
        slug,
        compte: slug,
        phone,
        access: true,
        ok: true,
        raw: {}
      };
    }catch(_){
      return {};
    }
  }

  function mergeSession(){
    const url = getFromUrl();
    const json = getFromJsonKeys();
    const simple = getFromSimpleKeys();

    const slug = url.slug || json.slug || simple.slug || "";
    const phone = url.phone || json.phone || simple.phone || "";
    const access = !!(url.access || json.access || simple.access || slug || phone);

    const session = {
      module: MODULE,
      slug,
      compte: slug,
      phone,
      access,
      access_ok: access,
      ok: access,
      source: url.slug || url.phone ? "url" : json.slug || json.phone ? "json" : simple.slug || simple.phone ? "storage" : "none",
      created_at: new Date().toISOString()
    };

    if(slug){
      writeStore("digiy_pay_slug", slug, true);
      writeStore("digiy_pay_last_slug", slug, true);
      writeStore("DIGIY_PAY_SLUG", slug, true);
    }

    if(phone){
      writeStore("digiy_pay_phone", phone, true);
      writeStore("digiy_pay_last_phone", phone, true);
      writeStore("DIGIY_PAY_PHONE", phone, true);
    }

    if(access){
      try{
        sessionStorage.setItem("digiy_pay_session", JSON.stringify(session));
        sessionStorage.setItem("DIGIY_SESSION_PAY", JSON.stringify(session));
        sessionStorage.setItem("DIGIY_PAY_SESSION", JSON.stringify(session));
      }catch(_){}
    }

    return session;
  }

  function cleanVisibleUrl(){
    try{
      const url = new URL(location.href);
      let changed = false;

      SENSITIVE_KEYS.forEach(function(key){
        if(url.searchParams.has(key)){
          url.searchParams.delete(key);
          changed = true;
        }
      });

      if(changed){
        history.replaceState({}, document.title, url.pathname + url.search + url.hash);
      }
    }catch(_){}
  }

  function get(){
    return mergeSession();
  }

  function requireSession(loginUrl){
    const session = mergeSession();

    if(session && session.ok && (session.slug || session.phone)){
      cleanVisibleUrl();
      return session;
    }

    const target = loginUrl || window.DIGIY_LOGIN_URL || "./pin.html";

    try{
      const redirect = location.pathname.split("/").pop() || "hub.html";
      const joiner = target.includes("?") ? "&" : "?";
      location.href = target + joiner + "redirect=" + encodeURIComponent(redirect);
    }catch(_){
      location.href = target;
    }

    return null;
  }

  function clear(){
    [
      ...SESSION_JSON_KEYS,
      ...SLUG_KEYS,
      ...PHONE_KEYS,
      "digiy_pay_session",
      "DIGIY_SESSION_PAY",
      "digiy_pay_access_ok",
      "DIGIY_PAY_ACCESS_OK"
    ].forEach(removeStore);
  }

  function boot(){
    const session = mergeSession();
    cleanVisibleUrl();
    return session;
  }

  window.DIGIY_SESSION = {
    version: VERSION,
    module: MODULE,
    boot,
    get,
    getSession: get,
    require: requireSession,
    clear,
    cleanVisibleUrl
  };

  boot();
})();













































































































































































































































