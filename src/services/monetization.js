import { AUTOPLAY } from '../config.js';
import { AD_UNITS, INTERSTITIAL, TEST_ADS } from '../data/ads.js';
import { STORE } from '../data/store.js';
import { Save } from '../systems/SaveSystem.js';

// One interface for ads and in-app purchases.
//
// - In the browser a MOCK is used: a fake 3-second ad and a confirmation dialog instead of
//   payment. No real money is ever involved, and there are no ads between levels.
// - In the Android app (Capacitor) the real thing is used:
//     * Google AdMob rewarded + interstitial ads   -> @capacitor-community/admob
//     * Google Play Billing                         -> cordova-plugin-purchase (CdvPurchase)
// The rest of the game only calls the Monetization object at the bottom of this file.

export const isNative = () => !!window.Capacitor?.isNativePlatform?.();

// ---------------------------------------------------------------------------
// small DOM helpers (drawn above the game canvas)
// ---------------------------------------------------------------------------
// A full-screen layer that swallows taps. Phaser listens for taps on the whole window, so
// this stops taps from reaching the game objects underneath (e.g. a card behind an ad).
function tapShield() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;z-index:1000;';
  for (const type of ['mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup']) {
    el.addEventListener(type, (e) => e.stopPropagation());
  }
  document.body.appendChild(el);
  return el;
}

function overlay(html) {
  const el = tapShield();
  el.style.cssText += 'display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);font-family:"Courier New",monospace;color:#fff;';
  el.innerHTML = `<div style="width:min(86vw,340px);background:#24101b;border:4px solid #000;box-shadow:0 0 0 4px #ff7aa8;padding:20px;text-align:center">${html}</div>`;
  return el;
}

const btn = (id, label, bg) => `<button id="${id}" style="font:bold 16px 'Courier New',monospace;color:#fff;background:${bg};border:3px solid #000;padding:10px 14px;margin:6px;cursor:pointer">${label}</button>`;

// A short message at the top of the screen that fades away by itself.
export function notice(msg, ms = 2600) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;left:50%;top:12%;transform:translateX(-50%);z-index:1001;max-width:80vw;padding:10px 14px;background:#24101b;border:3px solid #000;box-shadow:0 0 0 3px #ff7aa8;color:#fff;font:bold 14px "Courier New",monospace;text-align:center;pointer-events:none;transition:opacity .4s';
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; }, ms);
  setTimeout(() => el.remove(), ms + 500);
}

const sleep = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));

// Scenes can listen for changes (prices loaded, purchase delivered, ...) to redraw.
const listeners = new Set();
const emit = (what) => listeners.forEach((fn) => fn(what));

// Gives the player the contents of a store pack. Every purchase is granted exactly once:
// by its transaction id, and one-time packs only once ever. Returns true if granted.
export function deliver(productId, txId) {
  const item = STORE.find((s) => s.id === productId);
  if (!item) return false;
  const d = Save.data;
  if (txId && d.txns.includes(txId)) return false;
  if (txId) d.txns = [...d.txns, txId].slice(-100);
  d.adsRemoved = true;
  const fresh = !(item.oneTime && d.purchases[item.id]);
  if (fresh) {
    for (const [cur, amount] of Object.entries(item.grants)) d[cur] += amount;
    if (item.oneTime) d.purchases[item.id] = true;
  }
  Save.save();
  emit('delivered');
  return fresh;
}

// ---------------------------------------------------------------------------
// MOCK (browser)
// ---------------------------------------------------------------------------
const mock = {
  showRewardedAd(placement) {
    if (AUTOPLAY) return Promise.resolve(true);
    return new Promise((resolve) => {
      const el = overlay(`
        <div style="font-size:12px;opacity:.7;margin-bottom:8px">TEST AD · ${placement}</div>
        <div style="font-size:20px;font-weight:bold;margin:18px 0">Your ad here</div>
        <div id="ad-count" style="font-size:40px;font-weight:bold;color:#ffd23f">3</div>
        <div id="ad-actions" style="margin-top:14px">${btn('ad-close', 'Close (no reward)', '#555')}</div>`);
      let n = 3;
      const timer = setInterval(() => {
        n -= 1;
        el.querySelector('#ad-count').textContent = n > 0 ? n : '✓';
        if (n <= 0) {
          clearInterval(timer);
          el.querySelector('#ad-actions').innerHTML = btn('ad-claim', 'Claim reward', '#2e9e5b');
          el.querySelector('#ad-claim').onclick = () => { el.remove(); resolve(true); };
        }
      }, 1000);
      el.querySelector('#ad-close').onclick = () => { clearInterval(timer); el.remove(); resolve(false); };
    });
  },
  showInterstitial: () => Promise.resolve(false), // no ads between levels in the browser
  purchase(productId) {
    const item = STORE.find((s) => s.id === productId);
    return new Promise((resolve) => {
      const el = overlay(`
        <div style="font-size:12px;opacity:.7">TEST PURCHASE – no real money</div>
        <div style="font-size:20px;font-weight:bold;margin:16px 0">${item?.name ?? productId}</div>
        <div style="font-size:24px;color:#ffd23f;margin-bottom:12px">${item?.price ?? ''}</div>
        ${btn('p-buy', 'Buy', '#2e9e5b')}${btn('p-cancel', 'Cancel', '#555')}`);
      el.querySelector('#p-buy').onclick = () => {
        el.remove();
        deliver(productId, `test-${Date.now()}`);
        resolve(true);
      };
      el.querySelector('#p-cancel').onclick = () => { el.remove(); resolve(false); };
    });
  },
  restore: () => Promise.resolve(false),
};

// ---------------------------------------------------------------------------
// NATIVE ADS (AdMob)
// ---------------------------------------------------------------------------
const ads = {
  module: null, // @capacitor-community/admob
  plugin: null, // the AdMob plugin (for the consent forms)
  starting: null,
  AdMob: null, // set once the ads SDK has started
  canRequest: false,
  privacyRequired: false,
  rewarded: { state: 'idle', promise: null }, // idle | loading | ready
  interstitial: { state: 'idle', promise: null },
  showing: null, // the full-screen ad currently open: { kind, earned, closed, resolve }
};

// Consent first (Google's UMP form, shown only where the law requires it, e.g. the EU),
// then the ads SDK starts and pre-loads ads so they open instantly when needed.
async function initAds() {
  const m = await import('@capacitor-community/admob');
  ads.module = m;
  ads.plugin = m.AdMob;
  await consentAndStart(true);
}

// One consent + start sequence at a time: a resume or an ad tap while the consent form is
// open joins it instead of opening a second form.
function consentAndStart(showForm) {
  ads.flow ??= (async () => {
    await updateConsent(showForm);
    await startAds();
  })().finally(() => { ads.flow = null; });
  return ads.flow;
}

async function updateConsent(showForm) {
  const { AdMob, AdmobConsentStatus, PrivacyOptionsRequirementStatus } = ads.module;
  let info;
  try {
    info = await AdMob.requestConsentInfo();
  } catch (e) {
    // Offline etc.: fall back to this app's last answer. On the very first launch there is
    // none, so no ads until consent could be asked (it is asked again on the next ad tap or
    // when the app comes back to the front).
    console.warn('Consent info unavailable', e);
    ads.canRequest = !!Save.data.adConsent;
    ads.privacyRequired = !!Save.data.adPrivacyRequired;
    ads.consentChecked = false; // checked again when the app comes back to the front
    emit('ads');
    return;
  }
  if (showForm && info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
    ads.formOpen = true;
    try {
      info = await AdMob.showConsentForm();
    } catch (e) {
      console.warn('Consent form failed', e); // keep the answer from requestConsentInfo
    } finally {
      ads.formOpen = false;
    }
  }
  ads.canRequest = info.canRequestAds;
  ads.privacyRequired = info.privacyOptionsRequirementStatus === PrivacyOptionsRequirementStatus.REQUIRED;
  ads.consentChecked = true;
  Save.data.adConsent = info.canRequestAds;
  Save.data.adPrivacyRequired = ads.privacyRequired;
  Save.save();
  emit('ads');
}

function startAds() {
  if (!ads.canRequest) return Promise.resolve();
  ads.starting ??= startSdk().catch((e) => {
    ads.starting = null; // try again next time
    throw e;
  });
  return ads.starting;
}

// Catches up on what failed at launch (e.g. offline): asks for consent and starts ads, or,
// if ads already run on a saved answer, re-checks consent quietly (no form).
async function ensureAds() {
  if (!ads.module) return;
  if (!ads.AdMob) await consentAndStart(true);
  else if (!ads.consentChecked) await consentAndStart(false);
}

async function startSdk() {
  const { AdMob, MaxAdContentRating, RewardAdPluginEvents: R, InterstitialAdPluginEvents: I } = ads.module;
  // A game for ages 13+: no ads above "parental guidance" content.
  await AdMob.initialize({ maxAdContentRating: MaxAdContentRating.ParentalGuidance });

  // The reward can arrive just before or just after the ad is closed.
  const close = (kind, failed) => {
    const s = ads.showing;
    if (!s || s.kind !== kind || s.closed) return;
    s.closed = true;
    if (kind === 'interstitial') s.resolve(s.shown && !failed);
    else if (failed || s.earned) s.resolve(s.earned);
    else setTimeout(() => s.resolve(s.earned), 600);
  };
  AdMob.addListener(R.Rewarded, () => {
    const s = ads.showing;
    if (!s || s.kind !== 'rewarded') return;
    s.earned = true;
    if (s.closed) s.resolve(true);
  });
  AdMob.addListener(R.Showed, () => { if (ads.showing?.kind === 'rewarded') ads.showing.shown = true; });
  AdMob.addListener(R.Dismissed, () => close('rewarded'));
  AdMob.addListener(R.FailedToShow, () => close('rewarded', true));
  AdMob.addListener(I.Showed, () => { if (ads.showing?.kind === 'interstitial') ads.showing.shown = true; });
  AdMob.addListener(I.Dismissed, () => close('interstitial'));
  AdMob.addListener(I.FailedToShow, () => close('interstitial', true));

  ads.AdMob = AdMob;
  emit('ads');
  preload('rewarded');
  if (!Save.data.adsRemoved) preload('interstitial');
}

function preload(kind) {
  const slot = ads[kind];
  if (!ads.AdMob || !ads.canRequest) return Promise.resolve(false);
  if (slot.state === 'ready') return Promise.resolve(true);
  if (slot.state === 'loading') return slot.promise;
  slot.state = 'loading';
  const opts = { adId: AD_UNITS[kind], isTesting: TEST_ADS, immersiveMode: true };
  const load = kind === 'rewarded' ? ads.AdMob.prepareRewardVideoAd(opts) : ads.AdMob.prepareInterstitial(opts);
  slot.promise = load.then(
    () => { slot.state = 'ready'; return true; },
    (e) => { slot.state = 'idle'; console.warn(`${kind} ad failed to load`, e); return false; },
  );
  return slot.promise;
}

// Opens a pre-loaded full-screen ad and resolves when it is closed: rewarded ads with
// true only if the reward was earned, interstitials with true only if it was displayed.
function present(kind) {
  ads[kind].state = 'idle';
  // The ad needs a moment to cover the game: block taps until it has closed again.
  const shield = tapShield();
  return new Promise((resolve) => {
    const s = { kind, earned: false, closed: false, shown: false };
    s.resolve = (v) => {
      if (ads.showing !== s) return;
      ads.showing = null;
      shield.remove();
      resolve(v);
      preload(kind); // get the next one ready
    };
    ads.showing = s;
    const show = kind === 'rewarded'
      ? ads.AdMob.showRewardVideoAd({ adId: AD_UNITS[kind] }) // resolves only when rewarded
      : ads.AdMob.showInterstitial({ adId: AD_UNITS[kind] });
    show.catch(() => { s.closed = true; s.resolve(false); });
    // An ad that never manages to open must not block the game (the wait is paused while
    // the app is in the background).
    const giveUp = () => {
      if (s.shown || s.closed) return;
      if (document.hidden) setTimeout(giveUp, 2000);
      else s.resolve(false);
    };
    setTimeout(giveUp, 8000);
  });
}

function loadingOverlay() {
  return overlay('<div style="font-size:18px;font-weight:bold">Loading ad...</div>');
}

const native = {
  async showRewardedAd() {
    if (ads.rewarded.state !== 'ready') {
      // Covers the game (no taps) while ads start / an ad loads.
      const wait = loadingOverlay();
      try {
        if (!ads.AdMob) await Promise.race([adsReady, sleep(6000)]);
        if (!ads.AdMob) {
          const flow = ensureAds().catch(() => {});
          await Promise.race([flow, sleep(15000)]);
          if (ads.formOpen) await flow; // the player is still answering the consent form
        }
        await Promise.race([preload('rewarded'), sleep(8000, false)]);
      } finally {
        wait.remove();
      }
      if (ads.rewarded.state !== 'ready') {
        notice('No ad available right now. Try again later.');
        return false;
      }
    }
    const earned = await present('rewarded');
    if (earned) lastRewardedAt = Date.now();
    return earned;
  },
  // Only shown if one is already loaded: the player is never kept waiting for it.
  // Resolves true only if the ad was really displayed.
  async showInterstitial() {
    if (ads.interstitial.state !== 'ready') {
      preload('interstitial');
      return false;
    }
    return present('interstitial');
  },
  purchase: (id) => billingPurchase(id),
  restore: () => billingRestore(),
};
let lastRewardedAt = 0;

// ---------------------------------------------------------------------------
// NATIVE PAYMENTS (Google Play Billing through CdvPurchase)
// ---------------------------------------------------------------------------
let C = null; // window.CdvPurchase, once the store is ready
const waiting = new Map(); // productId -> resolve(true) when that purchase is delivered

async function initBilling() {
  // Cordova plugins appear on window after 'deviceready'.
  for (let i = 0; i < 100 && !window.CdvPurchase; i++) await sleep(100);
  const P = window.CdvPurchase;
  if (!P) throw new Error('CdvPurchase not available');
  const { store, ProductType, Platform, LogLevel } = P;
  store.verbosity = LogLevel.WARNING;
  store.register(STORE.map((s) => ({
    id: s.id,
    type: s.oneTime ? ProductType.NON_CONSUMABLE : ProductType.CONSUMABLE,
    platform: Platform.GOOGLE_PLAY,
  })));
  store.when()
    .productUpdated(() => emit('prices'))
    .approved((tx) => {
      // Paid: give the items (once), then tell Google Play it was delivered.
      // Consumable packs are consumed by finish(), so they can be bought again.
      for (const p of tx.products) {
        if (deliver(p.id, tx.transactionId) && !waiting.has(p.id)) notice('Purchase complete! Your items were added.');
        waiting.get(p.id)?.(true);
      }
      tx.finish();
    })
    .receiptUpdated(() => syncOwned());
  await store.initialize([Platform.GOOGLE_PLAY]);
  C = P;
  syncOwned();
  emit('prices');
}

// One-time packs bought earlier (e.g. before reinstalling the app) come back. A purchase
// not yet acknowledged is new: the 'approved' handler delivers it.
function syncOwned() {
  if (!window.CdvPurchase) return false;
  const { store, Platform } = window.CdvPurchase;
  let restored = false;
  for (const item of STORE) {
    if (!item.oneTime || Save.data.purchases[item.id] || waiting.has(item.id) || !store.owned(item.id)) continue;
    const product = store.get(item.id, Platform.GOOGLE_PLAY);
    if (product && store.findInLocalReceipts(product)?.isAcknowledged === false) continue;
    deliver(item.id, null);
    restored = true;
  }
  if (restored) notice('Your purchases were restored.');
  return restored;
}

async function billingPurchase(productId) {
  if (!C) await Promise.race([billingReady, sleep(5000)]);
  await refreshing; // the plugin handles one Google Play call at a time
  const offer = C?.store.get(productId, C.Platform.GOOGLE_PLAY)?.getOffer();
  if (!offer) {
    notice('The store is not available right now. Check your connection and try again.');
    return false;
  }
  const delivered = new Promise((r) => waiting.set(productId, r));
  try {
    // Normally Google Play answers when its purchase sheet closes; never wait forever.
    const err = await Promise.race([offer.order(), sleep(180000, { timeout: true })]);
    if (err?.timeout) {
      notice('Google Play is not responding. If you paid, your items will be added automatically.', 4000);
      return false;
    }
    if (err) {
      if (err.code !== C.ErrorCode.PAYMENT_CANCELLED) notice(`Purchase failed: ${err.message}`);
      return false;
    }
    // Paid: wait for Google Play to confirm it (the 'approved' event above).
    const ok = await Promise.race([delivered, sleep(20000, false)]);
    if (!ok) notice('Payment pending. Your items will be added as soon as Google Play confirms it.', 4000);
    return ok;
  } finally {
    waiting.delete(productId);
  }
}

async function billingRestore() {
  if (!C) await Promise.race([billingReady, sleep(5000)]);
  if (!C) {
    notice('The store is not available right now.');
    return false;
  }
  await refreshing;
  // Google Play answers with an error object (not an exception) when it can't be reached.
  const err = await Promise.race([C.store.restorePurchases(), sleep(15000, { timeout: true })]);
  if (err) {
    notice('Google Play could not be reached. Try again later.');
    return false;
  }
  if (!syncOwned()) notice('Nothing to restore.');
  return true;
}

let lastResumeAt = 0;
let refreshing = null; // the purchase check started when the app came back to the front
let adsReady = Promise.resolve();
let billingReady = Promise.resolve();

// ---------------------------------------------------------------------------
// public API
// ---------------------------------------------------------------------------

// Only one ad / purchase flow can be open at a time. Any other request while one is open
// (a double tap, or another ad button) gets false straight away; it never shares the open
// flow's result, so a reward can't be given twice or without its own ad.
let pending = null;
const once = (fn) => {
  if (pending) return Promise.resolve(false);
  pending = fn().finally(() => { pending = null; });
  return pending;
};

const impl = () => (isNative() ? native : mock);

export const Monetization = {
  /** Called once at start-up (Android only): consent, ads and the store. */
  init() {
    if (!isNative()) return;
    adsReady = initAds().catch((e) => console.warn('Ads unavailable', e));
    billingReady = initBilling().catch((e) => console.warn('Store unavailable', e));
  },
  /** Shows a rewarded ad. Resolves true only if the player watched it to the end. */
  showRewardedAd(placement = 'reward') {
    return once(() => impl().showRewardedAd(placement));
  },
  /** Starts a purchase of a STORE product id. Resolves true once its items were added. */
  purchase(productId) {
    return once(() => impl().purchase(productId));
  },
  /** Brings back one-time packs bought before (e.g. on a new phone). */
  restorePurchases() {
    return once(() => impl().restore());
  },
  /** True while an ad or purchase screen is open. */
  busy: () => !!pending,
  /**
   * The price to show: in the app the localised price from Google Play (null until it has
   * loaded, e.g. offline), in the browser the test price from store.js.
   */
  price(item) {
    if (!isNative()) return item.price;
    return C?.store.get(item.id, C.Platform.GOOGLE_PLAY)?.pricing?.price ?? null;
  },
  /**
   * Called when the app comes back to the front (at most once a minute): asks Google Play
   * again for purchases, so a payment that was still pending, or was finished outside the
   * app, is delivered right away; and starts ads if that failed at launch.
   */
  onResume() {
    if (!isNative() || pending || Date.now() - lastResumeAt < 60_000) return;
    lastResumeAt = Date.now();
    if (C) {
      refreshing = Promise.race([C.store.restorePurchases(), sleep(5000)])
        .catch(() => {})
        .finally(() => { refreshing = null; });
    }
    ensureAds().catch(() => {});
  },
  /** Count a finished level (win or lose) towards the next between-levels ad. */
  levelFinished() {
    Save.data.inter.since += 1;
    Save.save();
  },
  /**
   * Called when the player leaves the result screen. Every 2nd or 3rd finished level it
   * shows a skippable interstitial ad, unless the player bought anything, has just
   * watched a rewarded ad, or no ad is loaded. Resolves when the game can continue.
   */
  async betweenLevels() {
    const inter = Save.data.inter;
    if (!isNative() || Save.data.adsRemoved || pending || inter.since < inter.every) return;
    if (Date.now() - lastRewardedAt < INTERSTITIAL.skipAfterRewardedMs) return;
    if (!(await once(() => impl().showInterstitial()))) return;
    const { everyMin: a, everyMax: b } = INTERSTITIAL;
    Save.data.inter = { since: 0, every: a + Math.floor(Math.random() * (b - a + 1)) };
    Save.save();
  },
  /** EU players must be able to change their ad consent: show a button when needed. */
  privacyOptionsRequired: () => ads.privacyRequired,
  async showPrivacyOptions() {
    if (!ads.plugin) return;
    try {
      await ads.flow; // never on top of the consent form
      await ads.plugin.showPrivacyOptionsForm();
      await consentAndStart(false);
    } catch (e) {
      console.warn('Privacy options unavailable', e);
    }
  },
  /** Listen for 'prices' / 'delivered' / 'ads'. Returns a function that stops listening. */
  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
