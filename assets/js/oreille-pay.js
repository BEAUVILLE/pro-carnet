/* ==========================================================================
   DIGIYLYFE — OREILLE PAY
   Fichier : assets/js/oreille-pay.js
   Version : 2026-05-24
   Dépendance : assets/js/oreille-metier-core.js

   Doctrine :
   L’Oreille écoute.
   DIGIY formule.
   Le pro valide.
   PAY range.
   Aucun paiement n’est confirmé automatiquement.
   ========================================================================== */

(function () {
  "use strict";

  var VERSION = "oreille-pay-20260524";

  var PAY_GUIDE =
    "Bienvenue dans Oreille PAY DIGIYLYFE. " +
    "Ici, le professionnel peut parler ou cliquer pour préparer une note d’argent. " +
    "Il peut noter une vente, une dépense, une dette client, un encaissement Wave ou un paiement cash. " +
    "Mais PAY ne confirme jamais seul un paiement. " +
    "Une dette client ne devient pas du cash tant qu’un vrai paiement n’est pas reçu et vérifié. " +
    "L’Oreille prépare la phrase. DIGIY formule. Le pro relit. Le pro valide. PAY range. " +
    "Le terrain garde la main.";

  var PAY_TEMPLATES = [
    "Vente reçue : montant à préciser, mode de paiement à confirmer, note à ranger dans Mon argent.",
    "Dépense notée : vérifier le montant, la catégorie et le mode de paiement avant validation.",
    "Dette client ouverte : noter le client, le montant dû, la date prévue et le statut à recevoir.",
    "Encaissement Wave : vérifier le reçu avant de compter l’argent comme reçu.",
    "Paiement cash : vérifier l’argent reçu avant de valider l’entrée.",
    "Avance client : noter le montant reçu, le solde restant et la date prévue.",
    "Règlement dette client : préciser paiement partiel ou total avant de solder.",
    "Achat fournisseur : noter montant, fournisseur, catégorie et mode de paiement.",
    "Frais de transport : noter montant, raison et mode de paiement.",
    "Erreur ou doute : garder en note brouillon, ne pas valider dans la caisse."
  ];

  var PAY_CONFIG = {
    module: "PAY",
    title: "Oreille PAY",
    subtitle: "Le pro parle ou clique. DIGIY formule. Le pro valide. PAY range.",
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

  function findMountTarget() {
    return (
      document.querySelector("#digiy-oreille-pay") ||
      document.querySelector("[data-digiy-oreille-pay]") ||
      document.querySelector("[data-digiy-pay-oreille]") ||
      document.querySelector("#digiy-oreille-metier") ||
      document.querySelector("[data-digiy-oreille]")
    );
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.!?;:])/g, "$1")
      .trim();
  }

  function extractAmount(text) {
    var clean = normalizeText(text);
    var match = clean.match(/(\d[\d\s.,]*)\s*(fcfa|f\s*cfa|xof|cfa|€|eur|euro|euros)?/i);

    if (!match) {
      return {
        amount: null,
        currency: null
      };
    }

    var rawAmount = String(match[1] || "").replace(/\s/g, "").replace(",", ".");
    var amount = Number(rawAmount);
    var rawCurrency = String(match[2] || "").toLowerCase();

    var currency = null;

    if (/fcfa|f\s*cfa|xof|cfa/.test(rawCurrency)) {
      currency = "XOF";
    }

    if (/€|eur|euro|euros/.test(rawCurrency)) {
      currency = "EUR";
    }

    return {
      amount: isFinite(amount) ? amount : null,
      currency: currency
    };
  }

  function guessPayCategory(text) {
    var t = normalizeText(text).toLowerCase();

    if (/dette|crédit|credit|à recevoir|a recevoir|reste|impayé|impaye|client doit/.test(t)) {
      return "dette_client";
    }

    if (/dépense|depense|sortie|achat|fournisseur|frais|charge|transport|emballage/.test(t)) {
      return "sortie";
    }

    if (/vente|recette|entrée|entree|encaissement|payé|paye|paiement reçu|paiement recu/.test(t)) {
      return "entree";
    }

    if (/avance/.test(t)) {
      return "avance";
    }

    return "note";
  }

  function guessPayChannel(text) {
    var t = normalizeText(text).toLowerCase();

    if (/wave|wav/.test(t)) return "wave";
    if (/cash|espèce|espece|liquide/.test(t)) return "cash";
    if (/orange money|om\b/.test(t)) return "orange_money";
    if (/virement|banque/.test(t)) return "banque";

    return "inconnu";
  }

  function buildPayDraft(text) {
    var clean = normalizeText(text);
    var amountData = extractAmount(clean);
    var category = guessPayCategory(clean);
    var channel = guessPayChannel(clean);

    return {
      module: "PAY",
      raw_text: clean,
      category: category,
      channel: channel,
      amount: amountData.amount,
      currency: amountData.currency,
      status: "draft",
      warning: "À vérifier par le pro avant validation.",
      created_at: new Date().toISOString()
    };
  }

  function formatPayDraftMessage(draft) {
    if (!draft || !draft.raw_text) {
      return "PAY · Note vide : préciser le mouvement avant validation.";
    }

    var label = "Note métier";

    if (draft.category === "entree") label = "Entrée à vérifier";
    if (draft.category === "sortie") label = "Sortie à vérifier";
    if (draft.category === "dette_client") label = "Dette client / à recevoir";
    if (draft.category === "avance") label = "Avance à vérifier";

    var amountPart = draft.amount
      ? " Montant détecté : " + draft.amount + (draft.currency ? " " + draft.currency : "") + "."
      : " Montant à préciser.";

    var channelPart = draft.channel && draft.channel !== "inconnu"
      ? " Mode détecté : " + draft.channel + "."
      : " Mode de paiement à préciser.";

    var warning = " Le pro doit relire avant de ranger dans Mon argent.";

    if (draft.category === "dette_client") {
      warning = " Cette somme reste à recevoir et ne devient pas du cash tant qu’un vrai paiement n’est pas confirmé.";
    }

    return "PAY · " + label + " : " + draft.raw_text + amountPart + channelPart + warning;
  }

  function formulatePayDeep(text) {
    return formatPayDraftMessage(buildPayDraft(text));
  }

  function exposePayApi(core) {
    window.DigiyOreillePAY = {
      version: VERSION,
      config: PAY_CONFIG,
      templates: PAY_TEMPLATES.slice(),
      guideText: PAY_GUIDE,

      detect: function (text) {
        return buildPayDraft(text);
      },

      formulate: function (text) {
        return formulatePayDeep(text);
      },

      saveDraft: function (text) {
        var draft = buildPayDraft(text);
        var message = formatPayDraftMessage(draft);

        if (!core || typeof core.saveNote !== "function") {
          return null;
        }

        return core.saveNote(PAY_CONFIG, message, {
          pay_draft: draft,
          movement: draft
        });
      },

      speakGuide: function () {
        if (core && typeof core.speak === "function") {
          core.speak(PAY_GUIDE);
        }
      },

      stopVoice: function () {
        if (core && typeof core.stopVoice === "function") {
          core.stopVoice();
        }
      }
    };
  }

  function mountPayOreille(core) {
    var target = findMountTarget();

    exposePayApi(core);

    if (!target) {
      console.info("[DIGIY Oreille PAY] Aucun conteneur trouvé. Ajoute <div id=\"digiy-oreille-pay\"></div> pour afficher l’oreille.");
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

    console.info("[DIGIY Oreille PAY] montée avec succès.");
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
        console.warn("[DIGIY Oreille PAY] Core introuvable. Vérifie que oreille-metier-core.js est chargé avant oreille-pay.js.");
        return;
      }

      window.setTimeout(attempt, 100);
    }

    attempt();
  }

  ready(bootPayOreille);
})();
