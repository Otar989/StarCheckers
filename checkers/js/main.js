import {loadSettings, saveSettings} from './settings.js';
import {createState, playMove, undo} from './game.js';
import {generateMoves} from './rules.js';
import {findBestMove} from './ai.js';
import {initUI, setState} from './ui.js';
import {initAudio, unlockAudio, sfxMove, sfxCapture, sfxPromote, sfxWin, setVolume, isUnlocked} from './audio.js';

let settings = loadSettings();
let state = createState({force:settings.force});
initUI(state, ()=>{setState(state); maybeAIMove();});
initAudio();
updateSettingsUI();

document.addEventListener('click', ()=>{unlockAudio();});

// navigation
document.getElementById('btn-start').onclick=startGame;
document.getElementById('btn-settings').onclick=showSettings;
document.getElementById('btn-settings2').onclick=showSettings;
document.getElementById('btn-back').onclick=()=>switchScreen('screen-game');
document.getElementById('btn-new').onclick=newGame;
document.getElementById('btn-undo').onclick=()=>{undo(state); setState(state);};

function switchScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function startGame(){switchScreen('screen-game');}
function showSettings(){switchScreen('screen-settings');}
function newGame(){state=createState({force:settings.force}); setState(state);}

function updateSettingsUI(){
  document.getElementById('opt-mode').value=settings.mode;
  document.getElementById('opt-level').value=settings.level;
  document.getElementById('opt-color').value=settings.color;
  document.getElementById('opt-force').checked=settings.force;
  document.getElementById('set-music').checked=settings.music;
  document.getElementById('set-sfx').checked=settings.sfx;
}

// save settings on change
['opt-mode','opt-level','opt-color','opt-force','set-music','set-sfx'].forEach(id=>{
  document.getElementById(id).addEventListener('change',()=>{
    settings.mode=+document.getElementById('opt-mode').value;
    settings.level=+document.getElementById('opt-level').value;
    settings.color=document.getElementById('opt-color').value;
    settings.force=document.getElementById('opt-force').checked;
    settings.music=document.getElementById('set-music').checked;
    settings.sfx=document.getElementById('set-sfx').checked;
    setVolume('sfx',settings.sfx?1:0);
    setVolume('music',settings.music?1:0);
    saveSettings(settings);
  });
});

// Simple AI move
export function maybeAIMove(){
  if(settings.mode===1 && state.turn!==settings.color){
    const move=findBestMove(state,settings.level);
    if(move){playMove(state,move); setState(state);}
  }
}
