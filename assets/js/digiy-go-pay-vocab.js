/* DIGIY GO PAY — vocabulaire argent FR WO AR
   PAY garde recette, dépense, dette client, encaissement dette, clôture. Les métiers gardent leur détail métier.
*/
(function(){
  "use strict";
  var vocab={
    module:"PAY",
    label:"Mon argent",
    version:"pay-vocab-fr-wo-ar-20260528",
    languages:["fr","wo","ar"],
    doctrine:"PAY écoute l'argent réel en français, wolof ou arabe. Il ne détaille pas les articles, courses, réservations ou chantiers.",
    intents:{
      income:["recette","entrée","entree","argent reçu","argent recu","encaissement","paiement reçu","paiement recu","fay","xaalis bi dugg","dugg","recette","دخل","مدخول","قبض","دفع وصل","مال دخل"],
      expense:["dépense","depense","sortie","achat","carburant","emballage","fournisseur","loyer","charge","génn","jënd","essence","emballage","fournisseur","خرج","مصروف","شراء","بنزين","مورد","إيجار"],
      receivable:["client doit","doit","dette client","à recevoir","a recevoir","crédit","credit","kiliyaan am na bor","bor","war na fay","دين","زبون عليه","مستحق","آجل"],
      debtPayment:["a payé","a paye","paiement dette","sur sa dette","avance dette","fay na","fay bor","جزء من الدين","دفع الدين","سدد"],
      closure:["clôture","cloture","fin de journée","fin de journee","total caisse","tëj caisse","mujj bés","إغلاق","نهاية اليوم","مجموع الصندوق"]
    },
    fields:{
      amount:["montant","somme","total","prix","xaalis","njëg","مبلغ","مجموع","سعر"],
      channel:["cash","espèces","especes","wave","orange money","carte","tpe","xaalis","kesh","كاش","نقدا","وايف","أورنج موني","بطاقة"],
      who:["client","origine","boutique","chauffeur","loc","market","réseau","reseau","kiliyaan","fu joge","زبون","مصدر","محل","سائق"],
      category:["catégorie","categorie","motif","type","wàll","سبب","نوع","فئة"]
    },
    examples:["recette boutique 10000 Wave","dépense emballage 3000 cash","Awa doit 15000","Awa a payé 5000 Wave sur sa dette","دخل المحل 10000 وايف","Awa war na fay 15000"],
    safety:["aucun paiement automatique","aucune dette soldée automatiquement","aucune recette sans validation humaine","PAY ne remplace pas le module métier"],
    bridgePolicy:{acceptsFinalMoneyOnly:true,rejectsArticleDetails:true,rejectsTripDetails:true,rejectsBookingConfirmation:true}
  };
  window.DIGIY_GO_VOCABS=window.DIGIY_GO_VOCABS||{};
  window.DIGIY_GO_VOCABS.PAY=vocab;
  window.DIGIY_GO_PAY_VOCAB=vocab;
})();
