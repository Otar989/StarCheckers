(function(){
  const stage = document.getElementById('stage');
  const wrap  = document.querySelector('.board-wrap');
  const board = document.querySelector('.board');
  if (!stage || !wrap || !board) return;

  function sizeBoard(){
    const r = stage.getBoundingClientRect();
    const pad = Math.min(24, Math.floor(Math.min(r.width, r.height) * 0.04));
    const availW = Math.max(0, Math.floor(r.width)  - pad*2);
    const availH = Math.max(0, Math.floor(r.height) - pad*2);
    const size = Math.max(200, Math.min(availW, availH));
    wrap.style.inlineSize = size + 'px';
    wrap.style.blockSize  = size + 'px';
    board.style.inlineSize = '100%';
    board.style.blockSize  = '100%';
  }

  // Наблюдаем реальные изменения сцены
  const ro = new ResizeObserver(sizeBoard);
  ro.observe(stage);

  window.addEventListener('load', sizeBoard, { once:true });
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 80));
  window.addEventListener('reflow-board', sizeBoard);
  setTimeout(sizeBoard, 120); setTimeout(sizeBoard, 300);
})();
