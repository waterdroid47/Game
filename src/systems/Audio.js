import { Save } from './SaveSystem.js';

// Tiny synthesized sound effects (WebAudio) so the game needs no audio files.
let ctx = null;
let lastShot = 0;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'square', vol = 0.06, slide = 0, delay = 0) {
  if (!Save.data.settings.sound) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  shoot() {
    const now = performance.now();
    if (now - lastShot < 90) return;
    lastShot = now;
    tone(900, 0.05, 'square', 0.015, -400);
  },
  hit: () => tone(300, 0.04, 'square', 0.02, -100),
  kill: () => tone(240, 0.12, 'triangle', 0.06, -170),
  hurt: () => tone(140, 0.25, 'sawtooth', 0.08, -80),
  laser: () => tone(1200, 0.35, 'sawtooth', 0.03, -900),
  pulse: () => tone(180, 0.3, 'sine', 0.12, 260),
  missile: () => tone(500, 0.15, 'triangle', 0.03, 300),
  boom: () => tone(90, 0.25, 'sawtooth', 0.07, -40),
  coin: () => { tone(988, 0.07, 'square', 0.04); tone(1318, 0.12, 'square', 0.04, 0, 0.07); },
  heal: () => [659, 880, 1175].forEach((f, i) => tone(f, 0.09, 'sine', 0.08, 0, i * 0.05)),
  chest: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'square', 0.05, 0, i * 0.07)),
  levelUp: () => [392, 523, 659, 784].forEach((f, i) => tone(f, 0.1, 'triangle', 0.07, 0, i * 0.06)),
  click: () => tone(660, 0.05, 'square', 0.04),
  boss: () => [110, 104, 98].forEach((f, i) => tone(f, 0.4, 'sawtooth', 0.08, 0, i * 0.3)),
  win: () => [523, 659, 784, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, 'square', 0.05, 0, i * 0.11)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.2, 'triangle', 0.07, 0, i * 0.16)),
};
