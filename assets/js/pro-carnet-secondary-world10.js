/* PRO CARNET · traduction des écrans secondaires, interface uniquement.
 * Les codes de catégories, mouvements, données sauvegardées et contrôles
 * d'accès restent inchangés quelle que soit la langue d'affichage.
 */
(function(root){
"use strict";
const LANGS=["fr","en","es","pt","de","it","nl","ar","wo","zh"];
const ROWS={
  "quickTitle": [
    "Saisie rapide locale",
    "Quick local entry",
    "Entrada rápida local",
    "Registo rápido local",
    "Schneller lokaler Eintrag",
    "Registrazione rapida locale",
    "Snelle lokale invoer",
    "إدخال محلي سريع",
    "Bind bu gaaw ci telefon",
    "本地快速录入"
  ],
  "income": [
    "＋ Entrée",
    "＋ Income",
    "＋ Ingreso",
    "＋ Entrada",
    "＋ Einnahme",
    "＋ Entrata",
    "＋ Inkomsten",
    "＋ دخل",
    "＋ Xaalis bu dugg",
    "＋ 收入"
  ],
  "expense": [
    "− Sortie",
    "− Expense",
    "− Gasto",
    "− Saída",
    "− Ausgabe",
    "− Uscita",
    "− Uitgave",
    "− مصروف",
    "− Xaalis bu génn",
    "− 支出"
  ],
  "reason": [
    "Motif",
    "Reason",
    "Motivo",
    "Motivo",
    "Grund",
    "Motivo",
    "Reden",
    "السبب",
    "Li tax",
    "用途"
  ],
  "otherReason": [
    "Autre motif",
    "Other reason",
    "Otro motivo",
    "Outro motivo",
    "Anderer Grund",
    "Altro motivo",
    "Andere reden",
    "سبب آخر",
    "Beneen li tax",
    "其他用途"
  ],
  "otherPlaceholder": [
    "Ex : client, fournisseur, réparation…",
    "E.g. customer, supplier, repair…",
    "Ej.: cliente, proveedor, reparación…",
    "Ex.: cliente, fornecedor, reparação…",
    "Z. B. Kunde, Lieferant, Reparatur…",
    "Es.: cliente, fornitore, riparazione…",
    "Bijv. klant, leverancier, reparatie…",
    "مثال: عميل، مورد، إصلاح…",
    "Misaal: kiliyaan, joxekat, defaraat…",
    "例如：客户、供应商、维修…"
  ],
  "paymentMode": [
    "Mode de paiement",
    "Payment method",
    "Forma de pago",
    "Modo de pagamento",
    "Zahlungsart",
    "Metodo di pagamento",
    "Betaalmethode",
    "طريقة الدفع",
    "Anamu fay",
    "付款方式"
  ],
  "amount": [
    "Montant FCFA",
    "Amount FCFA",
    "Importe FCFA",
    "Montante FCFA",
    "Betrag FCFA",
    "Importo FCFA",
    "Bedrag FCFA",
    "المبلغ بالفرنك الإفريقي",
    "Xaalis FCFA",
    "金额（FCFA）"
  ],
  "confirmIn": [
    "Confirmer l’entrée",
    "Confirm income",
    "Confirmar ingreso",
    "Confirmar entrada",
    "Einnahme bestätigen",
    "Conferma entrata",
    "Inkomst bevestigen",
    "تأكيد الدخل",
    "Wóoral xaalis bu dugg",
    "确认收入"
  ],
  "confirmOut": [
    "Confirmer la sortie",
    "Confirm expense",
    "Confirmar gasto",
    "Confirmar saída",
    "Ausgabe bestätigen",
    "Conferma uscita",
    "Uitgave bevestigen",
    "تأكيد المصروف",
    "Wóoral xaalis bu génn",
    "确认支出"
  ],
  "backup": [
    "💾 Sauvegarde",
    "💾 Backup",
    "💾 Copia de seguridad",
    "💾 Cópia de segurança",
    "💾 Sicherung",
    "💾 Backup",
    "💾 Back-up",
    "💾 نسخة احتياطية",
    "💾 Dencukaay",
    "💾 备份"
  ],
  "openCarnet": [
    "Voir le carnet",
    "Open the ledger",
    "Ver el cuaderno",
    "Ver o caderno",
    "Kassenbuch öffnen",
    "Apri il registro",
    "Kasboek openen",
    "عرض الدفتر",
    "Gis carnet bi",
    "查看账本"
  ],
  "localTitle": [
    "Données locales :",
    "Local data:",
    "Datos locales:",
    "Dados locais:",
    "Lokale Daten:",
    "Dati locali:",
    "Lokale gegevens:",
    "بيانات محلية:",
    "Données yu ci telefon bi:",
    "本地数据："
  ],
  "localCopy": [
    "aucune copie cloud automatique. Cette page fonctionne sans télécharger son moteur depuis GitHub.",
    "no automatic cloud copy. This page works without downloading its engine from GitHub.",
    "sin copia automática en la nube. Esta página funciona sin descargar su motor de GitHub.",
    "sem cópia automática na nuvem. Esta página funciona sem descarregar o motor do GitHub.",
    "keine automatische Cloud-Kopie. Diese Seite funktioniert ohne Motor-Download von GitHub.",
    "nessun backup cloud automatico. Questa pagina funziona senza scaricare il motore da GitHub.",
    "geen automatische cloudkopie. Deze pagina werkt zonder de engine van GitHub te downloaden.",
    "لا توجد نسخة تلقائية على السحابة. تعمل الصفحة دون تنزيل المحرك من GitHub.",
    "Amul copie cloud bu boppam. Xët wii man na dox te du sàcc moteur bi ci GitHub.",
    "不会自动上传云端副本。本页面无需从 GitHub 下载运行引擎即可使用。"
  ],
  "errAmount": [
    "Pose un montant supérieur à zéro.",
    "Enter an amount greater than zero.",
    "Introduce un importe superior a cero.",
    "Introduz um montante superior a zero.",
    "Betrag größer als null eingeben.",
    "Inserisci un importo maggiore di zero.",
    "Vul een bedrag groter dan nul in.",
    "أدخل مبلغًا أكبر من صفر.",
    "Bindal xaalis bu ëpp zéro.",
    "请输入大于零的金额。"
  ],
  "errReason": [
    "Choisis ou écris un motif.",
    "Select or enter a reason.",
    "Elige o escribe un motivo.",
    "Escolhe ou escreve um motivo.",
    "Grund auswählen oder eingeben.",
    "Seleziona o scrivi un motivo.",
    "Kies of typ een reden.",
    "اختر أو اكتب سببًا.",
    "Tànnal walla bind li tax.",
    "请选择或填写用途。"
  ],
  "errMode": [
    "Choisis un mode de paiement.",
    "Select a payment method.",
    "Elige un método de pago.",
    "Escolhe um modo de pagamento.",
    "Zahlungsart auswählen.",
    "Scegli un metodo di pagamento.",
    "Kies een betaalmethode.",
    "اختر طريقة الدفع.",
    "Tànnal anamu fay.",
    "请选择付款方式。"
  ],
  "saved": [
    "✅ Trace enregistrée dans {pocket} · {mode}.",
    "✅ Entry saved in {pocket} · {mode}.",
    "✅ Registro guardado en {pocket} · {mode}.",
    "✅ Registo guardado em {pocket} · {mode}.",
    "✅ Eintrag gespeichert in {pocket} · {mode}.",
    "✅ Registrazione salvata in {pocket} · {mode}.",
    "✅ Invoer opgeslagen in {pocket} · {mode}.",
    "✅ تم حفظ العملية في {pocket} · {mode}.",
    "✅ Denc nañu mbind mi ci {pocket} · {mode}.",
    "✅ 记录已保存至 {pocket} · {mode}。"
  ],
  "saveFail": [
    "❌ Enregistrement impossible : {reason}",
    "❌ Could not save: {reason}",
    "❌ No se pudo guardar: {reason}",
    "❌ Não foi possível guardar: {reason}",
    "❌ Speichern fehlgeschlagen: {reason}",
    "❌ Salvataggio impossibile: {reason}",
    "❌ Opslaan mislukt: {reason}",
    "❌ تعذر الحفظ: {reason}",
    "❌ Mëneesul denc: {reason}",
    "❌ 无法保存：{reason}"
  ],
  "backupDone": [
    "✅ Sauvegarde téléchargée.",
    "✅ Backup downloaded.",
    "✅ Copia descargada.",
    "✅ Cópia descarregada.",
    "✅ Sicherung heruntergeladen.",
    "✅ Backup scaricato.",
    "✅ Back-up gedownload.",
    "✅ تم تنزيل النسخة الاحتياطية.",
    "✅ Yebbi nañu copie bi.",
    "✅ 备份已下载。"
  ],
  "backupFail": [
    "Sauvegarde impossible.",
    "Backup failed.",
    "No se pudo crear la copia.",
    "Não foi possível criar a cópia.",
    "Sicherung fehlgeschlagen.",
    "Backup non riuscito.",
    "Back-up mislukt.",
    "تعذر إنشاء نسخة احتياطية.",
    "Dencukaay bi doxul.",
    "备份失败。"
  ],
  "invalidStorage": [
    "stockage indisponible",
    "storage unavailable",
    "almacenamiento no disponible",
    "armazenamento indisponível",
    "Speicher nicht verfügbar",
    "memoria non disponibile",
    "opslag niet beschikbaar",
    "التخزين غير متاح",
    "Dencukaay bi amul",
    "存储不可用"
  ],
  "openFail": [
    "Ouverture impossible.",
    "Unable to open.",
    "No se pudo abrir.",
    "Impossível abrir.",
    "Öffnen fehlgeschlagen.",
    "Impossibile aprire.",
    "Kan niet openen.",
    "تعذر الفتح.",
    "Mëneesul ubbi.",
    "无法打开。"
  ],
  "backPin": [
    "Revenir au PIN",
    "Back to PIN",
    "Volver al PIN",
    "Voltar ao PIN",
    "Zurück zur PIN-Eingabe",
    "Torna al PIN",
    "Terug naar pincode",
    "العودة إلى الرمز",
    "Dellu ci PIN",
    "返回 PIN 登录"
  ],
  "sessionTitle": [
    "📒 Ma session PRO CARNET",
    "📒 My PRO CARNET session",
    "📒 Mi sesión PRO CARNET",
    "📒 A minha sessão PRO CARNET",
    "📒 Meine PRO CARNET-Sitzung",
    "📒 La mia sessione PRO CARNET",
    "📒 Mijn PRO CARNET-sessie",
    "📒 جلستي في PRO CARNET",
    "📒 Sama session PRO CARNET",
    "📒 我的 PRO CARNET 会话"
  ],
  "sessionDesc": [
    "Cette page ne supprime jamais les mouvements, les sauvegardes ou les données métier.",
    "This page never deletes your transactions, backups or business data.",
    "Esta página nunca elimina movimientos, copias ni datos comerciales.",
    "Esta página nunca elimina movimentos, cópias ou dados de atividade.",
    "Diese Seite löscht niemals Buchungen, Sicherungen oder Geschäftsdaten.",
    "Questa pagina non cancella mai movimenti, backup o dati aziendali.",
    "Deze pagina verwijdert nooit transacties, back-ups of bedrijfsgegevens.",
    "لا تحذف هذه الصفحة المعاملات أو النسخ الاحتياطية أو بيانات العمل.",
    "Xët wii du far say mouvements, sauvegardes walla say données métier.",
    "本页面不会删除流水、备份或业务数据。"
  ],
  "verified": [
    "Compte vérifié",
    "Verified account",
    "Cuenta verificada",
    "Conta verificada",
    "Verifiziertes Konto",
    "Account verificato",
    "Geverifieerd account",
    "حساب موثّق",
    "Kont bu ñu wóoral",
    "已验证账户"
  ],
  "expires": [
    "Expiration de la session",
    "Session expires",
    "Caducidad de la sesión",
    "Fim da sessão",
    "Sitzung läuft ab",
    "Scadenza della sessione",
    "Sessie verloopt",
    "انتهاء الجلسة",
    "Session bi dina jeex",
    "会话到期时间"
  ],
  "backupJson": [
    "💾 Télécharger ma sauvegarde JSON",
    "💾 Download my JSON backup",
    "💾 Descargar mi copia JSON",
    "💾 Descarregar a minha cópia JSON",
    "💾 JSON-Sicherung herunterladen",
    "💾 Scarica il backup JSON",
    "💾 Mijn JSON-back-up downloaden",
    "💾 تنزيل نسخة JSON الاحتياطية",
    "💾 Yebbi sama sauvegarde JSON",
    "💾 下载 JSON 备份"
  ],
  "return": [
    "Retour au carnet",
    "Back to ledger",
    "Volver al cuaderno",
    "Voltar ao caderno",
    "Zurück zum Kassenbuch",
    "Torna al registro",
    "Terug naar kasboek",
    "العودة إلى الدفتر",
    "Dellu ci carnet bi",
    "返回账本"
  ],
  "logout": [
    "Fermer uniquement la session",
    "Close session only",
    "Cerrar solo la sesión",
    "Fechar apenas a sessão",
    "Nur Sitzung beenden",
    "Chiudi solo la sessione",
    "Alleen sessie sluiten",
    "إغلاق الجلسة فقط",
    "Tëj session bi rekk",
    "仅关闭会话"
  ],
  "sessionLocalCopy": [
    "tes chiffres sont dans ce téléphone. Aucune copie cloud automatique. Télécharge une sauvegarde chaque semaine.",
    "your figures stay on this phone. No automatic cloud copy. Download a backup every week.",
    "tus cifras permanecen en este teléfono. Sin copia automática en la nube. Descarga una copia cada semana.",
    "os teus números ficam neste telefone. Sem cópia automática na nuvem. Descarrega uma cópia semanalmente.",
    "deine Zahlen bleiben auf diesem Telefon. Keine automatische Cloud-Kopie. Lade wöchentlich eine Sicherung herunter.",
    "i tuoi dati restano su questo telefono. Nessun backup cloud automatico. Scarica un backup ogni settimana.",
    "je cijfers blijven op deze telefoon. Geen automatische cloudkopie. Download elke week een back-up.",
    "تبقى أرقامك على هذا الهاتف. لا توجد نسخة سحابية تلقائية. نزّل نسخة احتياطية كل أسبوع.",
    "Say chiffres dañu nekk ci telefon bii. Amul copie cloud bu boppam. Yebbil sauvegarde bépp ayu-bis.",
    "您的数据保存在本手机上，不会自动云端备份。请每周下载一份备份。"
  ],
  "closeConfirm": [
    "Fermer la session ? Tes mouvements resteront dans ce téléphone.",
    "Close this session? Your transactions remain on this phone.",
    "¿Cerrar la sesión? Tus movimientos seguirán en este teléfono.",
    "Fechar a sessão? Os movimentos ficam neste telefone.",
    "Sitzung beenden? Deine Buchungen bleiben auf diesem Telefon.",
    "Chiudere la sessione? I movimenti restano sul telefono.",
    "Sessie sluiten? Je transacties blijven op deze telefoon.",
    "إغلاق الجلسة؟ ستبقى معاملاتك على هذا الهاتف.",
    "Tëj session bi? Say mouvements dinañu des ci telefon bii.",
    "关闭会话吗？您的流水仍保留在本手机上。"
  ],
  "sessionMissing": [
    "Session indisponible",
    "Session unavailable",
    "Sesión no disponible",
    "Sessão indisponível",
    "Sitzung nicht verfügbar",
    "Sessione non disponibile",
    "Sessie niet beschikbaar",
    "الجلسة غير متاحة",
    "Session bi amul",
    "会话不可用"
  ],
  "emptyLedger": [
    "Carnet illisible ou vide.",
    "Ledger unreadable or empty.",
    "Cuaderno ilegible o vacío.",
    "Caderno ilegível ou vazio.",
    "Kassenbuch unlesbar oder leer.",
    "Registro illeggibile o vuoto.",
    "Kasboek onleesbaar of leeg.",
    "الدفتر غير قابل للقراءة أو فارغ.",
    "Carnet bi kenn mënuko jàng walla dafa neen.",
    "账本无法读取或为空。"
  ]
};
const LABELS={
  "fr": {
    "Client": "Client",
    "Vente": "Vente",
    "Course": "Course",
    "Location": "Location",
    "Réservation": "Réservation",
    "Acompte": "Acompte",
    "Caisse": "Caisse",
    "Autre entrée": "Autre entrée",
    "Gasoil": "Gasoil",
    "Internet": "Internet",
    "Matériel": "Matériel",
    "Transport": "Transport",
    "Loyer": "Loyer",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Réparation",
    "Fournisseur": "Fournisseur",
    "Autre sortie": "Autre sortie",
    "Retraite": "Retraite",
    "Aide reçue": "Aide reçue",
    "Remboursement": "Remboursement",
    "Virement reçu": "Virement reçu",
    "Maison": "Maison",
    "Nourriture": "Nourriture",
    "École": "École",
    "Santé": "Santé",
    "Chèque": "Chèque",
    "Virement": "Virement",
    "Cash": "Cash"
  },
  "en": {
    "Client": "Customer",
    "Vente": "Sale",
    "Course": "Ride",
    "Location": "Rental",
    "Réservation": "Booking",
    "Acompte": "Deposit",
    "Caisse": "Cash register",
    "Autre entrée": "Other income",
    "Gasoil": "Fuel",
    "Internet": "Internet",
    "Matériel": "Equipment",
    "Transport": "Transport",
    "Loyer": "Rent",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Repair",
    "Fournisseur": "Supplier",
    "Autre sortie": "Other expense",
    "Retraite": "Pension",
    "Aide reçue": "Aid received",
    "Remboursement": "Refund",
    "Virement reçu": "Transfer received",
    "Maison": "Home",
    "Nourriture": "Food",
    "École": "School",
    "Santé": "Health",
    "Chèque": "Cheque",
    "Virement": "Bank transfer",
    "Cash": "Cash"
  },
  "es": {
    "Client": "Cliente",
    "Vente": "Venta",
    "Course": "Carrera",
    "Location": "Alquiler",
    "Réservation": "Reserva",
    "Acompte": "Anticipo",
    "Caisse": "Caja",
    "Autre entrée": "Otro ingreso",
    "Gasoil": "Combustible",
    "Internet": "Internet",
    "Matériel": "Material",
    "Transport": "Transporte",
    "Loyer": "Alquiler",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Reparación",
    "Fournisseur": "Proveedor",
    "Autre sortie": "Otro gasto",
    "Retraite": "Pensión",
    "Aide reçue": "Ayuda recibida",
    "Remboursement": "Reembolso",
    "Virement reçu": "Transferencia recibida",
    "Maison": "Casa",
    "Nourriture": "Comida",
    "École": "Escuela",
    "Santé": "Salud",
    "Chèque": "Cheque",
    "Virement": "Transferencia",
    "Cash": "Efectivo"
  },
  "pt": {
    "Client": "Cliente",
    "Vente": "Venda",
    "Course": "Corrida",
    "Location": "Aluguer",
    "Réservation": "Reserva",
    "Acompte": "Adiantamento",
    "Caisse": "Caixa",
    "Autre entrée": "Outra entrada",
    "Gasoil": "Combustível",
    "Internet": "Internet",
    "Matériel": "Material",
    "Transport": "Transporte",
    "Loyer": "Renda",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Reparação",
    "Fournisseur": "Fornecedor",
    "Autre sortie": "Outra saída",
    "Retraite": "Pensão",
    "Aide reçue": "Ajuda recebida",
    "Remboursement": "Reembolso",
    "Virement reçu": "Transferência recebida",
    "Maison": "Casa",
    "Nourriture": "Alimentação",
    "École": "Escola",
    "Santé": "Saúde",
    "Chèque": "Cheque",
    "Virement": "Transferência",
    "Cash": "Dinheiro"
  },
  "de": {
    "Client": "Kunde",
    "Vente": "Verkauf",
    "Course": "Fahrt",
    "Location": "Vermietung",
    "Réservation": "Reservierung",
    "Acompte": "Anzahlung",
    "Caisse": "Kasse",
    "Autre entrée": "Sonstige Einnahme",
    "Gasoil": "Kraftstoff",
    "Internet": "Internet",
    "Matériel": "Material",
    "Transport": "Transport",
    "Loyer": "Miete",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Reparatur",
    "Fournisseur": "Lieferant",
    "Autre sortie": "Sonstige Ausgabe",
    "Retraite": "Rente",
    "Aide reçue": "Erhaltene Hilfe",
    "Remboursement": "Erstattung",
    "Virement reçu": "Eingegangene Überweisung",
    "Maison": "Haus",
    "Nourriture": "Lebensmittel",
    "École": "Schule",
    "Santé": "Gesundheit",
    "Chèque": "Scheck",
    "Virement": "Überweisung",
    "Cash": "Bargeld"
  },
  "it": {
    "Client": "Cliente",
    "Vente": "Vendita",
    "Course": "Corsa",
    "Location": "Affitto",
    "Réservation": "Prenotazione",
    "Acompte": "Acconto",
    "Caisse": "Cassa",
    "Autre entrée": "Altra entrata",
    "Gasoil": "Carburante",
    "Internet": "Internet",
    "Matériel": "Materiale",
    "Transport": "Trasporto",
    "Loyer": "Affitto",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Riparazione",
    "Fournisseur": "Fornitore",
    "Autre sortie": "Altra uscita",
    "Retraite": "Pensione",
    "Aide reçue": "Aiuto ricevuto",
    "Remboursement": "Rimborso",
    "Virement reçu": "Bonifico ricevuto",
    "Maison": "Casa",
    "Nourriture": "Cibo",
    "École": "Scuola",
    "Santé": "Salute",
    "Chèque": "Assegno",
    "Virement": "Bonifico",
    "Cash": "Contanti"
  },
  "nl": {
    "Client": "Klant",
    "Vente": "Verkoop",
    "Course": "Rit",
    "Location": "Verhuur",
    "Réservation": "Reservering",
    "Acompte": "Aanbetaling",
    "Caisse": "Kassa",
    "Autre entrée": "Overige inkomst",
    "Gasoil": "Brandstof",
    "Internet": "Internet",
    "Matériel": "Materiaal",
    "Transport": "Vervoer",
    "Loyer": "Huur",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Reparatie",
    "Fournisseur": "Leverancier",
    "Autre sortie": "Overige uitgave",
    "Retraite": "Pensioen",
    "Aide reçue": "Ontvangen hulp",
    "Remboursement": "Terugbetaling",
    "Virement reçu": "Ontvangen overschrijving",
    "Maison": "Huis",
    "Nourriture": "Eten",
    "École": "School",
    "Santé": "Gezondheid",
    "Chèque": "Cheque",
    "Virement": "Overschrijving",
    "Cash": "Contant"
  },
  "ar": {
    "Client": "عميل",
    "Vente": "بيع",
    "Course": "رحلة",
    "Location": "إيجار",
    "Réservation": "حجز",
    "Acompte": "عربون",
    "Caisse": "صندوق",
    "Autre entrée": "دخل آخر",
    "Gasoil": "وقود",
    "Internet": "إنترنت",
    "Matériel": "معدات",
    "Transport": "نقل",
    "Loyer": "إيجار",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "إصلاح",
    "Fournisseur": "مورد",
    "Autre sortie": "مصروف آخر",
    "Retraite": "معاش تقاعدي",
    "Aide reçue": "مساعدة مستلمة",
    "Remboursement": "استرداد",
    "Virement reçu": "تحويل مستلم",
    "Maison": "منزل",
    "Nourriture": "طعام",
    "École": "مدرسة",
    "Santé": "صحة",
    "Chèque": "شيك",
    "Virement": "تحويل",
    "Cash": "نقد"
  },
  "wo": {
    "Client": "Kiliyaan",
    "Vente": "Jaay",
    "Course": "Yoon",
    "Location": "Luway",
    "Réservation": "Réservation",
    "Acompte": "Acompte",
    "Caisse": "Caisse",
    "Autre entrée": "Beneen xaalis bu dugg",
    "Gasoil": "Gasoil",
    "Internet": "Internet",
    "Matériel": "Jumtukaay",
    "Transport": "Transport",
    "Loyer": "Loyer",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "Defaraat",
    "Fournisseur": "Joxekat",
    "Autre sortie": "Beneen xaalis bu génn",
    "Retraite": "Retraite",
    "Aide reçue": "Ndimbal bu ñu jot",
    "Remboursement": "Dellusi xaalis",
    "Virement reçu": "Virement bu ñu jot",
    "Maison": "Kër",
    "Nourriture": "Lekku",
    "École": "Daaray xale",
    "Santé": "Wér-gu-yaram",
    "Chèque": "Chèque",
    "Virement": "Virement",
    "Cash": "Cash"
  },
  "zh": {
    "Client": "客户",
    "Vente": "销售",
    "Course": "行程",
    "Location": "租赁",
    "Réservation": "预订",
    "Acompte": "预付款",
    "Caisse": "收银",
    "Autre entrée": "其他收入",
    "Gasoil": "燃油",
    "Internet": "互联网",
    "Matériel": "设备",
    "Transport": "交通",
    "Loyer": "租金",
    "Senelec": "Senelec",
    "SEN’EAU": "SEN’EAU",
    "Réparation": "维修",
    "Fournisseur": "供应商",
    "Autre sortie": "其他支出",
    "Retraite": "退休金",
    "Aide reçue": "收到的援助",
    "Remboursement": "退款",
    "Virement reçu": "收到的转账",
    "Maison": "住房",
    "Nourriture": "食品",
    "École": "学校",
    "Santé": "医疗",
    "Chèque": "支票",
    "Virement": "银行转账",
    "Cash": "现金"
  }
};
const KEY="digiy_carnet_ui_lang_v1";
const LOCALES={fr:"fr-FR",en:"en-GB",es:"es-ES",pt:"pt-PT",de:"de-DE",it:"it-IT",nl:"nl-NL",ar:"ar-SA",wo:"wo-SN",zh:"zh-CN"};
const NAMES={fr:"🇫🇷 FR",en:"🇬🇧 EN",es:"🇪🇸 ES",pt:"🇵🇹 PT",de:"🇩🇪 DE",it:"🇮🇹 IT",nl:"🇳🇱 NL",ar:"🇸🇦 AR",wo:"🇸🇳 WO",zh:"🇨🇳 中文"};
function chooseLang(){
  try{
    const q=new URLSearchParams(root.location.search).get("lang");
    const candidate=String(q||root.localStorage.getItem(KEY)||root.localStorage.getItem("digiy_lang")||"fr").trim().slice(0,2).toLowerCase();
    return LANGS.includes(candidate)?candidate:"fr";
  }catch(_){return"fr"}
}
let lang=chooseLang();
const callbacks=[];
const has=Object.prototype.hasOwnProperty;
function t(key,params){
  if(!has.call(ROWS,key))return key;
  let out=ROWS[key][LANGS.indexOf(lang)]||ROWS[key][0];
  if(params&&typeof params==="object")out=out.replace(/\{([a-z_]+)\}/gi,(s,k)=>has.call(params,k)?String(params[k]):s);
  return out;
}
function label(value){return LABELS[lang]?.[value]||value}
function locale(){return LOCALES[lang]||"fr-FR"}
function apply(){
  const html=document.documentElement;
  html.lang=lang==="zh"?"zh-CN":lang;
  html.dir=lang==="ar"?"rtl":"ltr";
  document.querySelectorAll("[data-pro10]").forEach(el=>{el.textContent=t(el.getAttribute("data-pro10"))});
  document.querySelectorAll("[data-pro10-placeholder]").forEach(el=>{el.setAttribute("placeholder",t(el.getAttribute("data-pro10-placeholder")))});
  document.querySelectorAll("[data-pro10-aria]").forEach(el=>{el.setAttribute("aria-label",t(el.getAttribute("data-pro10-aria")))});
  const select=document.getElementById("pro10Lang");
  if(select)select.value=lang;
  try{root.localStorage.setItem(KEY,lang);root.localStorage.setItem("digiy_lang",lang)}catch(_){}
  callbacks.forEach(fn=>fn(lang));
}
function setLang(code){
  if(!LANGS.includes(code))return lang;
  lang=code;
  apply();
  return lang;
}
function onChange(fn){if(typeof fn==="function")callbacks.push(fn)}
function mount(){
  const host=document.getElementById("pro10Controls");
  if(host){
    const select=document.createElement("select");
    select.id="pro10Lang";
    select.setAttribute("aria-label","Langue / Language");
    select.style.cssText="min-height:44px;max-width:220px;width:100%;border:1px solid rgba(180,160,105,.4);border-radius:12px;padding:8px;background:#14261c;color:#fff8e8;font-weight:800;font-size:14px";
    LANGS.forEach(code=>{
      const option=document.createElement("option");option.value=code;option.textContent=NAMES[code];select.appendChild(option);
    });
    select.addEventListener("change",event=>setLang(event.target.value));
    host.appendChild(select);
  }
  apply();
}
root.DIGIY_PRO10=Object.freeze({t,label,locale,getLang:()=>lang,setLang,onChange,langs:LANGS.slice()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})(window);
