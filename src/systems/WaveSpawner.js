import Phaser from 'phaser';
import { W } from '../config.js';
import { BOSS, ELITE } from '../data/enemies.js';
import { waveSpec } from '../data/levels.js';

// Spawns the enemies of each wave and moves on to the next wave when the screen is clear.
// The last wave of every level is the boss; killing it wins the level.
export default class WaveSpawner {
  constructor(game) {
    this.game = game;
    this.level = game.level;
    this.wave = 0;
    this.alive = 0;
    this.queue = [];
    this.state = 'idle';
    this.timer = 0;
  }

  start() {
    this.next();
  }

  next() {
    this.wave += 1;
    const L = this.level;
    this.spec = waveSpec(L, this.wave);
    this.isBoss = this.wave === L.waves;
    this.queue = [];
    if (this.isBoss) {
      this.queue.push(BOSS);
      for (let i = 0; i < 6 + L.n; i++) this.queue.push(this.pick());
      this.interval = this.spec.interval * 2.2;
    } else {
      for (let i = 0; i < this.spec.count; i++) this.queue.push(this.pick());
      for (let i = 0; i < this.spec.elites; i++) {
        const at = Phaser.Math.Between(Math.floor(this.queue.length / 2), this.queue.length);
        this.queue.splice(at, 0, ELITE);
      }
      this.interval = this.spec.interval;
    }
    this.game.startWaveXp(this.wave, this.queue);
    this.state = 'spawning';
    this.timer = 1.4;
    this.game.showBanner(this.isBoss ? 'BOSS WAVE!' : `WAVE ${this.wave}`, this.isBoss ? '#ff4d6d' : '#ffffff');
  }

  pick() {
    const entries = Object.entries(this.level.pool);
    const total = entries.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * total;
    for (const [type, w] of entries) {
      r -= w;
      if (r < 0) return type;
    }
    return entries[0][0];
  }

  update(dt) {
    if (this.state === 'spawning') {
      this.timer -= dt;
      if (this.timer <= 0 && this.queue.length) {
        const type = this.queue.shift();
        const boss = type === BOSS;
        this.game.spawnEnemy(type, boss ? W / 2 : Phaser.Math.Between(24, W - 24), boss ? -40 : -16, this.spec.hpMult);
        this.timer = this.interval * Phaser.Math.FloatBetween(0.6, 1.4);
      }
      if (!this.queue.length) this.state = 'clearing';
    } else if (this.state === 'clearing') {
      if (this.alive <= 0 && !this.isBoss) {
        this.state = 'break';
        this.timer = 1.6;
      }
    } else if (this.state === 'break') {
      this.timer -= dt;
      if (this.timer <= 0) this.next();
    }
  }

  // Debug helper: drop the rest of this wave.
  skip() {
    this.queue = this.queue.filter((t) => t === BOSS);
  }
}
