import Phaser from 'phaser';
import { createTextures } from '../art/pixelSprites.js';
import { DEBUG, START_LEVEL } from '../config.js';
import { Save } from '../systems/SaveSystem.js';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createTextures(this);
    if (DEBUG) {
      Save.data.unlocked = 10;
      Save.data.coins = Math.max(Save.data.coins, 50000);
      Save.data.dna = Math.max(Save.data.dna, 1000);
      Save.save();
    }
    if (START_LEVEL) this.scene.start('Game', { level: START_LEVEL });
    else this.scene.start('Menu');
  }
}
