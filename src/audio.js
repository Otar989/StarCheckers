let ctx, masterGain, compressor;

function createContext() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  compressor = ctx.createDynamicsCompressor();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.15; // тихо и мягко
  compressor.connect(masterGain);
  masterGain.connect(ctx.destination);
}

export function initAudio() { createContext(); }

export function playMove() {
  createContext();
  const t = ctx.currentTime + 0.01;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 700;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.5, t+0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.12);
  osc.connect(g); g.connect(compressor);
  osc.start(t); osc.stop(t+0.15);
}

export function stopAll() {
  if (ctx && ctx.state !== "closed") ctx.close();
  ctx = null; masterGain = null; compressor = null;
}
