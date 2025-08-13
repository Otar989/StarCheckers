(function(){
  const $ = s => document.querySelector(s);
  const app = $('#app');
  const main = $('.main');
  const header = $('.header');
  const footer = $('.footer');
  const wrap = $('.board-wrap');
  const board = $('.board');

  if (!app || !main || !wrap || !board) return;

  function sizeBoard(){
    // Доступная область внутри main
    const appRect = app.getBoundingClientRect();
    const headH = header ? header.getBoundingClientRect().height : 0;
    const footH = footer ? footer.getBoundingClientRect().height : 0;

    // Внутренние паддинги app уже учтены браузером, поэтому ориентируемся по main:
    const mainRect = main.getBoundingClientRect();
    const availW = Math.floor(mainRect.width);
    const availH = Math.floor(mainRect.height);

    // Квадрат — минимум из сторон
    const size = Math.max(120, Math.min(availW, availH)); // нижний предел 120px, чтобы не схлопывалось
    wrap.style.width = size + 'px';
    wrap.style.height = size + 'px';
    board.style.width = size + 'px';
    board.style.height = size + 'px';
  }

  const ro = new ResizeObserver(sizeBoard);
  ro.observe(main);
  ro.observe(wrap);

  window.addEventListener('load', sizeBoard, { once:true });
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 50));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(sizeBoard, 50); });
})();

