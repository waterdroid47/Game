import { Monetization, isNative } from './monetization.js';

// Android-only setup: ads + store, full screen, and the system Back button.
export async function initNative(game) {
  if (!isNative()) return;
  Monetization.init();

  const [{ App }, { StatusBar }] = await Promise.all([import('@capacitor/app'), import('@capacitor/status-bar')]);
  StatusBar.hide().catch(() => {});

  // Back in the app: deliver purchases completed meanwhile (pending payments), retry ads.
  App.addListener('resume', () => Monetization.onResume());

  // Back: pauses a run, closes the pause menu, goes back from menu screens to the main
  // menu, and leaves the app from the main menu.
  App.addListener('backButton', () => {
    if (Monetization.busy()) return; // an ad or purchase screen is open
    const top = game.scene.getScenes(true, true)[0]; // the scene in front
    switch (top?.scene.key) {
      case 'Menu': App.exitApp(); break;
      case 'Game': top.pauseGame(); break; // nothing on the death menu: revive or give up
      case 'Pause': top.resumeGame(); break;
      case 'Result': top.leave('Menu'); break;
      case 'LevelUp': case 'Boot': case undefined: break; // a card must be picked
      default: top.scene.start('Menu'); // LevelSelect, Shop, Store
    }
  });
}
