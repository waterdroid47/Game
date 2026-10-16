// Real-money packs. The ids are the Google Play product ids (create them with exactly
// these ids in Play Console). Prices here are only the fallback shown in the browser:
// in the Android app the real, localised price comes from Google Play.
export const STORE = [
  { id: 'starter_pack', name: 'Starter Pack', price: '€1.99', grants: { coins: 2000, gems: 100 }, oneTime: true, tag: 'BEST VALUE' },
  { id: 'gems_small', name: 'Pouch of Gems', price: '€0.99', grants: { gems: 60 } },
  { id: 'gems_medium', name: 'Bag of Gems', price: '€4.99', grants: { gems: 350 }, tag: '+15%' },
  { id: 'gems_large', name: 'Chest of Gems', price: '€9.99', grants: { gems: 800 }, tag: '+30%' },
  { id: 'coins_sack', name: 'Sack of Coins', price: '€2.99', grants: { coins: 6000 } },
];

// Free gems for watching a rewarded ad from the menu.
export const AD_GEMS = { amount: 5, dailyLimit: 5 };
