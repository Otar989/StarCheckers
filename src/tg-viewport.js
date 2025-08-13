(function(){
  const setVH = () => {
    // Если в Telegram доступна стабильная высота — используем её
    const tg = window.Telegram && Telegram.WebApp;
    const h = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;
    // Переводим в "единицу vh" для CSS переменной
    document.documentElement.style.setProperty('--vh', (h/100) + 'px');
  };
  setVH();
  // Telegram шлёт события изменения Viewport — подпишемся
  if (window.Telegram && Telegram.WebApp) {
    try { Telegram.WebApp.onEvent('viewportChanged', setVH); } catch(e){}
    try { Telegram.WebApp.expand(); } catch(e){}
    // Насыщаем тему (опционально, если используете TG тему)
    try {
      const theme = Telegram.WebApp.themeParams || {};
      if (theme.bg_color) document.documentElement.style.setProperty('--bg', theme.bg_color);
    } catch(e){}
  }
  // На всякий случай — реагируем и на ресайзы браузера
  window.addEventListener('resize', setVH);
})();
