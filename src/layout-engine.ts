export const applyLayout = () => {
  const stage = document.querySelector('.stage') as HTMLElement;
  const app = document.getElementById('app');
  const appbar = document.querySelector('.appbar') as HTMLElement;
  const footer = document.querySelector('.footer') as HTMLElement;
  if (!stage || !app || !appbar || !footer) return;
  const height =
    app.clientHeight - appbar.clientHeight - footer.clientHeight;
  stage.style.height = `${height}px`;
};

window.addEventListener('resize', applyLayout);
applyLayout();
