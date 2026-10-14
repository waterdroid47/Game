import Phaser from 'phaser';
import { W, H } from '../config.js';
import { SHOP } from '../data/shop.js';
import { Save } from '../systems/SaveSystem.js';
import { sfx } from '../systems/Audio.js';
import { backButton, button, currencyBar, panel, text } from '../ui/widgets.js';

export default class Shop extends Phaser.Scene {
  constructor() {
    super('Shop');
  }

  create() {
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);
    const refresh = currencyBar(this, Save);
    backButton(this);
    text(this, W / 2, 62, 'UPGRADES', 24, '#7dff7a');
    text(this, W / 2, 84, 'permanent – kept between runs', 10, '#c090a8');

    const rows = [];
    SHOP.forEach((item, i) => {
      const y = 126 + i * 57;
      panel(this, 10, y - 25, W - 20, 50, 0x2a1220, item.currency === 'dna' ? 0x9b2c8c : 0x6b2b4a);
      this.add.image(32, y, item.icon).setScale(3).setTint(item.color);
      text(this, 54, y - 13, item.name, 13, '#ffffff', 0, 0.5);
      text(this, 54, y + 3, item.desc, 10, '#d0a0b8', 0, 0.5);
      const pips = this.add.graphics();
      const b = button(this, 296, y, 98, 36, '', () => {
        const lvl = Save.level(item.id);
        if (lvl >= item.max) return;
        if (!Save.spend(item.currency, item.cost(lvl))) return;
        Save.data.upgrades[item.id] = lvl + 1;
        Save.save();
        sfx.levelUp();
        update();
      }, { size: 13, icon: item.currency === 'dna' ? 'dna' : 'coin', iconScale: item.currency === 'dna' ? 1.8 : 2.2 });
      rows.push({ item, b, pips, y });
    });

    const update = () => {
      refresh();
      for (const { item, b, pips, y } of rows) {
        const lvl = Save.level(item.id);
        pips.clear();
        const n = item.max;
        for (let p = 0; p < n; p++) {
          pips.fillStyle(p < lvl ? 0x7dff7a : 0x4a2a3a, 1).fillRect(54 + p * 12, y + 14, 10, 4);
        }
        if (lvl >= item.max) {
          b.setLabel('MAX').setEnabled(false);
        } else {
          const cost = item.cost(lvl);
          b.setLabel(String(cost)).setEnabled(Save.data[item.currency] >= cost);
        }
      }
    };
    update();
  }
}
