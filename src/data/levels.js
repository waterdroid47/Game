import { BOSS } from './enemies.js';

// The levels, in order. Each one is a place with its own ground and monster mix; health,
// speed, damage, waves and rewards all follow from the level number (see LEVELS below),
// so new levels can simply be added to the end of this list.
// bg: ground look – base colour, dark/light decoration shades, decoration type (light is
// also the level's button colour on the level-select screen).
const LEVEL_DEFS = [
  { name: 'Meadow', bg: { base: '#1d3a1f', dark: '#16301a', light: '#2f5c2c', deco: 'grass' } },
  { name: 'Dark Forest', bg: { base: '#12251a', dark: '#0d1c13', light: '#214030', deco: 'leaves' } },
  { name: 'Crystal Cave', bg: { base: '#1b1a2e', dark: '#141325', light: '#3a3468', deco: 'crystals' } },
  { name: 'Murky Swamp', bg: { base: '#1f2a19', dark: '#172013', light: '#3a4a24', deco: 'bubbles' } },
  { name: 'Scorched Desert', bg: { base: '#3a2a14', dark: '#2e210f', light: '#5a4420', deco: 'sand' } },
  { name: 'Ice Peaks', bg: { base: '#142236', dark: '#0f1a2a', light: '#2e4a70', deco: 'snow' } },
  { name: 'Volcano', bg: { base: '#2a0f0a', dark: '#200a07', light: '#6a2410', deco: 'lava' } },
  { name: 'Graveyard', bg: { base: '#1e1a24', dark: '#16131b', light: '#3a3446', deco: 'bones' } },
  { name: 'Castle Ruins', bg: { base: '#22222a', dark: '#1a1a21', light: '#3c3c4a', deco: 'bricks' } },
  { name: 'Dark Realm', bg: { base: '#1a0d26', dark: '#12091b', light: '#4a2a70', deco: 'stars' } },
  // Monster Lairs: each is full of one kind of monster, ruled by a giant King.
  {
    name: 'Slime Bog', boss: 'slimeking', bg: { base: '#132a1c', dark: '#0e2015', light: '#3f8a3a', deco: 'bubbles' },
    pool: { slime: 8, bigslime: 5, golem: 2, bat: 1, ghost: 1, skeleton: 1 }, countMult: 0.9, intervalMult: 1.1,
  },
  {
    name: 'Bat Caverns', boss: 'batqueen', bg: { base: '#1a1420', dark: '#120d17', light: '#6a2a5a', deco: 'drips' },
    pool: { bat: 12, slime: 3, skeleton: 2, ghost: 2, golem: 1 }, countMult: 1.1,
  },
  {
    name: 'Haunted Halls', boss: 'ghostlord', bg: { base: '#161a24', dark: '#10131b', light: '#4a5a78', deco: 'webs' },
    pool: { ghost: 10, bat: 2, skeleton: 2, slime: 2 }, extraHits: 1,
  },
  {
    name: 'Stone Quarry', boss: 'golemtitan', bg: { base: '#2a2620', dark: '#201d18', light: '#6a6050', deco: 'rubble' },
    pool: { golem: 9, slime: 3, skeleton: 2, bigslime: 1 }, countMult: 0.5, intervalMult: 2.6,
  },
  {
    name: 'Bone Crypt', boss: 'skeletonking', bg: { base: '#1c1818', dark: '#141111', light: '#6a5e54', deco: 'skulls' },
    pool: { skeleton: 6, slime: 2, ghost: 2, bat: 1, golem: 1 }, countMult: 0.75, intervalMult: 1.9,
  },
  {
    name: 'Ogre Stronghold', boss: 'ogrewarlord', bg: { base: '#24180f', dark: '#1b120b', light: '#6a4422', deco: 'bricks' },
    pool: { brute: 8, golem: 2, skeleton: 2, slime: 1 }, countMult: 0.6, intervalMult: 2.3,
  },
  {
    name: "Dragon's Peak", boss: 'elderdragon', bg: { base: '#2a0a12', dark: '#1e070d', light: '#9a3020', deco: 'embers' },
    pool: { whelp: 8, skeleton: 2, bat: 2, golem: 1 }, countMult: 0.8, intervalMult: 2.4, gems: 25,
  },
];

// How much tougher each level's monsters are (health): +12% per level up to level 6, then
// +10%. Shop upgrades only add ~6-8% net power per level (they get pricier, and monsters
// adapt to them), so bigger steps make the first wave of a new level a wall. Later levels
// also get harder through more waves, faster spawns, more monster types and more damage.
const hpMultFor = (n) => (n <= 6 ? 1 + 0.12 * (n - 1) : 1.6 + 0.1 * (n - 6));

// Early levels: mostly slimes and slow golems. Ghosts (3 hits) from level 3,
// fast bats (1 hit) and skeleton archers from level 4.
function poolFor(n) {
  if (n === 1) return { slime: 7, golem: 2 };
  if (n === 2) return { slime: 7, golem: 3 };
  if (n === 3) return { slime: 6, golem: 3, bigslime: 2, ghost: 2 };
  if (n <= 5) return { slime: 6, golem: 3, bigslime: 2, ghost: 2, skeleton: 2, bat: 2 };
  if (n <= 7) return { slime: 5, golem: 3, bigslime: 2, ghost: 3, skeleton: 3, bat: 3 };
  return { slime: 4, golem: 3, bigslime: 3, ghost: 3, skeleton: 3, bat: 4 };
}

export const LEVELS = LEVEL_DEFS.map((d, i) => {
  const n = i + 1;
  const hp = hpMultFor(n);
  return {
    n,
    name: d.name,
    bg: d.bg,
    mode: 'normal',
    bgKey: `bg_${n}`,
    boss: d.boss ?? BOSS, // the last wave is always this boss
    waves: Math.min(12, 8 + Math.floor(n / 3)),
    hpMult: hp,
    bossHpMult: hp * (1 + 0.04 * (n - 1)), // bosses get tougher faster than their minions
    speedMult: Math.min(1.4, 1 + 0.03 * i),
    // +7% per level up to level 10, then +3%: lair monsters already hit harder by type.
    dmgMult: i < 10 ? 1 + 0.07 * i : 1.63 + 0.03 * (i - 9),
    // Aimed shots grow more slowly (+5% per level): several shooters fire at once.
    shotMult: 1 + 0.05 * i,
    pool: d.pool ?? poolFor(n),
    countMult: d.countMult ?? 1,
    intervalMult: d.intervalMult ?? 1,
    extraHits: d.extraHits ?? 0, // ghosts take this many more hits
    clearCoins: 40 + 30 * n,
    clearGems: d.gems ?? (n % 3 === 0 ? 10 : n > 10 ? 5 : 3),
  };
});

// Nightmare mode: hard versions of every level, bought once for 5000 coins after beating
// level 10. Monsters don't adapt to shop upgrades here, so every upgrade counts in full –
// the later Nightmare levels need an (almost) fully upgraded shop. k = level number.
export const NIGHTMARE = {
  cost: 5000,
  requires: 10, // beat this normal level first
  hp: (k) => 3.0 + 0.16 * (k - 1),
  bossHp: (k) => (3.0 + 0.16 * (k - 1)) * (1 + 0.04 * (k - 1)),
  dmg: (k) => 2.2 + 0.06 * (k - 1),
  shot: (k) => 1.7 + 0.04 * (k - 1),
  speed: 1.12,
  speedCap: 1.55,
  count: 1.1, // more monsters per wave
  interval: 0.85, // spawning faster
  minInterval: 0.24,
  extraHits: 1, // ghosts take one more hit
  phase2At: 0.6, // bosses get angry sooner...
  bossCd: 0.85, // ...and attack more often
  heartChance: 0.75,
  heartHeal: 0.12,
  coinMult: 2, // kill coins
  clearCoins: (k) => 500 + 100 * k,
  firstGems: (k) => 20 + 5 * Math.floor((k - 1) / 4), // first clear
  gems: 4, // replays
};

// Mix a #rrggbb colour towards another (t = 0..1).
const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => {
  const v = Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t);
  return v.toString(16).padStart(2, '0');
}).join('');

const NIGHTMARE_LEVELS = LEVELS.map((L) => {
  const k = L.n;
  const N = NIGHTMARE;
  return {
    ...L,
    mode: 'nightmare',
    bgKey: `bg_${k}_nm`,
    bg: { ...L.bg, base: mix(L.bg.base, '#1a0008', 0.5), dark: mix(L.bg.dark, '#1a0008', 0.5), light: mix(L.bg.light, '#b0103a', 0.45) },
    hpMult: N.hp(k),
    bossHpMult: N.bossHp(k),
    dmgMult: N.dmg(k),
    shotMult: N.shot(k),
    speedMult: Math.min(N.speedCap, L.speedMult * N.speed),
    countMult: L.countMult * N.count,
    intervalMult: L.intervalMult * N.interval,
    minInterval: N.minInterval,
    extraHits: L.extraHits + N.extraHits,
    phase2At: N.phase2At,
    bossCd: N.bossCd,
    heartChance: N.heartChance,
    heartHeal: N.heartHeal,
    coinMult: N.coinMult,
    noAdapt: true,
    clearCoins: N.clearCoins(k),
    clearGems: N.gems,
    firstGems: N.firstGems(k),
  };
});

// A level by number (clamped to the existing levels) and mode ('normal' or 'nightmare').
export function getLevel(n, mode = 'normal') {
  const i = Math.min(LEVELS.length, Math.max(1, Math.floor(Number(n)) || 1)) - 1;
  return mode === 'nightmare' ? NIGHTMARE_LEVELS[i] : LEVELS[i];
}

// Every level of both modes (e.g. to create the ground textures).
export const ALL_LEVELS = [...LEVELS, ...NIGHTMARE_LEVELS];

// Enemies per wave and spawn rhythm. Waves get longer and faster.
export function waveSpec(level, wave) {
  return {
    count: Math.round((8 + wave * 4 + Math.round(level.n / 2)) * level.countMult),
    interval: Math.max(level.minInterval ?? 0.28, (1.05 - wave * 0.06 - level.n * 0.02) * level.intervalMult),
    hpMult: level.hpMult * (1 + 0.16 * (wave - 1)),
    // Ogre Kings (drop a chest) in waves 4, 7, 10: more of them in later levels, at most 3.
    elites: wave >= 4 && wave % 3 === 1 ? Math.min(3, 1 + Math.floor(level.n / 4)) : 0,
  };
}

// Level-ups. Wave 1 gives two (at these shares of its XP). After that a level-up costs
// `need` times a wave's XP, so not every wave gives one; progress carries over to the next
// wave, up to `carry` of a level-up. The shop's Fast Learner (more XP) buys level-ups back.
export const LEVEL_UPS = { first: [0.4, 0.9], need: 1.5, carry: 0.75 };
