export const setHeaderHeight = () => {
  const ua = navigator.userAgent.toLowerCase();
  let h = 0;
  if (/iphone|ipad|macintosh/.test(ua)) h = 64;
  else if (/android/.test(ua)) h = 56;
  document.documentElement.style.setProperty('--tg-header', `${h}px`);
};

setHeaderHeight();
