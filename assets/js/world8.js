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
    "client_due.preview_warning": ["Ce montant est à recevoir. Il n’entre pas dans la caisse.", "This amount is receivable. It does not enter the cash balance.", "Este importe está por cobrar. No entra en caja.", "Este valor está a receber. Não entra em caixa.", "Dieser Betrag steht aus. Er geht nicht in die Kasse ein.", "Questo importo è da ricevere. Non entra in cassa.", "Dit bedrag moet nog worden ontvangen. Het komt niet in de kas.", "هذا المبلغ مستحق القبض. لا يدخل الصندوق."],
    "client_due.title": ["Dettes clients", "Customer debts", "Deudas de clientes", "Dívidas de clientes", "Kundenschulden", "Debiti dei clienti", "Klantschulden", "ديون العملاء"],
    "client_due.subtitle": ["Crédit vendeur · Argent à recevoir", "Seller credit · Money receivable", "Crédito del vendedor · Dinero por cobrar", "Crédito do vendedor · Dinheiro a receber", "Verkäuferkredit · Ausstehende Beträge", "Credito del venditore · Denaro da ricevere", "Verkoperskrediet · Te ontvangen geld", "ائتمان البائع · مبالغ مستحقة"],
    "client_due.protection": ["Protection PAY", "PAY protection", "Protección PAY", "Proteção PAY", "PAY-Schutz", "Protezione PAY", "PAY-bescherming", "حماية PAY"],
    "client_due.receivable": ["Ce montant est à recevoir.", "This amount is receivable.", "Este importe está por cobrar.", "Este valor está a receber.", "Dieser Betrag steht noch aus.", "Questo importo è da ricevere.", "Dit bedrag moet nog worden ontvangen.", "هذا المبلغ مستحق القبض."],
    "client_due.cash_warning": ["Il n’entre dans la caisse que quand le client paie.", "It enters the cash balance only when the customer pays.", "Solo entra en caja cuando el cliente paga.", "Só entra em caixa quando o cliente paga.", "Er geht erst bei Zahlung des Kunden in die Kasse ein.", "Entra in cassa solo quando il cliente paga.", "Het komt pas in de kas wanneer de klant betaalt.", "لا يدخل الصندوق إلا عندما يدفع العميل."],
    "client_due.name": ["Nom", "Name", "Nombre", "Nome", "Name", "Nome", "Naam", "الاسم"],
    "client_due.phone": ["Tel", "Phone", "Teléfono", "Telefone", "Telefon", "Telefono", "Telefoon", "الهاتف"],
    "client_due.amount": ["Somme due", "Amount due", "Importe pendiente", "Valor devido", "Offener Betrag", "Importo dovuto", "Openstaand bedrag", "المبلغ المستحق"],
    "client_due.date": ["Date", "Date", "Fecha", "Data", "Datum", "Data", "Datum", "التاريخ"],
    "client_due.add": ["📒 Ajouter dette client", "📒 Add customer debt", "📒 Añadir deuda de cliente", "📒 Adicionar dívida de cliente", "📒 Kundenschuld hinzufügen", "📒 Aggiungi debito cliente", "📒 Klantschuld toevoegen", "📒 إضافة دين عميل"],
    "client_due.clear": ["🧹 Vider", "🧹 Clear", "🧹 Vaciar", "🧹 Limpar", "🧹 Leeren", "🧹 Svuota", "🧹 Wissen", "🧹 إفراغ"],
    "client_due.warning": ["Dette client = argent attendu. Pas encore recette réelle.", "Customer debt = expected money. Not yet actual income.", "Deuda de cliente = dinero esperado. Aún no es un ingreso real.", "Dívida de cliente = dinheiro esperado. Ainda não é receita real.", "Kundenschuld = erwartetes Geld. Noch keine tatsächliche Einnahme.", "Debito cliente = denaro atteso. Non è ancora un incasso reale.", "Klantschuld = verwacht geld. Nog geen echte inkomsten.", "دين العميل = مال منتظر. ليس إيرادًا فعليًا بعد."],
    "client_due.empty": ["Aucune dette client gardée sur ce téléphone.", "No customer debt saved on this phone.", "No hay deudas de clientes guardadas en este teléfono.", "Nenhuma dívida de cliente guardada neste telefone.", "Keine Kundenschuld auf diesem Telefon gespeichert.", "Nessun debito cliente salvato su questo telefono.", "Geen klantschuld opgeslagen op deze telefoon.", "لا توجد ديون عملاء محفوظة على هذا الهاتف."],
    "client_due.status.open": ["À recevoir", "Receivable", "Por cobrar", "A receber", "Ausstehend", "Da ricevere", "Te ontvangen", "مستحق القبض"],
    "client_due.status.partial": ["Payé en partie", "Partially paid", "Pagado parcialmente", "Pago parcialmente", "Teilweise bezahlt", "Pagato parzialmente", "Gedeeltelijk betaald", "مدفوع جزئيًا"],
    "client_due.status.settled": ["Soldé", "Settled", "Saldado", "Liquidado", "Beglichen", "Saldato", "Voldaan", "مسدد"],
    "client_due.client": ["Client", "Customer", "Cliente", "Cliente", "Kunde", "Cliente", "Klant", "العميل"],
    "client_due.status": ["Statut", "Status", "Estado", "Estado", "Status", "Stato", "Status", "الحالة"],
    "client_due.paid": ["Déjà payé", "Already paid", "Ya pagado", "Já pago", "Bereits bezahlt", "Già pagato", "Al betaald", "المدفوع سابقًا"],
    "client_due.remaining": ["Reste", "Remaining", "Restante", "Restante", "Restbetrag", "Residuo", "Resterend", "المتبقي"],
    "client_due.payment_received": ["Paiement reçu", "Payment received", "Pago recibido", "Pagamento recebido", "Zahlung erhalten", "Pagamento ricevuto", "Betaling ontvangen", "تم استلام الدفع"],
    "client_due.missing_name": ["Nom client manquant", "Customer name missing", "Falta el nombre del cliente", "Falta o nome do cliente", "Kundenname fehlt", "Nome cliente mancante", "Klantnaam ontbreekt", "اسم العميل مفقود"],
    "client_due.invalid_amount": ["Somme due invalide", "Invalid amount due", "Importe pendiente no válido", "Valor devido inválido", "Ungültiger offener Betrag", "Importo dovuto non valido", "Ongeldig openstaand bedrag", "المبلغ المستحق غير صالح"],
    "client_due.added": ["📒 Dette client ajoutée", "📒 Customer debt added", "📒 Deuda de cliente añadida", "📒 Dívida de cliente adicionada", "📒 Kundenschuld hinzugefügt", "📒 Debito cliente aggiunto", "📒 Klantschuld toegevoegd", "📒 تمت إضافة دين العميل"],
    "client_due.no_phone": ["tel non renseigné", "phone not provided", "teléfono no indicado", "telefone não indicado", "Telefon nicht angegeben", "telefono non indicato", "telefoon niet ingevuld", "الهاتف غير مسجل"],
    "client_due.saved": ["📒 Dette client gardée", "📒 Customer debt saved", "📒 Deuda de cliente guardada", "📒 Dívida de cliente guardada", "📒 Kundenschuld gespeichert", "📒 Debito cliente salvato", "📒 Klantschuld opgeslagen", "📒 تم حفظ دين العميل"],
    "client_due.delete_confirm": ["Supprimer cette dette client ?", "Delete this customer debt?", "¿Eliminar esta deuda de cliente?", "Eliminar esta dívida de cliente?", "Diese Kundenschuld löschen?", "Eliminare questo debito cliente?", "Deze klantschuld verwijderen?", "هل تريد حذف دين هذا العميل؟"],
    "client_due.deleted": ["Dette client supprimée", "Customer debt deleted", "Deuda de cliente eliminada", "Dívida de cliente eliminada", "Kundenschuld gelöscht", "Debito cliente eliminato", "Klantschuld verwijderd", "تم حذف دين العميل"],
    "client_due.already_settled": ["Dette déjà soldée", "Debt already settled", "Deuda ya saldada", "Dívida já liquidada", "Schuld bereits beglichen", "Debito già saldato", "Schuld al voldaan", "الدين مسدد بالفعل"],
    "client_due.payment_prompt": ["Montant reçu sur la dette client ?", "Amount received towards the customer debt?", "¿Importe recibido por la deuda del cliente?", "Valor recebido da dívida do cliente?", "Erhaltener Betrag für die Kundenschuld?", "Importo ricevuto per il debito cliente?", "Ontvangen bedrag voor de klantschuld?", "ما المبلغ المستلم لسداد دين العميل؟"],
    "client_due.invalid_received": ["Montant reçu invalide", "Invalid received amount", "Importe recibido no válido", "Valor recebido inválido", "Ungültiger erhaltener Betrag", "Importo ricevuto non valido", "Ongeldig ontvangen bedrag", "المبلغ المستلم غير صالح"],
    "client_due.total_confirm": ["Encaissement total ?\nOK = total / Annuler = partiel", "Full payment?\nOK = full / Cancel = partial", "¿Cobro total?\nAceptar = total / Cancelar = parcial", "Recebimento total?\nOK = total / Cancelar = parcial", "Vollständiger Zahlungseingang?\nOK = vollständig / Abbrechen = teilweise", "Incasso totale?\nOK = totale / Annulla = parziale", "Volledige betaling?\nOK = volledig / Annuleren = gedeeltelijk", "هل تم التحصيل بالكامل؟\nموافق = كامل / إلغاء = جزئي"],
    "client_due.payment_prepared": ["✅ Paiement préparé. Vérifie puis enregistre.", "✅ Payment prepared. Check, then save.", "✅ Pago preparado. Revisa y guarda.", "✅ Pagamento preparado. Verifique e guarde.", "✅ Zahlung vorbereitet. Prüfen und speichern.", "✅ Pagamento preparato. Verifica e salva.", "✅ Betaling voorbereid. Controleer en sla op.", "✅ تم إعداد الدفع. تحقق ثم احفظ."],
    "client_due.cleared": ["Dette client vidée", "Customer debt form cleared", "Formulario de deuda de cliente vaciado", "Formulário de dívida de cliente limpo", "Kundenschuldformular geleert", "Modulo debito cliente svuotato", "Klantschuldformulier gewist", "تم إفراغ نموذج دين العميل"],
    "client_due.voice_prepared": ["📒 Dette client préparée par la voix", "📒 Customer debt prepared by voice", "📒 Deuda de cliente preparada por voz", "📒 Dívida de cliente preparada por voz", "📒 Kundenschuld per Sprache vorbereitet", "📒 Debito cliente preparato con la voce", "📒 Klantschuld voorbereid met spraak", "📒 تم إعداد دين العميل بالصوت"],
    "client_due.voice_title": ["📒 Dette client préparée :", "📒 Customer debt prepared:", "📒 Deuda de cliente preparada:", "📒 Dívida de cliente preparada:", "📒 Kundenschuld vorbereitet:", "📒 Debito cliente preparato:", "📒 Klantschuld voorbereid:", "📒 تم إعداد دين العميل:"],
    "client_due.voice_filled": ["📒 Dette client remplie. Vérifie puis clique sur Ajouter dette client.", "📒 Customer debt filled in. Check, then click Add customer debt.", "📒 Deuda de cliente rellenada. Revisa y pulsa Añadir deuda de cliente.", "📒 Dívida de cliente preenchida. Verifique e clique em Adicionar dívida de cliente.", "📒 Kundenschuld ausgefüllt. Prüfen, dann Kundenschuld hinzufügen anklicken.", "📒 Debito cliente compilato. Verifica e premi Aggiungi debito cliente.", "📒 Klantschuld ingevuld. Controleer en klik op Klantschuld toevoegen.", "📒 تم ملء دين العميل. تحقق ثم اضغط إضافة دين عميل."],
    "client_due.amount_missing": ["somme due à compléter", "amount due to complete", "importe pendiente por completar", "valor devido a preencher", "offenen Betrag ergänzen", "importo dovuto da completare", "openstaand bedrag invullen", "أكمل المبلغ المستحق"],
    "client_due.name_missing": ["nom à compléter", "name to complete", "nombre por completar", "nome a preencher", "Namen ergänzen", "nome da completare", "naam invullen", "أكمل الاسم"],
    "client_due.phone_optional": ["tel optionnel", "optional phone", "teléfono opcional", "telefone opcional", "Telefon optional", "telefono facoltativo", "telefoon optioneel", "الهاتف اختياري"],
    "client_due.date_missing": ["date à préciser", "date to specify", "fecha por indicar", "data a indicar", "Datum angeben", "data da precisare", "datum invullen", "حدد التاريخ"],
    "client_due.voice_amount_warning": ["⚠️ Somme due non détectée : complète avant d’ajouter.", "⚠️ Amount due not detected: complete before adding.", "⚠️ Importe pendiente no detectado: completa antes de añadir.", "⚠️ Valor devido não detetado: preencha antes de adicionar.", "⚠️ Offener Betrag nicht erkannt: vor dem Hinzufügen ergänzen.", "⚠️ Importo dovuto non rilevato: completa prima di aggiungere.", "⚠️ Openstaand bedrag niet herkend: vul in voor toevoegen.", "⚠️ لم يتم تحديد المبلغ المستحق: أكمله قبل الإضافة."],
    "client_due.voice_name_warning": ["⚠️ Nom client non détecté : complète avant d’ajouter.", "⚠️ Customer name not detected: complete before adding.", "⚠️ Nombre de cliente no detectado: completa antes de añadir.", "⚠️ Nome do cliente não detetado: preencha antes de adicionar.", "⚠️ Kundenname nicht erkannt: vor dem Hinzufügen ergänzen.", "⚠️ Nome cliente non rilevato: completa prima di aggiungere.", "⚠️ Klantnaam niet herkend: vul in voor toevoegen.", "⚠️ لم يتم تحديد اسم العميل: أكمله قبل الإضافة."],
    "client_due.module": ["Module annoncé", "Stated module", "Módulo indicado", "Módulo indicado", "Genanntes Modul", "Modulo indicato", "Genoemde module", "الوحدة المذكورة"],
    "client_due.phrase": ["Phrase", "Phrase", "Frase", "Frase", "Satz", "Frase", "Zin", "العبارة"],
    "client_due.language": ["Langue", "Language", "Idioma", "Idioma", "Sprache", "Lingua", "Taal", "اللغة"],
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
    "nav.menu": ["Menu", "Menu", "Menú", "Menu", "Menü", "Menu", "Menu", "القائمة"],
    "journal.all": ["Tout", "All", "Todo", "Tudo", "Alle", "Tutto", "Alles", "الكل"],
    "journal.income": ["Entrées", "Income", "Ingresos", "Entradas", "Einnahmen", "Entrate", "Inkomsten", "المداخيل"],
    "journal.expenses": ["Sorties", "Expenses", "Gastos", "Saídas", "Ausgaben", "Uscite", "Uitgaven", "المصاريف"],
    "journal.net": ["Net", "Net", "Neto", "Líquido", "Netto", "Netto", "Netto", "الصافي"],
    "journal.empty": ["Base vierge. Ajoute ton premier mouvement réel.", "No records yet. Add your first real transaction.", "Aún no hay registros. Añade tu primera operación real.", "Ainda não há registos. Adiciona o teu primeiro movimento real.", "Noch keine Einträge. Füge deine erste tatsächliche Buchung hinzu.", "Nessuna registrazione. Aggiungi il tuo primo movimento reale.", "Nog geen registraties. Voeg je eerste echte transactie toe.", "لا توجد سجلات بعد. أضف أول عملية فعلية."],
    "journal.summary": ["Entrées {income} · Sorties {expenses} · Net {net}", "Income {income} · Expenses {expenses} · Net {net}", "Ingresos {income} · Gastos {expenses} · Neto {net}", "Entradas {income} · Saídas {expenses} · Líquido {net}", "Einnahmen {income} · Ausgaben {expenses} · Netto {net}", "Entrate {income} · Uscite {expenses} · Netto {net}", "Inkomsten {income} · Uitgaven {expenses} · Netto {net}", "المداخيل {income} · المصاريف {expenses} · الصافي {net}"],
    "journal.more": ["Voir 10 mouvements de plus", "Show 10 more transactions", "Ver 10 movimientos más", "Ver mais 10 movimentos", "10 weitere Buchungen anzeigen", "Mostra altri 10 movimenti", "Nog 10 transacties tonen", "عرض 10 حركات إضافية"],
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
