(function(){
  const isTG = !!(window.Telegram && Telegram.WebApp);
  if (isTG){ try{ Telegram.WebApp.enableClosingConfirmation(); Telegram.WebApp.expand(); }catch(e){} }
  function block(e){
    const board = document.querySelector('.board');
    if (board && (e.target===board || board.contains(e.target))) e.preventDefault();
  }
  ['gesturestart','gesturechange','gestureend'].forEach(t=>window.addEventListener(t, e=>e.preventDefault(), {passive:false}));
  ['touchstart','touchmove','pointerdown','pointermove'].forEach(t=>document.addEventListener(t, block, {passive:false}));
})();
