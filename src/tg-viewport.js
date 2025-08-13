/* ПОДКЛЮЧИТЬ ПЕРВЫМ */
(function(){
  const set = () => {
    const tg = window.Telegram && Telegram.WebApp;
    const h = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;
    const app = document.getElementById('app');
    if (app){ app.style.height = h+'px'; app.style.maxHeight = h+'px'; }
  };
  set();
  if (window.Telegram && Telegram.WebApp){
    try{ Telegram.WebApp.onEvent('viewportChanged', set); }catch(e){}
    try{ Telegram.WebApp.expand(); }catch(e){}
  }
  window.addEventListener('resize', set);
})();
