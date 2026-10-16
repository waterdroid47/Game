// Hero group: the player guard (seen from behind, aiming up), its magic bolt, the orbiting
// shield, and the enemy projectiles that fly down at it.
export default {
  // The player: steel helmet, gold pauldrons, blue cape that sways; crossbow raised with a glowing tip.
  guard: {
    fps: 3,
    frames: [
      [
        '.......1c1........',
        '......1c7c1.......',
        '......1c7c1.......',
        '...00000700000....',
        '.009999979999900..',
        '09944449744444440.',
        '04000009740000040.',
        '.0..0ff944ff0..0..',
        '...0cc00800c10....',
        '..0cc0778650c10...',
        '.0cc067686650c10..',
        '07aa066626650aa90.',
        '0a990666665509990.',
        '.0ccc0555550c110..',
        '.0cccc00000c1110..',
        '0ccc1ccc1ccc1c110.',
        '0ccc1ccc1ccc1c110.',
        '.0000440.0440000..',
      ],
      [
        '.......c7c........',
        '......1c7c1.......',
        '......1c7c1.......',
        '...00000700000....',
        '.009999979999900..',
        '09944449744444440.',
        '04000009740000040.',
        '.0..0ff944ff0..0..',
        '...0cc00800c10....',
        '..0cc0778650c10...',
        '.0cc067686650c10..',
        '07aa066626650aa90.',
        '0a990666665509990.',
        '.0ccc0555550c110..',
        '.0cccc00000c11110.',
        '.0ccc1ccc1ccc1c110',
        '.0ccc1ccc1ccc1c110',
        '..000440.04400000.',
      ],
    ],
  },
  // Player bolt flying up: white core, blue glow, pointed tip, fading tail.
  bolt: {
    fps: 0,
    frames: [
      [
        '.7.',
        '777',
        'c7c',
        'c7c',
        '1c1',
        '.c.',
        '.1.',
      ],
    ],
  },
  // Skeleton projectile: a small bone (rotated in game to spin).
  bone: {
    fps: 0,
    frames: [
      [
        '.7...',
        '7770.',
        '.0760',
        '..066',
        '...6.',
      ],
    ],
  },
  // Enemy fireball falling down: hot core, flame tongues trailing up, flickering.
  fireball: {
    fps: 8,
    frames: [
      [
        '..2....',
        '.898.2.',
        '.89998.',
        '89a7a98',
        '8a777a8',
        '.89a98.',
        '..888..',
      ],
      [
        '....2..',
        '.2.898.',
        '.89a98.',
        '89aaa98',
        '8aa7aa8',
        '.89a98.',
        '..888..',
      ],
    ],
  },
  // Homing spirit: pale wisp head with little eyes, flickering tail below.
  spirit: {
    fps: 8,
    frames: [
      [
        '.ccc.',
        'c777c',
        'c171c',
        'c7771',
        '.c71.',
        '.cc1.',
        '..c1.',
        '...1.',
      ],
      [
        '.ccc.',
        'c777c',
        'c171c',
        'c7771',
        '.c71.',
        '.1cc.',
        '.1c..',
        '.1...',
      ],
    ],
  },
  // Orbiting magic shield: round blue shield with a gold diamond emblem.
  shield: {
    fps: 0,
    frames: [
      [
        '..0000..',
        '.07ccc0.',
        '0cc7ac10',
        '0caaa910',
        '0caa9910',
        '0cca9c10',
        '.0cc110.',
        '..0000..',
      ],
    ],
  },
};
