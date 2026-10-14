import Phaser from 'phaser';
import { AUTOPLAY, DEBUG, H, MEMBRANE_Y, PLAYER_Y, SPEED, SPRITE_SCALE, W } from '../config.js';
import { ENEMIES } from '../data/enemies.js';
import { LEVELS, xpFor } from '../data/levels.js';
import { metaStats } from '../data/shop.js';
import { CARDS, STANCES, STANCE_MAX, rollCards } from '../data/upgrades.js';
import { Monetization } from '../services/monetization.js';
import { sfx } from '../systems/Audio.js';
import WaveSpawner from '../systems/WaveSpawner.js';
import { button, text } from '../ui/widgets.js';

const BASE_FIRE_RATE = 2.6;
const ENEMY_COLORS = {
  virus: 0xe0335a, germ: 0xffd23f, tank: 0x7fae3a, splitter: 0x4aa8ff, mini: 0x4aa8ff,
  shooter: 0xff8a2a, elite: 0xc43cf0, boss: 0x56b53a,
};

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.level = LEVELS[Phaser.Math.Clamp((data && data.level) || 1, 1, LEVELS.length) - 1];
  }

  create() {
    this.time.timeScale = SPEED;
    this.tweens.timeScale = SPEED;
    this.physics.world.timeScale = 1 / SPEED;

    this.bg = this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0).setTint(this.level.tint);
    this.add.tileSprite(0, MEMBRANE_Y, W, 18, 'membrane').setOrigin(0, 0).setTileScale(3, 3).setDepth(2);
    this.add.rectangle(0, MEMBRANE_Y + 18, W, H - MEMBRANE_Y - 18, 0x3a0d20).setOrigin(0).setDepth(2);

    // ----- run state -----
    const meta = (this.meta = metaStats());
    this.stats = {
      damage: 5 * meta.damageMult,
      fireRate: BASE_FIRE_RATE * meta.fireRateMult,
      projectiles: 1,
      pierce: 0,
      crit: 0.05 + meta.crit,
      critMult: 2,
      ricochet: 0,
      bulletScale: 1,
      bulletSpeed: 430,
      maxHp: 100 + meta.hp,
      xpMult: meta.xpMult,
      coinMult: meta.coinMult,
    };
    this.stances = { spread: 0, laser: 0, orbit: 0, missile: 0, pulse: 0 };
    this.cardLevels = {};
    this.hp = this.stats.maxHp;
    this.xp = 0;
    this.runLevel = 1;
    this.xpNext = xpFor(1);
    this.levelUpQueue = [];
    this.kills = 0;
    this.coinsEarned = 0;
    this.freeRevives = meta.revives;
    this.adReviveUsed = false;
    this.dead = false;
    this.finished = false;
    this.invuln = 0;
    this.boss = null;
    this.graveyard = [];
    this.floatCount = 0;
    this.cd = { main: 0.5, spread: 1, laser: 2, missile: 1.5, pulse: 2, chest: Phaser.Math.Between(30, 45) };
    this.laserTime = 0;
    this.laserTick = 0;
    this.orbitAngle = 0;
    this.orbiters = [];

    // ----- groups -----
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group({ maxSize: 400 });
    this.enemyBullets = this.physics.add.group({ maxSize: 200 });
    this.missiles = this.physics.add.group({ maxSize: 60 });
    this.pickups = this.physics.add.group();

    // ----- player -----
    this.player = this.physics.add.sprite(W / 2, PLAYER_Y, 'cell').setScale(SPRITE_SCALE).setDepth(7);
    this.player.body.setCircle(5, 1, 1);
    this.targetX = W / 2;
    this.tweens.add({ targets: this.player, scaleX: SPRITE_SCALE * 1.06, scaleY: SPRITE_SCALE * 0.94, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.fx = this.add.particles(0, 0, 'px', {
      speed: { min: 40, max: 170 },
      lifespan: { min: 250, max: 550 },
      scale: { start: 1.6, end: 0 },
      emitting: false,
    }).setDepth(8);
    this.laserGfx = this.add.graphics().setDepth(6);
    this.barGfx = this.add.graphics().setDepth(9);

    // ----- input: slide anywhere to move -----
    this.dragStart = null;
    this.input.on('pointerdown', (p) => {
      this.dragStart = p.x;
      this.dragFrom = this.targetX;
    });
    this.input.on('pointermove', (p) => {
      if (!p.isDown || this.dragStart === null) return;
      this.targetX = Phaser.Math.Clamp(this.dragFrom + (p.x - this.dragStart) * 1.4, 16, W - 16);
    });
    this.input.on('pointerup', () => { this.dragStart = null; });
    this.keys = this.input.keyboard?.addKeys('LEFT,RIGHT,A,D');

    // ----- collisions -----
    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHit, null, this);
    this.physics.add.overlap(this.missiles, this.enemies, (m) => this.explodeMissile(m), null, this);
    this.physics.add.overlap(this.player, this.enemyBullets, this.onPlayerShot, null, this);
    this.physics.add.overlap(this.player, this.pickups, this.onPickup, null, this);

    this.createHud();
    this.spawner = new WaveSpawner(this);

    if (meta.startStance) {
      const ids = Object.keys(STANCES);
      this.applyChoice({ kind: 'stance', id: ids[Phaser.Math.Between(0, ids.length - 1)] });
    }

    // Pause automatically when the app goes to the background.
    const onHidden = () => this.pauseGame();
    this.game.events.on('hidden', onHidden);
    this.events.on('resume', () => { this.dragStart = null; });
    this.events.once('shutdown', () => this.game.events.off('hidden', onHidden));

    this.spawner.start();
  }

  // ======================================================================
  // main loop
  // ======================================================================
  update(_t, delta) {
    for (const e of this.graveyard) e.destroy();
    this.graveyard.length = 0;
    if (this.dead || this.finished) return;

    const dt = (Math.min(delta, 50) / 1000) * SPEED;
    this.bg.tilePositionY -= dt * 12;
    this.invuln = Math.max(0, this.invuln - dt);

    this.updatePlayer(dt);
    this.updateWeapons(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.spawner.update(dt);
    this.updateChests(dt);
    this.updateHud();

    if (this.levelUpQueue.length && !this.dead && !this.finished && !this.scene.isActive('LevelUp')) {
      this.openLevelUp(this.levelUpQueue.shift());
    }
  }

  updatePlayer(dt) {
    if (AUTOPLAY) this.targetX = this.autoTarget();
    if (this.keys) {
      if (this.keys.LEFT.isDown || this.keys.A.isDown) this.targetX -= 320 * dt;
      if (this.keys.RIGHT.isDown || this.keys.D.isDown) this.targetX += 320 * dt;
      this.targetX = Phaser.Math.Clamp(this.targetX, 16, W - 16);
    }
    const p = this.player;
    const dx = this.targetX - p.x;
    p.x += dx * Math.min(1, dt * 16);
    p.rotation = Phaser.Math.Clamp(dx * 0.004, -0.25, 0.25);
    p.setAlpha(this.invuln > 0.2 ? 0.5 + 0.5 * Math.sin(this.time.now * 0.05) : 1);
  }

  // Simple bot used for automated tests: chase the lowest enemy, grab chests, dodge shots.
  autoTarget() {
    let best = null;
    for (const c of this.pickups.getChildren()) if (c.active && c.y > 250) return c.x;
    for (const e of this.enemies.getChildren()) {
      if (!e.active || e.dying || e.y < 0) continue;
      if (!best || e.y > best.y) best = e;
    }
    let x = best ? best.x : W / 2;
    for (const b of this.enemyBullets.getChildren()) {
      if (b.active && b.y > PLAYER_Y - 120 && b.y < PLAYER_Y && Math.abs(b.x - x) < 22) x += b.x < x ? 40 : -40;
    }
    return Phaser.Math.Clamp(x, 16, W - 16);
  }

  // ======================================================================
  // weapons
  // ======================================================================
  updateWeapons(dt) {
    const s = this.stats;
    const L = this.stances;
    const px = this.player.x;
    const py = PLAYER_Y - 16;
    const hasTargets = this.spawner.alive > 0;
    const rateF = s.fireRate / BASE_FIRE_RATE;

    // Main blaster
    this.cd.main -= dt;
    if (this.cd.main <= 0 && hasTargets) {
      this.cd.main = 1 / s.fireRate;
      const n = s.projectiles;
      for (let i = 0; i < n; i++) {
        const off = i - (n - 1) / 2;
        this.fireBullet(px + off * 8, py, -90 + off * 4, s.damage, { pierce: s.pierce, ricochet: s.ricochet });
      }
      sfx.shoot();
    }

    // Spread shot
    if (L.spread) {
      this.cd.spread -= dt;
      if (this.cd.spread <= 0 && hasTargets) {
        this.cd.spread = Math.max(0.45, 1.6 - 0.12 * L.spread) / rateF;
        const evolved = L.spread === STANCE_MAX;
        const n = evolved ? 9 : 2 + L.spread;
        const arc = 34 + 6 * L.spread;
        for (let i = 0; i < n; i++) {
          this.fireBullet(px, py, -90 - arc / 2 + (arc * i) / (n - 1), s.damage * 0.7, {
            pierce: s.pierce + (evolved ? 1 : 0), tint: 0xffd23f, scale: 0.85,
          });
        }
      }
    }

    // Laser
    this.laserGfx.clear();
    if (L.laser) {
      const evolved = L.laser === STANCE_MAX;
      if (this.laserTime > 0) {
        this.laserTime -= dt;
        this.laserTick -= dt;
        const w = evolved ? 44 : 8 + 4 * L.laser;
        const flick = 0.75 + 0.25 * Math.sin(this.time.now * 0.08);
        this.laserGfx.fillStyle(0xff4df0, 0.3 * flick).fillRect(px - w / 2 - 4, 0, w + 8, py);
        this.laserGfx.fillStyle(0xff4df0, 0.75 * flick).fillRect(px - w / 2, 0, w, py);
        this.laserGfx.fillStyle(0xffffff, 0.9).fillRect(px - w / 6, 0, w / 3, py);
        if (this.laserTick <= 0) {
          this.laserTick = 0.1;
          const dmg = s.damage * (0.5 + 0.15 * L.laser) * (evolved ? 1.5 : 1);
          for (const e of this.liveEnemies()) {
            if (Math.abs(e.x - px) < w / 2 + e.def.radius && e.y < py) this.damageEnemy(e, dmg, false);
          }
        }
      } else {
        this.cd.laser -= dt;
        if (this.cd.laser <= 0 && hasTargets) {
          this.cd.laser = evolved ? 1.2 : 3.8 - 0.4 * L.laser;
          this.laserTime = 0.6 + 0.08 * L.laser;
          sfx.laser();
        }
      }
    }

    // Orbiting antibodies
    if (this.orbiters.length) {
      const evolved = L.orbit === STANCE_MAX;
      const R = evolved ? 56 : 44;
      this.orbitAngle += dt * 2.8;
      const dmg = s.damage * (1 + 0.25 * L.orbit);
      this.orbiters.forEach((o, i) => {
        const a = this.orbitAngle + (i * Math.PI * 2) / this.orbiters.length;
        o.setPosition(px + Math.cos(a) * R, PLAYER_Y + Math.sin(a) * R * 0.8);
        for (const e of this.liveEnemies()) {
          if (e.orbitHitT > 0) continue;
          if (Phaser.Math.Distance.Between(o.x, o.y, e.x, e.y) < e.def.radius + 9) {
            e.orbitHitT = 0.35;
            this.damageEnemy(e, dmg, true);
          }
        }
        for (const b of this.enemyBullets.getChildren()) {
          if (b.active && Phaser.Math.Distance.Between(o.x, o.y, b.x, b.y) < 12) b.disableBody(true, true);
        }
      });
    }

    // Homing missiles
    if (L.missile) {
      this.cd.missile -= dt;
      if (this.cd.missile <= 0 && hasTargets) {
        const evolved = L.missile === STANCE_MAX;
        this.cd.missile = evolved ? 1.0 : 2.8 - 0.3 * L.missile;
        const n = evolved ? 4 : Math.ceil(L.missile / 2);
        for (let i = 0; i < n; i++) {
          const m = this.missiles.get(px, py, 'missile');
          if (!m) break;
          m.enableBody(true, px, py, true, true);
          m.setScale(evolved ? 3 : 2.4).setDepth(6);
          m.angle0 = (-90 + (i - (n - 1) / 2) * 35) * (Math.PI / 180);
          m.heading = m.angle0;
          m.target = null;
          m.life = 4;
          m.damage = s.damage * (2.5 + 0.6 * L.missile);
          m.aoe = evolved ? 50 : 26;
        }
        sfx.missile();
      }
    }

    // Immune pulse
    if (L.pulse) {
      this.cd.pulse -= dt;
      const evolved = L.pulse === STANCE_MAX;
      const R = evolved ? 170 : 70 + 16 * L.pulse;
      if (this.cd.pulse <= 0 && this.liveEnemies().some((e) => this.distToPlayer(e) < R + 20)) {
        this.cd.pulse = evolved ? 1.8 : 4.6 - 0.5 * L.pulse;
        const dmg = s.damage * (1.6 + 0.6 * L.pulse);
        for (const e of this.liveEnemies()) {
          if (this.distToPlayer(e) < R + e.def.radius) {
            this.damageEnemy(e, dmg, true);
            if (evolved && !e.def.boss) e.knock = 220;
          }
        }
        for (const b of this.enemyBullets.getChildren()) {
          if (b.active && Phaser.Math.Distance.Between(px, PLAYER_Y, b.x, b.y) < R) b.disableBody(true, true);
        }
        const ring = this.add.circle(px, PLAYER_Y, R, 0x7dff7a, 0.12).setStrokeStyle(4, 0x7dff7a, 0.9).setDepth(6).setScale(0.1);
        this.tweens.add({ targets: ring, scale: 1, alpha: 0, duration: 380, ease: 'Cubic.out', onComplete: () => ring.destroy() });
        sfx.pulse();
      }
    }
  }

  fireBullet(x, y, angleDeg, damage, opts = {}) {
    const b = this.bullets.get(x, y, 'bullet');
    if (!b) return;
    b.enableBody(true, x, y, true, true);
    b.setScale(2 * this.stats.bulletScale * (opts.scale || 1)).setDepth(6);
    if (opts.tint) b.setTint(opts.tint);
    else b.clearTint();
    b.setRotation((angleDeg + 90) * (Math.PI / 180));
    this.physics.velocityFromAngle(angleDeg, this.stats.bulletSpeed, b.body.velocity);
    b.damage = damage;
    b.pierce = opts.pierce || 0;
    b.ricochet = opts.ricochet || 0;
    b.hit = new Set();
  }

  rebuildOrbiters() {
    this.orbiters.forEach((o) => o.destroy());
    const n = this.stances.orbit === STANCE_MAX ? 6 : this.stances.orbit;
    this.orbiters = [];
    for (let i = 0; i < n; i++) this.orbiters.push(this.add.image(this.player.x, PLAYER_Y, 'orbiter').setScale(2.6).setDepth(7));
  }

  // ======================================================================
  // projectiles & pickups
  // ======================================================================
  updateProjectiles(dt) {
    for (const b of this.bullets.getChildren()) {
      if (b.active && (b.y < -20 || b.x < -20 || b.x > W + 20)) b.disableBody(true, true);
    }
    for (const b of this.enemyBullets.getChildren()) {
      if (b.active && b.y > H + 10) b.disableBody(true, true);
    }
    for (const m of this.missiles.getChildren()) {
      if (!m.active) continue;
      m.life -= dt;
      if (m.life <= 0 || m.y < -30) { this.explodeMissile(m); continue; }
      if (!m.target || !m.target.active || m.target.dying) m.target = this.nearestEnemy(m.x, m.y);
      if (m.target) {
        const want = Phaser.Math.Angle.Between(m.x, m.y, m.target.x, m.target.y);
        m.heading = Phaser.Math.Angle.RotateTo(m.heading, want, 6 * dt);
      }
      this.physics.velocityFromRotation(m.heading, 260, m.body.velocity);
      m.setRotation(m.heading + Math.PI / 2);
      if (Math.random() < 0.4) this.burst(m.x, m.y + 6, 0xffd23f, 1);
    }
  }

  explodeMissile(m) {
    if (!m.active) return;
    for (const e of this.liveEnemies()) {
      if (Phaser.Math.Distance.Between(m.x, m.y, e.x, e.y) < m.aoe + e.def.radius) this.damageEnemy(e, m.damage, true);
    }
    this.burst(m.x, m.y, 0xff6a3d, 14);
    const ring = this.add.circle(m.x, m.y, m.aoe, 0xff6a3d, 0.3).setDepth(6);
    this.tweens.add({ targets: ring, alpha: 0, scale: 1.3, duration: 220, onComplete: () => ring.destroy() });
    sfx.boom();
    m.disableBody(true, true);
  }

  updateChests(dt) {
    if (!this.spawner.isBoss) {
      this.cd.chest -= dt;
      if (this.cd.chest <= 0) {
        this.cd.chest = Phaser.Math.Between(50, 80);
        this.dropChest(Phaser.Math.Between(40, W - 40), -10, Math.random() < 0.15);
      }
    }
    for (const c of this.pickups.getChildren()) {
      if (c.active && c.y > MEMBRANE_Y + 12) {
        this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() });
        c.body.enable = false;
        c.setActive(false);
      }
    }
  }

  dropChest(x, y, rare) {
    const c = this.pickups.create(x, y, rare ? 'chestRare' : 'chest').setScale(3).setDepth(6);
    c.rare = rare;
    c.setVelocityY(75);
    this.tweens.add({ targets: c, angle: { from: -8, to: 8 }, duration: 400, yoyo: true, repeat: -1 });
    if (rare) this.tweens.add({ targets: c, alpha: 0.6, duration: 200, yoyo: true, repeat: -1 });
  }

  onPickup(_player, c) {
    if (!c.active) return;
    c.body.enable = false;
    c.setActive(false);
    this.graveyard.push(c);
    this.burst(c.x, c.y, 0xffd23f, 20);
    if (c.rare) {
      sfx.chest();
      const picks = rollCards(this, 3);
      picks.forEach((p) => this.applyChoice(p));
      this.toast(`RARE CHEST!\n${picks.map((p) => p.name).join(' · ')}`, '#ffe970');
    } else {
      this.levelUpQueue.unshift('chest');
    }
  }

  // ======================================================================
  // enemies
  // ======================================================================
  spawnEnemy(type, x, y, hpMult) {
    const def = ENEMIES[type];
    const e = this.physics.add.sprite(x, y, def.tex).setScale(def.scale ?? SPRITE_SCALE).setDepth(5);
    this.enemies.add(e);
    const r = Math.min(e.width, e.height) * 0.45;
    e.body.setCircle(r, e.width / 2 - r, e.height / 2 - r);
    e.def = def;
    e.type = type;
    e.maxHp = e.hp = def.boss ? def.hp * this.level.hpMult : def.hp * hpMult;
    e.speed = def.speed * this.level.speedMult * Phaser.Math.FloatBetween(0.9, 1.1);
    e.baseX = def.boss ? W / 2 : x;
    e.t = Math.random() * 10;
    e.shootT = def.shoot ? def.shoot.every * Phaser.Math.FloatBetween(0.5, 1) : 0;
    e.holdY = def.hold ? Phaser.Math.Between(def.hold[0], def.hold[1]) : null;
    e.holdT = 0;
    e.summonT = def.summon ? def.summon.every : 0;
    e.orbitHitT = 0;
    e.flashT = 0;
    e.knock = 0;
    this.spawner.alive += 1;
    if (def.boss) {
      this.boss = e;
      sfx.boss();
      this.cameras.main.shake(500, 0.008);
    }
    return e;
  }

  liveEnemies() {
    return this.enemies.getChildren().filter((e) => e.active && !e.dying);
  }

  nearestEnemy(x, y, exclude) {
    let best = null;
    let bd = Infinity;
    for (const e of this.liveEnemies()) {
      if (exclude && exclude.has(e)) continue;
      const d = Phaser.Math.Distance.Squared(x, y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  distToPlayer(e) {
    return Phaser.Math.Distance.Between(this.player.x, PLAYER_Y, e.x, e.y);
  }

  updateEnemies(dt) {
    for (const e of this.liveEnemies()) {
      const def = e.def;
      e.t += dt;
      e.orbitHitT -= dt;
      if (e.flashT > 0) {
        e.flashT -= dt;
        if (e.flashT <= 0) e.clearTint();
      }
      if (e.knock > 0) {
        e.y -= e.knock * dt;
        e.knock = Math.max(0, e.knock - 400 * dt);
      }
      if (e.holdY !== null && e.y >= e.holdY) {
        e.holdT += dt;
        const amp = def.boss ? 110 : 40;
        e.x = Phaser.Math.Clamp(e.baseX + Math.sin(e.t * (def.boss ? 0.7 : 1.3)) * amp, 30, W - 30);
        if (!def.boss && e.holdT > 10) e.holdY = null; // shooters eventually advance
      } else {
        e.y += e.speed * dt;
        if (def.wobble) e.x = Phaser.Math.Clamp(e.baseX + Math.sin(e.t * 3) * def.wobble, 12, W - 12);
      }
      if (def.shoot) {
        e.shootT -= dt;
        if (e.shootT <= 0 && e.y > 30) {
          e.shootT = def.shoot.every * (def.boss && e.hp < e.maxHp / 2 ? 0.6 : 1);
          this.enemyShoot(e);
        }
      }
      if (def.summon) {
        e.summonT -= dt;
        if (e.summonT <= 0 && e.y > 60) {
          e.summonT = def.summon.every;
          for (let i = 0; i < def.summon.count; i++) {
            this.spawnEnemy(def.summon.type, Phaser.Math.Clamp(e.x + (i - 0.5) * 70, 20, W - 20), e.y + 30, this.spawner.spec.hpMult * 0.8);
          }
        }
      }
      if (e.y >= MEMBRANE_Y - 6) {
        this.hurtPlayer(def.dmg * this.level.dmgMult);
        this.burst(e.x, MEMBRANE_Y, 0xff7aa8, 12);
        this.removeEnemy(e);
      }
    }
  }

  enemyShoot(e) {
    const sh = e.def.shoot;
    const base = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, PLAYER_Y);
    const n = sh.count;
    const spread = ((sh.spread || 0) * Math.PI) / 180;
    for (let i = 0; i < n; i++) {
      const a = n > 1 ? base - spread / 2 + (spread * i) / (n - 1) : base;
      const b = this.enemyBullets.get(e.x, e.y + 10, 'ebullet');
      if (!b) return;
      b.enableBody(true, e.x, e.y + 10, true, true);
      b.setScale(2.4).setDepth(6);
      b.body.setCircle(2, 0.5, 0.5);
      this.physics.velocityFromRotation(a, sh.speed, b.body.velocity);
      b.damage = sh.dmg * this.level.dmgMult;
    }
  }

  onBulletHit(b, e) {
    if (!b.active || !e.active || e.dying || b.hit.has(e)) return;
    b.hit.add(e);
    this.damageEnemy(e, b.damage, true);
    if (b.ricochet > 0) {
      const t = this.nearestEnemy(b.x, b.y, b.hit);
      if (t) {
        b.ricochet -= 1;
        const a = Phaser.Math.Angle.Between(b.x, b.y, t.x, t.y);
        this.physics.velocityFromRotation(a, this.stats.bulletSpeed, b.body.velocity);
        b.setRotation(a + Math.PI / 2);
        return;
      }
    }
    if (b.pierce > 0) {
      b.pierce -= 1;
      return;
    }
    b.disableBody(true, true);
  }

  damageEnemy(e, dmg, canCrit) {
    if (e.dying) return;
    if (canCrit && Math.random() < this.stats.crit) {
      dmg *= this.stats.critMult;
      this.floatText(e.x, e.y - 12, String(Math.round(dmg)), '#ffd23f');
    }
    e.hp -= dmg;
    e.setTintFill(0xffffff);
    e.flashT = 0.05;
    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e) {
    if (e.dying) return;
    e.dying = true;
    const def = e.def;
    this.kills += 1;
    this.coinsEarned += def.coins;
    this.gainXp(def.xp);
    this.burst(e.x, e.y, ENEMY_COLORS[e.type] ?? 0xffffff, def.boss ? 80 : 12);
    sfx.kill();
    if (def.split) {
      for (let i = 0; i < def.split.count; i++) {
        this.spawnEnemy(def.split.into, Phaser.Math.Clamp(e.x + (i ? 14 : -14), 12, W - 12), e.y, this.spawner.spec.hpMult);
      }
    }
    if (def.chest) this.dropChest(e.x, e.y, Math.random() < 0.1);
    this.removeEnemy(e);
    if (def.boss) {
      this.boss = null;
      this.cameras.main.shake(600, 0.02);
      this.cameras.main.flash(300, 255, 255, 255);
      for (const other of this.liveEnemies()) this.killEnemy(other);
      this.time.delayedCall(1400, () => this.finish(true));
    }
  }

  // Remove without reward (reached the membrane, revive clean-up, or killed).
  removeEnemy(e) {
    e.dying = true;
    e.setActive(false).setVisible(false);
    e.body.enable = false;
    this.graveyard.push(e);
    this.spawner.alive -= 1;
  }

  // ======================================================================
  // player health / xp / level-ups
  // ======================================================================
  onPlayerShot(_p, b) {
    if (!b.active) return;
    b.disableBody(true, true);
    this.hurtPlayer(b.damage);
  }

  hurtPlayer(dmg) {
    if (this.invuln > 0 || this.dead || this.finished) return;
    this.hp -= dmg;
    sfx.hurt();
    this.cameras.main.shake(120, 0.008);
    this.player.setTintFill(0xff3b5c);
    this.time.delayedCall(80, () => this.player.clearTint());
    this.invuln = 0.1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.updateHud();
      this.onDeath();
    }
  }

  heal(n) {
    this.hp = Math.min(this.stats.maxHp, this.hp + n);
  }

  gainXp(n) {
    this.xp += n * this.stats.xpMult;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.runLevel += 1;
      this.xpNext = xpFor(this.runLevel);
      this.levelUpQueue.push('xp');
    }
  }

  openLevelUp(source) {
    const picks = rollCards(this, this.meta.cards);
    if (!picks.length) {
      this.heal(30);
      return;
    }
    if (source === 'chest') sfx.chest();
    else sfx.levelUp();
    this.scene.pause();
    this.scene.launch('LevelUp', { source, picks });
  }

  applyChoice(choice) {
    if (choice.kind === 'stance') {
      this.stances[choice.id] = Math.min(STANCE_MAX, this.stances[choice.id] + 1);
      if (choice.id === 'orbit') this.rebuildOrbiters();
    } else {
      const card = CARDS.find((c) => c.id === choice.id);
      card.apply(this.stats, this);
      this.cardLevels[card.id] = (this.cardLevels[card.id] || 0) + 1;
    }
    this.refreshStanceIcons();
  }

  onDeath() {
    this.dead = true;
    this.physics.pause();
    this.laserGfx.clear();
    this.burst(this.player.x, PLAYER_Y, 0x7dff7a, 40);
    this.player.setVisible(false);
    if (this.freeRevives > 0) {
      this.freeRevives -= 1;
      this.toast('SECOND LIFE!', '#7dff7a');
      this.time.delayedCall(900, () => this.revive());
      return;
    }
    this.time.delayedCall(500, () => this.showDeathMenu());
  }

  showDeathMenu() {
    if (AUTOPLAY) {
      this.finish(false);
      return;
    }
    const c = this.add.container(0, 0).setDepth(50);
    c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setInteractive());
    c.add(text(this, W / 2, 210, 'YOUR CELL\nWAS INFECTED', 28, '#ff4d6d'));
    c.add(text(this, W / 2, 285, `Wave ${this.spawner.wave}/${this.level.waves}`, 16, '#ffffff'));
    if (!this.adReviveUsed) {
      c.add(button(this, W / 2, 360, 250, 54, 'REVIVE  (watch ad)', async () => {
        if (await Monetization.showRewardedAd('revive')) {
          this.adReviveUsed = true;
          c.destroy();
          this.revive();
        }
      }, { color: 0x8a6d00, size: 17 }));
    }
    c.add(button(this, W / 2, 430, 200, 44, 'GIVE UP', () => { c.destroy(); this.finish(false); }, { color: 0x663333 }));
  }

  revive() {
    this.hp = Math.round(this.stats.maxHp * 0.6);
    for (const b of this.enemyBullets.getChildren()) if (b.active) b.disableBody(true, true);
    for (const e of this.liveEnemies()) {
      if (!e.def.boss && e.y > PLAYER_Y - 260) {
        this.burst(e.x, e.y, 0x7dff7a, 6);
        this.removeEnemy(e);
      }
    }
    this.player.setVisible(true);
    this.invuln = 2.5;
    this.dead = false;
    this.physics.resume();
    const ring = this.add.circle(this.player.x, PLAYER_Y, 260, 0x7dff7a, 0.2).setDepth(6).setScale(0.1);
    this.tweens.add({ targets: ring, scale: 1, alpha: 0, duration: 500, onComplete: () => ring.destroy() });
  }

  finish(victory) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    this.laserGfx.clear();
    const hpFrac = this.hp / this.stats.maxHp;
    const result = {
      level: this.level.n,
      victory,
      coins: Math.round((this.coinsEarned + (victory ? this.level.clearCoins : 0)) * this.stats.coinMult),
      dna: victory ? this.level.clearDna : 0,
      stars: victory ? (this.adReviveUsed ? 1 : hpFrac >= 0.8 ? 3 : hpFrac >= 0.4 ? 2 : 1) : 0,
      kills: this.kills,
      wave: this.spawner.wave,
      waves: this.level.waves,
      runLevel: this.runLevel,
    };
    window.__lastResult = result;
    if (victory) sfx.win();
    else sfx.lose();
    this.time.delayedCall(victory ? 700 : 300, () => this.scene.start('Result', result));
  }

  pauseGame() {
    if (this.dead || this.finished || !this.scene.isActive()) return;
    this.scene.pause();
    this.scene.launch('Pause');
  }

  // ======================================================================
  // HUD & effects
  // ======================================================================
  createHud() {
    const d = 20;
    this.hud = this.add.graphics().setDepth(d);
    this.hpText = text(this, 64, 15, '', 11).setDepth(d + 1);
    this.waveText = text(this, W / 2 + 8, 15, '', 13).setDepth(d + 1);
    this.add.image(W - 102, 15, 'coin').setScale(2.2).setDepth(d + 1);
    this.coinText = text(this, W - 92, 15, '', 13, '#ffd23f', 0).setDepth(d + 1);
    this.lvlText = text(this, 6, 46, '', 11, '#c8b0ff', 0).setDepth(d + 1);
    this.bossText = text(this, W / 2, 64, '', 10, '#ffffff').setDepth(d + 2);
    this.stanceHud = this.add.container(0, 0).setDepth(d + 1);
    button(this, W - 22, 15, 34, 24, 'II', () => this.pauseGame(), { size: 12, color: 0x444466 }).setDepth(d + 2);
    if (DEBUG) {
      button(this, W - 40, 100, 70, 22, 'SKIP', () => {
        this.spawner.skip();
        for (const e of this.liveEnemies()) if (!e.def.boss) this.killEnemy(e);
      }, { size: 10, color: 0x664400 }).setDepth(d + 2);
      button(this, W - 40, 128, 70, 22, '+LVL', () => this.levelUpQueue.push('xp'), { size: 10, color: 0x664400 }).setDepth(d + 2);
    }
  }

  updateHud() {
    const g = this.hud;
    g.clear();
    g.fillStyle(0x000000, 1).fillRect(4, 4, 122, 22);
    g.fillStyle(0x4a1020, 1).fillRect(6, 6, 118, 18);
    g.fillStyle(0xff3b5c, 1).fillRect(6, 6, (118 * this.hp) / this.stats.maxHp, 18);
    g.fillStyle(0xffffff, 0.25).fillRect(6, 6, (118 * this.hp) / this.stats.maxHp, 4);
    g.fillStyle(0x000000, 1).fillRect(0, 30, W, 9);
    g.fillStyle(0x9d74ff, 1).fillRect(1, 31, ((W - 2) * this.xp) / this.xpNext, 7);
    this.hpText.setText(`${Math.ceil(this.hp)}/${Math.round(this.stats.maxHp)}`);
    this.waveText.setText(`WAVE ${this.spawner.wave}/${this.level.waves}`);
    this.coinText.setText(String(Math.round(this.coinsEarned * this.stats.coinMult)));
    this.lvlText.setText(`LV ${this.runLevel}`);

    const bg = this.barGfx;
    bg.clear();
    if (this.boss && this.boss.active) {
      g.fillStyle(0x000000, 1).fillRect(38, 56, W - 76, 14);
      g.fillStyle(0x56b53a, 1).fillRect(40, 58, ((W - 80) * Math.max(0, this.boss.hp)) / this.boss.maxHp, 10);
      this.bossText.setText('GIANT BACTERIUM');
    } else this.bossText.setText('');
    // Small health bars over tough enemies.
    for (const e of this.liveEnemies()) {
      if (e.def.boss || e.hp >= e.maxHp || e.maxHp < 30) continue;
      const w = 26;
      bg.fillStyle(0x000000, 0.8).fillRect(e.x - w / 2 - 1, e.y - e.displayHeight / 2 - 8, w + 2, 5);
      bg.fillStyle(0xff3b5c, 1).fillRect(e.x - w / 2, e.y - e.displayHeight / 2 - 7, (w * e.hp) / e.maxHp, 3);
    }
  }

  refreshStanceIcons() {
    this.stanceHud.removeAll(true);
    let x = 52;
    for (const [id, lvl] of Object.entries(this.stances)) {
      if (!lvl) continue;
      const def = STANCES[id];
      this.stanceHud.add(this.add.image(x, 50, def.icon).setScale(2).setTint(def.color));
      this.stanceHud.add(text(this, x + 11, 55, lvl === STANCE_MAX ? '★' : String(lvl), 9, '#ffffff'));
      x += 30;
    }
  }

  burst(x, y, color, n = 10) {
    this.fx.particleTint = color;
    this.fx.explode(n, x, y);
  }

  floatText(x, y, str, color) {
    if (this.floatCount > 20) return;
    this.floatCount += 1;
    const t = text(this, x, y, str, 12, color).setDepth(15);
    this.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 600, onComplete: () => { t.destroy(); this.floatCount -= 1; } });
  }

  showBanner(str, color = '#ffffff') {
    const t = text(this, W / 2, 260, str, 32, color).setDepth(30).setScale(0.3).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 250, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, y: 230, delay: 1100, duration: 400, onComplete: () => t.destroy() });
  }

  toast(str, color = '#ffffff') {
    const t = text(this, W / 2, 330, str, 14, color).setDepth(30);
    this.tweens.add({ targets: t, y: 300, alpha: 0, delay: 1600, duration: 500, onComplete: () => t.destroy() });
  }
}
