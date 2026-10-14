// 10 levels. Each one is a body location with its own enemy mix and difficulty.
const NAMES = [
  'Skin Scratch', 'Bloodstream', 'Lymph Node', 'Lungs', 'Stomach',
  'Liver', 'Bone Marrow', 'Heart', 'Spinal Cord', 'Brain',
];
// Background colours per level: [base, cells, cell rims].
const BACKGROUNDS = [
  ['#2a0f14', '#3d1720', '#4a1c27'], // skin: dark rose
  ['#30050a', '#4a0a13', '#5c0f19'], // bloodstream: deep red
  ['#0b2415', '#123520', '#18422a'], // lymph node: green
  ['#0a1930', '#112746', '#183356'], // lungs: blue
  ['#2a2108', '#3d300d', '#4b3b12'], // stomach: amber
  ['#2a1309', '#3c1d10', '#4b2616'], // liver: brown
  ['#262320', '#38322c', '#463e36'], // bone marrow: bone grey
  ['#3a0611', '#55091b', '#6a0e24'], // heart: crimson
  ['#1b0e30', '#2a1746', '#351d56'], // spinal cord: violet
  ['#30112a', '#461a3d', '#56214b'], // brain: pink
];

// How much tougher each level's enemies are (health): +12% per level. Shop upgrades only
// add ~6-8% net power per level (they get pricier, and enemies adapt to them), so bigger
// steps make the first wave of a new level a wall. Later levels also get harder through
// more waves, faster spawns, more enemy types and more damage.
const HP_MULT = [1, 1.12, 1.24, 1.36, 1.48, 1.6, 1.7, 1.8, 1.9, 2.0];

// Early levels: mostly basic viruses and slow tanks. Drifters (3 hits) from level 3,
// fast germs (1 hit) from level 4.
function poolFor(n) {
  if (n === 1) return { virus: 7, tank: 2 };
  if (n === 2) return { virus: 7, tank: 3 };
  if (n === 3) return { virus: 6, tank: 3, splitter: 2, drifter: 2 };
  if (n <= 5) return { virus: 6, tank: 3, splitter: 2, drifter: 2, shooter: 2, germ: 2 };
  if (n <= 7) return { virus: 5, tank: 3, splitter: 2, drifter: 3, shooter: 3, germ: 3 };
  return { virus: 4, tank: 3, splitter: 3, drifter: 3, shooter: 3, germ: 4 };
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
    clearDna: n % 3 === 0 ? 10 : 3,
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
