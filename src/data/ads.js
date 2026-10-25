// Google AdMob ad units used by the Android app (the browser version shows a fake test ad).
//
// These are the real ad units of the Pixel Guard app in AdMob (admob.google.com → Apps →
// Pixel Guard → Ad units); the app id is in android/app/src/main/res/values/strings.xml
// (admob_app_id). To test on your own phone, add it in AdMob → Settings → Test devices:
// it then gets test ads, and tapping them is safe.
export const AD_UNITS = {
  rewarded: 'ca-app-pub-8257165312390194/6039203777',
  interstitial: 'ca-app-pub-8257165312390194/7819189305',
};

// True while the test ids above are in use.
export const TEST_ADS = Object.values(AD_UNITS).some((id) => id.startsWith('ca-app-pub-3940256099942544/'));

// A skippable full-screen ad between levels, after every 2nd or 3rd finished level
// (never in the browser, and never for players who bought anything in the store).
export const INTERSTITIAL = {
  everyMin: 2,
  everyMax: 3,
  // Skip it if the player has just watched a rewarded ad (e.g. x2 coins).
  skipAfterRewardedMs: 60_000,
};
