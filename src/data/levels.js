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
    bossHpMult: hp,
    speedMult: Math.min(1.4, 1 + 0.03 * i),
    dmgMult: 1 + 0.07 * i,
    // Aimed shots grow more slowly (+5% per level): several shooters fire at once.
    shotMult: 1 + 0.05 * i,
    pool: d.pool ?? poolFor(n),
    countMult: d.countMult ?? 1,
    intervalMult: d.intervalMult ?? 1,
    extraHits: d.extraHits ?? 0, // ghosts take this many more hits
    clearCoins: 40 + 30 * n,
    clearGems: d.gems ?? (n % 3 === 0 ? 10 : 3),
  };
});

// A level by number (clamped to the existing levels).
export function getLevel(n) {
  const i = Math.min(LEVELS.length, Math.max(1, Math.floor(Number(n)) || 1)) - 1;
  return LEVELS[i];
}

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

// Level-ups per wave: when this share of the wave's total XP has been collected.
// Wave 1 gives two level-ups, every later wave one. Unused XP doesn't carry over.
export const LEVEL_UPS = { first: [0.35, 0.75], other: [0.75] };
