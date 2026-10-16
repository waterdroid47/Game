import Phaser from 'phaser';
import { W, H } from '../config.js';
import { STORE } from '../data/store.js';
import { Monetization } from '../services/monetization.js';
import { Save } from '../systems/SaveSystem.js';
import { sfx } from '../systems/Audio.js';
import { backButton, button, currencyBar, panel, text } from '../ui/widgets.js';

export default class Store extends Phaser.Scene {
  constructor() {
    super('Store');
  }

  create() {
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);
    const refresh = currencyBar(this, Save);
    backButton(this);
    text(this, W / 2, 66, 'STORE', 26, '#ff9be6');
    text(this, W / 2, 90, 'Gems buy the strongest upgrades', 10, '#c090a8');

    STORE.forEach((item, i) => {
      const y = 150 + i * 82;
      const owned = item.oneTime && Save.data.purchases[item.id];
      panel(this, 14, y - 34, W - 28, 68, 0x2a1220, item.tag === 'BEST VALUE' ? 0xffd23f : 0x9b2c8c);
      text(this, 30, y - 16, item.name, 15, '#ffffff', 0, 0.5);
      let gx = 30;
      for (const [cur, amount] of Object.entries(item.grants)) {
        this.add.image(gx + 6, y + 12, cur === 'gems' ? 'gem' : 'coin').setScale(2.2);
        const t = text(this, gx + 18, y + 12, String(amount), 14, cur === 'gems' ? '#ff9be6' : '#ffd23f', 0, 0.5);
        gx += 36 + t.width;
      }
      if (item.tag) text(this, 200, y - 16, item.tag, 10, '#ffd23f');
      const b = button(this, 284, y, 100, 42, owned ? 'OWNED' : item.price, async () => {
        if (!(await Monetization.purchase(item.id))) return;
        for (const [cur, amount] of Object.entries(item.grants)) Save.add(cur, amount);
        if (item.oneTime) {
          Save.data.purchases[item.id] = true;
          Save.save();
          b.setLabel('OWNED').setEnabled(false);
        }
        sfx.chest();
        refresh();
      }, { color: 0x2e9e5b, disabled: !!owned, size: 15 });
    });

    text(this, W / 2, H - 28, 'Test mode: no real payments. In the Android app\npurchases go through Google Play.', 9, '#9a7080');
  }
}
