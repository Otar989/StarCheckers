// src/board-layout.js
(function(){
  const wrap  = document.querySelector('.board-wrap');
  const board = document.querySelector('.board');
  if (!wrap || !board) return;

  function resizeBoard(){
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const size = Math.min(vh, vw) * 0.95; // 95% от меньшей стороны
    wrap.style.width  = size + 'px';
    wrap.style.height = size + 'px';
    board.style.width = '100%';
    board.style.height = '100%';
  }

  window.addEventListener('resize', resizeBoard);
  window.addEventListener('orientationchange', resizeBoard);
  window.addEventListener('load', resizeBoard);
  resizeBoard();
})();

