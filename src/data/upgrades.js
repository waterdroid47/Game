// In-run upgrade cards offered on level-up and from bonus chests.

export const STANCE_MAX = 5; // level 5 = evolved

// Numbers for every attack stance at every level (0 = not owned). The game reads these,
// and the card descriptions are built from them, so a card always says exactly what changes.
export const STANCE_STATS = {
  spread: (L) => ({ shots: L === 5 ? 9 : 2 + L, arc: 34 + 6 * L, every: Math.max(0.45, 1.6 - 0.12 * L), pierce: L === 5 ? 1 : 0 }),
  laser: (L) => ({ width: L === 5 ? 44 : 8 + 4 * L, every: L === 5 ? 1.2 : 3.8 - 0.4 * L, duration: 0.6 + 0.08 * L, dmg: (0.5 + 0.15 * L) * (L === 5 ? 1.5 : 1) }),
  orbit: (L) => ({ count: L === 5 ? 6 : L, radius: L === 5 ? 56 : 44, dmg: 1 + 0.25 * L }),
  missile: (L) => ({ count: L === 5 ? 6 : L, every: L === 5 ? 1.0 : 2.8 - 0.3 * L, dmg: 2.2 + 0.4 * L, aoe: L === 5 ? 50 : 26 }),
  pulse: (L) => ({ radius: L === 5 ? 170 : 70 + 16 * L, every: L === 5 ? 1.8 : 4.6 - 0.5 * L, dmg: 1.6 + 0.6 * L, knock: L === 5 }),
};

const f1 = (n) => (Math.round(n * 10) / 10).toString();
const pct = (n) => `${Math.round(n * 100)}%`;
const arrow = (a, b) => `${a} -> ${b}`;

// desc(next level, stats now) – what taking this card changes.
export const STANCES = {
  spread: {
    name: 'Fire Fan', icon: 'ic_spread', color: 0xffd23f,
    desc: (l) => {
      const [a, b] = [STANCE_STATS.spread(l - 1), STANCE_STATS.spread(l)];
      if (l === 1) return `Throws a fan of ${b.shots} fire bolts`;
      if (l === STANCE_MAX) return `EVOLVED: fan of ${b.shots} piercing shots`;
      return `Shots per fan ${arrow(a.shots, b.shots)}, fires faster`;
    },
  },
  laser: {
    name: 'Lightning Beam', icon: 'ic_laser', color: 0x8fe8ff,
    desc: (l) => {
      const [a, b] = [STANCE_STATS.laser(l - 1), STANCE_STATS.laser(l)];
      if (l === 1) return `Lightning strikes straight up, every ${f1(b.every)}s`;
      if (l === STANCE_MAX) return `EVOLVED: huge storm beam every ${f1(b.every)}s`;
      return `Beam width ${arrow(a.width, b.width)}, every ${arrow(f1(a.every), f1(b.every))}s`;
    },
  },
  orbit: {
    name: 'Shield Orbit', icon: 'ic_orbit', color: 0x4ae8ff,
    desc: (l) => {
      const [a, b] = [STANCE_STATS.orbit(l - 1), STANCE_STATS.orbit(l)];
      if (l === 1) return '1 magic shield circles you, hitting monsters and blocking shots';
      if (l === STANCE_MAX) return `EVOLVED: ${b.count} shields, wider ring`;
      return `Shields ${arrow(a.count, b.count)}`;
    },
  },
  missile: {
    name: 'Spirit Missiles', icon: 'ic_missile', color: 0xff6a3d,
    desc: (l) => {
      const [a, b] = [STANCE_STATS.missile(l - 1), STANCE_STATS.missile(l)];
      if (l === 1) return `1 homing spirit every ${f1(b.every)}s`;
      if (l === STANCE_MAX) return `EVOLVED: ${b.count} big exploding spirits every ${f1(b.every)}s`;
      return `Spirits per volley ${arrow(a.count, b.count)}`;
    },
  },
  pulse: {
    name: 'Shockwave', icon: 'ic_pulse', color: 0x6ab8ff,
    desc: (l) => {
      const [a, b] = [STANCE_STATS.pulse(l - 1), STANCE_STATS.pulse(l)];
      if (l === 1) return `A shockwave hits everything near you, every ${f1(b.every)}s`;
      if (l === STANCE_MAX) return 'EVOLVED: huge shockwave that knocks monsters back';
      return `Wave size ${arrow(a.radius, b.radius)}, every ${arrow(f1(a.every), f1(b.every))}s`;
    },
  },
};

// Stat cards. max = how many times the card can be taken in one run.
// desc(stats) shows the change from the current value.
export const CARDS = [
  { id: 'dmg', name: 'Sharp Bolts', icon: 'ic_dmg', color: 0xff5a5a, desc: (s) => `Damage ${arrow(f1(s.damage), f1(s.damage * 1.2))}`, apply: (s) => { s.damage *= 1.2; } },
  { id: 'rate', name: 'Quick Hands', icon: 'ic_rate', color: 0x7ff9ff, desc: (s) => `Shots per second ${arrow(f1(s.fireRate), f1(s.fireRate * 1.15))}`, apply: (s) => { s.fireRate *= 1.15; } },
  { id: 'multi', name: 'Twin Shot', icon: 'ic_multi', color: 0x7ff9ff, max: 4, desc: (s) => `Main shots ${arrow(s.projectiles, s.projectiles + 1)}`, apply: (s) => { s.projectiles += 1; } },
  { id: 'pierce', name: 'Piercing', icon: 'ic_pierce', color: 0xffffff, max: 3, desc: (s) => `Each shot passes through ${arrow(s.pierce, s.pierce + 1)} monsters`, apply: (s) => { s.pierce += 1; } },
  { id: 'crit', name: 'Critical Hit', icon: 'ic_crit', color: 0xffd23f, max: 5, desc: (s) => `Crit chance ${arrow(pct(s.crit), pct(s.crit + 0.1))} (double damage)`, apply: (s) => { s.crit += 0.1; } },
  { id: 'ricochet', name: 'Ricochet', icon: 'ic_ricochet', color: 0xb0ff6a, max: 3, desc: (s) => `Shots bounce to ${arrow(s.ricochet, s.ricochet + 1)} more monsters`, apply: (s) => { s.ricochet += 1; } },
  { id: 'size', name: 'Heavy Bolts', icon: 'ic_size', color: 0xffa04d, max: 3, desc: (s) => `Bigger shots, damage ${arrow(f1(s.damage), f1(s.damage * 1.1))}`, apply: (s) => { s.bulletScale *= 1.25; s.damage *= 1.1; } },
  // More max HP, but no healing: during a run only hearts heal.
  { id: 'hp', name: 'Iron Heart', icon: 'ic_hp', color: 0xff3b5c, desc: (s) => `Max HP ${arrow(Math.round(s.maxHp), Math.round(s.maxHp + 20))}`, apply: (s) => { s.maxHp += 20; } },
  { id: 'speed', name: 'Swift Bolts', icon: 'ic_speed', color: 0xc0c0ff, max: 2, desc: (s) => `Shot speed +25%, shots per second ${arrow(f1(s.fireRate), f1(s.fireRate * 1.1))}`, apply: (s) => { s.bulletSpeed *= 1.25; s.fireRate *= 1.1; } },
];

// Can this card / stance still be taken in this run?
export function canTake(run, kind, id) {
  if (kind === 'stance') return run.stances[id] < STANCE_MAX;
  const card = CARDS.find((c) => c.id === id);
  return !card.max || (run.cardLevels[id] || 0) < card.max;
}

// Roll `count` distinct cards the player can still take (maxed-out ones are never offered).
export function rollCards(run, count) {
  const options = [];
  for (const c of CARDS) {
    if (!canTake(run, 'card', c.id)) continue;
    options.push({ kind: 'card', id: c.id, weight: 10, def: c, level: (run.cardLevels[c.id] || 0) + 1 });
  }
  for (const [id, def] of Object.entries(STANCES)) {
    if (!canTake(run, 'stance', id)) continue;
    const lvl = run.stances[id];
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
  return picks.map((o) => describe(o, run));
}

function describe(o, run) {
  if (o.kind === 'stance') {
    return { ...o, name: o.def.name, icon: o.def.icon, color: o.def.color, desc: o.def.desc(o.level), tag: o.level === 1 ? 'NEW!' : o.level === STANCE_MAX ? 'EVOLVE' : `Lv ${o.level}` };
  }
  return { ...o, name: o.def.name, icon: o.def.icon, color: o.def.color, desc: o.def.desc(run.stats), tag: o.def.max ? `${o.level}/${o.def.max}` : '' };
}
