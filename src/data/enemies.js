// Base monster stats. Level and wave multipliers are applied on top (see data/levels.js).
// tex: sprite key (src/art/sprites/). radius: hit radius in screen pixels.
// dmg: damage dealt when reaching the castle wall (or touching the guard).
export const ENEMIES = {
  slime: { name: 'Slime', tex: 'slime', hp: 10, speed: 38, dmg: 8, xp: 1, coins: 1, radius: 14 },
  // Fast and fragile: pops in one hit.
  bat: { name: 'Bat', tex: 'bat', hp: 6, speed: 64, dmg: 6, xp: 1, coins: 1, radius: 11, wobble: 40, oneHit: true },
  // Slow side-to-side floater; always takes exactly 3 hits.
  ghost: { name: 'Ghost', tex: 'ghost', hp: 3, hits: 3, speed: 24, dmg: 10, xp: 2, coins: 2, radius: 16, wobble: 75, wobbleSpeed: 1.3 },
  golem: { name: 'Golem', tex: 'golem', hp: 45, speed: 18, dmg: 16, xp: 3, coins: 3, radius: 16 },
  bigslime: { name: 'Big Slime', tex: 'bigslime', hp: 20, speed: 28, dmg: 10, xp: 2, coins: 2, radius: 14, split: { into: 'minislime', count: 2 } },
  minislime: { name: 'Mini Slime', tex: 'minislime', hp: 5, speed: 54, dmg: 4, xp: 1, coins: 0, radius: 9, wobble: 25 },
  skeleton: {
    name: 'Skeleton Archer', tex: 'skeleton', hp: 18, speed: 26, dmg: 10, xp: 2, coins: 2, radius: 14,
    hold: [110, 260], shoot: { every: 2.8, speed: 150, dmg: 7, count: 1, tex: 'bone' },
  },
  ogre: { name: 'Ogre King', tex: 'ogre', hp: 150, speed: 15, dmg: 25, xp: 8, coins: 10, radius: 20, chest: true },
  dragon: {
    name: 'Red Dragon', tex: 'dragon', hp: 1500, speed: 22, dmg: 40, xp: 0, coins: 120, radius: 44, boss: true,
    hold: [130, 130], shoot: { every: 1.9, speed: 150, dmg: 9, count: 5, spread: 60, tex: 'fireball' }, summon: { every: 5, type: 'slime', count: 2 },
  },
};

export const BOSS = 'dragon';
