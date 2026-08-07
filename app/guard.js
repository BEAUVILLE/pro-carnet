// PRO CARNET app guard shim v13 — exige une validation PIN juste avant l'ouverture.
(function(){
  "use strict";
  const ENTRY_KEY="DIGIY_CARNET_ENTRY_OK_V13";
  const MAX_AGE=90*1000;
  let stamp=0;
  try{stamp=Number(sessionStorage.getItem(ENTRY_KEY)||0);sessionStorage.removeItem(ENTRY_KEY)}catch(_){}
  const fresh=stamp>0&&Date.now()-stamp>=0&&Date.now()-stamp<=MAX_AGE;
  if(!fresh){location.replace("../hub.html?v=20260807-2148-root-pin");return}
  window.DIGIY_LOGIN_URL="../pin.html";
  document.write('<script src="../guard.js?v=pro-carnet-app-v13-20260807-2148"></'+'script>');
  document.write('<style>html body #btnMenu{display:block!important}html body #fabWrap{display:grid!important}html body .topline{justify-content:space-between!important}html body .topline .title{flex:0 1 auto!important}html body .topline::after{display:none!important}html body #digiyBackupAccess{display:none!important}html body .magic-actions{grid-template-columns:repeat(5,1fr)!important}@media(max-width:430px){html body .magic-actions{grid-template-columns:repeat(2,1fr)!important}}</style>');
})();