// Base enemy stats. Level and wave multipliers are applied on top (see data/levels.js).
// radius: hit radius in screen pixels. dmg: damage dealt when reaching the membrane.
export const ENEMIES = {
  virus: { tex: 'virus', hp: 10, speed: 38, dmg: 8, xp: 1, coins: 1, radius: 14 },
  germ: { tex: 'germ', hp: 6, speed: 64, dmg: 6, xp: 1, coins: 1, radius: 11, wobble: 40 },
  tank: { tex: 'tank', hp: 45, speed: 18, dmg: 16, xp: 3, coins: 3, radius: 16 },
  splitter: { tex: 'splitter', hp: 20, speed: 28, dmg: 10, xp: 2, coins: 2, radius: 14, split: { into: 'mini', count: 2 } },
  mini: { tex: 'mini', hp: 5, speed: 54, dmg: 4, xp: 1, coins: 0, radius: 9, wobble: 25 },
  shooter: {
    tex: 'shooter', hp: 18, speed: 26, dmg: 10, xp: 2, coins: 2, radius: 14,
    hold: [110, 260], shoot: { every: 2.4, speed: 150, dmg: 7, count: 1 },
  },
  elite: { tex: 'elite', hp: 150, speed: 15, dmg: 25, xp: 8, coins: 10, radius: 20, chest: true, scale: 3 },
  boss: {
    tex: 'boss', hp: 1500, speed: 22, dmg: 40, xp: 20, coins: 80, radius: 44, boss: true, scale: 3,
    hold: [130, 130], shoot: { every: 1.9, speed: 150, dmg: 9, count: 5, spread: 60 }, summon: { every: 5, type: 'virus', count: 2 },
  },
};
