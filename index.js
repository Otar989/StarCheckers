import { showGame, showSettings } from './src/nav.js';
import { initTheme } from './src/theme.js';

document.getElementById('btn-settings').addEventListener('click', showSettings);
document.getElementById('btn-back').addEventListener('click', showGame);
document.getElementById('btn-newgame').addEventListener('click', () => {
  showGame();
});

initTheme(document.querySelector('select[name="theme"]'));
