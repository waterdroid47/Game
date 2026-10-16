import Phaser from 'phaser';
import { W, H } from '../config.js';
import { STORE } from '../data/store.js';
import { Monetization, isNative } from '../services/monetization.js';
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

    const buttons = STORE.map((item, i) => {
      const y = 150 + i * 82;
      panel(this, 14, y - 34, W - 28, 68, 0x2a1220, item.tag === 'BEST VALUE' ? 0xffd23f : 0x9b2c8c);
      text(this, 30, y - 16, item.name, 15, '#ffffff', 0, 0.5);
      let gx = 30;
      for (const [cur, amount] of Object.entries(item.grants)) {
        this.add.image(gx + 6, y + 12, cur === 'gems' ? 'gem' : 'coin').setScale(2.2);
        const t = text(this, gx + 18, y + 12, String(amount), 14, cur === 'gems' ? '#ff9be6' : '#ffd23f', 0, 0.5);
        gx += 36 + t.width;
      }
      if (item.tag) text(this, 200, y - 16, item.tag, 10, '#ffd23f');
      // The items are added by Monetization (once Google Play confirms the payment).
      return button(this, 284, y, 100, 42, '', async () => {
        if (await Monetization.purchase(item.id)) sfx.chest();
      }, { color: 0x2e9e5b, size: 15 });
    });

    // Prices arrive from Google Play a moment after start-up, and a purchase can be
    // confirmed later (pending payments), so redraw whenever something changes.
    const update = () => {
      STORE.forEach((item, i) => {
        const owned = item.oneTime && Save.data.purchases[item.id];
        // Price is null until Google Play answers; a tap then explains that it isn't available.
        const price = Monetization.price(item);
        const label = owned ? 'OWNED' : price ?? '...';
        buttons[i].setLabel(label).setEnabled(!owned);
        buttons[i].label.setFontSize(label.length > 8 ? 12 : 15); // long local prices, e.g. 9,99 lei
      });
      refresh();
    };
    update();
    const off = Monetization.onChange(update);
    this.events.once('shutdown', off);

    text(this, W / 2, 542, 'Any purchase also removes the ads\nbetween levels on this phone', 10, '#c090a8');
    if (isNative()) {
      button(this, W / 2, 584, 200, 34, 'RESTORE PURCHASES', () => Monetization.restorePurchases(), { color: 0x444466, size: 12 });
    } else {
      text(this, W / 2, H - 28, 'Test mode: no real payments. In the Android app\npurchases go through Google Play.', 9, '#9a7080');
    }
  }
}
