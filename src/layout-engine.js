/* ПОДКЛЮЧИТЬ ПОСЛЕ РЕНДЕРА DOM */
(function(){
  const app    = document.getElementById('app');
  const header = document.querySelector('.appbar');
  const footer = document.querySelector('.footer');
  const stage  = document.getElementById('stage');
  const center = document.querySelector('.game-center');
  const wrap   = document.querySelector('.board-wrap');
  const board  = document.querySelector('.board');
  const caption= document.querySelector('.board-caption');
  if (!app || !header || !footer || !stage || !center || !wrap || !board || !caption) return;

  // точная высота «сцены» = высота app минус header и footer (их реальная высота в px)
  function sizeStage(){
    const appH    = app.getBoundingClientRect().height;
    const headH   = header.getBoundingClientRect().height;
    const footH   = footer.getBoundingClientRect().height;
    const padTop  = parseFloat(getComputedStyle(app).paddingTop)  || 0;
    const padBot  = parseFloat(getComputedStyle(app).paddingBottom)|| 0;
    const stageH  = Math.max(0, appH - headH - footH - padTop - padBot);
    stage.style.blockSize = stageH + 'px';
  }

  const outerH = (el) => {
    const cs = getComputedStyle(el);
    return Math.ceil(el.getBoundingClientRect().height
      + (parseFloat(cs.marginTop)||0) + (parseFloat(cs.marginBottom)||0));
  };

  // размер доски с учётом подписи и внутренних запасов
  function sizeBoard(){
    const r = stage.getBoundingClientRect();
    const pad = Math.min(24, Math.floor(Math.min(r.width, r.height)*0.04));
    const capH = outerH(caption);
    const availW = Math.max(0, Math.floor(r.width)  - pad*2);
    const availH = Math.max(0, Math.floor(r.height) - pad*2 - capH);
    const size = Math.max(200, Math.min(availW, availH));
    wrap.style.inlineSize = size + 'px';
    wrap.style.blockSize  = size + 'px';
    board.style.inlineSize = '100%';
    board.style.blockSize  = '100%';
  }

  function reflow(){
    sizeStage();
    sizeBoard();
  }

  // наблюдаем реальные изменения
  const roApp   = new ResizeObserver(reflow); roApp.observe(app);
  const roStage = new ResizeObserver(reflow); roStage.observe(stage);
  const roHead  = new ResizeObserver(reflow); roHead.observe(header);
  const roFoot  = new ResizeObserver(reflow); roFoot.observe(footer);
  const roCap   = new ResizeObserver(reflow); roCap.observe(caption);

  // триггеры
  window.addEventListener('load', reflow, {once:true});
  window.addEventListener('orientationchange', () => setTimeout(reflow, 80));
  window.addEventListener('layout:reflow', reflow);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(reflow, 80); });

  // фоллбеки от iOS «прыжков»
  setTimeout(reflow, 120);
  setTimeout(reflow, 300);
})();
