(function(){
  const stage   = document.getElementById('stage');
  const wrap    = document.querySelector('.board-wrap');
  const board   = document.querySelector('.board');
  const caption = document.getElementById('board-caption');
  if (!stage || !wrap || !board || !caption) return;

  const outerHeight = (el) => {
    const cs = getComputedStyle(el);
    const mt = parseFloat(cs.marginTop)  || 0;
    const mb = parseFloat(cs.marginBottom)|| 0;
    return Math.ceil(el.getBoundingClientRect().height + mt + mb);
  };

  function sizeBoard(){
    const r = stage.getBoundingClientRect();

    // Запас от краёв, чтобы стек «дышал»
    const pad = Math.min(24, Math.floor(Math.min(r.width, r.height) * 0.04));

    // Текущая высота подписи (с учётом переноса строк на узких экранах)
    const capH = outerHeight(caption);

    // Доступные размеры под квадрат ДОСКИ: вся сцена минус подпись и отступы
    const availW = Math.max(0, Math.floor(r.width)  - pad*2);
    const availH = Math.max(0, Math.floor(r.height) - pad*2 - capH);

    // Квадратный размер. Не меньше минимального, но не вылезаем под подпись.
    const size = Math.max(200, Math.min(availW, availH));

    wrap.style.inlineSize = size + 'px';
    wrap.style.blockSize  = size + 'px';
    board.style.inlineSize = '100%';
    board.style.blockSize  = '100%';
  }

  // Следим за изменениями сцены и подписи (перенос текста, смена языка и т.п.)
  const ro1 = new ResizeObserver(sizeBoard);
  ro1.observe(stage);
  const ro2 = new ResizeObserver(sizeBoard);
  ro2.observe(caption);

  // Гарантированные перерасчёты
  window.addEventListener('load', sizeBoard, { once:true });
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 80));
  window.addEventListener('reflow-board', sizeBoard);

  // Небольшие подстраховки от iOS «прыжков»
  setTimeout(sizeBoard, 120);
  setTimeout(sizeBoard, 300);
})();
