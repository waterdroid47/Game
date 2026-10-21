import Phaser from 'phaser';
import { W, H } from '../config.js';
import { AD_GEMS } from '../data/store.js';
import { animate } from '../art/pixelSprites.js';
import { Monetization } from '../services/monetization.js';
import { Save } from '../systems/SaveSystem.js';
import { sfx } from '../systems/Audio.js';
import { button, currencyBar, text } from '../ui/widgets.js';

export default class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0).setScale(1);
    this.bgScroll = this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0).setAlpha(0.5);

    // Monsters drifting by in the background.
    const kinds = ['slime', 'bat', 'golem', 'ghost', 'skeleton', 'bigslime'];
    this.drifters = [];
    for (let i = 0; i < 8; i++) {
      const s = animate(this.add.sprite(Phaser.Math.Between(20, W - 20), Phaser.Math.Between(0, H), kinds[i % kinds.length]).setScale(2).setAlpha(0.35));
      s.vy = Phaser.Math.Between(10, 30);
      this.drifters.push(s);
    }

    const refresh = currencyBar(this, Save);

    text(this, W / 2, 120, 'PIXEL', 52, '#29adff');
    text(this, W / 2, 170, 'GUARD', 52, '#ffec27');
    text(this, W / 2, 210, 'defend the gate, one wave at a time', 11, '#c2c3c7');

    const guard = animate(this.add.sprite(W / 2, 270, 'guard').setScale(4));
    this.tweens.add({ targets: guard, y: 262, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Fresh data: the level select opens on the page with the newest unlocked level.
    button(this, W / 2, 350, 220, 54, 'PLAY', () => this.scene.start('LevelSelect', {}), { size: 24 });
    // New levels unlocked but not seen yet.
    if (Save.data.unlocked > 10 && !Save.data.flags.seenLairs) {
      const badge = text(this, W / 2 + 92, 330, 'NEW!', 13, '#ffec27').setAngle(12);
      this.tweens.add({ targets: badge, scale: 1.2, duration: 400, yoyo: true, repeat: -1 });
    }
    button(this, W / 2, 418, 220, 44, 'UPGRADES', () => this.scene.start('Shop'), { color: 0x2b6cb0 });
    button(this, W / 2, 474, 220, 44, 'STORE', () => this.scene.start('Store'), { color: 0x9b2c8c });

    const adBtn = button(this, W / 2, 530, 220, 40, '', async () => {
      if (Save.adsToday() >= AD_GEMS.dailyLimit) return;
      if (await Monetization.showRewardedAd('menu_gems')) {
        Save.adsToday();
        Save.data.ads.count += 1;
        Save.add('gems', AD_GEMS.amount);
        sfx.coin();
        refresh();
        updateAd();
      }
    }, { color: 0x8a6d00, size: 13, icon: 'gem' });
    const updateAd = () => {
      const left = AD_GEMS.dailyLimit - Save.adsToday();
      adBtn.setLabel(left > 0 ? `AD: +${AD_GEMS.amount} GEMS (${left} left)` : 'Come back tomorrow');
      adBtn.setEnabled(left > 0);
    };
    updateAd();

    const sound = button(this, 60, H - 30, 96, 30, '', () => {
      Save.data.settings.sound = !Save.data.settings.sound;
      Save.save();
      sound.setLabel(`SOUND ${Save.data.settings.sound ? 'ON' : 'OFF'}`);
    }, { size: 12, color: 0x444466 });
    sound.setLabel(`SOUND ${Save.data.settings.sound ? 'ON' : 'OFF'}`);

    let resetArmed = false;
    const reset = button(this, W - 60, H - 30, 96, 30, 'RESET', () => {
      if (!resetArmed) {
        resetArmed = true;
        reset.setLabel('SURE?');
        this.time.delayedCall(2500, () => { resetArmed = false; reset.setLabel('RESET'); });
        return;
      }
      Save.reset();
      this.scene.restart();
    }, { size: 12, color: 0x663333 });

    text(this, W / 2, H - 9, `v${__APP_VERSION__}`, 9, '#7a5060');

    // Players in the EU can change their ad consent at any time (Android app only).
    let privacy = null;
    const updatePrivacy = () => {
      if (privacy || !Monetization.privacyOptionsRequired()) return;
      privacy = button(this, W / 2, H - 30, 96, 30, 'PRIVACY', () => Monetization.showPrivacyOptions(), { size: 12, color: 0x444466 });
    };
    updatePrivacy();
    this.events.once('shutdown', Monetization.onChange(updatePrivacy));
  }

  update(_t, delta) {
    this.bgScroll.tilePositionY -= delta * 0.01;
    for (const s of this.drifters) {
      s.y += (s.vy * delta) / 1000;
      if (s.y > H + 20) { s.y = -20; s.x = Phaser.Math.Between(20, W - 20); }
    }
  }
}
