// guard.js — DIGIY PAY PRO / MON ARGENT
// Doctrine : PIN une seule fois -> session locale fraîche 8h -> navigation interne directe
// Rail ABOS : digiy_has_module_access_from_abos(phone, "PAY") d'abord
// Secours transition : digiy_has_access(phone, "PAY")
// Sécurité : ne jamais exposer téléphone / slug sensible dans l'URL

(function () {
  "use strict";

  const CFG = {
    SUPABASE_URL:
      window.DIGIY_SUPABASE_URL ||
      "https://wesqmwjjtsefyjnluosj.supabase.co",

    SUPABASE_ANON_KEY:
      window.DIGIY_SUPABASE_ANON_KEY ||
      window.DIGIY_SUPABASE_ANON ||
      "sb_publishable_tGHItRgeWDmGjnd0CK1DVQ_BIep4Ug3",

    MODULE_CODE: "PAY",
    MODULE_CODE_LOWER: "pay",

    SESSION_MAX_AGE_MS: 8 * 60 * 60 * 1000,

    PIN_PATH: window.DIGIY_LOGIN_URL || "./pin.html",

    STORAGE: {
      SESSION_KEYS: [
        "DIGIY_PAY_SESSION",
        "DIGIY_PAY_PIN_SESSION",
        "DIGIY_SESSION_PAY",
        "digiy_pay_session",
        "digiy_guard_pay_session",
        "digiy_guard_session"
      ],
      SLUG_KEY: "digiy_pay_slug",
      PHONE_KEY: "digiy_pay_phone",
      LAST_SLUG_KEY: "digiy_pay_last_slug",
      LAST_PHONE_KEY: "digiy_pay_last_phone",
      HUB_PHONE_KEY: "DIGIY_PAY_HUB_PHONE"
    },

    RPC: {
      VERIFY_PIN: "digiy_verify_pin",
      HAS_MODULE_ACCESS_FROM_ABOS: "digiy_has_module_access_from_abos",
      HAS_ACCESS_LEGACY: "digiy_has_access"
    },

    TABLES: {
      SUBSCRIPTIONS_PUBLIC: "digiy_subscriptions_public"
    }
  };

  const MODULE = CFG.MODULE_CODE;
  const MODULE_LOWER = CFG.MODULE_CODE_LOWER;

  let pendingPromise = null;
  let supabaseClient = null;

  const state = {
    module: MODULE,
    slug: "",
    phone: "",
    access: false,
    access_ok: false,
    pin_session_ok: false,
    ready_flag: false,
    reason: "booting",
    source: "none",
    validated_at: null,
    verified_at: null,
    expires_at: null,
    pin_url: ""
  };

  function nowMs() {
    return Date.now();
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function safeJsonParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function normalizePhone(value) {
    const session = window.DIGIY_SESSION;
    if (session && typeof session.normalizePhone === "function") {
      return session.normalizePhone(value);
    }

    const digits = String(value || "").replace(/[^\d]/g, "");
    if (!digits) return "";
    if (digits.startsWith("221") && digits.length === 12) return digits;
    if (digits.length === 9) return "221" + digits;
    return digits;
  }

  function normalizeSlug(value) {
    const session = window.DIGIY_SESSION;
    if (session && typeof session.normalizeSlug === "function") {
      return session.normalizeSlug(value);
    }

    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "");
  }

  function normalizePin(value) {
    return String(value || "").trim().replace(/\s+/g, "");
  }

  function parseTime(value) {
    if (value === null || value === undefined || value === "") return 0;

    if (typeof value === "number" && Number.isFinite(value)) {
      return value < 100000000000 ? value * 1000 : value;
    }

    const str = String(value).trim();
    if (!str) return 0;

    if (/^\d+$/.test(str)) {
      const n = Number(str);
      if (!Number.isFinite(n)) return 0;
      return n < 100000000000 ? n * 1000 : n;
    }

    const d = Date.parse(str);
    return Number.isFinite(d) ? d : 0;
  }

  function isFresh(ts) {
    const n = parseTime(ts);
    if (!n) return false;
    return nowMs() - n <= CFG.SESSION_MAX_AGE_MS;
  }

  function isSensitiveSlug(slug) {
    return /\d{7,}/.test(String(slug || ""));
  }

  function canExposeSlug(slug) {
    const s = normalizeSlug(slug);
    return !!s && !isSensitiveSlug(s);
  }

  function isLoginPage() {
    const path = String(location.pathname || "").toLowerCase();
    return path.endsWith("/pin.html") || path.endsWith("pin.html");
  }

  function isPublicEntryPage() {
    const path = String(location.pathname || "").toLowerCase();
    return path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("index.html");
  }

  function hidePage() {
    try {
      document.documentElement.style.visibility = "hidden";
    } catch (_) {}
  }

  function showPage() {
    try {
      document.documentElement.style.visibility = "";
    } catch (_) {}
  }

  function readSession(key) {
    try {
      return sessionStorage.getItem(key) || "";
    } catch (_) {
      return "";
    }
  }

  function readLocal(key) {
    try {
      return localStorage.getItem(key) || "";
    } catch (_) {
      return "";
    }
  }

  function writeSession(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (_) {}
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {}
  }

  function removeSession(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (_) {}
  }

  function removeLocal(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  }

  function removeBoth(key) {
    removeSession(key);
    removeLocal(key);
  }

  function jsonHeaders() {
    return {
      apikey: CFG.SUPABASE_ANON_KEY,
      Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Accept: "application/json"
    };
  }

  function getHeaders() {
    return {
      apikey: CFG.SUPABASE_ANON_KEY,
      Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY,
      Accept: "application/json"
    };
  }

  async function rpc(name, body) {
    const res = await fetch(CFG.SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(body || {})
    });

    const data = await res.json().catch(function () {
      return null;
    });

    return {
      ok: res.ok,
      status: res.status,
      data: data
    };
  }

  async function tableGet(table, paramsObj) {
    const params = new URLSearchParams(paramsObj || {});

    const res = await fetch(CFG.SUPABASE_URL + "/rest/v1/" + table + "?" + params.toString(), {
      method: "GET",
      headers: getHeaders()
    });

    const data = await res.json().catch(function () {
      return null;
    });

    return {
      ok: res.ok,
      status: res.status,
      data: data
    };
  }

  function boolFromRpcData(data) {
    const raw = Array.isArray(data) ? data[0] : data;

    if (raw === true) return true;
    if (raw === 1) return true;

    if (typeof raw === "string") {
      const txt = raw.trim().toLowerCase();

      if (txt === "true" || txt === "t" || txt === "1" || txt === "yes" || txt === "ok") {
        return true;
      }

      if (txt.startsWith("(")) {
        const first = txt.replace(/^\(/, "").split(",")[0];
        const token = String(first || "").trim().replace(/^"|"$/g, "").toLowerCase();
        if (token === "t" || token === "true" || token === "1") return true;
      }

      return false;
    }

    if (raw && typeof raw === "object") {
      if (raw.ok === true) return true;
      if (raw.access === true) return true;
      if (raw.access_ok === true) return true;
      if (raw.has_access === true) return true;
      if (raw.allowed === true) return true;
      if (raw.active === true) return true;
      if (raw.is_active === true) return true;
      if (raw.subscribed === true) return true;
      if (raw.valid === true) return true;

      const vals = Object.values(raw);
      if (vals.some(function (v) {
        return v === true || v === 1 || v === "t" || v === "true";
      })) {
        return true;
      }
    }

    return false;
  }

  function cleanVisibleUrl(contextSlug) {
    try {
      const url = new URL(location.href);
      let changed = false;

      [
        "phone",
        "tel",
        "owner_phone",
        "owner_id",
        "pay_phone",
        "wallet_phone",
        "wave_phone",
        "business_phone",
        "pin",
        "code",
        "token",
        "session",
        "access",
        "pay_slug",
        "subscription_slug",
        "référence",
        "pay_référence",
        "subscription_référence"
      ].forEach(function (key) {
        if (url.searchParams.has(key)) {
          url.searchParams.delete(key);
          changed = true;
        }
      });

      const urlSlug = normalizeSlug(url.searchParams.get("slug") || "");
      const finalSlug = normalizeSlug(contextSlug || urlSlug || "");

      if (urlSlug && isSensitiveSlug(urlSlug)) {
        url.searchParams.delete("slug");
        changed = true;
      }

      if (finalSlug && isSensitiveSlug(finalSlug) && url.searchParams.has("slug")) {
        url.searchParams.delete("slug");
        changed = true;
      }

      if (changed) {
        history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch (_) {}
  }

  function sanitizeReturnUrl(value) {
    try {
      const url = new URL(value || location.href, location.href);

      if (url.origin !== location.origin) {
        return location.pathname;
      }

      [
        "phone",
        "tel",
        "owner_phone",
        "owner_id",
        "pay_phone",
        "wallet_phone",
        "wave_phone",
        "business_phone",
        "pin",
        "code",
        "token",
        "session",
        "access"
      ].forEach(function (key) {
        url.searchParams.delete(key);
      });

      const slug = normalizeSlug(url.searchParams.get("slug") || "");
      if (slug && isSensitiveSlug(slug)) {
        url.searchParams.delete("slug");
      }

      return url.pathname + url.search + url.hash;
    } catch (_) {
      return location.pathname;
    }
  }

  function buildPinUrl(input) {
    const payload = input || {};
    const url = new URL(CFG.PIN_PATH, location.href);
    const slug = normalizeSlug(payload.slug || state.slug || "");

    [
      "phone",
      "tel",
      "owner_phone",
      "owner_id",
      "pay_phone",
      "pin",
      "code",
      "token",
      "session",
      "access"
    ].forEach(function (key) {
      url.searchParams.delete(key);
    });

    if (canExposeSlug(slug)) {
      url.searchParams.set("slug", slug);
    } else {
      url.searchParams.delete("slug");
    }

    url.searchParams.set("return", sanitizeReturnUrl(location.href));

    if (url.origin === location.origin) {
      return url.pathname + url.search + url.hash;
    }

    return url.toString();
  }

  function goPin(input) {
    const payload = input || {};
    const slug = normalizeSlug(payload.slug || state.slug || "");
    const phone = normalizePhone(payload.phone || state.phone || "");

    if (slug) saveSlugOnly(slug);
    if (phone) savePhoneOnly(phone);

    location.replace(buildPinUrl({ slug: slug, phone: phone }));
  }

  function buildSafeUrl(path, params) {
    const url = new URL(path || location.href, location.href);

    [
      "phone",
      "tel",
      "owner_phone",
      "owner_id",
      "pay_phone",
      "pin",
      "code",
      "token",
      "session",
      "access"
    ].forEach(function (key) {
      url.searchParams.delete(key);
    });

    Object.entries(params || {}).forEach(function ([key, value]) {
      const clean = String(value == null ? "" : value).trim();

      if (["phone", "tel", "owner_phone", "owner_id", "pay_phone"].includes(key)) return;

      if (key === "slug") {
        const slug = normalizeSlug(clean);
        if (canExposeSlug(slug)) url.searchParams.set("slug", slug);
        else url.searchParams.delete("slug");
        return;
      }

      if (clean) url.searchParams.set(key, clean);
      else url.searchParams.delete(key);
    });

    const slug = normalizeSlug(url.searchParams.get("slug") || "");
    if (slug && isSensitiveSlug(slug)) {
      url.searchParams.delete("slug");
    }

    if (url.origin === location.origin) {
      return url.pathname + url.search + url.hash;
    }

    return url.toString();
  }

  function saveSlugOnly(slug) {
    const clean = normalizeSlug(slug);
    if (!clean) return;

    writeSession(CFG.STORAGE.SLUG_KEY, clean);
    writeSession(CFG.STORAGE.LAST_SLUG_KEY, clean);

    if (canExposeSlug(clean)) {
      writeLocal(CFG.STORAGE.SLUG_KEY, clean);
      writeLocal(CFG.STORAGE.LAST_SLUG_KEY, clean);
    } else {
      removeLocal(CFG.STORAGE.SLUG_KEY);
      removeLocal(CFG.STORAGE.LAST_SLUG_KEY);
    }
  }

  function savePhoneOnly(phone) {
    const clean = normalizePhone(phone);
    if (!clean) return;

    writeSession(CFG.STORAGE.PHONE_KEY, clean);
    writeSession(CFG.STORAGE.LAST_PHONE_KEY, clean);
    writeSession(CFG.STORAGE.HUB_PHONE_KEY, clean);

    removeLocal(CFG.STORAGE.PHONE_KEY);
    removeLocal(CFG.STORAGE.LAST_PHONE_KEY);
    removeLocal(CFG.STORAGE.HUB_PHONE_KEY);

    window.DIGIY_PAY_HUB_PHONE = clean;
  }

  function readUrlContext() {
    try {
      const qs = new URLSearchParams(location.search || "");

      return {
        slug: normalizeSlug(
          qs.get("slug") ||
          qs.get("pay_slug") ||
          qs.get("subscription_slug") ||
          qs.get("référence") ||
          ""
        ),
        phone: normalizePhone(
          qs.get("phone") ||
          qs.get("tel") ||
          qs.get("owner_phone") ||
          qs.get("pay_phone") ||
          ""
        )
      };
    } catch (_) {
      return { slug: "", phone: "" };
    }
  }

  function readSavedSlug() {
    const urlCtx = readUrlContext();

    const candidate =
      urlCtx.slug ||
      readSession(CFG.STORAGE.SLUG_KEY) ||
      readSession(CFG.STORAGE.LAST_SLUG_KEY) ||
      readLocal(CFG.STORAGE.SLUG_KEY) ||
      readLocal(CFG.STORAGE.LAST_SLUG_KEY) ||
      "";

    const clean = normalizeSlug(candidate);

    if (clean && isSensitiveSlug(clean)) {
      removeLocal(CFG.STORAGE.SLUG_KEY);
      removeLocal(CFG.STORAGE.LAST_SLUG_KEY);
    }

    return clean;
  }

  function readSavedPhone() {
    const urlCtx = readUrlContext();

    return normalizePhone(
      urlCtx.phone ||
      readSession(CFG.STORAGE.PHONE_KEY) ||
      readSession(CFG.STORAGE.LAST_PHONE_KEY) ||
      readSession(CFG.STORAGE.HUB_PHONE_KEY) ||
      window.DIGIY_PAY_HUB_PHONE ||
      ""
    );
  }

  function clearSessionsOnly() {
    CFG.STORAGE.SESSION_KEYS.forEach(function (key) {
      removeBoth(key);
    });
  }

  function clearAllLocalState() {
    clearSessionsOnly();

    [
      CFG.STORAGE.SLUG_KEY,
      CFG.STORAGE.PHONE_KEY,
      CFG.STORAGE.LAST_SLUG_KEY,
      CFG.STORAGE.LAST_PHONE_KEY,
      CFG.STORAGE.HUB_PHONE_KEY
    ].forEach(removeBoth);

    try {
      delete window.DIGIY_PAY_HUB_PHONE;
    } catch (_) {}
  }

  function readStoredSession() {
    for (const key of CFG.STORAGE.SESSION_KEYS) {
      let parsed = safeJsonParse(readSession(key));
      if (!parsed) parsed = safeJsonParse(readLocal(key));

      if (!parsed || typeof parsed !== "object") continue;

      const moduleName = String(parsed.module || parsed.module_code || MODULE).toUpperCase();
      const slug = normalizeSlug(parsed.slug || parsed.référence || parsed.reference || "");
      const phone = normalizePhone(parsed.phone || "");
      const access =
        parsed.access === true ||
        parsed.access_ok === true ||
        parsed.ok === true ||
        parsed.has_access === true ||
        parsed.pin_session_ok === true;

      const verifiedAt =
        parseTime(parsed.verified_at) ||
        parseTime(parsed.validated_at) ||
        parseTime(parsed.validated_at_ms) ||
        parseTime(parsed.ts) ||
        parseTime(parsed.created_at);

      const expiresAt = parseTime(parsed.expires_at || parsed.expiresAt || 0);

      const ageOk =
        (expiresAt && nowMs() < expiresAt) ||
        (verifiedAt && isFresh(verifiedAt));

      if (!slug && !phone) continue;
      if (moduleName && moduleName !== MODULE) continue;
      if (!access) continue;
      if (!ageOk) continue;

      return {
        key: key,
        module: MODULE,
        slug: slug,
        phone: phone,
        access: true,
        access_ok: true,
        pin_session_ok: true,
        verified_at: verifiedAt || nowMs(),
        validated_at: new Date(verifiedAt || nowMs()).toISOString(),
        expires_at: expiresAt || nowMs() + CFG.SESSION_MAX_AGE_MS
      };
    }

    return null;
  }

  function saveSession(payload) {
    const p = payload || {};

    const verifiedAtMs =
      parseTime(p.verified_at || p.validated_at_ms || p.validated_at || 0) ||
      nowMs();

    const expiresAtMs =
      parseTime(p.expires_at || 0) ||
      verifiedAtMs + CFG.SESSION_MAX_AGE_MS;

    const session = {
      module: MODULE,
      slug: normalizeSlug(p.slug || p.référence || state.slug || ""),
      phone: normalizePhone(p.phone || state.phone || ""),
      access: !!p.access,
      access_ok: !!p.access,
      pin_session_ok: !!p.access,
      verified_at: verifiedAtMs,
      validated_at: p.validated_at || nowIso(),
      expires_at: expiresAtMs,
      ts: nowMs()
    };

    const raw = JSON.stringify(session);

    CFG.STORAGE.SESSION_KEYS.forEach(function (key) {
      writeSession(key, raw);
      writeLocal(key, raw);
    });

    if (session.slug) saveSlugOnly(session.slug);
    if (session.phone) savePhoneOnly(session.phone);

    if (window.DIGIY_SESSION && typeof window.DIGIY_SESSION.save === "function") {
      try {
        window.DIGIY_SESSION.save(session.slug, session.phone);
      } catch (_) {}
    }

    try {
      window.DIGIY_ACCESS = Object.assign({}, window.DIGIY_ACCESS || {}, session);
    } catch (_) {}

    cleanVisibleUrl(session.slug);

    return session;
  }

  async function resolveSubBySlug(slug) {
    const s = normalizeSlug(slug);
    if (!s) return null;

    const tries = [
      { select: "phone,slug,module", slug: "eq." + s, module: "eq." + MODULE, limit: "1" },
      { select: "phone,slug,module", slug: "eq." + s, module: "eq." + MODULE_LOWER, limit: "1" },
      { select: "phone,slug,module", slug: "eq." + s, limit: "1" }
    ];

    for (const params of tries) {
      const res = await tableGet(CFG.TABLES.SUBSCRIPTIONS_PUBLIC, params);

      if (!res.ok || !Array.isArray(res.data) || !res.data[0]) continue;

      return {
        slug: normalizeSlug(res.data[0].slug),
        phone: normalizePhone(res.data[0].phone),
        module: String(res.data[0].module || MODULE).toUpperCase()
      };
    }

    return null;
  }

  async function resolveSubByPhone(phone) {
    const p = normalizePhone(phone);
    if (!p) return null;

    const tries = [
      { select: "phone,slug,module", phone: "eq." + p, module: "eq." + MODULE, limit: "1" },
      { select: "phone,slug,module", phone: "eq." + p, module: "eq." + MODULE_LOWER, limit: "1" },
      { select: "phone,slug,module", phone: "eq." + p, limit: "1" }
    ];

    for (const params of tries) {
      const res = await tableGet(CFG.TABLES.SUBSCRIPTIONS_PUBLIC, params);

      if (!res.ok || !Array.isArray(res.data) || !res.data[0]) continue;

      return {
        slug: normalizeSlug(res.data[0].slug),
        phone: normalizePhone(res.data[0].phone),
        module: String(res.data[0].module || MODULE).toUpperCase()
      };
    }

    return null;
  }

  async function tryAccessRpc(name, payloads) {
    for (const body of payloads) {
      try {
        const res = await rpc(name, body);
        if (!res.ok) continue;
        if (boolFromRpcData(res.data)) return true;
      } catch (_) {}
    }

    return false;
  }

  async function checkAccessFromAbos(phone) {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return false;

    const payloads = [
      { p_phone: cleanPhone, p_module: MODULE },
      { phone: cleanPhone, module: MODULE },
      { p_phone: cleanPhone, p_module: MODULE_LOWER },
      { phone: cleanPhone, module: MODULE_LOWER }
    ];

    return tryAccessRpc(CFG.RPC.HAS_MODULE_ACCESS_FROM_ABOS, payloads);
  }

  async function checkAccessLegacy(phone) {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return false;

    const payloads = [
      { p_phone: cleanPhone, p_module: MODULE },
      { phone: cleanPhone, module: MODULE },
      { p_phone: cleanPhone, p_module: MODULE_LOWER },
      { phone: cleanPhone, module: MODULE_LOWER }
    ];

    return tryAccessRpc(CFG.RPC.HAS_ACCESS_LEGACY, payloads);
  }

  async function checkAccess(phone) {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return false;

    const abosOk = await checkAccessFromAbos(cleanPhone);
    if (abosOk) return true;

    const legacyOk = await checkAccessLegacy(cleanPhone);
    if (legacyOk) return true;

    return false;
  }

  function parseVerifyPinPayload(data, fallbackPhone, fallbackSlug) {
    const raw = Array.isArray(data) ? data[0] : data;
    if (!raw) return null;

    if (typeof raw === "object" && !Array.isArray(raw)) {
      if (raw.ok === true || raw.access_ok === true || raw.valid === true || raw.success === true) {
        return {
          ok: true,
          phone: normalizePhone(raw.phone || raw.p_phone || fallbackPhone || ""),
          slug: normalizeSlug(raw.slug || raw.référence || raw.reference || raw.owner_slug || fallbackSlug || "")
        };
      }

      const vals = Object.values(raw);
      if (vals.length >= 3) {
        const okLike =
          vals[0] === true ||
          vals[0] === "t" ||
          vals[0] === "true" ||
          vals[0] === 1;

        if (okLike) {
          return {
            ok: true,
            phone: normalizePhone(vals[2] || fallbackPhone || ""),
            slug: normalizeSlug(fallbackSlug || "")
          };
        }
      }
    }

    if (typeof raw === "string") {
      const txt = raw.trim();

      if (txt.startsWith("(") && txt.endsWith(")")) {
        const m = txt.match(/^\(([^,]+),([^,]+),([^,]+),?(.*)\)$/);

        if (m) {
          const okToken = String(m[1] || "").trim().replace(/^"|"$/g, "");
          const okLike =
            okToken === "t" ||
            okToken === "true" ||
            okToken === "1";

          if (okLike) {
            return {
              ok: true,
              phone: normalizePhone(String(m[3] || "").trim().replace(/^"|"$/g, "") || fallbackPhone || ""),
              slug: normalizeSlug(fallbackSlug || "")
            };
          }
        }
      }
    }

    if (raw === true) {
      return {
        ok: true,
        phone: normalizePhone(fallbackPhone || ""),
        slug: normalizeSlug(fallbackSlug || "")
      };
    }

    return null;
  }

  async function verifyPin(phone, pin, slug) {
    const cleanPhone = normalizePhone(phone);
    const cleanPin = normalizePin(pin);
    const cleanSlug = normalizeSlug(slug);

    if (!cleanPhone || !cleanPin) {
      return {
        ok: false,
        error: "Téléphone ou code manquant."
      };
    }

    const tries = [
      { p_phone: cleanPhone, p_module: MODULE, p_pin: cleanPin },
      { p_phone: cleanPhone, p_module: MODULE_LOWER, p_pin: cleanPin }
    ];

    for (const body of tries) {
      const res = await rpc(CFG.RPC.VERIFY_PIN, body);
      if (!res.ok) continue;

      const parsed = parseVerifyPinPayload(res.data, cleanPhone, cleanSlug);
      if (!parsed || !parsed.ok) continue;

      return {
        ok: true,
        phone: normalizePhone(parsed.phone || cleanPhone),
        slug: normalizeSlug(parsed.slug || cleanSlug)
      };
    }

    return {
      ok: false,
      error: "Code incorrect."
    };
  }

  async function loginWithPin(identifierOrSlug, pin, explicitPhone) {
    const rawIdentifier = String(identifierOrSlug || "").trim();
    const cleanPin = normalizePin(pin);

    if (!cleanPin) {
      return {
        ok: false,
        error: "Code manquant."
      };
    }

    let slug = "";
    let phone = normalizePhone(explicitPhone || state.phone || readSavedPhone() || "");

    const maybePhone = normalizePhone(rawIdentifier);
    const maybeSlug = normalizeSlug(rawIdentifier);

    if (maybePhone && maybePhone.length >= 8) {
      phone = maybePhone;
    } else if (maybeSlug) {
      slug = maybeSlug;
    }

    if (!slug) slug = normalizeSlug(state.slug || readSavedSlug() || "");
    if (!phone) phone = normalizePhone(state.phone || readSavedPhone() || "");

    if (!phone && slug) {
      const sub = await resolveSubBySlug(slug);
      phone = normalizePhone(sub && sub.phone ? sub.phone : "");
      if (!state.slug && sub && sub.slug) slug = normalizeSlug(sub.slug);
    }

    if (!slug && phone) {
      const sub = await resolveSubByPhone(phone);
      slug = normalizeSlug(sub && sub.slug ? sub.slug : "");
    }

    if (!phone) {
      return {
        ok: false,
        error: "Téléphone PAY introuvable."
      };
    }

    if (!slug && phone) {
      slug = "pay-" + phone;
    }

    const auth = await verifyPin(phone, cleanPin, slug);

    if (!auth.ok) {
      return auth;
    }

    const finalPhone = normalizePhone(auth.phone || phone);
    let finalSlug = normalizeSlug(auth.slug || slug || "");

    if (!finalSlug && finalPhone) {
      const sub = await resolveSubByPhone(finalPhone);
      finalSlug = normalizeSlug(sub && sub.slug ? sub.slug : "");
    }

    if (!finalSlug && finalPhone) {
      finalSlug = "pay-" + finalPhone;
    }

    const accessOk = await checkAccess(finalPhone);

    if (!accessOk) {
      return {
        ok: false,
        error: "Accès PAY non actif."
      };
    }

    const saved = saveSession({
      slug: finalSlug,
      phone: finalPhone,
      access: true,
      verified_at: nowMs(),
      validated_at: nowIso()
    });

    Object.assign(state, {
      module: MODULE,
      slug: saved.slug,
      phone: saved.phone,
      access: true,
      access_ok: true,
      pin_session_ok: true,
      ready_flag: true,
      reason: "pin_ok",
      source: "pin",
      verified_at: saved.verified_at,
      validated_at: saved.validated_at,
      expires_at: saved.expires_at,
      pin_url: buildPinUrl(saved)
    });

    cleanVisibleUrl(saved.slug);
    showPage();

    return {
      ok: true,
      slug: saved.slug,
      phone: saved.phone
    };
  }

  async function boot(options) {
    const opts = Object.assign(
      {
        redirect: true,
        preserve_validation: true
      },
      options || {}
    );

    cleanVisibleUrl(state.slug);

    const stored = readStoredSession();
    const urlCtx = readUrlContext();

    let slug = normalizeSlug(urlCtx.slug || stored?.slug || state.slug || readSavedSlug() || "");
    let phone = normalizePhone(urlCtx.phone || stored?.phone || state.phone || readSavedPhone() || "");

    if (slug) saveSlugOnly(slug);
    if (phone) savePhoneOnly(phone);

    if (slug && !phone) {
      const sub = await resolveSubBySlug(slug);
      if (sub && sub.phone) {
        phone = normalizePhone(sub.phone);
        savePhoneOnly(phone);
      }
    }

    if (phone && !slug) {
      const sub = await resolveSubByPhone(phone);
      if (sub && sub.slug) {
        slug = normalizeSlug(sub.slug);
        saveSlugOnly(slug);
      }
    }

    const freshSession =
      stored &&
      stored.access &&
      (
        (stored.expires_at && nowMs() < parseTime(stored.expires_at)) ||
        isFresh(stored.verified_at) ||
        isFresh(stored.validated_at)
      );

    if (freshSession) {
      const saved = saveSession({
        slug: slug || stored.slug,
        phone: phone || stored.phone,
        access: true,
        verified_at: stored.verified_at || nowMs(),
        expires_at: stored.expires_at || nowMs() + CFG.SESSION_MAX_AGE_MS,
        validated_at: stored.validated_at || nowIso()
      });

      Object.assign(state, {
        module: MODULE,
        slug: saved.slug,
        phone: saved.phone,
        access: true,
        access_ok: true,
        pin_session_ok: true,
        ready_flag: true,
        reason: "session_valid",
        source: "session",
        verified_at: saved.verified_at,
        validated_at: saved.validated_at,
        expires_at: saved.expires_at,
        pin_url: buildPinUrl(saved)
      });

      cleanVisibleUrl(saved.slug);
      showPage();

      return {
        ok: true,
        session: { ...state },
        source: "session"
      };
    }

    if (!opts.preserve_validation) {
      clearSessionsOnly();
    }

    Object.assign(state, {
      module: MODULE,
      slug: slug,
      phone: phone,
      access: false,
      access_ok: false,
      pin_session_ok: false,
      ready_flag: true,
      reason: slug || phone ? "login_required" : "missing_context",
      source: slug || phone ? "context" : "none",
      verified_at: null,
      validated_at: null,
      expires_at: null,
      pin_url: buildPinUrl({ slug: slug, phone: phone })
    });

    showPage();

    if (opts.redirect !== false && !isLoginPage()) {
      goPin({ slug: slug, phone: phone });
    }

    return {
      ok: false,
      session: { ...state },
      reason: state.reason
    };
  }

  function ready(options) {
    const opts = Object.assign(
      {
        redirect: true,
        preserve_validation: true
      },
      options || {}
    );

    if (opts.redirect !== false && !isLoginPage() && !isPublicEntryPage()) {
      hidePage();
    }

    if (state.ready_flag) {
      showPage();
      return Promise.resolve({
        ok: !!state.access_ok,
        session: { ...state },
        reason: state.reason
      });
    }

    if (!pendingPromise) {
      pendingPromise = boot(opts).finally(function () {
        pendingPromise = null;
      });
    }

    return pendingPromise;
  }

  async function requireSession(options) {
    const opts = Object.assign(
      {
        redirect: true,
        to: CFG.PIN_PATH
      },
      options || {}
    );

    const res = await ready({
      redirect: opts.redirect,
      preserve_validation: true
    });

    if (res && res.ok && state.access_ok) {
      return { ...state };
    }

    if (opts.redirect !== false) {
      goPin({ slug: state.slug, phone: state.phone });
    }

    return null;
  }

  function getSession() {
    if (state.access_ok) {
      return { ...state };
    }

    const stored = readStoredSession();

    if (stored) {
      return {
        module: MODULE,
        slug: stored.slug,
        phone: stored.phone,
        access: stored.access,
        access_ok: stored.access_ok,
        pin_session_ok: stored.pin_session_ok,
        verified_at: stored.verified_at,
        validated_at: stored.validated_at,
        expires_at: stored.expires_at
      };
    }

    return {
      module: MODULE,
      slug: state.slug || readSavedSlug(),
      phone: state.phone || readSavedPhone(),
      access: false,
      access_ok: false,
      pin_session_ok: false,
      reason: state.reason || "no_session"
    };
  }

  function logout(redirect) {
    const keepSlug = state.slug;

    clearAllLocalState();

    Object.assign(state, {
      module: MODULE,
      slug: keepSlug || "",
      phone: "",
      access: false,
      access_ok: false,
      pin_session_ok: false,
      ready_flag: true,
      reason: "logout",
      source: "logout",
      verified_at: null,
      validated_at: null,
      expires_at: null,
      pin_url: buildPinUrl({ slug: keepSlug })
    });

    cleanVisibleUrl(keepSlug);
    showPage();

    if (redirect !== false) {
      goPin({ slug: keepSlug, phone: "" });
    }
  }

  function go(target, mode) {
    const finalTarget = buildSafeUrl(target || location.href, {
      slug: canExposeSlug(state.slug) ? state.slug : ""
    });

    if (mode === "replace") {
      location.replace(finalTarget);
    } else {
      location.assign(finalTarget);
    }
  }

  function getSb() {
    if (supabaseClient) return supabaseClient;

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      return null;
    }

    supabaseClient = window.supabase.createClient(
      CFG.SUPABASE_URL,
      CFG.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey: "digiy-pay-guard-auth"
        }
      }
    );

    window.sb = supabaseClient;
    return supabaseClient;
  }

  window.DIGIY_GUARD = {
    VERSION: "pay-guard-abos-central-v1-20260522",
    module: MODULE,
    MODULE_CODE: MODULE,
    state: state,

    ready: ready,
    boot: boot,
    requireSession: requireSession,

    getSession: getSession,

    getSlug: function () {
      return normalizeSlug(state.slug || readSavedSlug() || "");
    },

    getPhone: function () {
      return normalizePhone(state.phone || readSavedPhone() || "");
    },

    getModule: function () {
      return MODULE;
    },

    isAuthenticated: function () {
      return !!state.access_ok;
    },

    saveSession: function (payload) {
      const saved = saveSession(Object.assign({}, payload || {}, { access: true }));

      Object.assign(state, {
        module: MODULE,
        slug: saved.slug,
        phone: saved.phone,
        access: true,
        access_ok: true,
        pin_session_ok: true,
        ready_flag: true,
        reason: "manual_save",
        verified_at: saved.verified_at,
        validated_at: saved.validated_at,
        expires_at: saved.expires_at,
        pin_url: buildPinUrl(saved)
      });

      return saved;
    },

    clearSession: function () {
      clearSessionsOnly();

      Object.assign(state, {
        access: false,
        access_ok: false,
        pin_session_ok: false,
        ready_flag: false,
        reason: "session_cleared"
      });
    },

    clearAll: function () {
      clearAllLocalState();

      Object.assign(state, {
        slug: "",
        phone: "",
        access: false,
        access_ok: false,
        pin_session_ok: false,
        ready_flag: false,
        reason: "all_cleared"
      });

      cleanVisibleUrl();
    },

    loginWithPin: loginWithPin,
    verifyPin: verifyPin,
    logout: logout,

    checkAccess: checkAccess,
    checkAccessFromAbos: checkAccessFromAbos,
    checkAccessLegacy: checkAccessLegacy,

    resolveSubBySlug: resolveSubBySlug,
    resolveSubByPhone: resolveSubByPhone,

    buildPinUrl: function (input) {
      return buildPinUrl(Object.assign({}, state, input || {}));
    },

    goPin: function (input) {
      return goPin(Object.assign({}, state, input || {}));
    },

    buildUrl: function (target, params) {
      return buildSafeUrl(target, params || {});
    },

    go: go,
    cleanUrl: function () {
      cleanVisibleUrl(state.slug);
    },

    getSb: getSb
  };

  cleanVisibleUrl();

  if (isPublicEntryPage() || isLoginPage()) {
    ready({ redirect: false }).catch(function () {
      showPage();
    });
  } else {
    ready({ redirect: true }).catch(function () {
      showPage();
    });
  }
})();
