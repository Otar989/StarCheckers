// src/board-layout.js
(function(){
  const content = document.querySelector('#view-game .game');
  const wrap = document.querySelector('.board-wrap');
  const board = document.querySelector('.board');
  if (!content || !wrap || !board) return;

  function sizeBoard(){
    const r = content.getBoundingClientRect();
    const size = Math.max(160, Math.min(Math.floor(r.width), Math.floor(r.height)));
    wrap.style.width = wrap.style.height = size + 'px';
    board.style.width = board.style.height = size + 'px';
  }

  const ro = new ResizeObserver(sizeBoard);
  ro.observe(content); ro.observe(wrap);
  window.addEventListener('reflow-board', sizeBoard);
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 60));
  window.addEventListener('load', sizeBoard, { once:true });
})();

