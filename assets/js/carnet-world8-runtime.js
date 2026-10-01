/* PRO CARNET WORLD8 — Jour / Oreille / Client dû */
(function(){
  "use strict";
  const LANGS=["fr","en","es","pt","de","it","nl","ar"];
  const lang=(()=>{
    try{
      const p=(new URLSearchParams(location.search).get("lang")||localStorage.getItem("digiy-lang")||localStorage.getItem("digiy_lang")||"fr").slice(0,2).toLowerCase();
      return LANGS.includes(p)?p:"fr";
    }catch(_){return "fr";}
  })();
  try{localStorage.setItem("digiy-lang",lang)}catch(_){}
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";

  const D={
    en:{"Mon activité":"My activity","Aujourd’hui":"Today","Situation du jour en haut. Ajouter déroule les encaissements, les dépenses et la réserve. Le journal garde les traces de l’activité.":"Today's situation is at the top. Add opens income, expenses and reserve. The journal keeps the activity records.","Entrées jour":"Today's income","Sorties jour":"Today's expenses","Net jour":"Today's net","Voix CARNET":"CARNET Voice","Parler maintenant":"Speak now","Parle, corrige, puis valide. La base complète reste accessible.":"Speak, correct, then validate. The full form remains available.","Quelques exemples à lire":"A few examples to say","Client dû":"Customer balance due","Clients dus":"Customer balances due","Montant dû":"Amount due","Remboursement client dû":"Customer repayment","Ajouter":"Add","Menu":"Menu","Mes clients":"My customers","Historique":"History","Saisie":"Entry"},
    es:{"Mon activité":"Mi actividad","Aujourd’hui":"Hoy","Situation du jour en haut. Ajouter déroule les encaissements, les dépenses et la réserve. Le journal garde les traces de l’activité.":"La situación del día aparece arriba. Añadir abre ingresos, gastos y reserva. El diario conserva los registros.","Entrées jour":"Ingresos del día","Sorties jour":"Gastos del día","Net jour":"Neto del día","Voix CARNET":"Voz CARNET","Parler maintenant":"Hablar ahora","Parle, corrige, puis valide. La base complète reste accessible.":"Habla, corrige y valida. El formulario completo sigue disponible.","Quelques exemples à lire":"Algunos ejemplos","Client dû":"Cliente con saldo pendiente","Clients dus":"Clientes con saldo pendiente","Montant dû":"Importe pendiente","Remboursement client dû":"Pago de cliente pendiente","Ajouter":"Añadir","Menu":"Menú","Mes clients":"Mis clientes","Historique":"Historial","Saisie":"Entrada"},
    pt:{"Mon activité":"Minha atividade","Aujourd’hui":"Hoje","Situation du jour en haut. Ajouter déroule les encaissements, les dépenses et la réserve. Le journal garde les traces de l’activité.":"A situação do dia aparece no topo. Adicionar abre entradas, despesas e reserva. O diário mantém os registos.","Entrées jour":"Entradas do dia","Sorties jour":"Saídas do dia","Net jour":"Líquido do dia","Voix CARNET":"Voz CARNET","Parler maintenant":"Falar agora","Parle, corrige, puis valide. La base complète reste accessible.":"Fale, corrija e valide. O formulário completo continua disponível.","Quelques exemples à lire":"Alguns exemplos","Client dû":"Cliente com valor em dívida","Clients dus":"Clientes com valores em dívida","Montant dû":"Valor devido","Remboursement client dû":"Pagamento de dívida do cliente","Ajouter":"Adicionar","Menu":"Menu","Mes clients":"Meus clientes","Historique":"Histórico","Saisie":"Lançamento"},
    de:{"Mon activité":"Meine Aktivität","Aujourd’hui":"Heute","Situation du jour en haut. Ajouter déroule les encaissements, les dépenses et la réserve. Le journal garde les traces de l’activité.":"Die heutige Situation steht oben. Hinzufügen öffnet Einnahmen, Ausgaben und Reserve. Das Journal bewahrt die Einträge.","Entrées jour":"Einnahmen heute","Sorties jour":"Ausgaben heute","Net jour":"Netto heute","Voix CARNET":"CARNET Sprache","Parler maintenant":"Jetzt sprechen","Parle, corrige, puis valide. La base complète reste accessible.":"Sprechen, korrigieren und bestätigen. Das vollständige Formular bleibt verfügbar.","Quelques exemples à lire":"Einige Beispiele","Client dû":"Offener Kundenbetrag","Clients dus":"Offene Kundenbeträge","Montant dû":"Offener Betrag","Remboursement client dû":"Kundenzahlung","Ajouter":"Hinzufügen","Menu":"Menü","Mes clients":"Meine Kunden","Historique":"Verlauf","Saisie":"Erfassung"},
    it:{"Mon activité":"La mia attività","Aujourd’hui":"Oggi","Situation du jour en haut. Ajouter déroule les encaissements, les dépenses et la réserve. Le journal garde les traces de l’activité.":"La situazione del giorno è in alto. Aggiungi apre entrate, spese e riserva. Il registro conserva le tracce.","Entrées jour":"Entrate di oggi","Sorties jour":"Uscite di oggi","Net jour":"Netto di oggi","Voix CARNET":"Voce CARNET","Parler maintenant":"Parla ora","Parle, corrige, puis valide. La base complète reste accessible.":"Parla, correggi e convalida. Il modulo completo resta disponibile.","Quelques exemples à lire":"Alcuni esempi","Client dû":"Credito cliente","Clients dus":"Crediti clienti","Montant dû":"Importo dovuto","Remboursement client dû":"Pagamento credito cliente","Ajouter":"Aggiungi","Menu":"Menu","Mes clients":"I miei clienti","Historique":"Cronologia","Saisie":"Inserimento"},
    nl:{"Mon activité":"Mijn activiteit","Aujourd’hui":"Vandaag","Situation du jour en haut. Ajouter déroule les encaissements, les dépenses et la réserve. Le journal garde les traces de l’activité.":"De situatie van vandaag staat bovenaan. Toevoegen opent inkomsten, uitgaven en reserve. Het dagboek bewaart de registraties.","Entrées jour":"Inkomsten vandaag","Sorties jour":"Uitgaven vandaag","Net jour":"Netto vandaag","Voix CARNET":"CARNET Stem","Parler maintenant":"Nu spreken","Parle, corrige, puis valide. La base complète reste accessible.":"Spreek, corrigeer en bevestig. Het volledige formulier blijft beschikbaar.","Quelques exemples à lire":"Enkele voorbeelden","Client dû":"Openstaand klantbedrag","Clients dus":"Openstaande klantbedragen","Montant dû":"Openstaand bedrag","Remboursement client dû":"Klantbetaling","Ajouter":"Toevoegen","Menu":"Menu","Mes clients":"Mijn klanten","Historique":"Geschiedenis","Saisie":"Invoer"},
    ar:{"Mon activité":"نشاطي","Aujourd’hui":"اليوم","Situation du jour en haut. Ajouter déroule les encaissements, les dépenses et la réserve. Le journal garde les traces de l’activité.":"وضع اليوم في الأعلى. زر الإضافة يفتح المداخيل والمصاريف والاحتياطي، والسجل يحتفظ بكل العمليات.","Entrées jour":"مداخيل اليوم","Sorties jour":"مصاريف اليوم","Net jour":"صافي اليوم","Voix CARNET":"صوت CARNET","Parler maintenant":"تحدث الآن","Parle, corrige, puis valide. La base complète reste accessible.":"تحدث وصحح ثم أكد. يبقى النموذج الكامل متاحًا.","Quelques exemples à lire":"بعض الأمثلة","Client dû":"مبلغ مستحق على العميل","Clients dus":"مبالغ مستحقة على العملاء","Montant dû":"المبلغ المستحق","Remboursement client dû":"سداد العميل","Ajouter":"إضافة","Menu":"القائمة","Mes clients":"عملائي","Historique":"السجل","Saisie":"إدخال"}
  };
  const dict=D[lang]||{};

  function translateText(root=document.body){
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n=>{
      const raw=n.nodeValue, trimmed=raw.trim();
      if(!trimmed)return;
      if(dict[trimmed]) n.nodeValue=raw.replace(trimmed,dict[trimmed]);
      else{
        Object.keys(dict).forEach(k=>{if(n.nodeValue.includes(k)) n.nodeValue=n.nodeValue.split(k).join(dict[k])});
      }
    });
    root.querySelectorAll?.("[placeholder]").forEach(el=>{
      const v=el.getAttribute("placeholder"); if(dict[v]) el.setAttribute("placeholder",dict[v]);
    });
  }

  function switcher(){
    if(document.getElementById("digiyWorld8Switch"))return;
    const box=document.createElement("div");
    box.id="digiyWorld8Switch";
    box.style.cssText="position:fixed;top:6px;right:8px;z-index:1000;display:flex;gap:3px;padding:4px;border-radius:999px;background:rgba(6,20,15,.92);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(10px);max-width:calc(100vw - 16px);overflow:auto";
    LANGS.forEach(l=>{
      const b=document.createElement("button"); b.type="button"; b.textContent=l.toUpperCase();
      b.style.cssText="border:0;border-radius:999px;padding:5px 7px;font:800 10px system-ui;cursor:pointer;background:"+(l===lang?"#f4d27a":"transparent")+";color:"+(l===lang?"#142016":"#fff")+";";
      b.onclick=()=>{try{localStorage.setItem("digiy-lang",l)}catch(_){} const u=new URL(location.href);u.searchParams.set("lang",l);location.href=u.toString();};
      box.appendChild(b);
    });
    document.body.appendChild(box);
  }
  function run(){translateText();switcher();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true}); else run();
  new MutationObserver(m=>{for(const x of m){for(const n of x.addedNodes){if(n.nodeType===1)translateText(n)}}}).observe(document.documentElement,{childList:true,subtree:true});
})();