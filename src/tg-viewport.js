(function(){
  const setVH = () => {
    const tg = window.Telegram && Telegram.WebApp;
    const stable = tg?.viewportStableHeight;
    const h = stable || tg?.viewportHeight || window.innerHeight;
    document.documentElement.style.setProperty('--vh', (h/100)+'px');
    const app = document.getElementById('app');
    if (app){ app.style.height = h+'px'; app.style.maxHeight = h+'px'; }
  };
  setVH();
  if (window.Telegram && Telegram.WebApp){
    try{ Telegram.WebApp.onEvent('viewportChanged', setVH); }catch(e){}
    try{ Telegram.WebApp.expand(); }catch(e){}
    try{ Telegram.WebApp.enableClosingConfirmation(); }catch(e){}
  }
  window.addEventListener('resize', setVH);
})();
