// Player progress, stored in localStorage. (On Android this can move to Capacitor Preferences.)
const KEY = 'pixel-guard-save-v1';
const OLD_KEY = 'cell-defender-save-v1'; // the game's old name; progress carries over

const defaults = () => ({
  version: 2,
  coins: 0,
  gems: 0,
  upgrades: {},
  unlocked: 1,
  stars: {},
  bestWave: {},
  purchases: {}, // one-time store packs owned (e.g. starter_pack: true)
  txns: [], // store transaction ids already granted (so a purchase is never granted twice)
  adsRemoved: false, // any store purchase removes the ads between levels
  adConsent: false, // last ad-consent answer from Google's form (used when offline)
  adPrivacyRequired: false, // whether that answer needs the PRIVACY button (EU)
  ads: { day: '', count: 0 },
  inter: { since: 0, every: 3 }, // levels finished since the last between-levels ad
  // Nightmare mode: bought once with coins; its own progress, like the normal levels'.
  nightmare: { owned: false, unlocked: 1, stars: {}, bestWave: {} },
  flags: {}, // one-off hints already shown (e.g. seenLairs)
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
      // New fields get their defaults; nested objects (settings, nightmare, ...) are merged
      // one level deep, so fields added to them later appear in old saves too.
      const out = { ...d, ...saved };
      for (const [k, v] of Object.entries(d)) {
        if (v && typeof v === 'object' && !Array.isArray(v) && saved[k] && typeof saved[k] === 'object') out[k] = { ...v, ...saved[k] };
      }
      out.version = d.version;
      return out;
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
  // Progress of a mode: { unlocked, stars, bestWave } for 'normal' or 'nightmare'.
  progress(mode = 'normal') {
    return mode === 'nightmare' ? this.data.nightmare : this.data;
  },
  // Old saves capped `unlocked` at the last level of that version (10). Anyone who already
  // beat a level gets the next one, now that there are more.
  fixProgress(levelCount) {
    for (const p of [this.data, this.data.nightmare]) {
      const beaten = Object.keys(p.stars).filter((n) => p.stars[n] > 0).map(Number);
      const best = beaten.length ? Math.max(...beaten) : 0;
      p.unlocked = Math.min(levelCount, Math.max(p.unlocked, best + 1));
    }
    this.save();
  },
  // Free ads watched today (for the daily limit on menu ad rewards).
  adsToday() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.data.ads.day !== today) this.data.ads = { day: today, count: 0 };
    return this.data.ads.count;
  },
  // Starts over, but keeps what was bought with real money (and the ad-consent answer).
  // Nightmare was bought with coins, so it goes too.
  reset() {
    const { purchases, txns, adsRemoved, adConsent, adPrivacyRequired } = this.data;
    this.data = { ...defaults(), purchases, txns, adsRemoved, adConsent, adPrivacyRequired };
    this.save();
  },
};
