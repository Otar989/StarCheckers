export const fixViewport = () => {
  const app = document.getElementById('app');
  const tg = (window as any).Telegram?.WebApp;
  if (app && tg?.viewportStableHeight) {
    app.style.height = `${tg.viewportStableHeight}px`;
  }
};

fixViewport();
