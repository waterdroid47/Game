import Phaser from 'phaser';
import { AUTOPLAY, W, H } from '../config.js';
import { rollCards } from '../data/upgrades.js';
import { Monetization } from '../services/monetization.js';
import { button, text } from '../ui/widgets.js';

const TAKE_ALL_Y = H - 102;
const ARM_DELAY = 600; // ms
const CARDS_TOP = 146;
const CARDS_BOTTOM = TAKE_ALL_Y - 20 - 10; // button half-height + border/margin

// Overlay shown on level-up or when catching a bonus chest: pick 1 of 3 (or 4) cards.
export default class LevelUp extends Phaser.Scene {
  constructor() {
    super('LevelUp');
  }

  create(data) {
    this.game_ = this.scene.get('Game');
    this.chosen = false;
    this.adBusy = false;
    // Ignore touches for a moment after the screen appears: the player's finger is usually
    // still on the screen from steering the cell.
    this.readyAt = performance.now() + ARM_DELAY;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.72).setOrigin(0).setInteractive();
    const chest = data.source === 'chest';
    const title = text(this, W / 2, 92, chest ? 'BONUS CHEST!' : 'LEVEL UP!', 32, chest ? '#ffd23f' : '#7dff7a');
    this.tweens.add({ targets: title, scale: { from: 0.5, to: 1 }, duration: 300, ease: 'Back.out' });
    text(this, W / 2, 128, 'Choose an upgrade', 13, '#e0c0d0');
    this.cards = this.add.container(0, 0);
    this.renderCards(data.picks);

    if (!this.game_.takeAllUsed) {
      button(this, W / 2, TAKE_ALL_Y, 230, 40, 'TAKE ALL  (watch ad)', () => this.withAd('take_all', () => {
        this.game_.takeAllUsed = true;
        this.chosen = true;
        this.picks.forEach((p) => this.game_.applyChoice(p));
        this.finish();
      }), { color: 0xc77d00, size: 14, armAfter: ARM_DELAY });
    }

    const reroll = button(this, W / 2, H - 50, 230, 40, 'REROLL  (watch ad)', () => this.withAd('reroll', () => {
      reroll.setEnabled(false).setLabel('REROLLED');
      this.renderCards(rollCards(this.game_, data.picks.length));
    }), { color: 0x8a6d00, size: 14, armAfter: ARM_DELAY });

    if (AUTOPLAY) this.time.delayedCall(150, () => this.choose(this.picks[0]));
  }

  // Shows a rewarded ad; card taps are ignored while it is open, and the reward is
  // only given if no card was picked in the meantime.
  async withAd(placement, onReward) {
    if (this.chosen || this.adBusy) return;
    this.adBusy = true;
    const ok = await Monetization.showRewardedAd(placement);
    this.adBusy = false;
    if (ok && !this.chosen && this.sys.isActive()) onReward();
  }

  renderCards(picks) {
    this.picks = picks;
    this.cards.removeAll(true);
    const n = picks.length;
    const gap = 12;
    // Fit all cards between the subtitle and the TAKE ALL button (4 cards get shorter).
    const space = CARDS_BOTTOM - CARDS_TOP;
    const ch = Math.min(104, Math.floor((space - (n - 1) * gap) / n));
    const top = CARDS_TOP + (space - (n * ch + (n - 1) * gap)) / 2;
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
      // A card is chosen only by a tap that starts on it, so lifting the finger that was
      // moving the cell when this screen opened doesn't pick a card blindly.
      c.on('pointerdown', () => {
        if (performance.now() < this.readyAt) return;
        c.pressed = true;
        c.setScale(0.97);
      });
      c.on('pointerout', () => { c.pressed = false; c.setScale(1); });
      c.on('pointerup', () => {
        const wasPressed = c.pressed;
        c.pressed = false;
        c.setScale(1);
        if (wasPressed) this.choose(p);
      });
      c.setAlpha(0).setScale(0.85);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, delay: i * 70, duration: 200, ease: 'Back.out' });
      this.cards.add(c);
    });
  }

  choose(p) {
    if (this.chosen || this.adBusy) return;
    this.chosen = true;
    this.game_.applyChoice(p);
    this.finish();
  }

  finish() {
    this.scene.stop();
    this.scene.resume('Game');
  }
}
