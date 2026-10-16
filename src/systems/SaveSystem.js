// Player progress, stored in localStorage. (On Android this can move to Capacitor Preferences.)
const KEY = 'pixel-guard-save-v1';
const OLD_KEY = 'cell-defender-save-v1'; // the game's old name; progress carries over

const defaults = () => ({
  coins: 0,
  gems: 0,
  upgrades: {},
  unlocked: 1,
  stars: {},
  bestWave: {},
  purchases: {},
  ads: { day: '', count: 0 },
  settings: { sound: true },
  stats: { runs: 0, kills: 0 },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
    if (raw) {
      const d = defaults();
      const { dna, ...saved } = JSON.parse(raw);
      if (saved.gems == null && dna != null) saved.gems = dna; // DNA was renamed to gems
      return { ...d, ...saved, settings: { ...d.settings, ...saved.settings }, stats: { ...d.stats, ...saved.stats } };
    }
  } catch (e) {
    console.warn('Could not load save', e);
  }
  return defaults();
}

export const Save = {
  data: load(),
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save', e);
    }
  },
  add(currency, n) {
    this.data[currency] = Math.max(0, Math.round(this.data[currency] + n));
    this.save();
  },
  spend(currency, n) {
    if (this.data[currency] < n) return false;
    this.data[currency] -= n;
    this.save();
    return true;
  },
  level(id) {
    return this.data.upgrades[id] || 0;
  },
  // Free ads watched today (for the daily limit on menu ad rewards).
  adsToday() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.data.ads.day !== today) this.data.ads = { day: today, count: 0 };
    return this.data.ads.count;
  },
  reset() {
    this.data = defaults();
    this.save();
  },
};
