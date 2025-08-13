// src/theme.js
const THEME_KEY = 'starcheckers.theme';
export function applyTheme(name){
  document.body.classList.remove('theme-classic','theme-walnut','theme-graphite');
  const cls = name === 'walnut' ? 'theme-walnut' : name === 'graphite' ? 'theme-graphite' : 'theme-classic';
  document.body.classList.add(cls);
  localStorage.setItem(THEME_KEY, name);
  window.dispatchEvent(new Event('theme-change'));
}
export function initTheme(selectEl){
  const saved = localStorage.getItem(THEME_KEY) || 'classic';
  applyTheme(saved);
  if (selectEl){
    selectEl.value = saved;
    selectEl.addEventListener('change', e => applyTheme(e.target.value));
  }
}
