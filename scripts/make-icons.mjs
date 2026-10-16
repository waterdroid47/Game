// Generates the app icons (public/icon-192.png, icon-512.png) from the guard sprite.
// Run: npm run icons
import { writeFileSync } from 'node:fs';
import { PALETTE } from '../src/art/palette.js';
import hero from '../src/art/sprites/hero.js';
import { encodePng, hexToRgb } from './png.mjs';

const BG = hexToRgb('#1d3a1f'); // meadow green

export function iconPixels(size, { margin = 0.18, bg = BG } = {}) {
  const rows = hero.guard.frames[0];
  const h = rows.length;
  const w = rows[0].length;
  const scale = Math.floor((size * (1 - 2 * margin)) / Math.max(w, h));
  const ox = Math.floor((size - w * scale) / 2);
  const oy = Math.floor((size - h * scale) / 2);
  const px = new Uint8Array(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let col = bg;
      const sx = Math.floor((x - ox) / scale);
      const sy = Math.floor((y - oy) / scale);
      if (sx >= 0 && sy >= 0 && sx < w && sy < h) {
        const ch = rows[sy][sx];
        if (ch !== '.' && PALETTE[ch]) col = hexToRgb(PALETTE[ch]);
      }
      px.set(col, (y * size + x) * 3);
    }
  }
  return px;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const s of [192, 512]) writeFileSync(new URL(`../public/icon-${s}.png`, import.meta.url), encodePng(s, s, iconPixels(s)));
  console.log('icons written');
}
