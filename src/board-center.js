(function(){
  const stage = document.getElementById('stage');
  const wrap  = document.querySelector('.board-wrap');
  const board = document.querySelector('.board');
  if (!stage || !wrap || !board) return;

  function sizeBoard(){
    // Размер доступной сцены (между appbar и footer)
    const r = stage.getBoundingClientRect();

    // Защита от iOS всплывающих панелей: делаем небольшой внутренний запас
    const pad = Math.min(24, Math.floor(Math.min(r.width, r.height) * 0.04));

    const availW = Math.max(0, Math.floor(r.width)  - pad*2);
    const availH = Math.max(0, Math.floor(r.height) - pad*2);

    // Квадратный размер: максимум, но не меньше 200px
    const size = Math.max(200, Math.min(availW, availH));

    // Проставляем точные px — так не будет артефактов сетки
    wrap.style.inlineSize = size + 'px';
    wrap.style.blockSize  = size + 'px';
    board.style.inlineSize = '100%';
    board.style.blockSize  = '100%';
  }

  // Наблюдаем реальные изменения сцены
  const ro = new ResizeObserver(sizeBoard);
  ro.observe(stage);

  // Гарантированные перерасчёты
  window.addEventListener('load', sizeBoard, { once:true });
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 80));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(sizeBoard, 80); });

  // Фоллбек от редких «прыжков» iOS после открытия
  setTimeout(sizeBoard, 120);
  setTimeout(sizeBoard, 300);
})();
