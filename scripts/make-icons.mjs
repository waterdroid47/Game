// Generates the app icons from the guard sprite:
//   public/icon-192.png, icon-512.png   (web / PWA, and the 512 Play Store icon)
//   android/app/src/main/res/...         (launcher icons for every density + splash screens)
// Run: npm run icons
import { existsSync, writeFileSync } from 'node:fs';
import { PALETTE } from '../src/art/palette.js';
import hero from '../src/art/sprites/hero.js';
import { encodePng, hexToRgb } from './png.mjs';

const BG = hexToRgb('#1d3a1f'); // meadow green (also android ic_launcher_background)
const SPLASH_BG = hexToRgb('#12060d'); // same as the game's loading background

// Draws the guard centred on a w x h image (whole-pixel scale, so it stays crisp).
// bg = null leaves the background transparent (RGBA). round = cut to a circle.
function render(w, h, { margin = 0.18, bg = BG, round = false, fill = 1 } = {}) {
  const rows = hero.guard.frames[0];
  const sh = rows.length;
  const sw = rows[0].length;
  const ch = bg ? 3 : 4;
  const box = Math.min(w, h) * fill;
  const scale = Math.max(1, Math.floor((box * (1 - 2 * margin)) / Math.max(sw, sh)));
  const ox = Math.floor((w - sw * scale) / 2);
  const oy = Math.floor((h - sh * scale) / 2);
  const px = new Uint8Array(w * h * (round ? 4 : ch));
  const r2 = (Math.min(w, h) / 2) ** 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let col = bg;
      const sx = Math.floor((x - ox) / scale);
      const sy = Math.floor((y - oy) / scale);
      if (sx >= 0 && sy >= 0 && sx < sw && sy < sh) {
        const c = rows[sy][sx];
        if (c !== '.' && PALETTE[c]) col = hexToRgb(PALETTE[c]);
      }
      const i = (y * w + x) * (round ? 4 : ch);
      if (round) {
        const inside = (x + 0.5 - w / 2) ** 2 + (y + 0.5 - h / 2) ** 2 <= r2;
        if (inside && col) px.set([...col, 255], i);
      } else if (ch === 4) {
        if (col) px.set([...col, 255], i);
      } else {
        px.set(col, i);
      }
    }
  }
  return { px, channels: round ? 4 : ch };
}

export function iconPixels(size, opts) {
  return render(size, size, opts).px;
}

function write(path, w, h, opts) {
  const { px, channels } = render(w, h, opts);
  writeFileSync(new URL(path, import.meta.url), encodePng(w, h, px, channels));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const s of [192, 512]) write(`../public/icon-${s}.png`, s, s);

  const res = '../android/app/src/main/res';
  if (existsSync(new URL(res, import.meta.url))) {
    const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
    for (const [d, k] of Object.entries(densities)) {
      const s = 48 * k;
      write(`${res}/mipmap-${d}/ic_launcher.png`, s, s);
      write(`${res}/mipmap-${d}/ic_launcher_round.png`, s, s, { round: true });
      // Adaptive icon foreground (Android 8+): 108dp, transparent, content inside the
      // central safe zone; the green background comes from ic_launcher_background.xml.
      write(`${res}/mipmap-${d}/ic_launcher_foreground.png`, 108 * k, 108 * k, { bg: null, margin: 0.25 });
      // Splash screens (Android 11 and older; newer versions show the launcher icon).
      write(`${res}/drawable-port-${d}/splash.png`, 320 * k, 480 * k, { bg: SPLASH_BG, margin: 0, fill: 0.4 });
      write(`${res}/drawable-land-${d}/splash.png`, 480 * k, 320 * k, { bg: SPLASH_BG, margin: 0, fill: 0.4 });
    }
    write(`${res}/drawable/splash.png`, 480, 320, { bg: SPLASH_BG, margin: 0, fill: 0.4 });
  }
  console.log('icons written');
}
