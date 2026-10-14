import Phaser from 'phaser';
import { W, H } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { Save } from '../systems/SaveSystem.js';
import { backButton, button, currencyBar, text } from '../ui/widgets.js';

export default class LevelSelect extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create() {
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);
    currencyBar(this, Save);
    backButton(this);
    text(this, W / 2, 72, 'CHOOSE LEVEL', 26, '#7dff7a');

    LEVELS.forEach((lvl, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 95 + col * 170;
      const y = 140 + row * 100;
      const locked = lvl.n > Save.data.unlocked;
      const b = button(this, x, y, 150, 70, '', () => this.scene.start('Game', { level: lvl.n }), {
        disabled: locked,
        color: parseInt(lvl.bg[2].slice(1), 16), // each level's own colour
      });
      if (locked) {
        b.add(this.add.image(0, -4, 'lock').setScale(3));
        b.add(text(this, 0, 22, lvl.name, 10, '#777777'));
        return;
      }
      b.add(text(this, 0, -20, String(lvl.n), 20, '#ffffff'));
      b.add(text(this, 0, 0, lvl.name, 11, '#ffb0cc'));
      const stars = Save.data.stars[lvl.n] || 0;
      for (let s = 0; s < 3; s++) b.add(this.add.image(-18 + s * 18, 22, s < stars ? 'star' : 'starEmpty').setScale(2));
    });
  }
}
