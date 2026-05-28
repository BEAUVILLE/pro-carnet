/* DIGIY GO PAY — vocabulaire métier argent
   PAY garde recette, dépense, dette client, encaissement dette, clôture. Les métiers gardent leur détail métier.
*/
(function(){
  "use strict";
  var vocab={
    module:"PAY",
    label:"Mon argent",
    version:"pay-vocab-20260528",
    doctrine:"PAY écoute l'argent réel. Il ne détaille pas les articles, les courses, les réservations ou les chantiers.",
    intents:{income:["recette","entrée","entree","argent reçu","argent recu","encaissement","paiement reçu","paiement recu"],expense:["dépense","depense","sortie","achat","carburant","emballage","fournisseur","loyer","charge"],receivable:["client doit","doit","dette client","à recevoir","a recevoir","crédit","credit"],debtPayment:["a payé","a paye","paiement dette","sur sa dette","avance dette"],closure:["clôture","cloture","fin de journée","fin de journee","total caisse"]},
    fields:{amount:["montant","somme","total","prix"],channel:["cash","espèces","especes","wave","orange money","carte","tpe"],who:["client","origine","boutique","chauffeur","loc","market","réseau","reseau"],category:["catégorie","categorie","motif","type"]},
    examples:["recette boutique 10000 Wave","dépense emballage 3000 cash","Awa doit 15000","Awa a payé 5000 Wave sur sa dette","clôture POS cash 25000 wave 10000"],
    safety:["aucun paiement automatique","aucune dette soldée automatiquement","aucune recette sans validation humaine","PAY ne remplace pas le module métier"],
    bridgePolicy:{acceptsFinalMoneyOnly:true,rejectsArticleDetails:true,rejectsTripDetails:true,rejectsBookingConfirmation:true}
  };
  window.DIGIY_GO_VOCABS=window.DIGIY_GO_VOCABS||{};
  window.DIGIY_GO_VOCABS.PAY=vocab;
  window.DIGIY_GO_PAY_VOCAB=vocab;
})();
