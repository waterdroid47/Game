import Phaser from 'phaser';
import { W, WALL_Y } from '../config.js';
import { sfx } from './Audio.js';

const LOWEST = 540; // a charging boss never comes lower than this (the castle wall is lower)
const GCD = 0.4; // pause between two attacks
const SAFE_SUMMON = 14; // no summons while this many monsters are alive (unless the attack says otherwise)
const deg = (d) => (d * Math.PI) / 180;

// Moves and fights for one boss, from its data in data/enemies.js (holdY, sway, attacks,
// phase2, spawnAt). All state lives here, never on the shared enemy definition.
export default class BossBrain {
  constructor(game, e) {
    this.game = game;
    this.e = e;
    this.def = e.def;
    const L = game.level;
    this.phase = 1;
    this.phase2At = L.phase2At ?? this.def.phase2?.at ?? 0.5;
    this.cdMult = L.bossCd ?? 1;
    this.state = 'enter'; // enter | sway | windup | dash | pause | return | blinkOut | blinkIn
    this.busy = false; // a charge or blink is running
    this.gcd = 0;
    this.t = 0;
    this.holdY = this.def.holdY;
    this.baseX = W / 2;
    this.amp = Math.min(this.def.sway[0], W / 2 - e.displayWidth / 2 - 6);
    this.attacks = this.def.attacks.map((a) => ({ a, t: a.every * Phaser.Math.FloatBetween(0.5, 1), rot: 0 }));
    this.spawnAt = [...(this.def.spawnAt?.at ?? [])];
    this.timers = []; // delayed shots: { t, fn }
    this.warnings = []; // rain columns: { x, t, max }
    this.line = null; // charge path while winding up
  }

  get active() {
    return this.e.active && !this.e.dying;
  }

  update(dt) {
    const e = this.e;
    this.t += dt;
    this.gcd -= dt;
    this.updateTimers(dt);
    if (this.phase === 1 && e.hp < e.maxHp * this.phase2At) this.enrage();
    while (this.spawnAt.length && e.hp < e.maxHp * this.spawnAt[0]) {
      this.spawnAt.shift();
      const s = this.def.spawnAt;
      this.summon({ enemy: s.enemy, count: s.count, max: 99 });
    }
    this.move(dt);
    for (const slot of this.attacks) {
      const a = this.eff(slot.a);
      if (!a) continue;
      slot.t -= dt;
      if (slot.t > 0) continue;
      const blocking = a.type === 'charge' || a.type === 'blink';
      // Only attack once in place; blocking attacks only while swaying.
      if (this.busy || this.gcd > 0 || e.y < 30 || (blocking && this.state !== 'sway')) continue;
      slot.t = a.every * this.cdNow();
      this.gcd = GCD;
      this.fire(a, slot);
    }
  }

  // The attack as it is in the current phase (null if not available yet).
  eff(a) {
    if (a.phase === 2 && this.phase < 2) return null;
    return this.phase === 2 && a.p2 ? { ...a, ...a.p2 } : a;
  }

  cdNow() {
    return (this.phase === 2 ? this.def.phase2?.cd ?? 1 : 1) * this.cdMult;
  }

  enrage() {
    const g = this.game;
    this.phase = 2;
    this.e.enraged = true;
    if (!(this.e.flashT > 0)) this.e.setTint(0xff9090);
    this.holdY = this.def.phase2?.holdY ?? this.holdY;
    for (const slot of this.attacks) if (slot.a.phase === 2) slot.t = 1.2;
    g.showBanner('ENRAGED!', '#ff4d6d');
    g.toast(this.def.phase2?.toast ?? `${this.def.name} is enraged!`, '#ffb0b0');
    g.cameras.main.shake(400, 0.012);
    sfx.boss();
  }

  // ----- movement -----
  move(dt) {
    const e = this.e;
    const sp = e.speed;
    switch (this.state) {
      case 'enter':
        e.y += sp * dt;
        if (e.y >= this.holdY) this.backToSway(); // starts swaying from the middle, no jump
        break;
      case 'sway':
        e.x = this.baseX + Math.sin(this.t * this.def.sway[1]) * this.amp;
        e.y += Phaser.Math.Clamp(this.holdY - e.y, -sp * dt, sp * dt);
        break;
      case 'windup':
        this.wait -= dt;
        e.x = this.from.x + Phaser.Math.FloatBetween(-3, 3);
        if (this.wait <= 0) {
          this.state = 'dash';
          this.line = null;
          e.x = this.from.x;
          this.restoreTint();
        }
        break;
      case 'dash':
        if (this.moveTo(this.target.x, this.target.y, this.charge.speed, dt)) {
          this.state = 'pause';
          this.wait = 0.3;
          this.game.cameras.main.shake(150, 0.01);
          if (this.charge.then) this.fire(this.charge.then, this.charge.slot, true);
        }
        break;
      case 'pause':
        this.wait -= dt;
        if (this.wait <= 0) {
          if (this.repeatsLeft > 0) {
            this.repeatsLeft -= 1;
            this.windup();
          } else this.state = 'return';
        }
        break;
      case 'return': {
        // Back up, and back inside the sway range so swaying continues without a jump.
        const x = Phaser.Math.Clamp(e.x, this.baseX - this.amp, this.baseX + this.amp);
        if (this.moveTo(x, this.holdY, this.charge.speed * 0.5, dt)) this.backToSway();
        break;
      }
      case 'blinkOut':
        this.wait -= dt;
        e.alpha = Math.max(0.15, this.wait / 0.3);
        if (this.wait <= 0) {
          // Reappear somewhere else, at least 90px away.
          let x = e.x;
          for (let i = 0; i < 10 && Math.abs(x - e.x) < 90; i++) x = Phaser.Math.Between(W / 2 - this.amp, W / 2 + this.amp);
          e.x = x;
          e.y = Phaser.Math.Clamp(this.holdY + Phaser.Math.Between(-20, 40), 90, LOWEST);
          this.state = 'blinkIn';
          this.wait = 0.3;
        }
        break;
      case 'blinkIn':
        this.wait -= dt;
        e.alpha = Math.min(1, 1 - this.wait / 0.3);
        if (this.wait <= 0) {
          e.alpha = 1;
          e.phased = false;
          if (this.charge.then) this.fire(this.charge.then, this.charge.slot, true);
          this.backToSway();
        }
        break;
      default:
        break;
    }
  }

  moveTo(x, y, speed, dt) {
    const e = this.e;
    const d = Phaser.Math.Distance.Between(e.x, e.y, x, y);
    if (d <= speed * dt) {
      e.x = x;
      e.y = y;
      return true;
    }
    e.x += ((x - e.x) / d) * speed * dt;
    e.y += ((y - e.y) / d) * speed * dt;
    return false;
  }

  restoreTint() {
    if (this.e.flashT > 0) return; // the hit flash restores it
    if (this.e.enraged) this.e.setTint(0xff9090);
    else this.e.clearTint();
  }

  // Continue swaying from where the boss is now (no jump).
  backToSway() {
    const e = this.e;
    this.busy = false;
    this.state = 'sway';
    const s = Phaser.Math.Clamp((e.x - this.baseX) / (this.amp || 1), -1, 1);
    this.t = Math.asin(s) / this.def.sway[1];
  }

  windup() {
    const p = this.game.player;
    this.state = 'windup';
    this.wait = this.charge.warn ?? 0.8;
    this.from = { x: this.e.x, y: this.e.y };
    // The whole boss stays on screen, wherever the guard stands.
    const half = Math.min(W / 2, this.e.displayWidth / 2);
    this.target = { x: Phaser.Math.Clamp(p.x, half, W - half), y: Phaser.Math.Clamp(p.y - 10, 300, LOWEST) };
    this.line = { ...this.target };
    if (!(this.e.flashT > 0)) this.e.setTint(0xff6060);
  }

  // ----- attacks -----
  fire(a, slot, followUp = false) {
    const g = this.game;
    const e = this.e;
    switch (a.type) {
      case 'fan': {
        const base = Phaser.Math.Angle.Between(e.x, e.y, g.player.x, g.player.y);
        const n = a.count;
        const spread = deg(a.spread ?? 0);
        for (let i = 0; i < n; i++) this.shot(base + (n > 1 ? -spread / 2 + (spread * i) / (n - 1) : 0), a);
        break;
      }
      case 'ring': {
        const arc = a.arc ?? 360;
        const n = a.count;
        const step = arc === 360 ? arc / n : arc / Math.max(1, n - 1);
        const start = 90 - (arc === 360 ? 0 : arc / 2) + (slot?.rot ?? 0);
        for (let i = 0; i < n; i++) this.shot(deg(start + step * i), a);
        if (slot && a.turn) slot.rot = (slot.rot + a.turn) % 360;
        break;
      }
      case 'volley':
        for (let i = 0; i < a.count; i++) {
          this.timers.push({ t: i * (a.gap ?? 0.15), fn: () => this.shot(Phaser.Math.Angle.Between(e.x, e.y, g.player.x, g.player.y), a) });
        }
        break;
      case 'rain': {
        // One column on the guard, the others spread out; each warns before the shot falls.
        const xs = [Phaser.Math.Clamp(g.player.x, 20, W - 20)];
        for (let tries = 0; xs.length < a.count && tries < 60; tries++) {
          const x = Phaser.Math.Between(20, W - 20);
          if (xs.every((o) => Math.abs(o - x) >= 40)) xs.push(x);
        }
        for (const x of xs) {
          const w = { x, t: a.warn, max: a.warn };
          this.warnings.push(w);
          this.timers.push({ t: a.warn, fn: () => {
            this.warnings.splice(this.warnings.indexOf(w), 1);
            g.spawnShot(x, -10, Math.PI / 2, a.speed, a.dmg, a.tex, 3);
          } });
        }
        break;
      }
      case 'summon':
        this.summon(a);
        break;
      case 'charge':
        this.busy = true;
        this.charge = { ...a, slot };
        this.repeatsLeft = (a.repeat ?? 1) - 1;
        this.windup();
        break;
      case 'blink':
        this.busy = true;
        this.charge = { ...a, slot };
        this.state = 'blinkOut';
        this.wait = 0.3;
        e.phased = true; // shots pass through while it is gone
        break;
      default:
        break;
    }
    if (followUp) sfx.boom();
  }

  shot(angle, a) {
    this.game.spawnShot(this.e.x, this.e.y + 10, angle, a.speed, a.dmg, a.tex);
  }

  summon(a) {
    const g = this.game;
    const e = this.e;
    if (g.spawner.alive >= (a.max ?? SAFE_SUMMON)) return;
    for (let i = 0; i < a.count; i++) {
      const x = Phaser.Math.Clamp(e.x + (i - (a.count - 1) / 2) * 70, 20, W - 20);
      g.spawnEnemy(a.enemy, x, Math.min(e.y + 30, LOWEST - 60), g.spawner.spec.hpMult * 0.8);
    }
  }

  updateTimers(dt) {
    for (const w of this.warnings) w.t -= dt;
    if (!this.timers.length) return;
    const due = [];
    this.timers = this.timers.filter((tm) => {
      tm.t -= dt;
      if (tm.t <= 0) { due.push(tm); return false; }
      return true;
    });
    for (const tm of due) if (this.active) tm.fn();
  }

  // Red warnings: rain columns and the path of a coming charge.
  draw(gfx) {
    for (const w of this.warnings) {
      const k = 1 - w.t / w.max;
      gfx.fillStyle(0xff004d, 0.12 + 0.18 * k + 0.08 * Math.sin(this.t * 30));
      gfx.fillRect(w.x - 12, 0, 24, WALL_Y);
    }
    if (this.line && this.state === 'windup') {
      gfx.lineStyle(3, 0xff004d, 0.5 + 0.3 * Math.sin(this.t * 25));
      gfx.lineBetween(this.e.x, this.e.y, this.line.x, this.line.y);
      gfx.strokeCircle(this.line.x, this.line.y, this.def.radius * 0.6);
    }
  }

  // Stop everything (boss died, revive, run over).
  clear() {
    this.timers = [];
    this.warnings = [];
    this.line = null;
    this.e.phased = false;
    if (this.e.active) this.e.alpha = 1;
  }
}
