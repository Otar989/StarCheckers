(function () {
  const isTG = !!(window.Telegram && Telegram.WebApp);
  if (isTG) {
    try { Telegram.WebApp.expand(); } catch(e){}
    try { Telegram.WebApp.enableClosingConfirmation(); } catch(e){}
  }
  function blockTouch(e){
    const board = document.querySelector('.board');
    if (!board) return;
    if (e.target === board || board.contains(e.target)) {
      e.preventDefault();
    }
  }
  window.addEventListener('gesturestart', e => e.preventDefault(), { passive:false });
  window.addEventListener('gesturechange', e => e.preventDefault(), { passive:false });
  window.addEventListener('gestureend',   e => e.preventDefault(), { passive:false });
  document.addEventListener('touchmove',  blockTouch, { passive:false });
  document.addEventListener('touchstart', blockTouch, { passive:false });
  document.addEventListener('pointermove', blockTouch, { passive:false });
  document.addEventListener('pointerdown', blockTouch, { passive:false });
})();
