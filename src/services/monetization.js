import { AUTOPLAY } from '../config.js';
import { STORE } from '../data/store.js';

// One interface for rewarded ads and in-app purchases.
//
// - In the browser (and while developing) a MOCK is used: a fake 3-second ad and a
//   confirmation dialog instead of payment. No real money is ever involved.
// - In the Android app (Capacitor), replace `native` below with real calls to:
//     * Google AdMob rewarded ads   -> @capacitor-community/admob
//     * Google Play Billing          -> cordova-plugin-purchase (CdvPurchase)
//   The rest of the game only calls Monetization.showRewardedAd() / purchase(), so
//   nothing else needs to change.

const isNative = () => !!window.Capacitor?.isNativePlatform?.();

function overlay(html) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);font-family:"Courier New",monospace;color:#fff;';
  el.innerHTML = `<div style="width:min(86vw,340px);background:#24101b;border:4px solid #000;box-shadow:0 0 0 4px #ff7aa8;padding:20px;text-align:center">${html}</div>`;
  document.body.appendChild(el);
  return el;
}

const btn = (id, label, bg) => `<button id="${id}" style="font:bold 16px 'Courier New',monospace;color:#fff;background:${bg};border:3px solid #000;padding:10px 14px;margin:6px;cursor:pointer">${label}</button>`;

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
  purchase(productId) {
    const item = STORE.find((s) => s.id === productId);
    return new Promise((resolve) => {
      const el = overlay(`
        <div style="font-size:12px;opacity:.7">TEST PURCHASE – no real money</div>
        <div style="font-size:20px;font-weight:bold;margin:16px 0">${item?.name ?? productId}</div>
        <div style="font-size:24px;color:#ffd23f;margin-bottom:12px">${item?.price ?? ''}</div>
        ${btn('p-buy', 'Buy', '#2e9e5b')}${btn('p-cancel', 'Cancel', '#555')}`);
      el.querySelector('#p-buy').onclick = () => { el.remove(); resolve(true); };
      el.querySelector('#p-cancel').onclick = () => { el.remove(); resolve(false); };
    });
  },
};

// Placeholder for the Android implementation (Phase 6). Falls back to the mock until wired up.
const native = {
  showRewardedAd: (placement) => mock.showRewardedAd(placement),
  purchase: (id) => mock.purchase(id),
};

// Only one ad / purchase flow can be open at a time (guards against double taps).
let pending = null;
const once = (fn) => {
  if (!pending) pending = fn().finally(() => { pending = null; });
  return pending;
};

export const Monetization = {
  /** Shows a rewarded ad. Resolves true only if the player watched it to the end. */
  showRewardedAd(placement = 'reward') {
    return once(() => (isNative() ? native : mock).showRewardedAd(placement));
  },
  /** Starts a purchase of a STORE product id. Resolves true if paid. */
  purchase(productId) {
    return once(() => (isNative() ? native : mock).purchase(productId));
  },
};
