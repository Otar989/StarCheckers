let ctx, masterGain, compressor, isPlaying = false, loopNode, started = false;

function createContext() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  compressor = ctx.createDynamicsCompressor();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.15; // тихо и мягко
  compressor.connect(masterGain);
  masterGain.connect(ctx.destination);
}

function playChord(time, notes, dur = 0.6) {
  notes.forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // Мягкий маллет: sine + лёгкий triangle микс через detune
    osc.type = "sine";
    osc.frequency.value = freq;
    const tri = ctx.createOscillator();
    tri.type = "triangle";
    tri.frequency.value = freq * 2;

    const mix = ctx.createGain();
    mix.gain.value = 0.3;
    tri.connect(mix);
    mix.connect(gain);

    osc.connect(gain);
    gain.connect(compressor);

    // ADSR
    const a=0.02, d=0.12, s=0.6, r=0.3;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.9, time+a);
    gain.gain.linearRampToValueAtTime(0.9*s, time+a+d);
    gain.gain.linearRampToValueAtTime(0, time+dur+r);

    osc.start(time);
    tri.start(time);
    osc.stop(time+dur+r+0.02);
    tri.stop(time+dur+r+0.02);
  });
}

function scheduleLoop() {
  const bar = 2.4; // размер такта
  const start = ctx.currentTime + 0.05;
  for (let i=0;i<8;i++) {
    const t = start + i*bar;
    // Спокойная последовательность: Cmaj7, Am7, Dm7, G7
    const seq = [
      [261.63, 329.63, 392.00], // C E G
      [220.00, 293.66, 349.23], // A C D#
      [293.66, 349.23, 440.00], // D F A
      [196.00, 246.94, 392.00], // G B G
    ];
    const chord = seq[i%4];
    playChord(t, chord, 1.8);
    // лёгкий колокольчик на каждую долю
    for (let k=0;k<4;k++) playChord(t + k*0.6, [880], 0.25);
  }
  // перезапуск
  setTimeout(scheduleLoop, 800); 
}

export function initAudio() { createContext(); }

export function toggleMusic(on) {
  createContext();
  if (on && !isPlaying) {
    if (ctx.state === "suspended") ctx.resume();
    isPlaying = true;
    scheduleLoop();
  } else if (!on && isPlaying) {
    isPlaying = false;
    // фактическая остановка — за счёт отсутствия рескейджулинга
  }
}

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
  ctx = null; masterGain = null; compressor = null; isPlaying = false;
}
