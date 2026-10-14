// All game art is drawn here from tiny pixel maps, so the game needs no image files.
// Each map is a list of rows; every character is one pixel, looked up in a palette ('.' = transparent).
// To use real art instead, load a PNG with the same texture key in Boot.preload().

const SPRITES = {
  cell: {
    pal: { g: '#1d6b3a', G: '#3ecf6e', l: '#a8f5b8', n: '#4b2a99', N: '#9d74ff', w: '#ffffff' },
    rows: [
      '....gggg....',
      '..gGGGGGGg..',
      '.gGwwllGGGg.',
      '.gGwllllllGg',
      'gGllnnnnllGg',
      'gGlnNNNNnlGg',
      'gGlnNwNNnlGg',
      'gGllnnnnllGg',
      '.gGllllllGg.',
      '.gGGllllGGg.',
      '..gGGGGGGg..',
      '....gggg....',
    ],
  },
  virus: {
    pal: { s: '#ff9db0', r: '#8a1435', R: '#e0335a', w: '#ffd0dc' },
    rows: [
      '.....s.....',
      '..s..r..s..',
      '...rRRRr...',
      '..rRRRRRr..',
      '.rRRwRRRRr.',
      'srRRRRRRRrs',
      '.rRRRRRwRr.',
      '..rRRRRRr..',
      '...rRRRr...',
      '..s..r..s..',
      '.....s.....',
    ],
  },
  germ: {
    pal: { y: '#a87b00', Y: '#ffd23f', k: '#3a2400' },
    rows: [
      '..yyyy..',
      '.yYYYYy.',
      'yYkYYkYy',
      'yYYYYYYy',
      'yYYkkYYy',
      '.yYYYYy.',
      '..yyyy..',
      '...yy...',
      '..y..y..',
    ],
  },
  tank: {
    pal: { t: '#3d5a1a', T: '#7fae3a', d: '#c7e27a', k: '#1a2608' },
    rows: [
      '...tttt...',
      '..tTTTTt..',
      '.tTTTTTTt.',
      '.tTkTTkTt.',
      '.tTTTTTTt.',
      '.tTTTTdTt.',
      '.tTTTTTTt.',
      '.tTdTTTTt.',
      '.tTTTTTTt.',
      '.tTTTTTTt.',
      '.tTTTdTTt.',
      '.tTTTTTTt.',
      '.tTTTTTTt.',
      '..tTTTTt..',
      '...tttt...',
    ],
  },
  drifter: {
    pal: { c: '#9ff7e0', p: '#0f6e5a', P: '#3fd1a8', w: '#d8fff2', n: '#1a4a8a', N: '#5a8aff' },
    rows: [
      '.c.c.c.c.c.c..',
      '..pppppppppp..',
      '.pPPwwPPPPPPp.',
      'pPPwPPPPnnPPPp',
      'pPPPPPPnNNnPPp',
      'pPPPPPPPnnPPPp',
      '.pPPPPPPPPPPp.',
      '..pppppppppp..',
      '.c.c.c.c.c.c..',
    ],
  },
  splitter: {
    pal: { b: '#1b4e9e', B: '#4aa8ff', w: '#e6f4ff', k: '#0b2550' },
    rows: [
      '..bbbbbb..',
      '.bBBBBBBb.',
      'bBBwBBBBBb',
      'bBkBBbBkBb',
      'bBBBBbBBBb',
      'bBBBBbBBBb',
      'bBBBBbBBBb',
      'bBBBBBBBBb',
      '.bBBBBBBb.',
      '..bbbbbb..',
    ],
  },
  mini: {
    pal: { b: '#1b4e9e', B: '#4aa8ff', w: '#e6f4ff' },
    rows: ['.bbbb.', 'bBBBBb', 'bBwBBb', 'bBBBBb', 'bBBBBb', '.bbbb.'],
  },
  shooter: {
    pal: { o: '#9a3b00', O: '#ff8a2a', w: '#ffffff', k: '#000000' },
    rows: [
      '..oooooo..',
      '.oOOOOOOo.',
      'oOOOOOOOOo',
      'oOOwwwwOOo',
      'oOwwkkwwOo',
      'oOwwkkwwOo',
      'oOOwwwwOOo',
      'oOOOOOOOOo',
      '.oOOOOOOo.',
      '..o.oo.o..',
    ],
  },
  elite: {
    pal: { m: '#5c1170', M: '#c43cf0', w: '#ffe0ff', k: '#2a0030', y: '#ffd23f' },
    rows: [
      '..y...yy...y..',
      '..yy.yMMy.yy..',
      '...mMMMMMMm...',
      '..mMMMMMMMMm..',
      '.mMMMwMMwMMMm.',
      'mMMMMMMMMMMMMm',
      'mMMMMMMMMMMMMm',
      'mMMMkMMMMkMMMm',
      'mMMMMkkkkMMMMm',
      '.mMMMMMMMMMMm.',
      '..mMMMMMMMMm..',
      '...mMMMMMMm...',
      '..mm.mMMm.mm..',
      '..m...mm...m..',
    ],
  },
  bullet: {
    pal: { w: '#ffffff', C: '#7ff9ff' },
    rows: ['.w.', 'wCw', 'CCC', 'CCC', '.C.'],
  },
  ebullet: {
    pal: { r: '#8a0f2a', R: '#ff4d6d', w: '#ffd6de' },
    rows: ['.rrr.', 'rRwRr', 'rRRRr', 'rRRRr', '.rrr.'],
  },
  missile: {
    pal: { w: '#ffffff', R: '#ff5a5a', g: '#9aa0a6', y: '#ffd23f' },
    rows: ['.ww.', 'wRRw', 'wRRw', 'wRRw', 'gRRg', '.yy.', '.y..'],
  },
  orbiter: {
    pal: { a: '#0f6e7a', A: '#4ae8ff', w: '#ffffff' },
    rows: ['..aaa..', '.aAAAa.', 'aAwAAAa', 'aAAAAAa', 'aAAAAAa', '.aAAAa.', '..aaa..'],
  },
  chest: {
    pal: { k: '#2a1600', B: '#a0622a', b: '#6e3d14', y: '#ffd23f' },
    rows: [
      '.kkkkkkkkk.',
      'kBBBBBBBBBk',
      'kbbbbbbbbbk',
      'kkkkkyykkkk',
      'kBBBByyBBBk',
      'kBBBBBBBBBk',
      'kbbbbbbbbbk',
      '.kkkkkkkkk.',
    ],
  },
  chestRare: {
    pal: { k: '#2a0a3a', B: '#b04cff', b: '#6e1fb0', y: '#ffe970' },
    rows: [
      '.kkkkkkkkk.',
      'kByBByBByBk',
      'kbbbbbbbbbk',
      'kkkkkyykkkk',
      'kBBBByyBBBk',
      'kByBBBBByBk',
      'kbbbbbbbbbk',
      '.kkkkkkkkk.',
    ],
  },
  coin: {
    pal: { y: '#a87b00', Y: '#ffd23f', w: '#fff6c2' },
    rows: ['.yyyy.', 'yYYYYy', 'yYwYYy', 'yYYYYy', 'yYYYYy', '.yyyy.'],
  },
  dna: {
    pal: { p: '#ff5ad1', c: '#4ad7ff', w: '#ffffff' },
    rows: ['p....c', '.p..c.', '..pw..', '..wp..', '.c..p.', 'c....p', '.c..p.', '..cp..'],
  },
  heart: {
    pal: { r: '#ff3b5c', w: '#ffc2cc', k: '#5a0012' },
    rows: ['.kk.kk.', 'krwkrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'],
  },
  lock: {
    pal: { g: '#9aa0a6', k: '#2b2f33', y: '#ffd23f' },
    rows: ['..kkk..', '.k...k.', '.k...k.', 'kkkkkkk', 'kgggggk', 'kggyggk', 'kggyggk', 'kkkkkkk'],
  },
  star: {
    pal: { y: '#ffd23f', o: '#a87b00' },
    rows: ['...y...', '...y...', 'yyyyyyy', '.yyyyy.', '..yyy..', '.yy.yy.', 'yo...oy'],
  },
  starEmpty: {
    pal: { y: '#1c1216', o: '#0d0809' },
    rows: ['...y...', '...y...', 'yyyyyyy', '.yyyyy.', '..yyy..', '.yy.yy.', 'yo...oy'],
  },
  px: { pal: { w: '#ffffff' }, rows: ['ww', 'ww'] },
  membrane: {
    pal: { a: '#ff7aa8', b: '#c23a6b', c: '#7a1f43' },
    rows: ['aa....aa', 'bbaaaabb', 'bbbbbbbb', 'cbbbbbbc', 'cccbbccc', '..cccc..'],
  },
};

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

function draw(scene, key, rows, pal) {
  const h = rows.length;
  const w = rows[0].length;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  rows.forEach((row, y) => {
    if (row.length !== w) console.warn(`sprite ${key}: row ${y} has length ${row.length}, expected ${w}`);
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '.' || !pal[c]) continue;
      ctx.fillStyle = pal[c];
      ctx.fillRect(x, y, 1, 1);
    }
  });
  tex.refresh();
}

// The boss is drawn procedurally: a big spotted bacterium with eyes and teeth.
function drawBoss(scene) {
  const w = 32;
  const h = 24;
  const tex = scene.textures.createCanvas('boss', w, h);
  const ctx = tex.getContext();
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = ((x - cx) / (w / 2)) ** 2 + ((y - cy) / (h / 2)) ** 2;
      if (d > 1) continue;
      let col = '#3f8f2a';
      if (d > 0.78) col = '#16380c';
      else if ((x * 7 + y * 13) % 23 === 0 || (x * 3 + y * 5) % 29 === 0) col = '#9be05a';
      else if (y < cy - 4) col = '#56b53a';
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // flagella
  ctx.fillStyle = '#16380c';
  for (let i = 0; i < 6; i++) ctx.fillRect(3 + i * 5, h - 2 + (i % 2), 1, 2);
  // eyes
  for (const ex of [10, 20]) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ex - 2, 7, 5, 4);
    ctx.fillStyle = '#d4001f';
    ctx.fillRect(ex - 1, 8, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ex, 9, 1, 1);
  }
  // mouth with teeth
  ctx.fillStyle = '#2a0006';
  ctx.fillRect(9, 14, 14, 4);
  ctx.fillStyle = '#ffffff';
  for (let x = 9; x < 23; x += 2) {
    ctx.fillRect(x, 14, 1, 1);
    ctx.fillRect(x + 1, 17, 1, 1);
  }
  tex.refresh();
}

// A dark, tileable "tissue" background with faint cells, in the given colours.
function drawBackground(scene, key = 'bg', [base, cell, rim] = ['#1e0812', '#2f0d1c', '#3a1022']) {
  const s = 48;
  const tex = scene.textures.createCanvas(key, s, s);
  const ctx = tex.getContext();
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  const blobs = [
    [8, 10, 4],
    [30, 6, 3],
    [38, 30, 5],
    [14, 36, 3],
    [24, 22, 2],
  ];
  for (const [bx, by, r] of blobs) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const d = x * x + y * y;
        if (d > r * r) continue;
        ctx.fillStyle = d < (r - 1.5) * (r - 1.5) ? cell : rim;
        ctx.fillRect((bx + x + s) % s, (by + y + s) % s, 1, 1);
      }
    }
  }
  ctx.fillStyle = cell;
  for (let i = 0; i < 18; i++) ctx.fillRect((i * 17) % s, (i * 29) % s, 1, 1);
  tex.refresh();
}

export function createTextures(scene, levels = []) {
  for (const [key, def] of Object.entries(SPRITES)) draw(scene, key, def.rows, def.pal);
  for (const [key, rows] of Object.entries(ICONS)) draw(scene, key, rows, { w: '#ffffff' });
  drawBoss(scene);
  drawBackground(scene);
  for (const lvl of levels) drawBackground(scene, `bg_${lvl.n}`, lvl.bg);
}

export { SPRITES };
