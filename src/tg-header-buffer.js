/* ПОДКЛЮЧИТЬ СРАЗУ ПОСЛЕ tg-viewport.js */
(function(){
  const tg = (window.Telegram && Telegram.WebApp) ? Telegram.WebApp : null;
  const ua = navigator.userAgent.toLowerCase();
  let header = 56;                        // Android/Web
  if (/iphone|ipad|ipod/.test(ua)) header = 64;  // iOS выше
  if (!tg || tg.platform === 'tdesktop' || tg.platform === 'web') header = 0;
  document.documentElement.style.setProperty('--tg-header', header+'px');

  // Подправляем спустя мгновение (после expand/анимаций TG)
  const refresh = () => {
    const minH = /iphone|ipad|ipod/.test(ua) ? 60 : 48;
    const h = Math.max(minH, header);
    document.documentElement.style.setProperty('--tg-header', h+'px');
    window.dispatchEvent(new Event('layout:reflow'));
  };
  try{ tg && tg.onEvent && tg.onEvent('viewportChanged', refresh); }catch(e){}
  setTimeout(refresh, 150);
})();
