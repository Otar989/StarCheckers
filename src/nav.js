// src/nav.js
export function showGame(){
  document.getElementById('view-game').hidden = false;
  document.getElementById('view-settings').hidden = true;
  document.getElementById('btn-settings').hidden = false;
  document.getElementById('btn-back').hidden = true;
}
export function showSettings(){
  document.getElementById('view-game').hidden = true;
  document.getElementById('view-settings').hidden = false;
  document.getElementById('btn-settings').hidden = true;
  document.getElementById('btn-back').hidden = false;
}
