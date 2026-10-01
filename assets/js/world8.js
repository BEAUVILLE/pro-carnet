/* WORLD8 — infrastructure centrale sans intégration UI.
 * Loading this file only exposes DIGIY_WORLD8 and reads its own preference.
 * setLang writes only that preference; no DOM, events, timers or navigation.
 * t returns plain text, not HTML. Consumers must escape it for HTML templates.
 */
(function (root) {
  "use strict";

  var owns = Object.prototype.hasOwnProperty;
  if (owns.call(root, "DIGIY_WORLD8")) return;

  var STORAGE_KEY = "digiy_carnet_ui_lang_v1";
  var LANGS = ["fr", "en", "es", "pt", "de", "it", "nl", "ar"];
  var dictionaries = Object.create(null);
  LANGS.forEach(function (lang) { dictionaries[lang] = Object.create(null); });

  // Each row follows LANGS order. Only UI labels belong in this catalogue.
  var catalogue = {
    "app.title": ["Mon activité", "My activity", "Mi actividad", "Minha atividade", "Meine Tätigkeit", "La mia attività", "Mijn activiteit", "نشاطي"],
    "wallet.balance": ["Solde {pocket}", "{pocket} balance", "Saldo {pocket}", "Saldo {pocket}", "Kontostand {pocket}", "Saldo {pocket}", "Saldo {pocket}", "رصيد {pocket}"],
    "wallet.open": ["Ouvert", "Open", "Abierto", "Aberto", "Offen", "Aperto", "Open", "مفتوح"],
    "wallet.closed": ["Fermé", "Closed", "Cerrado", "Fechado", "Geschlossen", "Chiuso", "Gesloten", "مغلق"],
    "day.today": ["Aujourd’hui {amount}", "Today {amount}", "Hoy {amount}", "Hoje {amount}", "Heute {amount}", "Oggi {amount}", "Vandaag {amount}", "اليوم {amount}"],
    "nav.home": ["Accueil", "Home", "Inicio", "Início", "Start", "Home", "Start", "الرئيسية"],
    "nav.sources": ["Sources", "Sources", "Fuentes", "Fontes", "Quellen", "Fonti", "Bronnen", "المصادر"],
    "nav.entry": ["Saisie", "Entry", "Registro", "Registo", "Erfassung", "Inserimento", "Invoer", "إدخال"],
    "nav.add": ["Ajouter", "Add", "Añadir", "Adicionar", "Hinzufügen", "Aggiungi", "Toevoegen", "إضافة"],
    "nav.admin": ["Admin", "Admin", "Administración", "Administração", "Verwaltung", "Amministrazione", "Beheer", "الإدارة"],
    "journal.all": ["Tout", "All", "Todo", "Tudo", "Alle", "Tutto", "Alles", "الكل"],
    "journal.income": ["Entrées", "Income", "Ingresos", "Entradas", "Einnahmen", "Entrate", "Inkomsten", "المداخيل"],
    "journal.expenses": ["Sorties", "Expenses", "Gastos", "Saídas", "Ausgaben", "Uscite", "Uitgaven", "المصاريف"],
    "journal.net": ["Net", "Net", "Neto", "Líquido", "Netto", "Netto", "Netto", "الصافي"],
    "journal.empty": ["Base vierge. Ajoute ton premier mouvement réel.", "No records yet. Add your first real transaction.", "Aún no hay registros. Añade tu primera operación real.", "Ainda não há registos. Adiciona o teu primeiro movimento real.", "Noch keine Einträge. Füge deine erste tatsächliche Buchung hinzu.", "Nessuna registrazione. Aggiungi il tuo primo movimento reale.", "Nog geen registraties. Voeg je eerste echte transactie toe.", "لا توجد سجلات بعد. أضف أول عملية فعلية."],
    "journal.summary": ["Entrées {income} · Sorties {expenses} · Net {net}", "Income {income} · Expenses {expenses} · Net {net}", "Ingresos {income} · Gastos {expenses} · Neto {net}", "Entradas {income} · Saídas {expenses} · Líquido {net}", "Einnahmen {income} · Ausgaben {expenses} · Netto {net}", "Entrate {income} · Uscite {expenses} · Netto {net}", "Inkomsten {income} · Uitgaven {expenses} · Netto {net}", "المداخيل {income} · المصاريف {expenses} · الصافي {net}"],
    "action.history": ["Historique", "History", "Historial", "Histórico", "Verlauf", "Cronologia", "Geschiedenis", "السجل"],
    "action.settings": ["Réglages", "Settings", "Ajustes", "Definições", "Einstellungen", "Impostazioni", "Instellingen", "الإعدادات"],
    "action.reserve": ["Réserve", "Reserve", "Reserva", "Reserva", "Reserve", "Riserva", "Reserve", "احتياطي"],
    "wallet.reserve": ["Réserve {amount}", "Reserve {amount}", "Reserva {amount}", "Reserva {amount}", "Reserve {amount}", "Riserva {amount}", "Reserve {amount}", "الاحتياطي {amount}"],
    "oreille.title": ["Oreille PAY", "PAY Ear", "Oreja PAY", "Ouvido PAY", "PAY-Ohr", "Orecchio PAY", "PAY-oor", "أذن PAY"],
    "oreille.subtitle": ["Montant · mode · lieu · client/source · téléphone · détail · preuve.", "Amount · method · place · client/source · phone · detail · proof.", "Importe · modo · lugar · cliente/fuente · teléfono · detalle · prueba.", "Valor · modo · local · cliente/fonte · telefone · detalhe · prova.", "Betrag · Modus · Ort · Kunde/Quelle · Telefon · Detail · Nachweis.", "Importo · modalità · luogo · cliente/fonte · telefono · dettaglio · prova.", "Bedrag · methode · plaats · klant/bron · telefoon · detail · bewijs.", "المبلغ · الطريقة · المكان · العميل/المصدر · الهاتف · التفاصيل · الإثبات."],
    "oreille.action.listen": ["Parler", "Speak", "Hablar", "Falar", "Sprechen", "Parla", "Spreken", "تحدث"],
    "oreille.action.formulate": ["Formuler", "Formulate", "Formular", "Formular", "Formulieren", "Formula", "Formuleren", "صياغة"],
    "oreille.action.copy": ["Copier", "Copy", "Copiar", "Copiar", "Kopieren", "Copia", "Kopiëren", "نسخ"],
    "oreille.action.save": ["Ranger", "Save", "Guardar", "Guardar", "Ablegen", "Archivia", "Opslaan", "حفظ"],
    "oreille.action.guide": ["Guide", "Guide", "Guía", "Guia", "Leitfaden", "Guida", "Gids", "دليل"],
    "oreille.action.stop": ["Stop", "Stop", "Detener", "Parar", "Stopp", "Stop", "Stop", "إيقاف"],
    "oreille.ready": ["Oreille prête. Le pro parle ou clique, DIGIY formule.", "Ear ready. The pro speaks or taps, DIGIY formulates.", "Oreja lista. El profesional habla o toca, DIGIY formula.", "Ouvido pronto. O profissional fala ou toca, DIGIY formula.", "Ohr bereit. Der Profi spricht oder tippt, DIGIY formuliert.", "Orecchio pronto. Il professionista parla o tocca, DIGIY formula.", "Oor klaar. De professional spreekt of tikt, DIGIY formuleert.", "الأذن جاهزة. يتحدث المهني أو يضغط، وDIGIY يصوغ."],
    "oreille.suggestions": ["Suggestions", "Suggestions", "Sugerencias", "Sugestões", "Vorschläge", "Suggerimenti", "Suggesties", "اقتراحات"],
    "oreille.notes.empty_title": ["Aucune note rangée", "No saved note", "Ninguna nota guardada", "Nenhuma nota guardada", "Keine gespeicherte Notiz", "Nessuna nota salvata", "Geen opgeslagen notitie", "لا توجد ملاحظة محفوظة"],
    "oreille.notes.empty_hint": ["Teste une suggestion, puis clique sur Ranger.", "Try a suggestion, then tap Save.", "Prueba una sugerencia y pulsa Guardar.", "Teste uma sugestão e toque em Guardar.", "Teste einen Vorschlag und tippe auf Ablegen.", "Prova un suggerimento, poi tocca Archivia.", "Probeer een suggestie en tik op Opslaan.", "جرّب اقتراحًا ثم اضغط حفظ."],
    "receiver.received": ["Reçu depuis ACTION DIGIY", "Received from ACTION DIGIY", "Recibido desde ACTION DIGIY", "Recebido de ACTION DIGIY", "Von ACTION DIGIY empfangen", "Ricevuto da ACTION DIGIY", "Ontvangen van ACTION DIGIY", "تم الاستلام من ACTION DIGIY"],
    "receiver.draft_title": ["DIGIY a préparé un brouillon.", "DIGIY prepared a draft.", "DIGIY preparó un borrador.", "DIGIY preparou um rascunho.", "DIGIY hat einen Entwurf vorbereitet.", "DIGIY ha preparato una bozza.", "DIGIY heeft een concept voorbereid.", "أعد DIGIY مسودة."],
    "receiver.action.validate": ["Valider", "Validate", "Validar", "Validar", "Bestätigen", "Conferma", "Bevestigen", "تأكيد"],
    "receiver.action.prefill": ["Pré-remplir", "Prefill", "Prellenar", "Pré-preencher", "Vorbefüllen", "Precompila", "Voorinvullen", "تعبئة مسبقة"],
    "receiver.action.copy": ["Copier", "Copy", "Copiar", "Copiar", "Kopieren", "Copia", "Kopiëren", "نسخ"],
    "receiver.action.keep": ["Garder", "Keep", "Guardar", "Guardar", "Behalten", "Conserva", "Bewaren", "احتفاظ"],
    "receiver.action.delete": ["Effacer", "Delete", "Borrar", "Apagar", "Löschen", "Elimina", "Verwijderen", "حذف"]
  };
  Object.keys(catalogue).forEach(function (key) {
    LANGS.forEach(function (lang, index) { dictionaries[lang][key] = catalogue[key][index]; });
  });
  // Reference-only copy deliberately falls back to French until translated.
  dictionaries.fr["app.description"] = "PRO CARNET : encaissements, dépenses, réserve, preuves, historique et sauvegarde de l’activité professionnelle.";
  LANGS.forEach(function (lang) { Object.freeze(dictionaries[lang]); });
  Object.freeze(dictionaries);

  function normalizeLang(value) {
    if (typeof value !== "string") return "fr";
    var lang = value.trim().toLowerCase();
    return LANGS.indexOf(lang) !== -1 ? lang : "fr";
  }

  var currentLang = "fr";
  try { currentLang = normalizeLang(root.localStorage.getItem(STORAGE_KEY)); } catch (_) {}

  function t(key, params) {
    if (typeof key !== "string" || !key) return "[world8:invalid-key]";
    var active = dictionaries[currentLang];
    var text = owns.call(active, key) ? active[key] : dictionaries.fr[key];
    if (typeof text !== "string") return "[world8:" + key + "]";
    return text.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, function (placeholder, name) {
      if (!params || typeof params !== "object") return placeholder;
      // Own data properties only: no getters, inherited values or coercion hooks.
      try {
        var descriptor = Object.getOwnPropertyDescriptor(params, name);
        if (!descriptor || !owns.call(descriptor, "value")) return placeholder;
        var value = descriptor.value;
        if (typeof value === "string" || typeof value === "boolean") return String(value);
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
      } catch (_) {}
      return placeholder;
    });
  }

  function getLang() { return currentLang; }
  function setLang(lang) {
    currentLang = normalizeLang(lang);
    try { root.localStorage.setItem(STORAGE_KEY, currentLang); } catch (_) {}
    return currentLang;
  }
  function getDir() { return currentLang === "ar" ? "rtl" : "ltr"; }
  function isRtl() { return currentLang === "ar"; }

  root.DIGIY_WORLD8 = Object.freeze({
    t: t,
    getLang: getLang,
    setLang: setLang,
    getDir: getDir,
    isRtl: isRtl
  });
})(window);
