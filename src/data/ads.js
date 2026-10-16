// Google AdMob ad units used by the Android app (the browser version shows a fake test ad).
//
// These are Google's official TEST ids: they always show "Test Ad" and never earn money.
// Before publishing, replace them with the ids of your own ad units
// (admob.google.com → Apps → Pixel Guard → Ad units), and also replace the
// app id in android/app/src/main/res/values/strings.xml (admob_app_id).
export const AD_UNITS = {
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
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
