function boolFromRpcData(data){
  const raw = Array.isArray(data) ? data[0] : data;

  if(raw === true) return true;
  if(raw === 1) return true;

  if(typeof raw === "string"){
    const txt = raw.trim().toLowerCase();

    if(txt === "true" || txt === "t" || txt === "1" || txt === "yes" || txt === "ok"){
      return true;
    }

    if(txt.startsWith("(")){
      const first = txt.replace(/^\(/, "").split(",")[0];
      const token = String(first || "").trim().replace(/^"|"$/g, "").toLowerCase();
      if(token === "t" || token === "true" || token === "1") return true;
    }

    return false;
  }

  if(raw && typeof raw === "object"){
    if(raw.ok === true) return true;
    if(raw.access === true) return true;
    if(raw.access_ok === true) return true;
    if(raw.has_access === true) return true;
    if(raw.allowed === true) return true;
    if(raw.active === true) return true;
    if(raw.is_active === true) return true;
    if(raw.subscribed === true) return true;
    if(raw.valid === true) return true;

    const vals = Object.values(raw);
    if(vals.some((v) => v === true || v === 1 || v === "t" || v === "true")){
      return true;
    }
  }

  return false;
}

async function tryAccessRpc(name, payloads){
  for(const body of payloads){
    try{
      const { data, error } = await sb.rpc(name, body);
      if(error) continue;

      if(boolFromRpcData(data)){
        return true;
      }
    }catch(_){}
  }

  return false;
}

async function callHasAccess(phone){
  const cleanPhone = SESSION.normalizePhone(phone);
  if(!cleanPhone) return false;

  const abosPayloads = [
    { p_phone: cleanPhone, p_module: "PAY" },
    { phone: cleanPhone, module: "PAY" },
    { p_phone: cleanPhone, p_module: "pay" },
    { phone: cleanPhone, module: "pay" }
  ];

  // 1. Vérité principale : rail ABOS central.
  const abosOk = await tryAccessRpc("digiy_has_module_access_from_abos", abosPayloads);
  if(abosOk) return true;

  const legacyPayloads = [
    { p_phone: cleanPhone, p_module: "PAY" },
    { phone: cleanPhone, module: "PAY" },
    { p_phone: cleanPhone, p_module: "pay" },
    { phone: cleanPhone, module: "pay" }
  ];

  // 2. Secours transition : ancien rail.
  const legacyOk = await tryAccessRpc("digiy_has_access", legacyPayloads);
  if(legacyOk) return true;

  return false;
}
