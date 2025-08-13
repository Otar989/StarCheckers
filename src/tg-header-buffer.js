(function(){
  const ua = navigator.userAgent.toLowerCase();
  const tg = (window.Telegram && Telegram.WebApp) ? Telegram.WebApp : null;

  // Базовые эвристики высоты нативной шапки
  let header = 56; // Android/общий случай
  if (/iphone|ipad|ipod/.test(ua)) header = 64;        // iOS: шапка выше
  if (!tg) header = 0;                                  // Обычный браузер — нативной шапки TG нет
  if (tg && (tg.platform === 'tdesktop' || tg.platform === 'web')) header = 0;

  // Установим переменную
  document.documentElement.style.setProperty('--tg-header', header + 'px');

  // Пересчёт при изменении вьюпорта от Telegram
  const refresh = () => {
    // Если Telegram разворачивает webview (expand), шапка может визуально «сжаться» — оставим минимально 48–56
    const minHeader = /iphone|ipad|ipod/.test(ua) ? 60 : 48;
    const h = Math.max(minHeader, header);
    document.documentElement.style.setProperty('--tg-header', h + 'px');
    // Форс-рефлоу доски (если есть слушатель)
    window.dispatchEvent(new Event('reflow-board'));
  };

  try { tg && tg.onEvent && tg.onEvent('viewportChanged', refresh); } catch(e){}
  // Подстраховка: пересчитать чуть позже после загрузки
  setTimeout(refresh, 150);
})();
