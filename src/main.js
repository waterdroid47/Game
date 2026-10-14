import Phaser from 'phaser';
import { W, H } from './config.js';
import Boot from './scenes/Boot.js';
import Menu from './scenes/Menu.js';
import LevelSelect from './scenes/LevelSelect.js';
import Shop from './scenes/Shop.js';
import Store from './scenes/Store.js';
import Game from './scenes/Game.js';
import LevelUp from './scenes/LevelUp.js';
import Pause from './scenes/Pause.js';
import Result from './scenes/Result.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#12060d',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { activePointers: 2 },
  scene: [Boot, Menu, LevelSelect, Shop, Store, Game, LevelUp, Pause, Result],
});

// Exposed for automated tests.
window.__game = game;

if (import.meta.env.PROD && 'serviceWorker' in navigator && !window.Capacitor) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
