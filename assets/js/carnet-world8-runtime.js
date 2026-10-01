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
  Object.assign(D.en,{
    "Ouvert":"Open","Solde PRO":"PRO balance","Solde PERSO":"PERSONAL balance","Réserve":"Reserve",
    "le bouton magique : saisie rapide, frais, entrées, coffre":"the magic button: quick entry, expenses, income, reserve",
    "PRIVÉ : choisis le mode, pose le montant, PRO CARNET garde la trace.":"PRIVATE: choose the mode, enter the amount, PRO CARNET keeps the record.",
    "Mouvements du jour":"Today's movements","Lecture":"View","Réglages":"Settings","Tout":"All","Entrées":"Income","Sorties":"Expenses",
    "Base vierge. Ajoute ton premier mouvement réel.":"Empty base. Add your first real movement.","Accueil":"Home","Sources":"Sources",
    "plein écran":"full screen","Entrée":"Income","CA modules":"module revenue","Frais":"Expenses","tout voir":"view all","Coffre":"Reserve",
    "réserve":"reserve","Tous les frais rapides":"All quick expenses","Frais bancaire":"Bank fees","Prélèvement banque France":"France bank debit",
    "Crédit téléphone":"Phone credit","École":"School","Frais voiture":"Car expenses","Ravitaillement":"Supplies","Vêtements":"Clothing"
  });
  Object.assign(D.de,{
    "Ouvert":"Offen","Solde PRO":"PRO-Saldo","Solde PERSO":"PERSO-Saldo","Réserve":"Reserve",
    "le bouton magique : saisie rapide, frais, entrées, coffre":"der magische Knopf: schnelle Eingabe, Ausgaben, Einnahmen, Reserve",
    "PRIVÉ : choisis le mode, pose le montant, PRO CARNET garde la trace.":"PRIVAT: Modus wählen, Betrag eingeben, PRO CARNET speichert die Spur.",
    "Mouvements du jour":"Bewegungen des Tages","Lecture":"Ansicht","Réglages":"Einstellungen","Tout":"Alle","Entrées":"Einnahmen","Sorties":"Ausgaben",
    "Base vierge. Ajoute ton premier mouvement réel.":"Leere Basis. Füge deine erste echte Bewegung hinzu.","Accueil":"Start","Sources":"Quellen",
    "plein écran":"Vollbild","Entrée":"Einnahme","CA modules":"Modulumsatz","Frais":"Ausgaben","tout voir":"alles sehen","Coffre":"Reserve",
    "réserve":"Reserve","Tous les frais rapides":"Alle schnellen Ausgaben","Frais bancaire":"Bankgebühren","Prélèvement banque France":"Bankabbuchung Frankreich",
    "Crédit téléphone":"Handyguthaben","École":"Schule","Frais voiture":"Autokosten","Ravitaillement":"Einkäufe","Vêtements":"Kleidung"
  });
  Object.assign(D.es,{
    "Ouvert":"Abierto","Solde PRO":"Saldo PRO","Solde PERSO":"Saldo PERSONAL","Réserve":"Reserva",
    "le bouton magique : saisie rapide, frais, entrées, coffre":"el botón mágico: entrada rápida, gastos, ingresos, reserva",
    "PRIVÉ : choisis le mode, pose le montant, PRO CARNET garde la trace.":"PRIVADO: elige el modo, introduce el importe y PRO CARNET conserva el registro.",
    "Mouvements du jour":"Movimientos del día","Lecture":"Vista","Réglages":"Ajustes","Tout":"Todo","Entrées":"Ingresos","Sorties":"Gastos",
    "Base vierge. Ajoute ton premier mouvement réel.":"Base vacía. Añade tu primer movimiento real.","Accueil":"Inicio","Sources":"Fuentes",
    "plein écran":"pantalla completa","Entrée":"Ingreso","CA modules":"ingresos de módulos","Frais":"Gastos","tout voir":"ver todo","Coffre":"Reserva",
    "réserve":"reserva","Tous les frais rapides":"Todos los gastos rápidos","Frais bancaire":"Comisiones bancarias","Prélèvement banque France":"Débito bancario Francia",
    "Crédit téléphone":"Crédito telefónico","École":"Escuela","Frais voiture":"Gastos de coche","Ravitaillement":"Suministros","Vêtements":"Ropa"
  });
  Object.assign(D.pt,{
    "Ouvert":"Aberto","Solde PRO":"Saldo PRO","Solde PERSO":"Saldo PESSOAL","Réserve":"Reserva",
    "le bouton magique : saisie rapide, frais, entrées, coffre":"o botão mágico: lançamento rápido, despesas, entradas, reserva",
    "PRIVÉ : choisis le mode, pose le montant, PRO CARNET garde la trace.":"PRIVADO: escolha o modo, insira o valor e o PRO CARNET guarda o registo.",
    "Mouvements du jour":"Movimentos do dia","Lecture":"Vista","Réglages":"Definições","Tout":"Tudo","Entrées":"Entradas","Sorties":"Saídas",
    "Base vierge. Ajoute ton premier mouvement réel.":"Base vazia. Adicione o primeiro movimento real.","Accueil":"Início","Sources":"Fontes",
    "plein écran":"ecrã inteiro","Entrée":"Entrada","CA modules":"receita dos módulos","Frais":"Despesas","tout voir":"ver tudo","Coffre":"Reserva",
    "réserve":"reserva","Tous les frais rapides":"Todas as despesas rápidas","Frais bancaire":"Taxas bancárias","Prélèvement banque France":"Débito bancário França",
    "Crédit téléphone":"Crédito telefónico","École":"Escola","Frais voiture":"Despesas do carro","Ravitaillement":"Abastecimento","Vêtements":"Roupa"
  });
  Object.assign(D.it,{
    "Ouvert":"Aperto","Solde PRO":"Saldo PRO","Solde PERSO":"Saldo PERSONALE","Réserve":"Riserva",
    "le bouton magique : saisie rapide, frais, entrées, coffre":"il pulsante magico: inserimento rapido, spese, entrate, riserva",
    "PRIVÉ : choisis le mode, pose le montant, PRO CARNET garde la trace.":"PRIVATO: scegli la modalità, inserisci l'importo e PRO CARNET conserva la traccia.",
    "Mouvements du jour":"Movimenti del giorno","Lecture":"Vista","Réglages":"Impostazioni","Tout":"Tutto","Entrées":"Entrate","Sorties":"Uscite",
    "Base vierge. Ajoute ton premier mouvement réel.":"Base vuota. Aggiungi il primo movimento reale.","Accueil":"Home","Sources":"Fonti",
    "plein écran":"schermo intero","Entrée":"Entrata","CA modules":"ricavi moduli","Frais":"Spese","tout voir":"vedi tutto","Coffre":"Riserva",
    "réserve":"riserva","Tous les frais rapides":"Tutte le spese rapide","Frais bancaire":"Commissioni bancarie","Prélèvement banque France":"Addebito bancario Francia",
    "Crédit téléphone":"Credito telefonico","École":"Scuola","Frais voiture":"Spese auto","Ravitaillement":"Rifornimenti","Vêtements":"Abbigliamento"
  });
  Object.assign(D.nl,{
    "Ouvert":"Open","Solde PRO":"PRO-saldo","Solde PERSO":"PERSOONLIJK saldo","Réserve":"Reserve",
    "le bouton magique : saisie rapide, frais, entrées, coffre":"de magische knop: snelle invoer, uitgaven, inkomsten, reserve",
    "PRIVÉ : choisis le mode, pose le montant, PRO CARNET garde la trace.":"PRIVÉ: kies de modus, voer het bedrag in en PRO CARNET bewaart de registratie.",
    "Mouvements du jour":"Bewegingen van vandaag","Lecture":"Overzicht","Réglages":"Instellingen","Tout":"Alles","Entrées":"Inkomsten","Sorties":"Uitgaven",
    "Base vierge. Ajoute ton premier mouvement réel.":"Lege basis. Voeg je eerste echte beweging toe.","Accueil":"Start","Sources":"Bronnen",
    "plein écran":"volledig scherm","Entrée":"Inkomst","CA modules":"module-omzet","Frais":"Uitgaven","tout voir":"alles bekijken","Coffre":"Reserve",
    "réserve":"reserve","Tous les frais rapides":"Alle snelle uitgaven","Frais bancaire":"Bankkosten","Prélèvement banque France":"Bankafschrijving Frankrijk",
    "Crédit téléphone":"Telefoontegoed","École":"School","Frais voiture":"Autokosten","Ravitaillement":"Benodigdheden","Vêtements":"Kleding"
  });
  Object.assign(D.ar,{
    "Ouvert":"مفتوح","Solde PRO":"رصيد مهني","Solde PERSO":"رصيد شخصي","Réserve":"احتياطي",
    "le bouton magique : saisie rapide, frais, entrées, coffre":"الزر السحري: إدخال سريع، مصاريف، مداخيل، احتياطي",
    "PRIVÉ : choisis le mode, pose le montant, PRO CARNET garde la trace.":"خاص: اختر الطريقة وأدخل المبلغ، وPRO CARNET يحتفظ بالأثر.",
    "Mouvements du jour":"حركات اليوم","Lecture":"عرض","Réglages":"الإعدادات","Tout":"الكل","Entrées":"المداخيل","Sorties":"المصاريف",
    "Base vierge. Ajoute ton premier mouvement réel.":"القاعدة فارغة. أضف أول حركة حقيقية.","Accueil":"الرئيسية","Sources":"المصادر",
    "plein écran":"ملء الشاشة","Entrée":"مدخول","CA modules":"مداخيل الوحدات","Frais":"مصاريف","tout voir":"عرض الكل","Coffre":"احتياطي",
    "réserve":"احتياطي","Tous les frais rapides":"كل المصاريف السريعة","Frais bancaire":"رسوم بنكية","Prélèvement banque France":"اقتطاع بنكي فرنسا",
    "Crédit téléphone":"رصيد هاتف","École":"مدرسة","Frais voiture":"مصاريف السيارة","Ravitaillement":"تموين","Vêtements":"ملابس"
  });

  let currentLang=lang;

  function canonicalFor(text){
    if(!text)return null;
    for(const fr of Object.keys(D.en||{})){
      if(text===fr)return fr;
      for(const l of Object.keys(D)){
        if(D[l]&&D[l][fr]===text)return fr;
      }
    }
    return null;
  }

  function translateText(root=document.body,target=currentLang){
    const dict=D[target]||{};
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n=>{
      const raw=n.nodeValue, trimmed=raw.trim();
      if(!trimmed)return;
      let fr=canonicalFor(trimmed);
      if(fr){
        const out=target==="fr"?fr:(dict[fr]||fr);
        n.nodeValue=raw.replace(trimmed,out);
        return;
      }
      for(const key of Object.keys(D.en||{})){
        const variants=[key,...Object.values(D).map(x=>x&&x[key]).filter(Boolean)];
        for(const v of variants){
          if(v&&n.nodeValue.includes(v)){
            const out=target==="fr"?key:(dict[key]||key);
            n.nodeValue=n.nodeValue.split(v).join(out);
            break;
          }
        }
      }
    });
    root.querySelectorAll?.("[placeholder]").forEach(el=>{
      const v=el.getAttribute("placeholder");
      const fr=canonicalFor(v);
      if(fr)el.setAttribute("placeholder",target==="fr"?fr:(dict[fr]||fr));
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
      b.onclick=()=>setLang(l);
      box.appendChild(b);
    });
    document.body.appendChild(box);
  }
  function setLang(l){
    if(!LANGS.includes(l))return;
    try{localStorage.setItem("digiy-lang",l);localStorage.setItem("digiy_lang",l)}catch(_){}
    currentLang=l;
    document.documentElement.lang=l;
    document.documentElement.dir=l==="ar"?"rtl":"ltr";
    const u=new URL(location.href);
    u.searchParams.set("lang",l);
    history.replaceState(null,"",u.toString());
    translateText(document.body,l);
    document.querySelectorAll("[data-world8-lang]").forEach(b=>{
      b.style.background=b.dataset.world8Lang===l?"#f4d27a":"transparent";
      b.style.color=b.dataset.world8Lang===l?"#142016":"#fff";
    });
  }
  function bindStatic(){
    document.querySelectorAll("[data-world8-lang]").forEach(b=>{
      b.onclick=()=>setLang(b.dataset.world8Lang);
    });
  }
  function run(){translateText(document.body,currentLang);switcher();bindStatic();setLang(currentLang);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true}); else run();
  new MutationObserver(m=>{for(const x of m){for(const n of x.addedNodes){if(n.nodeType===1)translateText(n)}}}).observe(document.documentElement,{childList:true,subtree:true});
})();