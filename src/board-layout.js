// src/board-layout.js
(function(){
  const wrap = document.querySelector('.board-wrap');
  const board = document.querySelector('.board');
  const host  = document.querySelector('#view-game .game-grid');
  if (!wrap || !board || !host) return;

  function sizeBoard(){
    const r = host.getBoundingClientRect();
    const size = Math.max(180, Math.min(Math.floor(r.width), Math.floor(r.height)));
    wrap.style.width = wrap.style.height = size + 'px';
    board.style.width = board.style.height = size + 'px';
  }
  const ro = new ResizeObserver(sizeBoard);
  ro.observe(host);
  ro.observe(wrap);
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 60));
  window.addEventListener('load', sizeBoard, { once:true });
  window.addEventListener('reflow-board', sizeBoard);
})();
