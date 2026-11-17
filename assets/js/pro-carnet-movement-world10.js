/* PRO CARNET · WORLD10 parcours frais/encaissements.
 * Textes d'interface uniquement. Aucune mutation des catégories, montants, preuves,
 * identifiants, clés de stockage ni garde de session.
 */
(function(root) {
  "use strict";
  const LANGS=["fr","en","es","pt","de","it","nl","ar","wo","zh"];
  const ROWS={
  "amount": [
    "Montant (FCFA)",
    "Amount (FCFA)",
    "Importe (FCFA)",
    "Montante (FCFA)",
    "Betrag (FCFA)",
    "Importo (FCFA)",
    "Bedrag (FCFA)",
    "المبلغ (فرنك)",
    "Xaalis bi (FCFA)",
    "金额（FCFA）"
  ],
  "label": [
    "Motif / libellé",
    "Reason / label",
    "Motivo / concepto",
    "Motivo / descrição",
    "Grund / Bezeichnung",
    "Motivo / descrizione",
    "Reden / omschrijving",
    "السبب / الوصف",
    "Li tax / tur bi",
    "用途 / 说明"
  ],
  "mode": [
    "Mode de règlement",
    "Payment method",
    "Método de pago",
    "Modo de pagamento",
    "Zahlungsart",
    "Metodo di pagamento",
    "Betaalmethode",
    "طريقة الدفع",
    "Anamu fay",
    "付款方式"
  ],
  "type": [
    "Nature",
    "Transaction type",
    "Tipo",
    "Tipo",
    "Buchungsart",
    "Tipo",
    "Soort",
    "نوع العملية",
    "Xeetu mouvement",
    "交易类型"
  ],
  "pocket": [
    "Poche",
    "Account",
    "Cuenta",
    "Conta",
    "Bereich",
    "Conto",
    "Rekening",
    "الحساب",
    "Kont bi",
    "账户"
  ],
  "source": [
    "Source d’activité",
    "Activity source",
    "Actividad de origen",
    "Atividade de origem",
    "Herkunftsaktivität",
    "Attività di origine",
    "Bronactiviteit",
    "مصدر النشاط",
    "Fu mu jóge",
    "业务来源"
  ],
  "person": [
    "Client / personne",
    "Customer / person",
    "Cliente / persona",
    "Cliente / pessoa",
    "Kunde / Person",
    "Cliente / persona",
    "Klant / persoon",
    "العميل / الشخص",
    "Kiliyaan / nit",
    "客户 / 人员"
  ],
  "note": [
    "Trace / note courte",
    "Receipt / short note",
    "Justificante / nota",
    "Comprovativo / nota",
    "Beleg / kurze Notiz",
    "Prova / nota breve",
    "Bewijs / korte notitie",
    "إثبات / ملاحظة",
    "Firnde / note",
    "凭证 / 简注"
  ],
  "income": [
    "＋ Entrée",
    "＋ Income",
    "＋ Ingreso",
    "＋ Entrada",
    "＋ Einnahme",
    "＋ Entrata",
    "＋ Inkomst",
    "＋ إيراد",
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
  "title_new": [
    "Poser un chiffre",
    "Enter an amount",
    "Introduce un importe",
    "Introduzir um montante",
    "Betrag eingeben",
    "Inserisci un importo",
    "Bedrag invoeren",
    "أدخل المبلغ",
    "Bindal xaalis bi",
    "填写金额"
  ],
  "title_edit": [
    "Modifier la trace",
    "Edit transaction",
    "Modificar movimiento",
    "Editar movimento",
    "Buchung ändern",
    "Modifica movimento",
    "Transactie wijzigen",
    "تعديل العملية",
    "Jubanti mouvement bi",
    "修改流水"
  ],
  "title_full": [
    "Saisie complète",
    "Full entry",
    "Registro completo",
    "Registo completo",
    "Vollständige Eingabe",
    "Inserimento completo",
    "Volledige invoer",
    "إدخال كامل",
    "Bind bu mat",
    "完整录入"
  ],
  "notice_pro": [
    "PRO : saisis le montant et vérifie le mode. Note facultative.",
    "PRO: enter the amount and check the method. Note optional.",
    "PRO: introduce el importe y comprueba el método. Nota opcional.",
    "PRO: introduz o valor e confirma o modo. Nota opcional.",
    "PRO: Betrag eingeben und Zahlungsart prüfen. Notiz optional.",
    "PRO: inserisci l'importo e verifica il metodo. Nota facoltativa.",
    "PRO: vul het bedrag in en controleer de betaalwijze. Notitie optioneel.",
    "PRO: أدخل المبلغ وتحقق من وسيلة الدفع. الملاحظة اختيارية.",
    "PRO: bindal xaalis bi te seetal anamu fay. Note warul.",
    "PRO：输入金额并核对付款方式。备注选填。"
  ],
  "notice_perso": [
    "PERSO : saisis le montant et vérifie le mode. Note facultative.",
    "PERSO: enter the amount and check the method. Note optional.",
    "PERSO: introduce el importe y comprueba el método. Nota opcional.",
    "PERSO: introduz o valor e confirma o modo. Nota opcional.",
    "PERSO: Betrag eingeben und Zahlungsart prüfen. Notiz optional.",
    "PERSO: inserisci l'importo e verifica il metodo. Nota facoltativa.",
    "PERSO: vul het bedrag in en controleer de betaalwijze. Notitie optioneel.",
    "PERSO: أدخل المبلغ وتحقق من وسيلة الدفع. الملاحظة اختيارية.",
    "PERSO: bindal xaalis bi te seetal anamu fay. Note warul.",
    "PERSO：输入金额并核对付款方式。备注选填。"
  ],
  "notice_full": [
    "Montant · motif · mode · entrée/sortie · PRO/PERSO · source · client · note.",
    "Amount · reason · method · income/expense · PRO/PERSO · source · customer · note.",
    "Importe · motivo · método · ingreso/gasto · PRO/PERSO · origen · cliente · nota.",
    "Valor · motivo · modo · entrada/saída · PRO/PERSO · origem · cliente · nota.",
    "Betrag · Grund · Zahlungsart · Ein-/Ausgabe · PRO/PERSO · Quelle · Kunde · Notiz.",
    "Importo · motivo · metodo · entrata/uscita · PRO/PERSO · origine · cliente · nota.",
    "Bedrag · reden · betaalwijze · in/uit · PRO/PERSO · bron · klant · notitie.",
    "المبلغ · السبب · الطريقة · دخل/مصروف · PRO/PERSO · المصدر · العميل · ملاحظة.",
    "Xaalis · li tax · anam fay · dugg/génn · PRO/PERSO · cosaan · kiliyaan · note.",
    "金额 · 用途 · 支付方式 · 收支 · PRO/PERSO · 来源 · 客户 · 备注。"
  ],
  "save": [
    "Confirmer la trace",
    "Confirm transaction",
    "Confirmar movimiento",
    "Confirmar movimento",
    "Buchung bestätigen",
    "Conferma movimento",
    "Transactie bevestigen",
    "تأكيد العملية",
    "Wóoral mouvement bi",
    "确认流水"
  ],
  "save_edit": [
    "Modifier et recalculer",
    "Update and recalculate",
    "Modificar y recalcular",
    "Alterar e recalcular",
    "Ändern und neu berechnen",
    "Modifica e ricalcola",
    "Wijzigen en herberekenen",
    "تعديل وإعادة الحساب",
    "Jubanti te nattaat",
    "修改并重新计算"
  ],
  "label_hint": [
    "Ex. Gasoil, Senelec, transport…",
    "E.g. fuel, Senelec, transport…",
    "Ej. combustible, Senelec, transporte…",
    "Ex. combustível, Senelec, transporte…",
    "Z. B. Diesel, Senelec, Transport…",
    "Es. carburante, Senelec, trasporto…",
    "Bijv. diesel, Senelec, vervoer…",
    "مثل وقود، Senelec، نقل…",
    "Misaal Gasoil, Senelec, transport…",
    "例如燃油、Senelec、交通…"
  ],
  "person_hint": [
    "Facultatif : client ou personne",
    "Optional: customer or person",
    "Opcional: cliente o persona",
    "Opcional: cliente ou pessoa",
    "Optional: Kunde oder Person",
    "Facoltativo: cliente o persona",
    "Optioneel: klant of persoon",
    "اختياري: عميل أو شخص",
    "Mën nga bàyyi ko: kiliyaan walla nit",
    "选填：客户或人员"
  ],
  "note_hint": [
    "Référence, reçu ou précision…",
    "Reference, receipt or detail…",
    "Referencia, recibo o detalle…",
    "Referência, recibo ou detalhe…",
    "Referenz, Beleg oder Detail…",
    "Riferimento, ricevuta o dettaglio…",
    "Referentie, bon of detail…",
    "مرجع أو إيصال أو توضيح…",
    "Référence, reçu walla leeral…",
    "编号、收据或补充说明…"
  ],
  "amount_invalid": [
    "Saisis un montant supérieur à zéro.",
    "Enter an amount greater than zero.",
    "Introduce un importe mayor que cero.",
    "Introduz um valor superior a zero.",
    "Betrag größer als null eingeben.",
    "Inserisci un importo maggiore di zero.",
    "Vul een bedrag groter dan nul in.",
    "أدخل مبلغًا أكبر من صفر.",
    "Bindal xaalis bu ëpp zéro.",
    "请输入大于零的金额。"
  ],
  "canonical_hint": [
    "Libellé comptable : conservé tel qu’enregistré.",
    "Accounting label: kept as originally recorded.",
    "Concepto contable: se conserva como fue registrado.",
    "Descrição contabilística: mantém-se como foi registada.",
    "Buchungstext: bleibt wie ursprünglich erfasst.",
    "Descrizione contabile: rimane come registrata.",
    "Boekhoudlabel: blijft zoals geregistreerd.",
    "الوصف المحاسبي: يُحفظ كما سُجل.",
    "Tur u mouvement bi: dañu koy denc ni ñu ko bindee.",
    "记账名称：仍按原登记内容保存。"
  ],
  "preset_prefix": [
    "Frais choisi : {name}",
    "Selected expense: {name}",
    "Gasto elegido: {name}",
    "Despesa escolhida: {name}",
    "Gewählte Ausgabe: {name}",
    "Spesa scelta: {name}",
    "Gekozen uitgave: {name}",
    "المصروف المختار: {name}",
    "Frais bi nga tànn: {name}",
    "所选支出：{name}"
  ],
  "choice_income": [
    "Entrées · sources d’activité",
    "Income · activity sources",
    "Ingresos · origen de actividad",
    "Entradas · fontes de atividade",
    "Einnahmen · Tätigkeitsquellen",
    "Entrate · fonti di attività",
    "Inkomsten · activiteiten",
    "الإيرادات · مصادر النشاط",
    "Xaalis bu dugg · cosaan yi",
    "收入 · 业务来源"
  ],
  "choice_expense": [
    "Sorties · frais rapides",
    "Expenses · quick entries",
    "Gastos · registros rápidos",
    "Saídas · registos rápidos",
    "Ausgaben · Schnellerfassung",
    "Spese · registrazioni rapide",
    "Uitgaven · snelle invoer",
    "المصروفات · إدخال سريع",
    "Xaalis bu génn · frais yu gaaw",
    "支出 · 快捷录入"
  ],
  "choice_expense_notice": [
    "Choisis un frais, puis indique le montant.",
    "Choose an expense, then enter the amount.",
    "Elige un gasto y después introduce el importe.",
    "Escolhe uma despesa e indica o valor.",
    "Ausgabe wählen und Betrag eingeben.",
    "Scegli una spesa e inserisci l'importo.",
    "Kies een uitgave en voer het bedrag in.",
    "اختر مصروفًا ثم أدخل المبلغ.",
    "Tànnal frais bi, te bind xaalis bi.",
    "选择支出项目，然后填写金额。"
  ],
  "choice_income_notice": [
    "Choisis une source ou une entrée, puis indique le montant.",
    "Choose a source or income, then enter the amount.",
    "Elige una fuente o un ingreso y luego indica el importe.",
    "Escolhe uma fonte ou entrada e indica o valor.",
    "Quelle oder Einnahme wählen und Betrag eingeben.",
    "Scegli una fonte o entrata e indica l'importo.",
    "Kies een bron of inkomst en voer het bedrag in.",
    "اختر مصدرًا أو إيرادًا ثم أدخل المبلغ.",
    "Tànnal cosaan walla xaalis bu dugg, te bind xaalis bi.",
    "选择来源或收入项目，然后填写金额。"
  ],
  "choice_modules": [
    "Modules qui font rentrer",
    "Income-generating modules",
    "Módulos que generan ingresos",
    "Módulos que geram entradas",
    "Einnahmemodule",
    "Moduli che generano entrate",
    "Modules met inkomsten",
    "الوحدات المدرة للدخل",
    "Modil yi di indi xaalis",
    "产生收入的模块"
  ],
  "choice_bank": [
    "Retraite · retraits · banques",
    "Pension · withdrawals · banks",
    "Pensión · retiradas · bancos",
    "Reforma · levantamentos · bancos",
    "Rente · Abhebungen · Banken",
    "Pensione · prelievi · banche",
    "Pensioen · opnames · banken",
    "معاش · سحب · بنوك",
    "Retraite · jële xaalis · bank yi",
    "退休金 · 取款 · 银行"
  ],
  "choice_other": [
    "Mes autres entrées",
    "Other income",
    "Otros ingresos",
    "Outras entradas",
    "Weitere Einnahmen",
    "Altre entrate",
    "Overige inkomsten",
    "إيرادات أخرى",
    "Yeneen xaalis bu dugg",
    "其他收入"
  ],
  "choice_empty": [
    "Aucun choix rapide. Ajoute un libellé dans les réglages.",
    "No quick options. Add a label in Settings.",
    "Sin opciones rápidas. Añade un concepto en Ajustes.",
    "Sem opções rápidas. Adiciona um nome nas Definições.",
    "Keine Schnellauswahl. In Einstellungen hinzufügen.",
    "Nessuna opzione rapida. Aggiungi un'etichetta nelle impostazioni.",
    "Geen snelle opties. Voeg er een toe bij Instellingen.",
    "لا توجد خيارات سريعة. أضف تسمية من الإعدادات.",
    "Amul tànneef bu gaaw. Yokkal tur ci Saytu.",
    "暂无快捷选项，请在设置中添加。"
  ],
  "choice_category_other": [
    "Mes libellés",
    "My labels",
    "Mis conceptos",
    "Os meus rótulos",
    "Meine Bezeichnungen",
    "Le mie etichette",
    "Mijn labels",
    "تسمياتي",
    "Sama tur yi",
    "我的标签"
  ],
  "choice_category_modules": [
    "Entrées / modules",
    "Income / modules",
    "Ingresos / módulos",
    "Entradas / módulos",
    "Einnahmen / Module",
    "Entrate / moduli",
    "Inkomsten / modules",
    "إيرادات / وحدات",
    "Xaalis bu dugg / modil yi",
    "收入 / 模块"
  ],
  "reserve_title": [
    "Réserve DIGIY",
    "DIGIY reserve",
    "Reserva DIGIY",
    "Reserva DIGIY",
    "DIGIY-Rücklage",
    "Riserva DIGIY",
    "DIGIY-reserve",
    "احتياطي DIGIY",
    "Réserve DIGIY",
    "DIGIY 储备金"
  ],
  "reserve_intro": [
    "Tu peux mettre de côté ou reprendre une somme. Tu confirmes chaque mouvement.",
    "You can set money aside or take some back. You confirm each transaction.",
    "Puedes reservar o recuperar dinero. Confirma cada movimiento.",
    "Podes guardar ou retirar dinheiro. Confirma cada movimento.",
    "Geld zurücklegen oder entnehmen. Jede Buchung wird bestätigt.",
    "Puoi mettere da parte o riprendere denaro. Confermi ogni movimento.",
    "Geld opzijzetten of terugnemen. Bevestig elke transactie.",
    "يمكنك ادخار مبلغ أو سحبه. تؤكد كل عملية.",
    "Mën nga denc xaalis walla jël ci réserve. Yaw ngay wóoral bépp mouvement.",
    "可以存入或取出储备金。每笔操作均由您确认。"
  ],
  "reserve_keep": [
    "＋ Garder",
    "＋ Set aside",
    "＋ Reservar",
    "＋ Guardar",
    "＋ Zurücklegen",
    "＋ Accantona",
    "＋ Opzijzetten",
    "＋ ادخار",
    "＋ Denc",
    "＋ 存入"
  ],
  "reserve_take": [
    "− Récupérer",
    "− Take back",
    "− Recuperar",
    "− Retirar",
    "− Entnehmen",
    "− Riprendi",
    "− Terugnemen",
    "− استرجاع",
    "− Jël",
    "− 取出"
  ],
  "reserve_advice": [
    "Protège la réserve quand la trésorerie le permet.",
    "Protect your reserve when cash flow allows.",
    "Protege la reserva cuando la tesorería lo permita.",
    "Protege a reserva quando a tesouraria permitir.",
    "Rücklage schützen, wenn die Liquidität es zulässt.",
    "Proteggi la riserva quando la liquidità lo consente.",
    "Bescherm de reserve wanneer de kas dat toelaat.",
    "احمِ الاحتياطي عندما تسمح السيولة.",
    "Aaral réserve bi bu xaalis bi nangu.",
    "资金允许时，请保护储备金。"
  ]
};
  function lang() {
    const choice=root.DIGIY_WORLD8?.getLang?.() || "fr";
    return LANGS.includes(choice)?choice:"fr";
  }
  function t(key,params) {
    const row=Object.prototype.hasOwnProperty.call(ROWS,key)?ROWS[key]:null;
    if(!row)return key;
    let result=row[LANGS.indexOf(lang())]||row[0];
    if(params&&typeof params==="object")result=result.replace(/\{([a-z_]+)\}/g,(token,key)=>Object.prototype.hasOwnProperty.call(params,key)?String(params[key]):token);
    return result;
  }
  function apply() {
    document.querySelectorAll("[data-move10]").forEach(el=>{
      el.textContent=t(el.getAttribute("data-move10"));
    });
    document.querySelectorAll("[data-move10-placeholder]").forEach(el=>{
      el.setAttribute("placeholder",t(el.getAttribute("data-move10-placeholder")));
    });
  }
  root.DIGIY_MOVE10=Object.freeze({t,lang,apply,keys:Object.freeze(Object.keys(ROWS))});
})(window);
