// Monster variants built from existing pixel maps instead of being drawn by hand: a palette
// remap (recolour), an optional crown on top, and an optional 2x shrink. Used for the giant
// Kings of the Monster Lairs, the Ogre Brute, the Dragon Whelp and new projectiles.
// Pure data + functions (no Phaser), so scripts/preview-sprites.mjs can render them too.

// Crowns drawn on top of a sprite's head (same palette characters as the sprites).
export const CROWNS = {
  big: [
    '.0...0...0.',
    '0a0.0a0.0a0',
    '0a90a8a09a0',
    '0aaaaaaaaa0',
    '0a8a9a9a8a0',
    '00000000000',
  ],
  small: [
    '...0...',
    '..0a0..',
    '.0aea0.',
    '0aa9aa0',
    '0000000',
  ],
};

// remap: { from: to } palette characters, applied in one pass (no chains).
// crown: CROWNS key; crownDx/crownDy move it; crownRemap recolours the crown only.
// downscale: 2 = half size (each 2x2 block becomes one pixel).
export function buildVariant(baseFrames, { remap = {}, crown, crownDx = 0, crownDy = 0, crownRemap = {}, downscale = 1 } = {}) {
  let frames = baseFrames.map((rows) => rows.map((row) => [...row].map((c) => remap[c] ?? c).join('')));
  if (downscale === 2) frames = frames.map(shrink);
  if (!crown) return frames;
  const art = CROWNS[crown].map((row) => [...row].map((c) => crownRemap[c] ?? c).join(''));
  const cw = art[0].length;
  const ch = art.length;
  const w = frames[0][0].length;
  const x0 = Math.floor((w - cw) / 2) + crownDx;
  // Where the head starts (first non-transparent row under the crown), per frame.
  const tops = frames.map((rows) => {
    const i = rows.findIndex((row) => [...row.slice(Math.max(0, x0), x0 + cw)].some((c) => c !== '.'));
    return i < 0 ? 0 : i;
  });
  const pad = Math.max(0, ...tops.map((t) => ch - 1 - t - crownDy));
  return frames.map((rows, f) => {
    const out = [...Array(pad).fill('.'.repeat(w)), ...rows].map((r) => [...r]);
    const top = tops[f] + pad - (ch - 1) + crownDy;
    art.forEach((row, y) => {
      [...row].forEach((c, x) => {
        const X = x0 + x;
        if (c !== '.' && X >= 0 && X < w && top + y >= 0) out[top + y][X] = c;
      });
    });
    return out.map((r) => r.join(''));
  });
}

// 2x2 blocks -> 1 pixel: transparent if 3+ are transparent, else the most common colour
// (ties go to the black outline, so edges stay crisp).
function shrink(rows) {
  const h = Math.ceil(rows.length / 2);
  const w = Math.ceil(rows[0].length / 2);
  const out = [];
  for (let y = 0; y < h; y++) {
    let line = '';
    for (let x = 0; x < w; x++) {
      const px = [rows[2 * y]?.[2 * x], rows[2 * y]?.[2 * x + 1], rows[2 * y + 1]?.[2 * x], rows[2 * y + 1]?.[2 * x + 1]].map((c) => c ?? '.');
      if (px.filter((c) => c === '.').length >= 3) { line += '.'; continue; }
      const count = {};
      for (const c of px) if (c !== '.') count[c] = (count[c] || 0) + 1;
      line += Object.entries(count).sort((a, b) => b[1] - a[1] || (a[0] === '0' ? -1 : b[0] === '0' ? 1 : 0))[0][0];
    }
    out.push(line);
  }
  return out;
}

// key: { base: existing sprite key, ...buildVariant options }
export const VARIANTS = {
  // Lair bosses
  slimeking: { base: 'slime', remap: { 3: '1' }, crown: 'big' },
  batqueen: { base: 'bat', remap: { e: '8', d: '2', 2: '1' }, crown: 'small' },
  ghostlord: { base: 'ghost', remap: { 7: 'c', 6: '1', d: '2', e: '7' }, crown: 'big', crownDx: -1 },
  golemtitan: { base: 'golem', remap: { 7: '6', 6: '5', 5: '1', b: '8', 3: '2', a: '8' }, crown: 'big' },
  skeletonking: { base: 'skeleton', remap: { 7: 'a', 6: '9', 4: '2', 8: '8' }, crown: 'big', crownDx: 2, crownRemap: { a: '7', 9: '6', 8: 'c' } },
  ogrewarlord: { base: 'ogre', remap: { b: '8', 3: '2', 1: '0' } }, // already wears a crown
  elderdragon: { base: 'dragon', remap: { 8: '2', e: 'd', 2: '1' } },
  // Lair monsters
  brute: { base: 'ogre', remap: { b: 'f', 3: '4', 1: '2', a: '6', 9: '5', 8: '5' } }, // crown -> iron helmet
  whelp: { base: 'dragon', downscale: 2, remap: { 8: 'b', e: 'a', 2: '3' } },
  // Boss projectiles
  goo: { base: 'fireball', remap: { 8: '3', 9: 'b', a: 'b', 2: '3' } },
  sonic: { base: 'fireball', remap: { 8: '2', 9: 'e', a: '7' } },
  wisp: { base: 'spirit', remap: { c: 'b', 1: '3' } },
  rock: { base: 'bone', remap: { 7: '6', 6: '5' } },
  darkfire: { base: 'fireball', remap: { 8: '2', 9: 'd', a: 'e' } },
};
