import Phaser from 'phaser';
import { W, H } from '../config.js';
import { LEVELS, NIGHTMARE, getLevel } from '../data/levels.js';
import { Save } from '../systems/SaveSystem.js';
import { sfx } from '../systems/Audio.js';
import { animate } from '../art/pixelSprites.js';
import { backButton, button, currencyBar, panel, text } from '../ui/widgets.js';

const PER_PAGE = 10;
const PAGES = Math.ceil(LEVELS.length / PER_PAGE);

// Two tabs (normal levels / Nightmare), 10 levels per page.
export default class LevelSelect extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  // The last tab is remembered while the game runs.
  static last = { mode: 'normal' };

  create(data) {
    const mode = data?.mode ?? LevelSelect.last.mode;
    const prog = Save.progress(mode);
    const pageOfUnlocked = Math.floor((Math.min(prog.unlocked, LEVELS.length) - 1) / PER_PAGE);
    // Opens on the page with the newest unlocked level (the arrows pass their own page).
    const page = Phaser.Math.Clamp(data?.page ?? pageOfUnlocked, 0, PAGES - 1);
    LevelSelect.last = { mode };
    const nightmare = mode === 'nightmare';

    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);
    if (nightmare) this.add.rectangle(0, 0, W, H, 0x3a0010, 0.35).setOrigin(0);
    this.refresh = currencyBar(this, Save);
    backButton(this);
    text(this, W / 2, 62, nightmare ? 'NIGHTMARE' : 'CHOOSE LEVEL', 22, nightmare ? '#ff4d6d' : '#7dff7a');

    // Tabs
    const owned = Save.data.nightmare.owned;
    button(this, 95, 100, 150, 32, 'NORMAL', () => this.scene.restart({ mode: 'normal' }), {
      size: 13, color: nightmare ? 0x3a3a50 : 0x2e9e5b,
    });
    const nmTab = button(this, 265, 100, 150, 32, owned ? 'NIGHTMARE' : '   NIGHTMARE', () => this.scene.restart({ mode: 'nightmare' }), {
      size: 13, color: nightmare ? 0x9b1c3c : 0x3a3a50,
    });
    if (!owned) nmTab.add(this.add.image(-56, 0, 'lock').setScale(1.6));

    if (nightmare && !owned) {
      this.unlockPanel();
      return;
    }

    // Level grid
    const first = page * PER_PAGE;
    LEVELS.slice(first, first + PER_PAGE).forEach((base, i) => {
      const lvl = getLevel(base.n, mode);
      const x = 95 + (i % 2) * 170;
      const y = 160 + Math.floor(i / 2) * 76;
      const locked = lvl.n > prog.unlocked;
      const b = button(this, x, y, 150, 62, '', () => this.scene.start('Game', { level: lvl.n, mode }), {
        disabled: locked,
        color: parseInt(lvl.bg.light.slice(1), 16), // each level's own colour
      });
      if (locked) {
        b.add(this.add.image(0, -6, 'lock').setScale(2.5));
        b.add(text(this, 0, 18, lvl.name, 10, '#777777'));
        return;
      }
      b.add(text(this, 0, -17, String(lvl.n), 18, '#ffffff'));
      b.add(text(this, 0, 1, lvl.name, 11, nightmare ? '#ffc0c8' : '#ffb0cc'));
      const stars = prog.stars[lvl.n] || 0;
      for (let s = 0; s < 3; s++) b.add(this.add.image(-18 + s * 18, 19, s < stars ? 'star' : 'starEmpty').setScale(2));
    });
    if (page >= 1 && !Save.data.flags.seenLairs) {
      Save.data.flags.seenLairs = true;
      Save.save();
    }

    // Pages
    if (PAGES > 1) {
      const last = Math.min(LEVELS.length, first + PER_PAGE);
      text(this, W / 2, 540, `LEVELS ${first + 1}-${last}`, 13, '#e0c8d4');
      button(this, 40, 540, 56, 40, '<', () => this.scene.restart({ mode, page: page - 1 }), { size: 18, color: 0x444466, disabled: page === 0 });
      button(this, W - 40, 540, 56, 40, '>', () => this.scene.restart({ mode, page: page + 1 }), { size: 18, color: 0x444466, disabled: page === PAGES - 1 });
    }
    if (nightmare) text(this, W / 2, 592, 'No monster adaptation · 2x coins · big gems', 10, '#ff8098');
    else if (page >= 1) text(this, W / 2, 592, 'Monster Lairs: each ruled by a giant King', 10, '#c090a8');
  }

  // Nightmare isn't bought yet: what it is, and the 5000-coin unlock.
  unlockPanel() {
    const d = Save.data;
    const beaten = (d.stars[NIGHTMARE.requires] || 0) > 0;
    const canPay = d.coins >= NIGHTMARE.cost;
    panel(this, 30, 136, 300, 380, 0x24101b, 0x9b1c3c);
    text(this, W / 2, 166, 'NIGHTMARE MODE', 20, '#ff4d6d');
    animate(this.add.sprite(W / 2, 236, 'ghostlord').setScale(3));
    const lines = [
      `Hard versions of all ${LEVELS.length} levels`,
      "Monsters don't adapt to your upgrades:",
      'every upgrade counts, and you need them all',
      '2x coins and big gem rewards',
    ];
    lines.forEach((l, i) => text(this, W / 2, 320 + i * 20, l, 11, '#ffd0d8'));
    const need = beaten ? (canPay ? 'Ready!' : `You need ${NIGHTMARE.cost} coins`) : `Beat level ${NIGHTMARE.requires} to unlock`;
    text(this, W / 2, 410, need, 12, beaten && canPay ? '#7dff7a' : '#ffa0a0');
    button(this, W / 2, 470, 240, 54, `UNLOCK  ${NIGHTMARE.cost}`, () => this.confirmUnlock(), {
      size: 18, color: 0x9b1c3c, icon: 'coin', disabled: !(beaten && canPay),
    });
  }

  confirmUnlock() {
    const c = this.add.container(0, 0).setDepth(50);
    c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setInteractive());
    c.add(panel(this, 40, 220, W - 80, 180, 0x24101b, 0x9b1c3c));
    c.add(text(this, W / 2, 262, `Unlock Nightmare mode\nfor ${NIGHTMARE.cost} coins?`, 15, '#ffffff'));
    c.add(button(this, W / 2 - 62, 350, 104, 44, 'YES', () => {
      c.destroy();
      if (Save.data.nightmare.owned || (Save.data.stars[NIGHTMARE.requires] || 0) === 0) return;
      if (Save.data.coins < NIGHTMARE.cost) return;
      Save.data.coins -= NIGHTMARE.cost; // pay and unlock in one save
      Save.data.nightmare.owned = true;
      Save.save();
      sfx.chest();
      this.scene.restart({ mode: 'nightmare', page: 0 });
    }, { color: 0x2e9e5b, size: 16, armAfter: 300 }));
    c.add(button(this, W / 2 + 62, 350, 104, 44, 'NO', () => c.destroy(), { color: 0x663333, size: 16, armAfter: 300 }));
  }
}
