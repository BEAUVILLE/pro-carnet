/* ==========================================================================
   DIGIYLYFE — OREILLE MÉTIER CORE · PAY
   Fichier : assets/js/oreille-metier-core.js
   Version : 2026-05-24 · PAY pavés téléphone

   Doctrine :
   L’Oreille écoute.
   DIGIY formule.
   Le pro valide.
   PAY range.
   Rien n’est confirmé automatiquement.
   ========================================================================== */
(function () {
  "use strict";

  var VERSION = "oreille-metier-core-pay-paves-tel-20260524";
  var DEFAULT_MODULE = "PAY";

  var DEFAULT_CONFIG = {
    module: DEFAULT_MODULE,
    title: "Oreille PAY",
    subtitle: "Montant · mode · lieu · client/source · téléphone · détail · preuve.",
    storagePrefix: "DIGIY_OREILLE_METIER",
    mountSelector: "[data-digiy-oreille], #digiy-oreille-metier, #digiy-oreille-pay",
    guideText:
      "Bienvenue dans Oreille PAY DIGIYLYFE. Ici, le professionnel parle ou clique. DIGIY prépare une note d’argent. Le pro vérifie et valide. PAY range. Aucun paiement n’est confirmé automatiquement.",
    templates: []
  };

  var PAY_KEYWORDS = {
    income: ["vente", "reçu", "recette", "entrée", "entree", "encaissement", "payé", "paye", "paiement reçu", "paiement recu", "wave reçu", "cash reçu"],
    expense: ["dépense", "depense", "sortie", "achat", "payer fournisseur", "frais", "transport", "emballage", "charge"],
    debt: ["dette", "crédit", "credit", "à recevoir", "a recevoir", "reste", "reste à payer", "reste a payer", "client doit", "impayé", "impaye", "avance"],
    wave: ["wave", "wav"],
    cash: ["cash", "espèce", "espece", "liquide"]
  };

  function assign(target) {
    target = target || {};
    for (var i = 1; i < arguments.length; i += 1) {
      var source = arguments[i] || {};
      Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    }
    return target;
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();
  }

  function lower(value) { return normalizeText(value).toLowerCase(); }

  function containsAny(text, words) {
    var t = lower(text);
    return words.some(function (word) { return t.indexOf(word) !== -1; });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function nowLabel() {
    try {
      return new Date().toLocaleString("fr-FR", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch (_err) { return String(new Date()); }
  }

  function storageKey(config) {
    var moduleName = String((config && config.module) || DEFAULT_MODULE).toUpperCase().replace(/[^A-Z0-9]+/g, "_");
    var prefix = String((config && config.storagePrefix) || DEFAULT_CONFIG.storagePrefix);
    return prefix + "_" + moduleName + "_NOTES_V1";
  }

  function safeJsonParse(raw, fallback) {
    try { return JSON.parse(raw) || fallback; } catch (_err) { return fallback; }
  }

  function getNotes(config) {
    try {
      var parsed = safeJsonParse(localStorage.getItem(storageKey(config)) || "", []);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) { return []; }
  }

  function setNotes(config, notes) {
    try { localStorage.setItem(storageKey(config), JSON.stringify(Array.isArray(notes) ? notes.slice(0, 60) : [])); } catch (_err) {}
  }

  function clearNotes(config) {
    try { localStorage.removeItem(storageKey(config)); } catch (_err) {}
  }

  function detectPayMovement(text) {
    var clean = normalizeText(text);
    var movement = { type:"note", direction:"unknown", channel:"unknown", confidence:"low", warning:"À vérifier par le pro avant validation." };
    if (!clean) return movement;

    if (containsAny(clean, PAY_KEYWORDS.income)) {
      movement.type = "entree";
      movement.direction = "money_in";
      movement.confidence = "medium";
    }
    if (containsAny(clean, PAY_KEYWORDS.expense)) {
      movement.type = "sortie";
      movement.direction = "money_out";
      movement.confidence = "medium";
    }
    if (containsAny(clean, PAY_KEYWORDS.debt)) {
      movement.type = "dette_client";
      movement.direction = "receivable";
      movement.confidence = "medium";
    }
    if (containsAny(clean, PAY_KEYWORDS.wave)) movement.channel = "wave";
    else if (containsAny(clean, PAY_KEYWORDS.cash)) movement.channel = "cash";

    return movement;
  }

  function saveNote(config, text, extra) {
    var clean = normalizeText(text);
    if (!clean) return null;
    var notes = getNotes(config);
    var note = assign({ id:"note_" + Date.now(), module:String((config && config.module) || DEFAULT_MODULE).toUpperCase(), text:clean, date:nowLabel(), source:"oreille-metier", status:"draft" }, extra || {});
    notes.unshift(note);
    setNotes(config, notes);
    return note;
  }

  function formulatePay(text) {
    var clean = normalizeText(text);
    if (!clean) return "PAY · Note vide : préciser la vente, la dépense, la dette client ou le mouvement avant validation.";
    var movement = detectPayMovement(clean);
    if (movement.type === "entree") return "PAY · Entrée à vérifier : " + clean + " Le montant, le client, le lieu, la preuve et le mode de paiement doivent être confirmés par le pro avant d’être comptés comme argent reçu.";
    if (movement.type === "sortie") return "PAY · Sortie à vérifier : " + clean + " Le pro doit confirmer le montant, la catégorie, le lieu, la preuve et le mode de paiement avant rangement dans Mon argent.";
    if (movement.type === "dette_client") return "PAY · Dette client / à recevoir : " + clean + " Cette somme ne devient pas du cash tant qu’un vrai paiement n’est pas reçu et confirmé.";
    if (movement.channel === "wave") return "PAY · Note Wave : " + clean + " Vérifier le reçu Wave avant de valider le mouvement.";
    if (movement.channel === "cash") return "PAY · Note cash : " + clean + " Vérifier l’encaissement réel avant de valider le mouvement.";
    return "PAY · Note métier : " + clean + " À relire, préciser et valider par le pro avant rangement.";
  }

  function formulateGeneric(text, config) {
    var clean = normalizeText(text);
    var moduleName = String((config && config.module) || DEFAULT_MODULE).toUpperCase();
    return clean ? moduleName + " · Note métier : " + clean + " À vérifier par le pro avant envoi ou rangement." : moduleName + " · Note vide : préciser la demande avant validation.";
  }

  function formulate(text, config) {
    var moduleName = String((config && config.module) || DEFAULT_MODULE).toUpperCase();
    return moduleName === "PAY" ? formulatePay(text) : formulateGeneric(text, config);
  }

  function createToast() {
    var existing = document.getElementById("digiyOreilleToast");
    if (existing) return existing;
    var toast = document.createElement("div");
    toast.id = "digiyOreilleToast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.style.cssText = "position:fixed;left:50%;bottom:20px;transform:translateX(-50%) translateY(20px);background:#102015;color:#fff;padding:12px 16px;border-radius:999px;box-shadow:0 16px 36px rgba(0,0,0,.25);font-weight:900;opacity:0;pointer-events:none;transition:.2s ease;z-index:99999;max-width:min(92vw,620px);text-align:center";
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(message) {
    var toast = createToast();
    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
    }, 2200);
  }

  function loadVoices(callback) {
    if (!("speechSynthesis" in window)) { callback([]); return; }
    var voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) { callback(voices); return; }
    var tries = 0;
    var timer = window.setInterval(function () {
      tries += 1;
      voices = window.speechSynthesis.getVoices();
      if ((voices && voices.length) || tries > 12) { window.clearInterval(timer); callback(voices || []); }
    }, 120);
  }

  function speak(text, options) {
    if (!("speechSynthesis" in window)) { showToast("Lecture vocale non disponible ici"); return false; }
    var clean = normalizeText(text);
    if (!clean) { showToast("Rien à lire"); return false; }
    window.speechSynthesis.cancel();
    loadVoices(function (voices) {
      var utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = (options && options.lang) || "fr-FR";
      utterance.rate = (options && options.rate) || 0.86;
      utterance.pitch = (options && options.pitch) || 1.02;
      utterance.volume = (options && options.volume) || 1;
      var preferred = voices.find(function (v) { return /fr/i.test(v.lang || "") && /Google|Thomas|Daniel|Amelie|Audrey|Pauline/i.test(v.name || ""); }) || voices.find(function (v) { return /fr/i.test(v.lang || ""); }) || voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onstart = function () { showToast("DIGIY parle"); };
      utterance.onend = function () { showToast("Lecture terminée"); };
      utterance.onerror = function () { showToast("Lecture interrompue"); };
      window.speechSynthesis.speak(utterance);
    });
    return true;
  }

  function stopVoice() {
    if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); showToast("Lecture arrêtée"); return true; }
    return false;
  }

  function canListen() { return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition); }

  function listen(options) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Micro non supporté ici");
      if (options && typeof options.onError === "function") options.onError(new Error("SpeechRecognition not supported"));
      return null;
    }
    stopVoice();
    var recognition = new SpeechRecognition();
    recognition.lang = (options && options.lang) || "fr-FR";
    recognition.interimResults = true;
    recognition.continuous = false;
    var finalText = "";
    recognition.onstart = function () { showToast("Oreille ouverte"); if (options && typeof options.onStart === "function") options.onStart(); };
    recognition.onresult = function (event) {
      var interim = "";
      for (var i = event.resultIndex; i < event.results.length; i += 1) {
        var transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript + " ";
        else interim += transcript;
      }
      if (options && typeof options.onText === "function") options.onText(normalizeText(finalText + interim));
    };
    recognition.onerror = function (event) { showToast("Micro interrompu"); if (options && typeof options.onError === "function") options.onError(event); };
    recognition.onend = function () { if (options && typeof options.onEnd === "function") options.onEnd(normalizeText(finalText)); };
    recognition.start();
    return recognition;
  }

  async function copy(text) {
    var clean = normalizeText(text);
    if (!clean) { showToast("Rien à copier"); return false; }
    try { await navigator.clipboard.writeText(clean); showToast("Copié"); return true; }
    catch (_err) {
      var area = document.createElement("textarea");
      area.value = clean;
      area.setAttribute("readonly", "readonly");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.focus();
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (_copyErr) { ok = false; }
      document.body.removeChild(area);
      showToast(ok ? "Copie tentée" : "Copie impossible ici");
      return ok;
    }
  }

  function injectStyles() {
    if (document.getElementById("digiyOreilleStyles")) return;
    var style = document.createElement("style");
    style.id = "digiyOreilleStyles";
    style.textContent = `
      .digiy-oreille-box{border:1px solid rgba(24,32,20,.14)!important;border-radius:28px!important;padding:16px!important;background:#fff8e8!important;box-shadow:0 18px 38px rgba(32,24,8,.14)!important;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif!important;color:#182014!important}
      .digiy-oreille-box *{box-sizing:border-box!important}
      .digiy-oreille-head{display:block!important;margin-bottom:12px!important}
      .digiy-oreille-head strong{display:block!important;font-size:clamp(2rem,8vw,3.3rem)!important;line-height:.92!important;letter-spacing:-.06em!important;font-weight:1000!important;color:#102015!important;text-transform:uppercase!important}
      .digiy-oreille-head span{display:block!important;margin-top:8px!important;color:#5b523c!important;font-size:clamp(1.05rem,4.4vw,1.35rem)!important;font-weight:1000!important;line-height:1.22!important}
      .digiy-oreille-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;margin:14px 0!important}
      .digiy-oreille-actions button{width:100%!important;min-height:66px!important;border:1px solid rgba(24,32,20,.12)!important;border-radius:20px!important;padding:12px 10px!important;font-size:1.05rem!important;font-weight:1000!important;cursor:pointer!important;background:#fff7df!important;color:#182014!important;box-shadow:0 8px 20px rgba(32,24,8,.08)!important;text-align:center!important;line-height:1.12!important}
      .digiy-oreille-actions .primary{background:linear-gradient(135deg,#0f6b42,#134f38)!important;color:#fff!important}
      .digiy-oreille-actions .gold{background:linear-gradient(135deg,#f8dd80,#d6a63a)!important;color:#2a2108!important}
      .digiy-oreille-actions .dark{background:#11170f!important;color:#fff!important}
      .digiy-oreille-status{border-radius:18px!important;background:#102015!important;color:#d8ffe8!important;padding:13px 14px!important;font-size:1.05rem!important;font-weight:1000!important;line-height:1.34!important;margin:10px 0!important;border:1px solid rgba(250,204,21,.24)!important}
      .digiy-oreille-text{width:100%!important;min-height:132px!important;resize:vertical!important;border-radius:20px!important;border:1px solid rgba(24,32,20,.14)!important;padding:14px!important;font:inherit!important;font-size:1.08rem!important;font-weight:1000!important;line-height:1.42!important;background:#fffdf5!important;color:#182014!important;outline:none!important}
      .digiy-oreille-text:focus{border-color:rgba(15,107,66,.55)!important;box-shadow:0 0 0 4px rgba(15,107,66,.09)!important}
      .digiy-oreille-suggestions-title{margin:16px 0 9px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;color:#14532d!important;font-size:clamp(1.35rem,6vw,2.3rem)!important;line-height:.95!important;letter-spacing:-.055em!important;font-weight:1000!important;text-transform:uppercase!important}
      .digiy-oreille-suggestions-title small{color:#6b5b24!important;font-size:.78rem!important;font-weight:1000!important;letter-spacing:0!important;text-transform:none!important;white-space:nowrap!important}
      .digiy-oreille-templates{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin-top:0!important;max-height:none!important;overflow:visible!important;padding:0!important;border:0!important;background:transparent!important;scroll-snap-type:none!important}
      .digiy-oreille-template{width:100%!important;min-height:92px!important;border:2px solid rgba(15,107,66,.20)!important;border-radius:22px!important;text-align:left!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;background:linear-gradient(160deg,#fffdf4,#fff1b8)!important;color:#102015!important;padding:14px 15px!important;font-size:1.06rem!important;font-weight:1000!important;line-height:1.16!important;letter-spacing:-.02em!important;box-shadow:0 12px 26px rgba(32,24,8,.10)!important;cursor:pointer!important;overflow:visible!important;white-space:normal!important;-webkit-tap-highlight-color:transparent!important}
      .digiy-oreille-template:hover{background:linear-gradient(160deg,#fff7d8,#eaffef)!important;border-color:rgba(15,107,66,.34)!important}
      .digiy-oreille-template:active{transform:scale(.985)!important}
      .digiy-oreille-notes{display:grid!important;gap:10px!important;margin-top:12px!important}
      .digiy-oreille-note{min-height:88px!important;border-radius:22px!important;padding:14px 15px!important;background:linear-gradient(160deg,#fffdf4,#ecfff3)!important;border:2px solid rgba(15,107,66,.16)!important;font-size:1.02rem!important;font-weight:950!important;line-height:1.36!important;color:#182014!important;box-shadow:0 12px 26px rgba(32,24,8,.08)!important}
      .digiy-oreille-note b{display:block!important;margin-bottom:6px!important;font-size:1.18rem!important;font-weight:1000!important;color:#0f3b25!important;letter-spacing:-.03em!important}
      .digiy-oreille-note div{font-size:1rem!important;font-weight:950!important;line-height:1.34!important;color:#3f3828!important}
      .digiy-oreille-note small{display:block!important;color:#635b45!important;font-size:.94rem!important;font-weight:950!important;margin-top:8px!important}
      @media(max-width:760px){.digiy-oreille-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}.digiy-oreille-templates{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.digiy-oreille-template{min-height:82px!important;border-radius:19px!important;padding:11px 10px!important;font-size:.98rem!important;line-height:1.10!important}}
      @media(max-width:560px){.digiy-oreille-box{padding:13px!important;border-radius:24px!important}.digiy-oreille-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.digiy-oreille-actions button{min-height:60px!important;font-size:1rem!important;border-radius:18px!important}.digiy-oreille-text{min-height:120px!important;font-size:1.02rem!important}.digiy-oreille-suggestions-title{font-size:1.55rem!important;margin-top:14px!important}.digiy-oreille-suggestions-title small{font-size:.72rem!important}.digiy-oreille-templates{grid-template-columns:repeat(2,minmax(0,1fr))!important;max-height:360px!important;overflow-y:auto!important;padding-right:2px!important;-webkit-overflow-scrolling:touch!important}.digiy-oreille-template{min-height:78px!important;font-size:.94rem!important;padding:10px!important;border-radius:18px!important;box-shadow:0 8px 18px rgba(32,24,8,.09)!important}.digiy-oreille-note b{font-size:1.12rem!important}}
      @media(max-width:340px){.digiy-oreille-template{font-size:.88rem!important;min-height:74px!important;padding:9px!important}}
    `;
    document.head.appendChild(style);
  }

  function renderNotes(container, config) {
    if (!container) return;
    var notes = getNotes(config);
    container.innerHTML = "";
    if (!notes.length) {
      var empty = document.createElement("div");
      empty.className = "digiy-oreille-note";
      empty.innerHTML = "<b>Aucune note rangée</b><div>Teste une suggestion, puis clique sur Ranger.</div>";
      container.appendChild(empty);
      return;
    }
    notes.forEach(function (note) {
      var div = document.createElement("div");
      div.className = "digiy-oreille-note";
      div.innerHTML = "<b>" + escapeHtml(note.module || config.module || DEFAULT_MODULE) + "</b><div>" + escapeHtml(note.text) + "</div><small>" + escapeHtml(note.date || "") + "</small>";
      container.appendChild(div);
    });
  }

  function mount(userConfig) {
    var config = assign({}, DEFAULT_CONFIG, userConfig || {});
    var target = typeof config.target === "string" ? document.querySelector(config.target) : config.target;
    if (!target && config.mountSelector) target = document.querySelector(config.mountSelector);
    if (!target) return null;
    injectStyles();
    target.innerHTML =
      '<section class="digiy-oreille-box" aria-label="' + escapeHtml(config.title) + '">' +
      '<div class="digiy-oreille-head"><strong>🎙️ ' + escapeHtml(config.title) + '</strong><span>' + escapeHtml(config.subtitle) + '</span></div>' +
      '<div class="digiy-oreille-actions">' +
      '<button type="button" class="primary" data-action="listen">🎙️ Parler</button>' +
      '<button type="button" class="gold" data-action="formulate">✨ Formuler</button>' +
      '<button type="button" data-action="copy">📋 Copier</button>' +
      '<button type="button" data-action="save">🗂️ Ranger</button>' +
      '<button type="button" data-action="guide">🎧 Guide</button>' +
      '<button type="button" class="dark" data-action="stop">⏹ Stop</button>' +
      '</div>' +
      '<div class="digiy-oreille-status" data-role="status">Oreille prête. Le pro parle ou clique, DIGIY formule.</div>' +
      '<textarea class="digiy-oreille-text" data-role="text" aria-label="Texte Oreille Métier">' + escapeHtml((config.templates && config.templates[0]) || "") + '</textarea>' +
      '<div class="digiy-oreille-suggestions-title">Suggestions <small>tap rapide</small></div>' +
      '<div class="digiy-oreille-templates" data-role="templates"></div>' +
      '<div class="digiy-oreille-notes" data-role="notes"></div>' +
      '</section>';

    var status = target.querySelector('[data-role="status"]');
    var textArea = target.querySelector('[data-role="text"]');
    var templatesBox = target.querySelector('[data-role="templates"]');
    var notesBox = target.querySelector('[data-role="notes"]');
    function setStatus(message) { if (status) status.textContent = message; }
    function refreshNotes() { renderNotes(notesBox, config); }

    (config.templates || []).forEach(function (template) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "digiy-oreille-template";
      btn.textContent = template;
      btn.addEventListener("click", function () {
        textArea.value = template;
        setStatus("Suggestion chargée. Le pro peut modifier avant de copier ou ranger.");
      });
      templatesBox.appendChild(btn);
    });

    target.addEventListener("click", function (event) {
      var actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      var action = actionEl.getAttribute("data-action");
      if (action === "listen") listen({ onStart:function(){ setStatus("Oreille ouverte. Parle naturellement, puis vérifie le texte."); }, onText:function(txt){ textArea.value = txt; }, onEnd:function(){ setStatus("Parole captée. Clique sur Formuler pour préparer une note métier."); }, onError:function(){ setStatus("Micro indisponible ou interrompu. Utilise les suggestions prêtes."); } });
      if (action === "formulate") { textArea.value = formulate(textArea.value, config); setStatus("Texte formulé. Le pro doit relire et valider."); showToast("Formulé"); }
      if (action === "copy") copy(textArea.value).then(function () { setStatus("Texte copié. Tu peux le coller dans WhatsApp, SMS ou une fiche métier."); });
      if (action === "save") {
        var movement = config.module === "PAY" ? detectPayMovement(textArea.value) : {};
        var saved = saveNote(config, textArea.value, { movement:movement });
        if (saved) { refreshNotes(); setStatus("Note rangée localement. Le pro garde la main."); showToast("Note rangée"); }
        else showToast("Rien à ranger");
      }
      if (action === "guide") speak(config.guideText);
      if (action === "stop") stopVoice();
    });
    refreshNotes();
    return { config:config, target:target, formulate:function(){ textArea.value = formulate(textArea.value, config); return textArea.value; }, getText:function(){ return textArea.value; }, setText:function(value){ textArea.value = normalizeText(value); }, refreshNotes:refreshNotes };
  }

  window.DigiyOreilleMetier = { version:VERSION, init:mount, mount:mount, speak:speak, stopVoice:stopVoice, listen:listen, canListen:canListen, copy:copy, formulate:formulate, formulatePay:formulatePay, detectPayMovement:detectPayMovement, normalizeText:normalizeText, saveNote:saveNote, getNotes:getNotes, setNotes:setNotes, clearNotes:clearNotes, showToast:showToast };
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = function () {};
})();
