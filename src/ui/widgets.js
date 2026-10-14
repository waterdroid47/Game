import { FONT } from '../config.js';
import { sfx } from '../systems/Audio.js';

export function text(scene, x, y, str, size = 16, color = '#ffffff', originX = 0.5, originY = 0.5) {
  return scene.add
    .text(x, y, str, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: 'bold',
      color,
      align: 'center',
      stroke: '#000000',
      strokeThickness: Math.max(3, Math.round(size / 5)),
    })
    .setOrigin(originX, originY);
}

// A chunky pixel-style button. Returns a container with .setLabel() and .setEnabled().
export function button(scene, x, y, w, h, label, onClick, opts = {}) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  let enabled = !opts.disabled;
  const color = opts.color ?? 0x2e9e5b;
  const draw = () => {
    const fill = enabled ? color : 0x4a4a4a;
    g.clear();
    g.fillStyle(0x000000, 1).fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
    g.fillStyle(fill, 1).fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle(0xffffff, 0.22).fillRect(-w / 2, -h / 2, w, 4);
    g.fillStyle(0x000000, 0.28).fillRect(-w / 2, h / 2 - 5, w, 5);
  };
  draw();
  const t = text(scene, 0, -1, label, opts.size ?? 16, enabled ? '#ffffff' : '#9a9a9a');
  c.add([g, t]);
  if (opts.icon) {
    const ic = scene.add.image(-w / 2 + 18, 0, opts.icon).setScale(opts.iconScale ?? 2);
    c.add(ic);
    t.x += 10;
  }
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  // Only a tap that starts on the button counts: lifting a finger that was dragging
  // somewhere else (e.g. moving the cell) must not press it.
  let pressed = false;
  c.on('pointerdown', () => { pressed = true; if (enabled) c.setScale(0.95); });
  c.on('pointerout', () => { pressed = false; c.setScale(1); });
  let last = 0;
  c.on('pointerup', () => {
    c.setScale(1);
    const wasPressed = pressed;
    pressed = false;
    // Ignore duplicate events (touch + emulated mouse) and double taps.
    const now = performance.now();
    if (!enabled || !wasPressed || now - last < 300) return;
    last = now;
    sfx.click();
    onClick();
  });
  c.setLabel = (s) => { t.setText(s); return c; };
  c.setEnabled = (v) => { enabled = v; t.setColor(v ? '#ffffff' : '#9a9a9a'); draw(); return c; };
  c.label = t;
  return c;
}

// Pixel panel background.
export function panel(scene, x, y, w, h, fill = 0x2a1220, border = 0xff7aa8) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 1).fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle(border, 1).fillRect(x - 2, y - 2, w + 4, h + 4);
  g.fillStyle(fill, 1).fillRect(x, y, w, h);
  return g;
}

// Coins + DNA counter shown at the top of menu screens.
export function currencyBar(scene, Save) {
  const y = 22;
  scene.add.image(W_PAD, y, 'coin').setScale(3);
  const coins = text(scene, W_PAD + 14, y, '', 16, '#ffd23f', 0, 0.5);
  scene.add.image(W_PAD + 130, y, 'dna').setScale(2.4);
  const dna = text(scene, W_PAD + 144, y, '', 16, '#ff9be6', 0, 0.5);
  const refresh = () => {
    coins.setText(String(Save.data.coins));
    dna.setText(String(Save.data.dna));
  };
  refresh();
  return refresh;
}
const W_PAD = 18;

export function backButton(scene, to = 'Menu') {
  return button(scene, 312, 22, 72, 30, 'BACK', () => scene.scene.start(to), { size: 13, color: 0x6b2b4a });
}
