// Renders sprite groups into one PNG contact sheet so the pixel art can be checked by eye,
// and validates every pixel map (row lengths, frame sizes, palette characters).
//   node scripts/preview-sprites.mjs out.png [group ...]     (default: all groups)
// Each sprite is shown with all its frames side by side, scaled up 6x on a checkerboard.
import { readdirSync, writeFileSync } from 'node:fs';
import { PALETTE } from '../src/art/palette.js';
import { encodePng, hexToRgb } from './png.mjs';

const [out = 'sprites.png', ...only] = process.argv.slice(2);
const dir = new URL('../src/art/sprites/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.js') && (!only.length || only.includes(f.replace('.js', ''))));
const sprites = [];
const errors = [];
for (const f of files) {
  const mod = (await import(new URL(f, dir))).default;
  for (const [key, s] of Object.entries(mod)) {
    const frames = s.frames;
    if (!Array.isArray(frames) || !frames.length) { errors.push(`${f}:${key} has no frames`); continue; }
    const h = frames[0].length;
    const w = frames[0][0].length;
    frames.forEach((fr, fi) => {
      if (fr.length !== h) errors.push(`${f}:${key} frame ${fi} has ${fr.length} rows, expected ${h}`);
      fr.forEach((row, ri) => {
        if (row.length !== w) errors.push(`${f}:${key} frame ${fi} row ${ri} has ${row.length} chars, expected ${w}`);
        for (const ch of row) if (ch !== '.' && !(ch in PALETTE)) errors.push(`${f}:${key} frame ${fi} row ${ri} bad char '${ch}'`);
      });
    });
    sprites.push({ group: f.replace('.js', ''), key, w, h, frames });
  }
}

// Variants (Kings, brute, whelp, projectiles) are built from the sprites above.
if (!only.length || only.includes('variants')) {
  const { VARIANTS, buildVariant } = await import('../src/art/variants.js');
  // Bases can be in any sprite file, also ones not shown on this sheet.
  const allSprites = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) Object.assign(allSprites, (await import(new URL(f, dir))).default);
  for (const [key, v] of Object.entries(VARIANTS)) {
    const base = allSprites[v.base];
    if (!base) { errors.push(`variant ${key}: unknown base ${v.base}`); continue; }
    const frames = buildVariant(base.frames, v);
    sprites.push({ group: 'variants', key, w: frames[0][0].length, h: frames[0].length, frames });
  }
}

const S = 6; // preview scale
const PAD = 8;
const MAXW = 1400;
// lay out rows of sprites
let x = PAD, y = PAD, rowH = 0;
const placed = [];
for (const sp of sprites) {
  const bw = sp.frames.length * (sp.w * S + 4);
  const bh = sp.h * S;
  if (x + bw > MAXW) { x = PAD; y += rowH + PAD * 2; rowH = 0; }
  placed.push({ ...sp, x, y });
  x += bw + PAD * 2;
  rowH = Math.max(rowH, bh);
}
const W = MAXW, H = y + rowH + PAD;
const px = new Uint8Array(W * H * 3);
for (let i = 0; i < W * H; i++) { px.set([40, 34, 48], i * 3); }
const put = (X, Y, rgb) => { if (X >= 0 && Y >= 0 && X < W && Y < H) px.set(rgb, (Y * W + X) * 3); };
for (const sp of placed) {
  sp.frames.forEach((fr, fi) => {
    const ox = sp.x + fi * (sp.w * S + 4);
    for (let yy = 0; yy < sp.h; yy++) for (let xx = 0; xx < sp.w; xx++) {
      const ch = fr[yy]?.[xx] ?? '.';
      const checker = ((xx + yy) % 2 ? [70, 62, 80] : [58, 50, 66]);
      const rgb = ch === '.' || !(ch in PALETTE) ? checker : hexToRgb(PALETTE[ch]);
      for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) put(ox + xx * S + b, sp.y + yy * S + a, rgb);
    }
  });
}
writeFileSync(out, encodePng(W, H, px, 3));
placed.forEach((sp, i) => console.log(`${String(i + 1).padStart(2)}. ${sp.group}/${sp.key}  ${sp.w}x${sp.h}  frames=${sp.frames.length}  (sheet x=${sp.x} y=${sp.y})`));
if (errors.length) { console.log(`\n${errors.length} ERRORS:`); errors.forEach((e) => console.log('  ' + e)); process.exitCode = 1; }
else console.log(`\nOK: ${sprites.length} sprites valid -> ${out}`);
