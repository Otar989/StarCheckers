(function(){
  const setVH = () => {
    const tg = window.Telegram && Telegram.WebApp;
    const h = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;
    document.getElementById('app').style.height = h + 'px';
    document.getElementById('app').style.maxHeight = h + 'px';
  };
  setVH();
  if (window.Telegram && Telegram.WebApp){
    try{ Telegram.WebApp.onEvent('viewportChanged', setVH); }catch(e){}
    try{ Telegram.WebApp.expand(); }catch(e){}
  }
  window.addEventListener('resize', setVH);
})();
