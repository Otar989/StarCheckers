(function(){
  const wrap = document.querySelector('.board-wrap');
  const board = document.querySelector('.board');
  if (!wrap || !board) return;

  const ro = new ResizeObserver(entries => {
    const cr = entries[0].contentRect;
    const size = Math.floor(Math.min(cr.width, cr.height));
    // Делаем реальный квадрат пиксель-в-пиксель, чтобы не плыли линии
    wrap.style.setProperty('width', size + 'px');
    wrap.style.setProperty('height', size + 'px');
    board.style.setProperty('width', size + 'px');
    board.style.setProperty('height', size + 'px');
  });
  ro.observe(wrap);

  // Первичная установка
  const init = () => {
    const rect = wrap.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));
    wrap.style.width = wrap.style.height = size + 'px';
    board.style.width = board.style.height = size + 'px';
  };
  window.addEventListener('load', init, { once:true });
})();
