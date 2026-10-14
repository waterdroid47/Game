// Real-money packs. Prices are display placeholders: on Android the real price and
// payment come from Google Play Billing (see services/monetization.js).
export const STORE = [
  { id: 'starter_pack', name: 'Starter Pack', price: '€1.99', grants: { coins: 2000, dna: 100 }, oneTime: true, tag: 'BEST VALUE' },
  { id: 'dna_small', name: 'Pinch of DNA', price: '€0.99', grants: { dna: 60 } },
  { id: 'dna_medium', name: 'Vial of DNA', price: '€4.99', grants: { dna: 350 }, tag: '+15%' },
  { id: 'dna_large', name: 'Lab of DNA', price: '€9.99', grants: { dna: 800 }, tag: '+30%' },
  { id: 'coins_sack', name: 'Sack of Coins', price: '€2.99', grants: { coins: 6000 } },
];

// Free DNA for watching a rewarded ad from the menu.
export const AD_DNA = { amount: 5, dailyLimit: 5 };
