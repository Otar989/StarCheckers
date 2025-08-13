import { showGame, showSettings } from './src/nav.js';
document.getElementById('btn-settings').addEventListener('click', showSettings);
document.getElementById('btn-back').addEventListener('click', showGame);
document.getElementById('btn-newgame').addEventListener('click', () => { /* startNewGame(); */ showGame(); });
