// src/board-layout.js
(function(){
  const host  = document.querySelector('#view-game .game-grid');  // грид-контейнер
  const wrap  = document.querySelector('.board-wrap');
  const board = document.querySelector('.board');
  if (!host || !wrap || !board) return;

  function sizeBoard(){
    // Доступная область между header и footer — это сам .game-grid:
    const r = host.getBoundingClientRect();
    // Отведём небольшой «воздух» под подписи/статус (на телефонах):
    const padding = Math.min(24, Math.floor(r.height * 0.04));
    const availW = Math.max(0, Math.floor(r.width)  - padding*2);
    const availH = Math.max(0, Math.floor(r.height) - padding*2);

    const size = Math.max(180, Math.min(availW, availH)); // квадрат, но не меньше 180px
    wrap.style.width  = size + 'px';
    wrap.style.height = size + 'px';
    board.style.width  = size + 'px';
    board.style.height = size + 'px';
  }

  const ro = new ResizeObserver(sizeBoard);
  ro.observe(host);
  ro.observe(wrap);

  window.addEventListener('load', sizeBoard, { once:true });
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 60));
  window.addEventListener('reflow-board', sizeBoard);
})();

