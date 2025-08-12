export function showEndModal({result, onNew, onSettings}){
  const el = document.createElement('div');
  el.className = 'modal-root';
  el.innerHTML = `
  <div class="modal-backdrop"></div>
  <div class="modal">
    <div class="title">${result === 'win' ? 'Победа!' : 'Поражение'}</div>
    <div class="subtitle">Хорошая партия — сыграем ещё?</div>
    <div class="actions">
      <button id="again">Новая игра</button>
      <button id="settings">К настройкам</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#again').onclick = () => { el.remove(); onNew&&onNew(); };
  el.querySelector('#settings').onclick = () => { el.remove(); onSettings&&onSettings(); };
}
