// session.js — compatibilité stricte PRO CARNET
// Les anciennes pages conservent window.DIGIY_SESSION, mais l'autorité reste guard.js.
(function(){
  "use strict";

  window.DIGIY_MODULE="PAY";
  window.DIGIY_LOGIN_URL=window.DIGIY_LOGIN_URL||"./pin.html";
  try{document.documentElement.style.visibility="hidden"}catch(_){}

  function install(){
    const guard=window.DIGIY_GUARD;
    if(!guard){location.replace("./pin.html");return}

    const get=()=>guard.getSession();
    const requireStrict=(loginUrl)=>{
      const session=get();
      if(session){try{document.documentElement.style.visibility=""}catch(_){};return session}
      location.replace(loginUrl||guard.buildPinUrl());
      return null;
    };

    window.DIGIY_SESSION={
      version:"carnet-session-adapter-strict-v4-20260716",
      module:"PAY",
      boot:()=>requireStrict(),
      get,
      getSession:get,
      require:requireStrict,
      clear:()=>guard.clearSession(),
      logout:(redirect=true)=>guard.logout(redirect),
      cleanVisibleUrl:()=>guard.cleanUrl(),
      normalizePhone:value=>guard.normalizePhone(value),
      normalizeSlug:value=>guard.normalizeSlug(value)
    };

    const session=get();
    if(session){
      try{document.documentElement.style.visibility=""}catch(_){}
      return;
    }
    guard.requireSession({redirect:true,to:"./pin.html"});
  }

  if(window.DIGIY_GUARD){install();return}

  if(document.readyState==="loading"){
    document.write('<script src="./guard.js?v=carnet-guard-strict-pin-v4-20260716"><\\/script>');
    install();
    return;
  }

  const script=document.createElement("script");
  script.src="./guard.js?v=carnet-guard-strict-pin-v4-20260716";
  script.onload=install;
  script.onerror=()=>location.replace("./pin.html");
  document.head.appendChild(script);
})();