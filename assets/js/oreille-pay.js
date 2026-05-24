/* ==========================================================================
   DIGIYLYFE — OREILLE PAY V2
   Fichier : assets/js/oreille-pay.js
   Version : 2026-05-24 · V2 pavés + client/source + téléphone
   Dépendance : assets/js/oreille-metier-core.js

   Doctrine :
   L’Oreille écoute.
   DIGIY formule.
   Le pro valide.
   PAY range.
   Le client appartient au pro.
   Aucun paiement n’est confirmé automatiquement.
   Aucune provenance n’est inscrite en dur dans le moule.
   ========================================================================== */

(function () {
  "use strict";

  var VERSION = "oreille-pay-v2-20260524-paves-client-tel";

  var CLIENTS_KEY = "DIGIY_PAY_CLIENTS_LOCAL_V1";

  var PAY_GUIDE =
    "Bienvenue dans Oreille PAY DIGIYLYFE. " +
    "Ici, le professionnel peut parler ou cliquer pour préparer une note d’argent plus complète. " +
    "Un montant seul ne suffit pas. PAY aide à préciser le montant, le mode de paiement, la provenance, le client ou la source, le téléphone, le détail et la preuve. " +
    "La provenance reste libre, car chaque professionnel a ses propres activités. " +
    "PAY peut aussi garder une fiche client locale avec le nom, le téléphone et la dernière trace utile. " +
    "Mais PAY ne confirme jamais seul un paiement. " +
    "Une dette client ne devient pas du cash tant qu’un vrai paiement n’est pas reçu et vérifié. " +
    "L’Oreille prépare. DIGIY formule. Le pro relit. Le pro valide. PAY range. " +
    "Le terrain garde la main.";

  var PAY_TEMPLATES = [
    "💰 Vente reçue — montant · mode · client/source · téléphone · provenance libre · détail · preuve.",
    "💸 Dépense — montant · catégorie · fournisseur/source · téléphone si utile · raison · preuve.",
    "📒 Dette client — client · téléphone · montant dû · date prévue · détail · statut.",
    "🌊 Encaissement Wave — montant · client/source · téléphone · provenance · reçu/preuve.",
    "💵 Paiement cash — montant · client/source · téléphone · provenance · détail.",
    "🤝 Avance client — montant reçu · client · téléphone · solde restant · date prévue.",
    "✅ Règlement dette — client · téléphone · montant payé · partiel ou total · reste à recevoir.",
    "📦 Achat fournisseur — fournisseur · téléphone · montant · catégorie · mode · preuve.",
    "🚕 Frais transport — montant · raison · activité/provenance libre · preuve.",
    "⚠️ Doute / brouillon — garder en note, demander les détails, ne pas valider la caisse."
  ];

  var PAY_CONFIG = {
    module: "PAY",
    title: "Oreille PAY",
    subtitle: "Montant · provenance libre · client/source · téléphone · détail · preuve.",
    storagePrefix: "DIGIY_OREILLE_METIER",
    guideText: PAY_GUIDE,
    templates: PAY_TEMPLATES
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.!?;:])/g, "$1")
      .trim();
  }

  function lower(value) {
    return normalizeText(value).toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function findMountTarget() {
    return (
      document.querySelector("#digiy-oreille-pay") ||
      document.querySelector("[data-digiy-oreille-pay]") ||
      document.querySelector("[data-digiy-pay-oreille]") ||
      document.querySelector("#digiy-oreille-metier") ||
      document.querySelector("[data-digiy-oreille]")
    );
  }

  function extractAmount(text) {
    var clean = normalizeText(text);
    var match = clean.match(/(\d[\d\s.,]*)\s*(fcfa|f\s*cfa|xof|cfa|€|eur|euro|euros)?/i);

    if (!match) {
      return { amount: null, currency: null };
    }

    var rawAmount = String(match[1] || "").replace(/\s/g, "").replace(",", ".");
    var amount = Number(rawAmount);
    var rawCurrency = String(match[2] || "").toLowerCase();
    var currency = null;

    if (/fcfa|f\s*cfa|xof|cfa/.test(rawCurrency)) currency = "XOF";
    if (/€|eur|euro|euros/.test(rawCurrency)) currency = "EUR";

    return {
      amount: isFinite(amount) ? amount : null,
      currency: currency
    };
  }

  function extractPhone(text) {
    var clean = normalizeText(text);

    var explicit = clean.match(/(?:tel|tél|telephone|téléphone|phone|numéro|numero)\s*[:\-]?\s*((?:\+?\d[\d\s().-]{6,}\d))/i);
    if (explicit && explicit[1]) return normalizeText(explicit[1]);

    var any = clean.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
    return any ? normalizeText(any[0]) : "";
  }

  function extractField(text, labels) {
    var clean = normalizeText(text);

    for (var i = 0; i < labels.length; i += 1) {
      var label = labels[i];

      var re = new RegExp(
        "(?:^|[\\s;,.|—-])" +
          label +
          "\\s*[:\\-]?\\s*([^;|\\n]+?)(?=\\s+(?:client|source|tel|tél|telephone|téléphone|provenance|activité|activite|détail|detail|preuve|montant|mode)\\s*[:\\-]|$)",
        "i"
      );

      var match = clean.match(re);
      if (match && match[1]) {
        return normalizeText(match[1]);
      }
    }

    return "";
  }

  function extractClientName(text) {
    var explicit = extractField(text, [
      "client\\/source",
      "client",
      "source",
      "nom",
      "personne"
    ]);

    if (explicit) return explicit;

    var clean = normalizeText(text);

    var pour = clean.match(/\b(?:pour|de la part de|chez)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'.-]{1,40})/i);
    if (pour && pour[1]) {
      var candidate = normalizeText(pour[1])
        .replace(/\b(?:cash|wave|fcfa|cfa|xof|euro|euros|eur)\b.*$/i, "")
        .trim();

      if (candidate && candidate.length <= 45) return candidate;
    }

    return "";
  }

  function extractProvenance(text) {
    return extractField(text, [
      "provenance",
      "activité",
      "activite",
      "origine",
      "module",
      "source argent",
      "source d'argent"
    ]);
  }

  function extractDetail(text) {
    return extractField(text, [
      "détail",
      "detail",
      "raison",
      "objet",
      "produit",
      "service",
      "course",
      "note"
    ]);
  }

  function extractProof(text) {
    var proof = extractField(text, ["preuve", "reçu", "recu", "justificatif"]);
    if (proof) return proof;

    var t = lower(text);
    if (/preuve oui|reçu oui|recu oui|justificatif oui|photo oui/.test(t)) return "oui";
    if (/preuve non|reçu non|recu non|justificatif non|photo non/.test(t)) return "non";
    if (/reçu|recu|preuve|photo|capture/.test(t)) return "à vérifier";

    return "";
  }

  function guessPayCategory(text) {
    var t = lower(text);

    if (/dette|crédit|credit|à recevoir|a recevoir|reste|impayé|impaye|client doit/.test(t)) {
      return "dette_client";
    }

    if (/dépense|depense|sortie|achat|fournisseur|frais|charge|transport|emballage/.test(t)) {
      return "sortie";
    }

    if (/avance/.test(t)) {
      return "avance";
    }

    if (/vente|recette|entrée|entree|encaissement|payé|paye|paiement reçu|paiement recu|j’ai encaissé|j'ai encaissé|encaissé|encaisse/.test(t)) {
      return "entree";
    }

    return "note";
  }

  function guessPayChannel(text) {
    var t = lower(text);

    if (/wave|wav/.test(t)) return "wave";
    if (/cash|espèce|espece|liquide/.test(t)) return "cash";
    if (/orange money|om\b/.test(t)) return "orange_money";
    if (/virement|banque/.test(t)) return "banque";

    return "inconnu";
  }

  function missingFields(draft) {
    var missing = [];

    if (!draft.amount) missing.push("montant");
    if (!draft.channel || draft.channel === "inconnu") missing.push("mode");
    if (!draft.provenance) missing.push("provenance libre");
    if (!draft.client_name) missing.push("client/source");
    if (!draft.client_phone) missing.push("téléphone");
    if (!draft.detail) missing.push("détail");
    if (!draft.proof) missing.push("preuve");

    return missing;
  }

  function buildPayDraft(text) {
    var clean = normalizeText(text);
    var amountData = extractAmount(clean);
    var category = guessPayCategory(clean);
    var channel = guessPayChannel(clean);

    var draft = {
      module: "PAY",
      raw_text: clean,
      category: category,
      channel: channel,
      amount: amountData.amount,
      currency: amountData.currency,
      provenance: extractProvenance(clean),
      client_name: extractClientName(clean),
      client_phone: extractPhone(clean),
      detail: extractDetail(clean),
      proof: extractProof(clean),
      status: "draft",
      warning: "À vérifier par le pro avant validation.",
      created_at: new Date().toISOString()
    };

    draft.missing = missingFields(draft);

    return draft;
  }

  function labelCategory(category) {
    if (category === "entree") return "Entrée à vérifier";
    if (category === "sortie") return "Sortie à vérifier";
    if (category === "dette_client") return "Dette client / à recevoir";
    if (category === "avance") return "Avance à vérifier";
    return "Note métier";
  }

  function formatPayDraftMessage(draft) {
    if (!draft || !draft.raw_text) {
      return "PAY · Note vide : préciser montant, mode, provenance, client/source, téléphone, détail et preuve avant validation.";
    }

    var amountPart = draft.amount
      ? "Montant : " + draft.amount + (draft.currency ? " " + draft.currency : "")
      : "Montant : à préciser";

    var channelPart =
      draft.channel && draft.channel !== "inconnu"
        ? "Mode : " + draft.channel
        : "Mode : à préciser";

    var provenancePart = "Provenance : " + (draft.provenance || "à préciser librement");
    var clientPart = "Client/source : " + (draft.client_name || "à préciser");
    var phonePart = "Téléphone : " + (draft.client_phone || "à préciser");
    var detailPart = "Détail : " + (draft.detail || "à préciser");
    var proofPart = "Preuve : " + (draft.proof || "à vérifier");

    var warning =
      "Le pro doit relire et valider avant rangement dans Mon argent.";

    if (draft.category === "dette_client") {
      warning =
        "Cette somme reste à recevoir. Elle ne devient pas du cash tant qu’un vrai paiement n’est pas confirmé.";
    }

    var missing =
      draft.missing && draft.missing.length
        ? "Manque : " + draft.missing.join(", ") + ". "
        : "Trace complète à vérifier. ";

    return (
      "PAY · " +
      labelCategory(draft.category) +
      " — " +
      amountPart +
      " · " +
      channelPart +
      " · " +
      provenancePart +
      " · " +
      clientPart +
      " · " +
      phonePart +
      " · " +
      detailPart +
      " · " +
      proofPart +
      ". " +
      missing +
      warning +
      " Texte d’origine : " +
      draft.raw_text
    );
  }

  function formulatePayDeep(text) {
    return formatPayDraftMessage(buildPayDraft(text));
  }

  function getClients() {
    try {
      var raw = localStorage.getItem(CLIENTS_KEY) || "[]";
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function setClients(clients) {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify((clients || []).slice(0, 200)));
    } catch (_err) {}
  }

  function upsertClientFromDraft(draft) {
    if (!draft || (!draft.client_name && !draft.client_phone)) return null;

    var clients = getClients();
    var phone = normalizeText(draft.client_phone);
    var name = normalizeText(draft.client_name) || "Source sans nom";

    var found = null;

    if (phone) {
      found = clients.find(function (c) {
        return normalizeText(c.phone) === phone;
      });
    }

    if (!found && name) {
      found = clients.find(function (c) {
        return lower(c.name) === lower(name);
      });
    }

    var now = new Date().toISOString();

    if (found) {
      found.name = found.name || name;
      found.phone = found.phone || phone;
      found.last_provenance = draft.provenance || found.last_provenance || "";
      found.last_detail = draft.detail || found.last_detail || "";
      found.last_category = draft.category || found.last_category || "note";
      found.last_channel = draft.channel || found.last_channel || "";
      found.last_amount = draft.amount || found.last_amount || null;
      found.updated_at = now;
    } else {
      found = {
        id: "pay_client_" + Date.now(),
        name: name,
        phone: phone,
        type: draft.category === "sortie" ? "fournisseur/source" : "client/source",
        last_provenance: draft.provenance || "",
        last_detail: draft.detail || "",
        last_category: draft.category || "note",
        last_channel: draft.channel || "",
        last_amount: draft.amount || null,
        notes: "",
        created_at: now,
        updated_at: now
      };

      clients.unshift(found);
    }

    setClients(clients);
    return found;
  }

  function injectPayStyles() {
    if (document.getElementById("digiyOreillePayV2Styles")) return;

    var style = document.createElement("style");
    style.id = "digiyOreillePayV2Styles";
    style.textContent =
      ".digiy-pay-help{margin:10px 0 0;border:1px dashed rgba(83,58,26,.24);border-radius:18px;background:rgba(250,204,21,.13);padding:12px;color:#3d3324;font-weight:950;line-height:1.35}" +
      ".digiy-pay-help b{color:#6b4e09}" +
      ".digiy-oreille-templates{grid-template-columns:repeat(2,minmax(0,1fr))!important}" +
      ".digiy-oreille-template{min-height:92px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;border-radius:20px!important;font-size:14px!important}" +
      ".digiy-pay-client-mini{margin-top:10px;border:1px solid rgba(24,32,20,.14);border-radius:18px;background:#fffdf4;padding:12px;font-weight:850;color:#182014;line-height:1.35}" +
      ".digiy-pay-client-mini b{display:block;margin-bottom:4px;color:#14532d}" +
      "@media(max-width:620px){.digiy-oreille-templates{grid-template-columns:1fr!important}.digiy-oreille-template{min-height:78px!important}}";

    document.head.appendChild(style);
  }

  function addPayHelp(target) {
    if (!target || target.querySelector(".digiy-pay-help")) return;

    var status = target.querySelector(".digiy-oreille-status");
    if (!status) return;

    var help = document.createElement("div");
    help.className = "digiy-pay-help";
    help.innerHTML =
      "<b>PAY demande une trace complète.</b><br>" +
      "Montant · mode · provenance libre · client/source · téléphone · détail · preuve. " +
      "La provenance n’est pas figée : chaque pro écrit la sienne.";

    status.insertAdjacentElement("afterend", help);
  }

  function addClientPreview(target) {
    if (!target || target.querySelector(".digiy-pay-client-mini")) return;

    var notes = target.querySelector(".digiy-oreille-notes");
    if (!notes) return;

    var box = document.createElement("div");
    box.className = "digiy-pay-client-mini";
    box.innerHTML =
      "<b>📇 Fichier client PAY local</b>" +
      "<span>Quand tu ranges une note avec nom ou téléphone, PAY garde une trace client/source sur cet appareil.</span>";

    notes.insertAdjacentElement("beforebegin", box);
  }

  function patchInstanceButtons(target, core) {
    if (!target) return;

    target.addEventListener(
      "click",
      function (event) {
        var actionEl = event.target.closest("[data-action]");
        if (!actionEl) return;

        var action = actionEl.getAttribute("data-action");
        var textArea = target.querySelector(".digiy-oreille-text");
        var status = target.querySelector(".digiy-oreille-status");

        if (!textArea) return;

        if (action === "formulate") {
          window.setTimeout(function () {
            textArea.value = formulatePayDeep(textArea.value);
            if (status) status.textContent = "Trace PAY préparée. Complète les champs manquants puis valide.";
          }, 0);
        }

        if (action === "save") {
          window.setTimeout(function () {
            var draft = buildPayDraft(textArea.value);
            upsertClientFromDraft(draft);

            if (status) {
              status.textContent =
                draft.missing && draft.missing.length
                  ? "Note rangée en brouillon. Il manque : " + draft.missing.join(", ") + "."
                  : "Note rangée. Client/source local mis à jour si nom ou téléphone présent.";
            }

            if (core && typeof core.showToast === "function") {
              core.showToast("PAY rangé en brouillon");
            }
          }, 0);
        }
      },
      true
    );
  }

  function exposePayApi(core) {
    window.DigiyOreillePAY = {
      version: VERSION,
      config: PAY_CONFIG,
      templates: PAY_TEMPLATES.slice(),
      guideText: PAY_GUIDE,
      clientsKey: CLIENTS_KEY,

      detect: function (text) {
        return buildPayDraft(text);
      },

      formulate: function (text) {
        return formulatePayDeep(text);
      },

      getClients: getClients,
      setClients: setClients,

      saveDraft: function (text) {
        var draft = buildPayDraft(text);
        var message = formatPayDraftMessage(draft);

        upsertClientFromDraft(draft);

        if (!core || typeof core.saveNote !== "function") {
          return null;
        }

        return core.saveNote(PAY_CONFIG, message, {
          pay_draft: draft,
          movement: draft
        });
      },

      speakGuide: function () {
        if (core && typeof core.speak === "function") core.speak(PAY_GUIDE);
      },

      stopVoice: function () {
        if (core && typeof core.stopVoice === "function") core.stopVoice();
      }
    };
  }

  function mountPayOreille(core) {
    var target = findMountTarget();

    exposePayApi(core);
    injectPayStyles();

    if (!target) {
      console.info(
        "[DIGIY Oreille PAY] Aucun conteneur trouvé. Ajoute <div id=\"digiy-oreille-pay\"></div> pour afficher l’oreille."
      );
      return;
    }

    if (target.getAttribute("data-digiy-oreille-mounted") === "1") {
      return;
    }

    target.setAttribute("data-digiy-oreille-mounted", "1");

    var instance = core.mount({
      target: target,
      module: PAY_CONFIG.module,
      title: PAY_CONFIG.title,
      subtitle: PAY_CONFIG.subtitle,
      storagePrefix: PAY_CONFIG.storagePrefix,
      guideText: PAY_CONFIG.guideText,
      templates: PAY_CONFIG.templates
    });

    window.DigiyOreillePAY.instance = instance || null;

    addPayHelp(target);
    addClientPreview(target);
    patchInstanceButtons(target, core);

    console.info("[DIGIY Oreille PAY V2] montée avec succès.");
  }

  function bootPayOreille() {
    var tries = 0;
    var maxTries = 30;

    function attempt() {
      tries += 1;

      var core = window.DigiyOreilleMetier;

      if (core && typeof core.mount === "function") {
        mountPayOreille(core);
        return;
      }

      if (tries >= maxTries) {
        console.warn(
          "[DIGIY Oreille PAY] Core introuvable. Vérifie que oreille-metier-core.js est chargé avant oreille-pay.js."
        );
        return;
      }

      window.setTimeout(attempt, 100);
    }

    attempt();
  }

  ready(bootPayOreille);
})();
