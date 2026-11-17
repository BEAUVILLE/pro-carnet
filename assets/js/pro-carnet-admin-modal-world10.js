/* PRO CARNET WORLD10 · administration accessible via ☰ Admin.
 * Only display text: option.value, ids, stored labels and categories remain canonical.
 */
(function(root) {
 "use strict";
 const LANGS=["fr","en","es","pt","de","it","nl","ar","wo","zh"];
 const ROWS={
  "title": [
    "Réglages",
    "Settings",
    "Ajustes",
    "Definições",
    "Einstellungen",
    "Impostazioni",
    "Instellingen",
    "الإعدادات",
    "Saytu",
    "设置"
  ],
  "intro": [
    "Ajoute des modules à ton activité. Choisis leurs noms et leur catégorie : les données restent sous ton contrôle.",
    "Add modules to your activity. Choose their names and categories; you stay in control of your data.",
    "Añade módulos a tu actividad. Elige sus nombres y categorías; controlas tus datos.",
    "Adiciona módulos à tua atividade. Escolhe os nomes e categorias; controlas os teus dados.",
    "Module zur Tätigkeit hinzufügen. Namen und Kategorien festlegen; die Daten bleiben unter deiner Kontrolle.",
    "Aggiungi moduli alla tua attività. Scegli nomi e categorie; i dati restano sotto il tuo controllo.",
    "Voeg modules toe aan je activiteit. Kies namen en categorieën; jij beheert de gegevens.",
    "أضف وحدات لنشاطك واختر أسماءها وفئاتها. تبقى بياناتك تحت سيطرتك.",
    "Yokkal modil yi ci sa liggéey. Tànnal tur yi ak catégorie yi; yaw yaay saytu say données.",
    "为业务添加模块并选择名称和分类；数据由你掌控。"
  ],
  "module_pocket": [
    "Compte du module",
    "Module account",
    "Cuenta del módulo",
    "Conta do módulo",
    "Modulkonto",
    "Conto del modulo",
    "Modulerekening",
    "حساب الوحدة",
    "Kontu modil bi",
    "模块账户"
  ],
  "module_name": [
    "Nom du module",
    "Module name",
    "Nombre del módulo",
    "Nome do módulo",
    "Modulname",
    "Nome del modulo",
    "Modulenaam",
    "اسم الوحدة",
    "Turu modil bi",
    "模块名称"
  ],
  "module_hint": [
    "Ex. ABOS, RÉSEAU…",
    "E.g. ABOS, NETWORK…",
    "Ej. ABOS, RED…",
    "Ex. ABOS, REDE…",
    "Z. B. ABOS, NETZWERK…",
    "Es. ABOS, RETE…",
    "Bijv. ABOS, NETWERK…",
    "مثل ABOS أو الشبكة…",
    "Misaal ABOS, RÉSEAU…",
    "例如 ABOS、网络…"
  ],
  "add_module": [
    "Ajouter un module",
    "Add module",
    "Añadir módulo",
    "Adicionar módulo",
    "Modul hinzufügen",
    "Aggiungi modulo",
    "Module toevoegen",
    "إضافة وحدة",
    "Yokk modil",
    "添加模块"
  ],
  "quick_name": [
    "Nouveau libellé rapide",
    "New quick label",
    "Nuevo concepto rápido",
    "Novo rótulo rápido",
    "Neue Schnellbezeichnung",
    "Nuova voce rapida",
    "Nieuw snel label",
    "تسمية سريعة جديدة",
    "Tur bu bees bu gaaw",
    "新建快捷项目"
  ],
  "quick_hint": [
    "Ex. Tabaski, retrait bancaire, billet…",
    "E.g. Tabaski, bank withdrawal, ticket…",
    "Ej. Tabaski, retirada bancaria, billete…",
    "Ex. Tabaski, levantamento, bilhete…",
    "Z. B. Tabaski, Abhebung, Ticket…",
    "Es. Tabaski, prelievo, biglietto…",
    "Bijv. Tabaski, opname, ticket…",
    "مثل تاباسكي أو سحب بنكي أو تذكرة…",
    "Misaal Tabaski, retrait bank, billet…",
    "例如节日、银行取款、车票…"
  ],
  "family": [
    "Nature",
    "Type",
    "Naturaleza",
    "Tipo",
    "Art",
    "Tipo",
    "Soort",
    "نوع",
    "Xeet",
    "类型"
  ],
  "pocket": [
    "Compte",
    "Account",
    "Cuenta",
    "Conta",
    "Konto",
    "Conto",
    "Rekening",
    "الحساب",
    "Kont",
    "账户"
  ],
  "both": [
    "Les deux",
    "Both",
    "Ambos",
    "Ambos",
    "Beide",
    "Entrambi",
    "Beide",
    "كلاهما",
    "Ñaar ñépp",
    "两者"
  ],
  "default_mode": [
    "Paiement par défaut",
    "Default payment method",
    "Pago predeterminado",
    "Pagamento predefinido",
    "Standard-Zahlungsart",
    "Pagamento predefinito",
    "Standaard betaalwijze",
    "طريقة الدفع الافتراضية",
    "Anamu fay bu ñu jëkk",
    "默认支付方式"
  ],
  "screen_group": [
    "Catégorie d’affichage",
    "Display category",
    "Categoría de visualización",
    "Categoria de apresentação",
    "Anzeigekategorie",
    "Categoria visualizzata",
    "Weergavecategorie",
    "فئة العرض",
    "Catégorie buy feeñ",
    "显示分类"
  ],
  "help": [
    "Nomme le libellé, choisis ses réglages puis valide. Il apparaîtra dans la liste de saisie.",
    "Name the label, choose its settings and confirm. It will appear in the entry list.",
    "Nombra el concepto, elige sus ajustes y confirma. Aparecerá en la lista de registro.",
    "Dá um nome, escolhe as opções e confirma. Surgirá na lista de registo.",
    "Bezeichnung eingeben, Einstellungen wählen und bestätigen. Sie erscheint in der Eingabeliste.",
    "Dai un nome, scegli le impostazioni e conferma. Apparirà nell'elenco.",
    "Geef een naam, kies de instellingen en bevestig. Het verschijnt in de invoerlijst.",
    "أدخل الاسم واختر الإعدادات ثم أكد. سيظهر في قائمة الإدخال.",
    "Bindal tur bi, tànnal réglage yi, te wóoral. Dina feeñ ci list bi.",
    "填写名称、选择设置并确认；项目将显示在录入列表中。"
  ],
  "validate": [
    "✅ Valider le libellé rapide",
    "✅ Save quick label",
    "✅ Guardar concepto rápido",
    "✅ Guardar rótulo rápido",
    "✅ Schnellbezeichnung speichern",
    "✅ Salva voce rapida",
    "✅ Snel label opslaan",
    "✅ حفظ التسمية السريعة",
    "✅ Denc tur bu gaaw",
    "✅ 保存快捷项目"
  ],
  "edit_validate": [
    "✅ Modifier le libellé",
    "✅ Update label",
    "✅ Modificar concepto",
    "✅ Alterar rótulo",
    "✅ Bezeichnung ändern",
    "✅ Modifica voce",
    "✅ Label wijzigen",
    "✅ تعديل التسمية",
    "✅ Jubanti tur bi",
    "✅ 修改项目"
  ],
  "person": [
    "Personne / repère",
    "Person / reference",
    "Persona / referencia",
    "Pessoa / referência",
    "Person / Bezug",
    "Persona / riferimento",
    "Persoon / kenmerk",
    "شخص / مرجع",
    "Nit / xàmle",
    "人员 / 标记"
  ],
  "person_hint": [
    "Ex. moi-même, client…",
    "E.g. myself, customer…",
    "Ej. yo mismo, cliente…",
    "Ex. eu próprio, cliente…",
    "Z. B. ich selbst, Kunde…",
    "Es. me stesso, cliente…",
    "Bijv. ikzelf, klant…",
    "مثل نفسي أو عميل…",
    "Misaal man, kiliyaan…",
    "例如本人、客户…"
  ],
  "add_person": [
    "Ajouter une personne",
    "Add person",
    "Añadir persona",
    "Adicionar pessoa",
    "Person hinzufügen",
    "Aggiungi persona",
    "Persoon toevoegen",
    "إضافة شخص",
    "Yokk nit",
    "添加人员"
  ],
  "income": [
    "Entrée",
    "Income",
    "Ingreso",
    "Entrada",
    "Einnahme",
    "Entrata",
    "Inkomst",
    "إيراد",
    "Xaalis bu dugg",
    "收入"
  ],
  "expense": [
    "Sortie",
    "Expense",
    "Gasto",
    "Saída",
    "Ausgabe",
    "Uscita",
    "Uitgave",
    "مصروف",
    "Xaalis bu génn",
    "支出"
  ],
  "cat_mine": [
    "Mes libellés",
    "My labels",
    "Mis conceptos",
    "Os meus rótulos",
    "Meine Bezeichnungen",
    "Le mie voci",
    "Mijn labels",
    "تسمياتي",
    "Sama tur yi",
    "我的项目"
  ],
  "cat_fast": [
    "Sorties rapides",
    "Quick expenses",
    "Gastos rápidos",
    "Despesas rápidas",
    "Schnelle Ausgaben",
    "Spese rapide",
    "Snelle uitgaven",
    "مصروفات سريعة",
    "Xaalis bu génn bu gaaw",
    "快捷支出"
  ],
  "cat_modules": [
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
  "cat_bank": [
    "Retraits / banques",
    "Withdrawals / banks",
    "Retiros / bancos",
    "Levantamentos / bancos",
    "Abhebungen / Banken",
    "Prelievi / banche",
    "Opnames / banken",
    "سحوبات / بنوك",
    "Jële xaalis / bank yi",
    "取款 / 银行"
  ],
  "edit": [
    "Modifier",
    "Edit",
    "Modificar",
    "Alterar",
    "Bearbeiten",
    "Modifica",
    "Bewerken",
    "تعديل",
    "Jubanti",
    "编辑"
  ],
  "delete": [
    "Supprimer",
    "Delete",
    "Eliminar",
    "Eliminar",
    "Löschen",
    "Elimina",
    "Verwijderen",
    "حذف",
    "Far",
    "删除"
  ],
  "required": [
    "Saisis le nom du libellé avant de valider.",
    "Enter a label name before saving.",
    "Introduce un nombre antes de guardar.",
    "Introduz um nome antes de guardar.",
    "Vor dem Speichern einen Namen eingeben.",
    "Inserisci un nome prima di salvare.",
    "Vul een naam in voordat je opslaat.",
    "أدخل اسم التسمية قبل الحفظ.",
    "Bindal tur bi bala ngay denc.",
    "保存前请填写项目名称。"
  ],
  "duplicate": [
    "Ce libellé existe déjà dans cette catégorie.",
    "This label already exists in this category.",
    "Este concepto ya existe en esta categoría.",
    "Este rótulo já existe nesta categoria.",
    "Diese Bezeichnung gibt es in dieser Kategorie bereits.",
    "Questa voce esiste già nella categoria.",
    "Dit label bestaat al in deze categorie.",
    "هذه التسمية موجودة بالفعل في هذه الفئة.",
    "Tur bii am na ba pare ci catégorie bii.",
    "该分类中已存在此项目。"
  ],
  "added": [
    "✅ Libellé ajouté : {name}",
    "✅ Label added: {name}",
    "✅ Concepto añadido: {name}",
    "✅ Rótulo adicionado: {name}",
    "✅ Bezeichnung hinzugefügt: {name}",
    "✅ Voce aggiunta: {name}",
    "✅ Label toegevoegd: {name}",
    "✅ تمت إضافة التسمية: {name}",
    "✅ Yokk nañu tur bi: {name}",
    "✅ 已添加项目：{name}"
  ],
  "changed": [
    "✅ Libellé modifié : {name}",
    "✅ Label updated: {name}",
    "✅ Concepto modificado: {name}",
    "✅ Rótulo alterado: {name}",
    "✅ Bezeichnung geändert: {name}",
    "✅ Voce modificata: {name}",
    "✅ Label gewijzigd: {name}",
    "✅ تم تعديل التسمية: {name}",
    "✅ Jubanti nañu tur bi: {name}",
    "✅ 已更新项目：{name}"
  ],
  "edit_mode": [
    "Mode modification : ajuste puis valide.",
    "Edit mode: adjust and confirm.",
    "Modo edición: ajusta y confirma.",
    "Modo edição: ajusta e confirma.",
    "Bearbeitung: ändern und bestätigen.",
    "Modifica: regola e conferma.",
    "Bewerken: pas aan en bevestig.",
    "وضع التعديل: غيّر ثم أكد.",
    "Jubanti: soppi te wóoral.",
    "编辑模式：修改后确认。"
  ],
  "confirm_module": [
    "Supprimer ce module du listing ?",
    "Remove this module from the list?",
    "¿Eliminar este módulo de la lista?",
    "Remover este módulo da lista?",
    "Modul aus Liste entfernen?",
    "Rimuovere il modulo dall'elenco?",
    "Module uit lijst verwijderen?",
    "هل تريد حذف هذه الوحدة من القائمة؟",
    "Ndax danga bëgg a far modil bii?",
    "从列表中删除该模块？"
  ],
  "confirm_label": [
    "Supprimer ce libellé rapide ?",
    "Delete this quick label?",
    "¿Eliminar este concepto rápido?",
    "Eliminar este rótulo rápido?",
    "Schnellbezeichnung löschen?",
    "Eliminare questa voce rapida?",
    "Dit snelle label verwijderen?",
    "هل تريد حذف هذه التسمية السريعة؟",
    "Ndax danga bëgg a far tur bu gaaw bii?",
    "删除该快捷项目？"
  ],
  "channel_bank": [
    "Banque",
    "Bank",
    "Banco",
    "Banco",
    "Bank",
    "Banca",
    "Bank",
    "بنك",
    "Bank",
    "银行"
  ]
};
 function code(){
   const lang=root.DIGIY_WORLD8?.getLang?.()||"fr";
   return LANGS.includes(lang)?lang:"fr";
 }
 function t(key,values){
   if(!Object.prototype.hasOwnProperty.call(ROWS,key))return key;
   let str=ROWS[key][LANGS.indexOf(code())];
   if(values&&typeof values==="object")str=str.replace(/\{([a-z_]+)\}/g,(m,k)=>Object.prototype.hasOwnProperty.call(values,k)?String(values[k]):m);
   return str;
 }
 function category(raw){
   const keys={"Mes libellés":"cat_mine","Sorties rapides":"cat_fast",
     "Entrées / modules":"cat_modules","Retraits / banques":"cat_bank"};
   return Object.prototype.hasOwnProperty.call(keys,raw)?t(keys[raw]):raw;
 }
 function apply(){
   const modal=document.getElementById("adminModal");
   if(!modal)return;
   modal.querySelectorAll("[data-admin10]").forEach(el=>{el.textContent=t(el.getAttribute("data-admin10"))});
   modal.querySelectorAll("[data-admin10-placeholder]").forEach(el=>{el.setAttribute("placeholder",t(el.getAttribute("data-admin10-placeholder")))});
 }
 root.DIGIY_ADMIN10=Object.freeze({t,code,category,apply,keys:Object.freeze(Object.keys(ROWS))});
})(window);
