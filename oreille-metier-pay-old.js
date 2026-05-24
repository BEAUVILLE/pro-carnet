(() => {
  "use strict";
  const BUILD = "oreille-metier-pay-v1-20260519";
  const STORE_NOTES = "digiy_pay_oreille_notes";
  const norm = v => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const amount = text => { const m = norm(text).match(/\b(\d{3,9})\b/); return m ? Number(m[1]) : 0; };
  const channel = text => { const t=norm(text); if(t.includes("wave")) return "wave"; if(t.includes("orange")||/\bom\b/.test(t)) return "orange_money"; if(t.includes("cash")||t.includes("espece")) return "cash"; if(t.includes("carte")) return "card"; return "autre"; };
  const moduleName = text => { const t=norm(text); if(/\bpos\b|commerce|caisse|boutique/.test(t)) return "POS"; if(/market|vente|produit|commande/.test(t)) return "MARKET"; if(/driver|chauffeur|course|trajet|carburant/.test(t)) return "DRIVER"; if(/\bloc\b|logement|nuit|caution/.test(t)) return "LOC"; if(/resa|table|restaurant|reservation/.test(t)) return "RESA"; if(/explore|visite|lieu|guide|circuit/.test(t)) return "EXPLORE"; if(/service|chantier|devis|artisan/.test(t)) return "SERVICES"; return "PAY"; };
  const type = text => { const t=norm(text); if(/dette|doit|creance|reste a payer/.test(t)) return "debt"; if(/depense|sortie|paye|payer|achat|carburant|transport|loyer|fournisseur/.test(t)) return "expense"; if(/reserve|epargne|mettre de cote/.test(t)) return "reserve"; if(/encaisse|recu|recette|vente|avance|acompte|paiement client/.test(t)) return "income"; return "movement"; };
  const label = text => (String(text||"").trim().replace(/\s+/g," ") || "Mouvement PAY").slice(0,130);
  function parse(text){ const d={module:moduleName(text),origin:moduleName(text),type:type(text),amount:amount(text),channel:channel(text),label:label(text),note:"Oreille PAY : "+label(text),created_at:new Date().toISOString()}; d.nature=d.type==="income"?"Entrée":d.type==="expense"?"Dépense":d.type==="debt"?"Dette":d.type==="reserve"?"Réserve":"Mouvement"; return d; }
  function getNotes(){ try{return JSON.parse(localStorage.getItem(STORE_NOTES)||"[]")||[]}catch(_){return[]} }
  function saveNote(draft){ const notes=getNotes(); notes.unshift(draft); localStorage.setItem(STORE_NOTES,JSON.stringify(notes.slice(0,40))); localStorage.setItem("digiy_pay_oreille_last_movement",JSON.stringify(draft)); }
  function toAdminUrl(d){ const u=new URL("./admin.html", location.href); u.searchParams.set("origin",d.origin||"PAY"); u.searchParams.set("module",d.module||"PAY"); u.searchParams.set("type",d.type||"movement"); if(d.amount)u.searchParams.set("amount",String(d.amount)); if(d.channel)u.searchParams.set("channel",d.channel); u.searchParams.set("label",d.label||"Mouvement PAY"); u.searchParams.set("note",d.note||""); return "./"+(u.pathname.split("/").pop()||"admin.html")+u.search; }
  function speak(text){ if(!("speechSynthesis" in window)) return false; try{speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang="fr-FR"; u.rate=.88; u.pitch=1.02; speechSynthesis.speak(u); return true}catch(_){return false} }
  function injectPanel(){
    if(document.getElementById("digiyPayEarPanel")) return;
    const panel=document.createElement("section");
    panel.id="digiyPayEarPanel";
    panel.innerHTML=`<style>
      #digiyPayEarPanel{margin:0 0 16px;border:2px solid rgba(250,204,21,.38);background:radial-gradient(680px 240px at 100% 0%,rgba(250,204,21,.20),transparent 64%),linear-gradient(160deg,rgba(255,250,238,.98),rgba(246,232,202,.96));border-radius:28px;box-shadow:0 14px 34px rgba(77,52,22,.16);overflow:hidden;color:#1f2a1f;font-family:Nunito,Outfit,system-ui,-apple-system,"Segoe UI",sans-serif}
      #digiyPayEarPanel .earInner{padding:18px;display:grid;gap:12px}#digiyPayEarPanel .earKicker{color:#6b4e09;font-size:13px;font-weight:1000;letter-spacing:.08em;text-transform:uppercase}
      #digiyPayEarPanel .earTitle{font-size:clamp(26px,4vw,38px);line-height:1.04;font-weight:1000;letter-spacing:-.035em;color:#241a0d}#digiyPayEarPanel .earText{color:#3d3324;font-size:17px;line-height:1.58;font-weight:950}
      #digiyPayEarPanel textarea{width:100%;min-height:110px;border-radius:20px;border:1px solid rgba(83,58,26,.24);background:rgba(255,255,255,.70);color:#1f2a1f;padding:14px;font:inherit;font-size:17px;font-weight:950;line-height:1.5}
      #digiyPayEarPanel .earActions{display:flex;gap:9px;flex-wrap:wrap}#digiyPayEarPanel button,#digiyPayEarPanel a{min-height:56px;border-radius:18px;border:1px solid rgba(83,58,26,.24);background:rgba(255,255,255,.62);color:#1f2a1f;padding:0 14px;font-weight:1000;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
      #digiyPayEarPanel .gold{background:linear-gradient(135deg,#22c55e,#facc15);color:#102014;border:none}#digiyPayEarPanel .blue{background:rgba(219,234,254,.74);color:#1e3a8a;border-color:rgba(37,99,235,.24)}#digiyPayEarPanel .green{background:rgba(220,252,231,.80);color:#14532d;border-color:rgba(22,101,52,.25)}
      #digiyPayEarPanel .draft{display:none;border-radius:18px;padding:13px;background:rgba(220,252,231,.72);border:1px solid rgba(22,101,52,.24);font-size:15px;font-weight:950;line-height:1.5;color:#14532d}@media(max-width:640px){#digiyPayEarPanel .earActions>*{width:100%}}
    </style><div class="earInner"><div class="earKicker">🎧 Mon oreille PAY</div><div class="earTitle">Le pro parle. DIGIY prépare. PAY range après validation.</div><div class="earText">Exemples : “J’ai encaissé 15000 Wave pour POS”, “Dépense carburant 5000 cash DRIVER”, “Dette client 12000 MARKET”.</div><textarea id="payEarInput" placeholder="Écris ou dicte un mouvement terrain…"></textarea><div class="earActions"><button class="gold" id="payEarPrepare" type="button">Préparer</button><button class="green" id="payEarSave" type="button">Garder la note</button><a class="blue" id="payEarAdmin" href="./admin.html">Envoyer vers Ajouter</a><button id="payEarSpeak" type="button">Écouter</button></div><div class="draft" id="payEarDraft"></div></div>`;
    const target=document.getElementById("payVoicePanel")||document.querySelector(".hero")||document.querySelector(".wrap")||document.querySelector("main")||document.body;
    target.parentNode?target.parentNode.insertBefore(panel,target.nextSibling):document.body.prepend(panel);
    const input=panel.querySelector("#payEarInput"), box=panel.querySelector("#payEarDraft"), link=panel.querySelector("#payEarAdmin");
    function render(){const d=parse(input.value); box.style.display="block"; box.innerHTML=`<strong>${d.label}</strong><br>Nature : ${d.nature} · Montant : ${d.amount||"—"} · Canal : ${d.channel} · Module : ${d.module}`; link.href=toAdminUrl(d); return d;}
    panel.querySelector("#payEarPrepare").onclick=render; panel.querySelector("#payEarSave").onclick=()=>{const d=render(); saveNote(d); speak("Note PAY gardée dans le logiciel.")}; panel.querySelector("#payEarSpeak").onclick=()=>speak(input.value.trim()||"Bienvenue dans PAY. La voix prépare. Le clic confirme. PAY enregistre après validation."); input.oninput=()=>{link.href=toAdminUrl(parse(input.value))};
  }
  function boot(){injectPanel(); window.DIGIY_OREILLE_METIER_PAY={BUILD,parse,speak,saveNote,getNotes,toAdminUrl}; console.info("[DIGIY PAY] oreille métier prête",BUILD);}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
