// In-run upgrade cards offered on level-up and from bonus chests.

// Attack stances: extra weapons that fire on their own. Each goes up to level 5 (5 = evolved).
export const STANCES = {
  spread: {
    name: 'Spread Shot', icon: 'ic_spread', color: 0xffd23f,
    desc: (l) => (l === 5 ? 'EVOLVED: 9 piercing shots' : `Fires a fan of ${2 + l} shots`),
  },
  laser: {
    name: 'Enzyme Laser', icon: 'ic_laser', color: 0xff4df0,
    desc: (l) => (l === 5 ? 'EVOLVED: huge beam, fast recharge' : 'Burning beam straight up, wider each level'),
  },
  orbit: {
    name: 'Antibody Ring', icon: 'ic_orbit', color: 0x4ae8ff,
    desc: (l) => (l === 5 ? 'EVOLVED: 6 antibodies, wider ring' : `${l} antibod${l > 1 ? 'ies' : 'y'} orbit you, blocking shots`),
  },
  missile: {
    name: 'Homing Phage', icon: 'ic_missile', color: 0xff6a3d,
    desc: (l) => (l === 5 ? 'EVOLVED: big explosive volleys' : `Homing missiles hunt enemies (${Math.ceil(l / 2)} per volley)`),
  },
  pulse: {
    name: 'Immune Pulse', icon: 'ic_pulse', color: 0x7dff7a,
    desc: (l) => (l === 5 ? 'EVOLVED: pulse also knocks enemies back' : 'Shockwave hits everything near you'),
  },
};
export const STANCE_MAX = 5;

// Stat cards. max = how many times the card can be taken in one run.
export const CARDS = [
  { id: 'dmg', name: 'Sharp Enzymes', icon: 'ic_dmg', color: 0xff5a5a, desc: '+20% damage', apply: (s) => { s.damage *= 1.2; } },
  { id: 'rate', name: 'Fast Ribosomes', icon: 'ic_rate', color: 0x7ff9ff, desc: '+15% fire rate', apply: (s) => { s.fireRate *= 1.15; } },
  { id: 'multi', name: 'Twin Shot', icon: 'ic_multi', color: 0x7ff9ff, desc: '+1 main projectile', max: 4, apply: (s) => { s.projectiles += 1; } },
  { id: 'pierce', name: 'Piercing', icon: 'ic_pierce', color: 0xffffff, desc: 'Shots pierce +1 enemy', max: 3, apply: (s) => { s.pierce += 1; } },
  { id: 'crit', name: 'Critical Hit', icon: 'ic_crit', color: 0xffd23f, desc: '+10% crit chance', max: 5, apply: (s) => { s.crit += 0.1; } },
  { id: 'ricochet', name: 'Ricochet', icon: 'ic_ricochet', color: 0xb0ff6a, desc: 'Shots bounce to +1 enemy', max: 3, apply: (s) => { s.ricochet += 1; } },
  { id: 'size', name: 'Big Shots', icon: 'ic_size', color: 0xffa04d, desc: 'Bigger shots, +10% damage', max: 3, apply: (s) => { s.bulletScale *= 1.25; s.damage *= 1.1; } },
  { id: 'hp', name: 'Regenerate', icon: 'ic_hp', color: 0xff3b5c, desc: '+20 max HP, heal 40', apply: (s, run) => { s.maxHp += 20; run.heal(40); } },
  { id: 'speed', name: 'Flagellum', icon: 'ic_speed', color: 0xc0c0ff, desc: '+25% shot speed, +10% fire rate', max: 2, apply: (s) => { s.bulletSpeed *= 1.25; s.fireRate *= 1.1; } },
];

// Roll `count` distinct cards the player can still take.
export function rollCards(run, count) {
  const options = [];
  for (const c of CARDS) {
    const taken = run.cardLevels[c.id] || 0;
    if (c.max && taken >= c.max) continue;
    options.push({ kind: 'card', id: c.id, weight: 10, def: c, level: taken + 1 });
  }
  for (const [id, def] of Object.entries(STANCES)) {
    const lvl = run.stances[id];
    if (lvl >= STANCE_MAX) continue;
    // New stances are a bit rarer than levelling owned ones.
    options.push({ kind: 'stance', id, weight: lvl > 0 ? 14 : 8, def, level: lvl + 1 });
  }
  const picks = [];
  while (picks.length < count && options.length) {
    const total = options.reduce((a, o) => a + o.weight, 0);
    let r = Math.random() * total;
    const idx = options.findIndex((o) => (r -= o.weight) < 0);
    picks.push(options.splice(idx < 0 ? 0 : idx, 1)[0]);
  }
  return picks.map(describe);
}

function describe(o) {
  if (o.kind === 'stance') {
    return { ...o, name: o.def.name, icon: o.def.icon, color: o.def.color, desc: o.def.desc(o.level), tag: o.level === 1 ? 'NEW!' : o.level === STANCE_MAX ? 'EVOLVE' : `Lv ${o.level}` };
  }
  return { ...o, name: o.def.name, icon: o.def.icon, color: o.def.color, desc: o.def.desc, tag: o.def.max ? `${o.level}/${o.def.max}` : '' };
}
