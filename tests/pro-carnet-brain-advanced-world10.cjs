const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const brain=fs.readFileSync("brain-admin.html","utf8");
const code=fs.readFileSync("assets/js/pro-carnet-brain-advanced-world10.js","utf8");
const t=fs.readFileSync("assets/js/pro-carnet-secondary-world10.js","utf8");
new vm.Script(code,{filename:"brain-world10.js"});
assert.match(brain,/pro-carnet-brain-advanced-world10\.js\?v=20261117-admin-advanced-v1/);
assert.match(brain,/id="brainAudioLanguageNotice"/);
assert.match(code,/DIGIY_PRO10\?\.onChange\?\.\(apply\)/);
const match=code.match(/const TABLE=(\[[^;]*\]);\nconst NORM/);
assert.ok(match,"dictionnaire statique présent");
const rows=JSON.parse(match[1]);
assert.ok(rows.length>=115,"au moins 115 textes ou libellés admin");
for(const row of rows){
 assert.equal(row.length,10,"les 10 langues pour "+row[0]);
 assert.ok(row.every(v=>typeof v==="string" && v.trim().length>0),"traduction vide");
}
const keys=rows.map(r=>r[0]);
assert.equal(new Set(keys).size,keys.length,"pas de doublon ambigu");
for(const label of [
 "Base du mois","Charges fixes mensuelles","Crédit à rembourser","Dette à payer",
 "Projet à financer","Sauvegarde locale","Réserve de sécurité","Priorité",
 "Montant","Échéance (jours)","🎧 Écouter la notice"
]) assert.ok(keys.includes(label),"libellé vital manquant : "+label);
assert.doesNotMatch(code,/localStorage\s*\.|sessionStorage\s*\.|\.value\s*=|saveDraft\s*\(|removeItem\s*\(/,
 "le traducteur ne doit jamais modifier les données");
assert.match(brain,/function saveDraft\s*\(/);
assert.match(brain,/function applyBrainPreset\s*\(/);
new vm.Script(t,{filename:"secondary-world10.js"});
console.log("PRO CARNET · Réglages avancés WORLD10: "+rows.length+" libellés, 10 langues, données intactes ✓");
