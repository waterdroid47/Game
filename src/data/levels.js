// 10 levels. Each one is a place with its own monster mix, ground and difficulty.
const NAMES = [
  'Meadow', 'Dark Forest', 'Crystal Cave', 'Murky Swamp', 'Scorched Desert',
  'Ice Peaks', 'Volcano', 'Graveyard', 'Castle Ruins', 'Dark Realm',
];
// Ground look per level: base colour, dark/light decoration shades, decoration type.
// light is also used for the level's button on the level-select screen.
const BACKGROUNDS = [
  { base: '#1d3a1f', dark: '#16301a', light: '#2f5c2c', deco: 'grass' }, // meadow
  { base: '#12251a', dark: '#0d1c13', light: '#214030', deco: 'leaves' }, // dark forest
  { base: '#1b1a2e', dark: '#141325', light: '#3a3468', deco: 'crystals' }, // crystal cave
  { base: '#1f2a19', dark: '#172013', light: '#3a4a24', deco: 'bubbles' }, // murky swamp
  { base: '#3a2a14', dark: '#2e210f', light: '#5a4420', deco: 'sand' }, // scorched desert
  { base: '#142236', dark: '#0f1a2a', light: '#2e4a70', deco: 'snow' }, // ice peaks
  { base: '#2a0f0a', dark: '#200a07', light: '#6a2410', deco: 'lava' }, // volcano
  { base: '#1e1a24', dark: '#16131b', light: '#3a3446', deco: 'bones' }, // graveyard
  { base: '#22222a', dark: '#1a1a21', light: '#3c3c4a', deco: 'bricks' }, // castle ruins
  { base: '#1a0d26', dark: '#12091b', light: '#4a2a70', deco: 'stars' }, // dark realm
];

// How much tougher each level's enemies are (health): +12% per level. Shop upgrades only
// add ~6-8% net power per level (they get pricier, and enemies adapt to them), so bigger
// steps make the first wave of a new level a wall. Later levels also get harder through
// more waves, faster spawns, more enemy types and more damage.
const HP_MULT = [1, 1.12, 1.24, 1.36, 1.48, 1.6, 1.7, 1.8, 1.9, 2.0];

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

export const LEVELS = NAMES.map((name, i) => {
  const n = i + 1;
  return {
    n,
    name,
    bg: BACKGROUNDS[i],
    waves: 8 + Math.floor(n / 3), // last wave is always the boss
    hpMult: HP_MULT[i],
    speedMult: 1 + 0.03 * i,
    dmgMult: 1 + 0.07 * i,
    pool: poolFor(n),
    clearCoins: 40 + 30 * n,
    clearGems: n % 3 === 0 ? 10 : 3,
  };
});

// Enemies per wave and spawn rhythm. Waves get longer and faster.
export function waveSpec(level, wave) {
  return {
    count: 8 + wave * 4 + Math.round(level.n / 2),
    interval: Math.max(0.28, 1.05 - wave * 0.06 - level.n * 0.02),
    hpMult: level.hpMult * (1 + 0.16 * (wave - 1)),
    elites: wave >= 4 && wave % 3 === 1 ? 1 + Math.floor(level.n / 4) : 0,
  };
}

// Level-ups per wave: when this share of the wave's total XP has been collected.
// Wave 1 gives two level-ups, every later wave one. Unused XP doesn't carry over.
export const LEVEL_UPS = { first: [0.35, 0.75], other: [0.75] };
