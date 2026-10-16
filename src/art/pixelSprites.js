// All game art is drawn here from small text pixel maps, so the game needs no image files.
// The sprites live in src/art/sprites/*.js (see _example.js for the format) and all use the
// shared PICO-8 palette in palette.js. Animated sprites get a Phaser animation "<key>-anim".
// To use real art instead, load a PNG/spritesheet with the same key in Boot.preload().
import { PALETTE } from './palette.js';
import hero from './sprites/hero.js';
import items from './sprites/items.js';
import monsters1 from './sprites/monsters1.js';
import monsters2 from './sprites/monsters2.js';

export const SPRITE_GROUPS = { hero, items, monsters1, monsters2 };

// 8x8 white icons for upgrade cards (tinted per card).
const ICONS = {
  ic_dmg: ['...ww...', '..wwww..', '.wwwwww.', 'www..www', '...ww...', '...ww...', '...ww...', '...ww...'],
  ic_rate: ['...ww...', '..w..w..', '.w....w.', '...ww...', '..w..w..', '.w....w.', '........', '........'],
  ic_multi: ['.w....w.', 'www..www', 'www..www', 'www..www', '.w....w.', '.w....w.', '........', '........'],
  ic_pierce: ['...w....', '...ww...', 'wwwwwww.', 'w.wwwwww', 'wwwwwww.', '...ww...', '...w....', '........'],
  ic_crit: ['...ww...', '...ww...', 'wwwwwwww', '.wwwwww.', '..wwww..', '.ww..ww.', 'ww....ww', '........'],
  ic_ricochet: ['w.......', '.w....w.', '..w..w..', '...ww...', '...w....', '..w.....', '.wwww...', '........'],
  ic_size: ['..wwww..', '.wwwwww.', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', '.wwwwww.', '..wwww..'],
  ic_hp: ['.ww..ww.', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', '.wwwwww.', '..wwww..', '...ww...', '........'],
  ic_spread: ['w..w..w.', '.w.w.w..', '..www...', '...w....', '...w....', '..www...', '..www...', '........'],
  ic_laser: ['...ww...', '...ww...', '..wwww..', '..wwww..', '..wwww..', '..wwww..', '.wwwwww.', 'wwwwwwww'],
  ic_orbit: ['..www...', '.w...w..', 'w..w..w.', 'w.www.w.', 'w..w..w.', '.w...w..', '..www...', '........'],
  ic_missile: ['...w....', '..www...', '..www...', '..www...', '.wwwww..', 'w.www.w.', '..w.w...', '........'],
  ic_pulse: ['..wwww..', '.w....w.', 'w..ww..w', 'w.w..w.w', 'w.w..w.w', 'w..ww..w', '.w....w.', '..wwww..'],
  ic_speed: ['ww..ww..', '.ww..ww.', '..ww..ww', '.ww..ww.', 'ww..ww..', '........', '........', '........'],
  ic_xp: ['w......w', 'ww....ww', '.ww..ww.', '..wwww..', '..wwww..', '.ww..ww.', 'ww....ww', 'w......w'],
  ic_coins: ['..wwww..', '.w....w.', 'w..ww..w', 'w.w....w', 'w.w....w', 'w..ww..w', '.w....w.', '..wwww..'],
};

// Draws one sprite: all frames side by side on one canvas texture, one frame per Phaser frame.
function drawSprite(scene, key, frames, pal = PALETTE) {
  const h = frames[0].length;
  const w = frames[0][0].length;
  const tex = scene.textures.createCanvas(key, w * frames.length, h);
  const ctx = tex.getContext();
  frames.forEach((rows, f) => {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        if (c === '.' || !pal[c]) continue;
        ctx.fillStyle = pal[c];
        ctx.fillRect(f * w + x, y, 1, 1);
      }
    });
    tex.add(f, 0, f * w, 0, w, h); // the first added frame becomes the default frame
  });
  tex.refresh();
}

// A dark, tileable ground pattern for a level: base colour, scattered decorations
// (grass, leaves, crystals, ...) in two shades.
function drawBackground(scene, key, bg) {
  const { base = '#1e0812', dark = '#160610', light = '#2a0b18', deco = 'dots' } = bg || {};
  const s = 48;
  const tex = scene.textures.createCanvas(key, s, s);
  const ctx = tex.getContext();
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(((x % s) + s) % s, ((y % s) + s) % s, 1, 1); };
  // fixed pseudo-random spots so every tile is identical (seamless)
  const spots = [[5, 7], [29, 4], [41, 19], [16, 23], [33, 36], [8, 39], [23, 12], [44, 44], [19, 33], [37, 27]];
  const shapes = {
    grass: (x, y) => { px(x, y, light); px(x + 2, y, light); px(x + 1, y - 1, light); px(x + 1, y, dark); },
    leaves: (x, y) => { px(x, y, light); px(x + 1, y, light); px(x + 1, y + 1, dark); px(x, y - 1, light); },
    crystals: (x, y) => { px(x, y, light); px(x, y - 1, light); px(x, y - 2, dark); px(x + 1, y, dark); },
    bubbles: (x, y) => { px(x, y - 1, light); px(x - 1, y, light); px(x + 1, y, light); px(x, y + 1, light); px(x, y, dark); },
    sand: (x, y) => { px(x, y, light); px(x + 1, y, light); px(x + 2, y + 1, light); px(x + 3, y + 1, dark); },
    snow: (x, y) => { px(x, y, light); px(x + 1, y + 1, dark); },
    lava: (x, y) => { px(x, y, light); px(x + 1, y + 1, light); px(x + 2, y + 1, dark); px(x + 3, y + 2, light); },
    bones: (x, y) => { px(x, y, light); px(x + 1, y, light); px(x + 2, y, light); px(x, y + 1, dark); px(x + 2, y + 1, dark); },
    bricks: (x, y) => { for (let i = 0; i < 5; i++) px(x + i, y, dark); px(x, y - 1, dark); px(x + 4, y + 1, dark); },
    stars: (x, y) => { px(x, y, light); },
    dots: (x, y) => { px(x, y, light); },
  };
  const drawShape = shapes[deco] || shapes.dots;
  spots.forEach(([x, y]) => drawShape(x, y));
  // a few faint single pixels for texture
  for (let i = 0; i < 14; i++) px((i * 17) % s, (i * 29) % s, dark);
  tex.refresh();
}

// Simple 1-colour pixel map (icons, particles).
function drawMono(scene, key, rows, colour = '#ffffff') {
  drawSprite(scene, key, [rows.map((r) => r.replace(/w/g, '7'))], { 7: colour });
}

export function createTextures(scene, levels = []) {
  for (const group of Object.values(SPRITE_GROUPS)) {
    for (const [key, sp] of Object.entries(group)) {
      drawSprite(scene, key, sp.frames);
      if (sp.frames.length > 1 && !scene.anims.exists(`${key}-anim`)) {
        scene.anims.create({
          key: `${key}-anim`,
          frames: sp.frames.map((_, i) => ({ key, frame: i })),
          frameRate: sp.fps || 4,
          repeat: -1,
        });
      }
    }
  }
  for (const [key, rows] of Object.entries(ICONS)) drawMono(scene, key, rows);
  drawMono(scene, 'px', ['ww', 'ww']);
  drawBackground(scene, 'bg', { base: '#1a1622', dark: '#141019', light: '#241e2e', deco: 'bricks' });
  for (const lvl of levels) drawBackground(scene, `bg_${lvl.n}`, lvl.bg);
}

// Plays a sprite's animation (if it has one), starting on a random frame so a crowd of
// monsters doesn't move in lockstep.
export function animate(sprite) {
  const key = `${sprite.texture.key}-anim`;
  if (!sprite.scene.anims.exists(key)) {
    sprite.anims?.stop(); // a recycled sprite may still be playing its previous texture's animation
    return sprite;
  }
  const n = sprite.scene.anims.get(key).frames.length;
  sprite.play({ key, startFrame: Math.floor(Math.random() * n) });
  return sprite;
}
