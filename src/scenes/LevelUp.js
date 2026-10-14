import Phaser from 'phaser';
import { AUTOPLAY, W, H } from '../config.js';
import { rollCards } from '../data/upgrades.js';
import { Monetization } from '../services/monetization.js';
import { button, text } from '../ui/widgets.js';

// Overlay shown on level-up or when catching a bonus chest: pick 1 of 3 (or 4) cards.
export default class LevelUp extends Phaser.Scene {
  constructor() {
    super('LevelUp');
  }

  create(data) {
    this.game_ = this.scene.get('Game');
    this.chosen = false;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.72).setOrigin(0).setInteractive();
    const chest = data.source === 'chest';
    const title = text(this, W / 2, 92, chest ? 'BONUS CHEST!' : 'LEVEL UP!', 32, chest ? '#ffd23f' : '#7dff7a');
    this.tweens.add({ targets: title, scale: { from: 0.5, to: 1 }, duration: 300, ease: 'Back.out' });
    text(this, W / 2, 128, 'Choose an upgrade', 13, '#e0c0d0');
    this.cards = this.add.container(0, 0);
    this.renderCards(data.picks);

    const reroll = button(this, W / 2, H - 56, 230, 42, 'REROLL  (watch ad)', async () => {
      if (!(await Monetization.showRewardedAd('reroll'))) return;
      reroll.setEnabled(false).setLabel('REROLLED');
      this.renderCards(rollCards(this.game_, data.picks.length));
    }, { color: 0x8a6d00, size: 14 });

    if (AUTOPLAY) this.time.delayedCall(150, () => this.choose(this.picks[0]));
  }

  renderCards(picks) {
    this.picks = picks;
    this.cards.removeAll(true);
    const n = picks.length;
    const ch = n >= 4 ? 88 : 104;
    const gap = 12;
    const top = 330 - (n * ch + (n - 1) * gap) / 2;
    picks.forEach((p, i) => {
      const y = top + i * (ch + gap) + ch / 2;
      const c = this.add.container(W / 2, y);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 1).fillRect(-164, -ch / 2 - 4, 328, ch + 8);
      g.fillStyle(p.color, 1).fillRect(-162, -ch / 2 - 2, 324, ch + 4);
      g.fillStyle(0x2a1220, 1).fillRect(-156, -ch / 2 + 2, 316, ch - 4);
      g.fillStyle(0x000000, 0.35).fillRect(-156, -ch / 2 + 2, 62, ch - 4);
      c.add(g);
      c.add(this.add.image(-125, 0, p.icon).setScale(4).setTint(p.color));
      c.add(text(this, -84, -ch / 2 + 22, p.name, 16, '#ffffff', 0, 0.5));
      if (p.tag) c.add(text(this, 150, -ch / 2 + 18, p.tag, 11, p.tag === 'NEW!' || p.tag === 'EVOLVE' ? '#ffd23f' : '#b0a0c0', 1, 0.5));
      const d = text(this, -84, 10, p.desc, 12, '#e0c8d4', 0, 0.5).setAlign('left');
      d.setWordWrapWidth(228);
      c.add(d);
      c.setSize(328, ch).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => c.setScale(0.97));
      c.on('pointerout', () => c.setScale(1));
      c.on('pointerup', () => this.choose(p));
      c.setAlpha(0).setScale(0.85);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, delay: i * 70, duration: 200, ease: 'Back.out' });
      this.cards.add(c);
    });
  }

  choose(p) {
    if (this.chosen) return;
    this.chosen = true;
    this.game_.applyChoice(p);
    this.scene.stop();
    this.scene.resume('Game');
  }
}
