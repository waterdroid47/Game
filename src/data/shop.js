import { Save } from '../systems/SaveSystem.js';

// Permanent upgrades bought in the menu. Coins are earned by playing; DNA comes from
// bosses, rewarded ads and the real-money store.
export const SHOP = [
  { id: 'damage', name: 'Enzyme Power', desc: '+10% damage', icon: 'ic_dmg', color: 0xff5a5a, currency: 'coins', max: 10, cost: (l) => Math.round(60 * 1.55 ** l) },
  { id: 'hp', name: 'Thick Membrane', desc: '+15 max HP', icon: 'ic_hp', color: 0xff3b5c, currency: 'coins', max: 10, cost: (l) => Math.round(50 * 1.5 ** l) },
  { id: 'fireRate', name: 'Fast Ribosomes', desc: '+6% fire rate', icon: 'ic_rate', color: 0x7ff9ff, currency: 'coins', max: 10, cost: (l) => Math.round(70 * 1.55 ** l) },
  { id: 'xp', name: 'Quick Learner', desc: '+8% XP', icon: 'ic_xp', color: 0x9d74ff, currency: 'coins', max: 5, cost: (l) => Math.round(120 * 1.7 ** l) },
  { id: 'coins', name: 'Greedy Cell', desc: '+10% coins', icon: 'ic_coins', color: 0xffd23f, currency: 'coins', max: 5, cost: (l) => Math.round(150 * 1.7 ** l) },
  { id: 'crit', name: 'Killer Instinct', desc: '+5% crit chance', icon: 'ic_crit', color: 0xffd23f, currency: 'dna', max: 3, cost: (l) => 40 * (l + 1) },
  { id: 'startStance', name: 'Head Start', desc: 'Start each run with a stance', icon: 'ic_spread', color: 0xffd23f, currency: 'dna', max: 1, cost: () => 80 },
  { id: 'extraCard', name: 'Mutation Insight', desc: 'Level-ups show 4 cards', icon: 'ic_multi', color: 0xb04cff, currency: 'dna', max: 1, cost: () => 150 },
  { id: 'revive', name: 'Second Life', desc: '1 free revive per run', icon: 'ic_hp', color: 0x7dff7a, currency: 'dna', max: 1, cost: () => 120 },
];

// Combined effect of everything bought in the shop.
export function metaStats() {
  const u = (id) => Save.data.upgrades[id] || 0;
  return {
    damageMult: 1 + 0.1 * u('damage'),
    hp: 15 * u('hp'),
    fireRateMult: 1 + 0.06 * u('fireRate'),
    xpMult: 1 + 0.08 * u('xp'),
    coinMult: 1 + 0.1 * u('coins'),
    crit: 0.05 * u('crit'),
    startStance: u('startStance') > 0,
    cards: u('extraCard') > 0 ? 4 : 3,
    revives: u('revive'),
  };
}
