// Base monster stats. Level and wave multipliers are applied on top (see data/levels.js).
// tex: sprite key (src/art/sprites/). radius: hit radius in screen pixels.
// dmg: damage dealt when reaching the castle wall (or touching the guard).
// color: the burst when it is defeated.
export const ENEMIES = {
  slime: { name: 'Slime', tex: 'slime', hp: 10, speed: 38, dmg: 8, xp: 1, coins: 1, radius: 14, color: 0x00e436 },
  // Fast and fragile: pops in one hit.
  bat: { name: 'Bat', tex: 'bat', hp: 6, speed: 64, dmg: 6, xp: 1, coins: 1, radius: 11, wobble: 40, oneHit: true, color: 0x7e2553 },
  // Slow side-to-side floater; always takes exactly 3 hits.
  ghost: { name: 'Ghost', tex: 'ghost', hp: 3, hits: 3, speed: 24, dmg: 10, xp: 2, coins: 2, radius: 16, wobble: 75, wobbleSpeed: 1.3, color: 0xfff1e8 },
  golem: { name: 'Golem', tex: 'golem', hp: 45, speed: 18, dmg: 16, xp: 3, coins: 3, radius: 16, color: 0xc2c3c7 },
  bigslime: { name: 'Big Slime', tex: 'bigslime', hp: 20, speed: 28, dmg: 10, xp: 2, coins: 2, radius: 14, split: { into: 'minislime', count: 2 }, color: 0x83769c },
  minislime: { name: 'Mini Slime', tex: 'minislime', hp: 5, speed: 54, dmg: 4, xp: 1, coins: 0, radius: 9, wobble: 25, color: 0x83769c },
  skeleton: {
    name: 'Skeleton Archer', tex: 'skeleton', hp: 18, speed: 26, dmg: 10, xp: 2, coins: 2, radius: 14, color: 0xfff1e8,
    hold: [110, 260], shoot: { every: 2.8, speed: 150, dmg: 7, count: 1, tex: 'bone' },
  },
  ogre: { name: 'Ogre King', tex: 'ogre', hp: 150, speed: 15, dmg: 25, xp: 8, coins: 10, radius: 20, chest: true, color: 0x008751 },
  // Lair monsters (levels 11+).
  brute: { name: 'Ogre Brute', tex: 'brute', hp: 32, speed: 21, dmg: 16, xp: 3, coins: 3, radius: 18, color: 0xab5236 },
  whelp: {
    name: 'Dragon Whelp', tex: 'whelp', hp: 16, speed: 34, dmg: 12, xp: 2, coins: 2, radius: 15, color: 0x00e436,
    wobble: 35, wobbleSpeed: 2, shoot: { every: 5, speed: 140, dmg: 6, count: 1, tex: 'fireball' },
  },

  // ----- Bosses: the last wave of a level (see systems/BossBrain.js) -----
  // scale: screen pixels per art pixel. holdY: where it hovers; sway: [amplitude, speed].
  // attacks: fan | ring | volley | rain | summon | charge | blink, each every N seconds.
  //   p2: changes in phase 2; phase: 2 = only in phase 2; then: attack fired after a charge/blink.
  // phase2: below `at` of its health it gets angry: cooldowns x cd, optional new holdY.
  // Shot dmg goes through the level's shot multiplier; contact dmg like other monsters.
  dragon: {
    name: 'Red Dragon', tex: 'dragon', scale: 2, hp: 1650, speed: 22, dmg: 40, xp: 0, coins: 120, radius: 44, boss: true, color: 0xff004d,
    holdY: 130, sway: [110, 0.7],
    attacks: [
      { type: 'fan', every: 1.9, count: 5, spread: 60, speed: 150, dmg: 9, tex: 'fireball', p2: { count: 7, spread: 80 } },
      { type: 'summon', every: 5, enemy: 'slime', count: 2, p2: { count: 3 } },
      { type: 'rain', phase: 2, every: 6, count: 5, warn: 0.9, speed: 400, dmg: 12, tex: 'fireball' }, // Meteor Rain
    ],
    phase2: { at: 0.5, cd: 0.7, holdY: 170, toast: 'The dragon is enraged!' },
  },
  slimeking: {
    name: 'Slime King', tex: 'slimeking', scale: 5, bodyDy: 2.5, hp: 1500, speed: 22, dmg: 40, xp: 0, coins: 150, radius: 36, boss: true, color: 0x00e436,
    holdY: 140, sway: [100, 0.6],
    attacks: [
      { type: 'charge', every: 6, warn: 0.6, speed: 360, then: { type: 'ring', count: 8, speed: 120, dmg: 8, tex: 'goo' },
        p2: { then: { type: 'ring', count: 12, speed: 120, dmg: 8, tex: 'goo' } } },
      { type: 'summon', every: 4.5, enemy: 'slime', count: 2 },
      { type: 'volley', phase: 2, every: 3.5, count: 3, gap: 0.2, speed: 180, dmg: 8, tex: 'goo' },
    ],
    spawnAt: { at: [0.8, 0.6, 0.4, 0.2], enemy: 'bigslime', count: 2 }, // splits off big slimes as it loses health
    phase2: { at: 0.5, cd: 0.75, toast: 'The Slime King boils with rage!' },
  },
  batqueen: {
    name: 'Bat Queen', tex: 'batqueen', scale: 6, bodyDy: 1.5, hp: 1300, speed: 30, dmg: 35, xp: 0, coins: 160, radius: 32, boss: true, color: 0xff004d,
    holdY: 150, sway: [120, 1.1],
    attacks: [
      { type: 'volley', every: 2.8, count: 3, gap: 0.15, speed: 200, dmg: 7, tex: 'sonic', p2: { count: 5 } },
      { type: 'summon', every: 3.5, enemy: 'bat', count: 3, p2: { count: 4 } },
      { type: 'charge', phase: 2, every: 5, warn: 0.5, speed: 420 }, // dive
    ],
    phase2: { at: 0.5, cd: 0.75, toast: 'The Bat Queen shrieks!' },
  },
  ghostlord: {
    name: 'Ghost Lord', tex: 'ghostlord', scale: 5, bodyDy: 2.5, hp: 1450, speed: 20, dmg: 35, xp: 0, coins: 170, radius: 38, boss: true, color: 0x29adff,
    holdY: 150, sway: [90, 0.5],
    attacks: [
      { type: 'blink', every: 5, then: { type: 'ring', count: 10, speed: 110, dmg: 9, tex: 'wisp' },
        p2: { every: 3.5, then: { type: 'ring', count: 14, turn: 13, speed: 110, dmg: 9, tex: 'wisp' } } },
      { type: 'summon', every: 6, enemy: 'ghost', count: 2 },
      { type: 'fan', phase: 2, every: 2.5, count: 3, spread: 30, speed: 150, dmg: 9, tex: 'wisp' },
    ],
    phase2: { at: 0.5, cd: 1, toast: 'The Ghost Lord fades in and out!' },
  },
  golemtitan: {
    name: 'Golem Titan', tex: 'golemtitan', scale: 4, bodyDy: 2.5, hp: 1500, speed: 16, dmg: 40, xp: 0, coins: 180, radius: 32, boss: true, color: 0x5f574f,
    holdY: 120, sway: [80, 0.4],
    attacks: [
      { type: 'charge', every: 6.5, warn: 1, speed: 300, then: { type: 'ring', count: 8, speed: 130, dmg: 10, tex: 'rock' }, p2: { repeat: 2 } },
      { type: 'rain', every: 5, count: 4, warn: 1, speed: 380, dmg: 12, tex: 'rock' },
      { type: 'summon', phase: 2, every: 8, enemy: 'golem', count: 1 },
    ],
    phase2: { at: 0.5, cd: 0.75, toast: 'The ground shakes!' },
  },
  skeletonking: {
    name: 'Skeleton King', tex: 'skeletonking', scale: 5, bodyDy: 2.5, hp: 1400, speed: 22, dmg: 35, xp: 0, coins: 190, radius: 32, boss: true, color: 0xffec27,
    holdY: 140, sway: [110, 0.8],
    attacks: [
      { type: 'fan', every: 2.2, count: 7, spread: 70, speed: 170, dmg: 8, tex: 'bone' },
      { type: 'summon', every: 7, enemy: 'skeleton', count: 2, max: 6 },
      { type: 'ring', phase: 2, every: 1.2, count: 6, arc: 220, turn: 20, speed: 140, dmg: 8, tex: 'bone' }, // spiral
      { type: 'volley', phase: 2, every: 4, count: 4, gap: 0.15, speed: 230, dmg: 8, tex: 'bone' },
    ],
    phase2: { at: 0.5, cd: 0.7, toast: 'The Skeleton King raises his army!' },
  },
  ogrewarlord: {
    name: 'Ogre Warlord', tex: 'ogrewarlord', scale: 4, hp: 1400, speed: 18, dmg: 45, xp: 0, coins: 200, radius: 40, boss: true, color: 0xff004d,
    holdY: 130, sway: [100, 0.5],
    attacks: [
      { type: 'charge', every: 5.5, warn: 0.8, speed: 380, p2: { repeat: 2 } }, // club rush
      { type: 'fan', every: 3, count: 3, spread: 24, speed: 140, dmg: 11, tex: 'rock' },
      { type: 'summon', every: 9, enemy: 'brute', count: 2 },
      { type: 'rain', phase: 2, every: 6, count: 6, warn: 0.9, speed: 400, dmg: 13, tex: 'rock' },
    ],
    phase2: { at: 0.5, cd: 0.7, toast: 'The Warlord goes berserk!' },
  },
  elderdragon: {
    name: 'Elder Dragon', tex: 'elderdragon', scale: 3, hp: 1450, speed: 22, dmg: 45, xp: 0, coins: 300, radius: 56, boss: true, color: 0x7e2553,
    holdY: 150, sway: [95, 0.6],
    attacks: [
      { type: 'fan', every: 1.8, count: 7, spread: 80, speed: 160, dmg: 10, tex: 'darkfire' },
      { type: 'rain', every: 6, count: 5, warn: 0.9, speed: 400, dmg: 12, tex: 'darkfire', p2: { count: 7 } },
      { type: 'summon', every: 6, enemy: 'whelp', count: 2 },
      { type: 'ring', phase: 2, every: 3, count: 16, turn: 11, speed: 120, dmg: 10, tex: 'darkfire' },
      { type: 'charge', phase: 2, every: 7, warn: 1, speed: 340 }, // dive
    ],
    phase2: { at: 0.5, cd: 0.65, toast: 'The Elder Dragon awakens!' },
  },
};

export const BOSS = 'dragon'; // default boss (last wave) of a level
export const ELITE = 'ogre'; // mini-boss that drops a treasure chest (from wave 4)
