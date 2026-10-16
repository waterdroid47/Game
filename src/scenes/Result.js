import Phaser from 'phaser';
import { W, H } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { Monetization } from '../services/monetization.js';
import { Save } from '../systems/SaveSystem.js';
import { sfx } from '../systems/Audio.js';
import { button, currencyBar, panel, text } from '../ui/widgets.js';

export default class Result extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(r) {
    // Save rewards and progress.
    const d = Save.data;
    d.coins += r.coins;
    d.gems += r.gems;
    d.stats.runs += 1;
    d.stats.kills += r.kills;
    d.bestWave[r.level] = Math.max(d.bestWave[r.level] || 0, r.wave);
    if (r.victory) {
      d.unlocked = Math.max(d.unlocked, Math.min(LEVELS.length, r.level + 1));
      d.stars[r.level] = Math.max(d.stars[r.level] || 0, r.stars);
    }
    Save.save();

    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);
    const refresh = currencyBar(this, Save);
    const lvl = LEVELS[r.level - 1];
    text(this, W / 2, 92, r.victory ? 'VICTORY!' : 'DEFEATED', 40, r.victory ? '#7dff7a' : '#ff4d6d');
    text(this, W / 2, 132, `Level ${lvl.n} · ${lvl.name}`, 14, '#ffb0cc');

    if (r.victory) {
      for (let s = 0; s < 3; s++) {
        const st = this.add.image(W / 2 - 50 + s * 50, 180, s < r.stars ? 'star' : 'starEmpty').setScale(0);
        this.tweens.add({ targets: st, scale: 5, delay: 200 + s * 200, duration: 300, ease: 'Back.out' });
      }
    }

    panel(this, 40, 220, W - 80, 150);
    text(this, 60, 245, 'Wave reached', 14, '#e0c8d4', 0);
    text(this, W - 60, 245, `${r.wave}/${r.waves}`, 14, '#ffffff', 1);
    text(this, 60, 275, 'Enemies killed', 14, '#e0c8d4', 0);
    text(this, W - 60, 275, String(r.kills), 14, '#ffffff', 1);
    text(this, 60, 305, 'Coins earned', 14, '#e0c8d4', 0);
    const coinsT = text(this, W - 60, 305, String(r.coins), 14, '#ffd23f', 1);
    text(this, 60, 335, 'Gems earned', 14, '#e0c8d4', 0);
    text(this, W - 60, 335, String(r.gems), 14, '#ff9be6', 1);

    if (r.coins > 0) {
      const dbl = button(this, W / 2, 410, 250, 48, 'x2 COINS  (watch ad)', async () => {
        if (!(await Monetization.showRewardedAd('double_coins'))) return;
        Save.add('coins', r.coins);
        coinsT.setText(String(r.coins * 2));
        dbl.setEnabled(false).setLabel('DOUBLED!');
        sfx.coin();
        refresh();
      }, { color: 0x8a6d00, size: 16, armAfter: 600 });
    }

    const hasNext = r.victory && r.level < LEVELS.length;
    button(this, W / 2, 480, 220, 50, hasNext ? 'NEXT LEVEL' : 'RETRY', () => {
      this.scene.start('Game', { level: hasNext ? r.level + 1 : r.level });
    }, { size: 20, armAfter: 600 });
    button(this, W / 2 - 60, 548, 110, 40, 'UPGRADES', () => this.scene.start('Shop'), { color: 0x2b6cb0, size: 13, armAfter: 600 });
    button(this, W / 2 + 60, 548, 110, 40, 'MENU', () => this.scene.start('Menu'), { color: 0x6b2b4a, size: 13, armAfter: 600 });
  }
}
