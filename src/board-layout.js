(function(){
  const $ = s => document.querySelector(s);
  const content = $('.content');
  const wrap = $('.board-wrap');
  const board = $('.board');
  if (!content || !wrap || !board) return;

  function sizeBoard(){
    // Высота доступной зоны контента (между header и footer)
    const rect = content.getBoundingClientRect();
    const availW = Math.floor(rect.width);
    const availH = Math.floor(rect.height);
    const size = Math.max(160, Math.min(availW, availH)); // не даём схлопнуться
    wrap.style.width = size + 'px';
    wrap.style.height = size + 'px';
    board.style.width = size + 'px';
    board.style.height = size + 'px';
  }

  window.sizeBoard = sizeBoard;

  const ro = new ResizeObserver(sizeBoard);
  ro.observe(content);
  ro.observe(wrap);

  window.addEventListener('load', sizeBoard, { once:true });
  window.addEventListener('orientationchange', () => setTimeout(sizeBoard, 60));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(sizeBoard, 60); });
})();

