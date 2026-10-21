import Phaser from 'phaser';
import { createTextures } from '../art/pixelSprites.js';
import { DEBUG, START_LEVEL, START_MODE } from '../config.js';
import { ALL_LEVELS, LEVELS } from '../data/levels.js';
import { Save } from '../systems/SaveSystem.js';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createTextures(this, ALL_LEVELS);
    Save.fixProgress(LEVELS.length);
    if (DEBUG) {
      Save.data.unlocked = LEVELS.length;
      Save.data.nightmare = { ...Save.data.nightmare, owned: true, unlocked: LEVELS.length };
      Save.data.coins = Math.max(Save.data.coins, 50000);
      Save.data.gems = Math.max(Save.data.gems, 1000);
      Save.save();
    }
    if (START_LEVEL || START_MODE === 'nightmare') this.scene.start('Game', { level: START_LEVEL || 1, mode: START_MODE });
    else this.scene.start('Menu');
  }
}
