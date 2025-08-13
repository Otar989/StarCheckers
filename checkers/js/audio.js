let ctx=null;
let unlocked=false;
let gains={sfx:1};

/** Initialize audio context. */
export function initAudio(){
  if(!ctx){
    ctx = new (window.AudioContext||window.webkitAudioContext)();
  }
  return Promise.resolve();
}

/** Unlock audio on first gesture (iOS policy). */
export function unlockAudio(){
  if(ctx && !unlocked){
    const buffer = ctx.createBuffer(1,1,22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    unlocked=true;
  }
}

function tone(freq,duration,type='sfx'){
  if(!ctx) return;
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  gain.gain.value=gains[type];
  osc.frequency.value=freq;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime+duration);
}

export function sfxMove(){tone(400,0.1);}
export function sfxCapture(){tone(200,0.2);}
export function sfxPromote(){tone(600,0.3);}
export function sfxWin(){tone(800,0.5);}

export function setVolume(type,val){gains[type]=val;}
export function isUnlocked(){return unlocked;}
