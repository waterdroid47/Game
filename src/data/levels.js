// 10 levels. Each one is a body location with its own enemy mix and difficulty.
const NAMES = [
  'Skin Scratch', 'Bloodstream', 'Lymph Node', 'Lungs', 'Stomach',
  'Liver', 'Bone Marrow', 'Heart', 'Spinal Cord', 'Brain',
];
const TINTS = [0xffffff, 0xff9a9a, 0xb0ffb8, 0xb8d8ff, 0xffe39a, 0xd0a070, 0xfff0e0, 0xff7070, 0xd0b0ff, 0xffb0e0];

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
    tint: TINTS[i],
    waves: 8 + Math.floor(n / 3), // last wave is always the boss
    hpMult: 1.28 ** i,
    speedMult: 1 + 0.05 * i,
    dmgMult: 1 + 0.12 * i,
    pool: poolFor(n),
    clearCoins: 40 + 30 * n,
    clearDna: n % 3 === 0 ? 10 : 3,
  };
});

// Enemies per wave and spawn rhythm. Waves get longer and faster.
export function waveSpec(level, wave) {
  return {
    count: 8 + wave * 4 + level.n,
    interval: Math.max(0.28, 1.05 - wave * 0.06 - level.n * 0.04),
    hpMult: level.hpMult * (1 + 0.16 * (wave - 1)),
    elites: wave >= 4 && wave % 3 === 1 ? 1 + Math.floor(level.n / 4) : 0,
  };
}

// XP needed to go from run-level l to l+1 (roughly "kill N enemies").
export const xpFor = (l) => Math.round(8 + l * 5 + l * l * 0.8);
