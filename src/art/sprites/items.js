// Pickups, currency icons, UI stars and the castle wall tile. Light comes from the top-left.
export default {
  // Wooden treasure chest dropped by monsters: brown planks, gold corner bands and latch.
  chest: {
    fps: 0,
    frames: [
      [
        '.0000000000.',
        '07ffffffff90',
        '0a4444444290',
        '0a2220022290',
        '000007a00000',
        '0a440a904290',
        '0a4440044290',
        '0a2222222290',
        '094444422290',
        '.0000000000.',
      ],
    ],
  },
  // Royal chest: purple with gold trim and a pink gem set in a gold lock plate.
  chestRare: {
    fps: 0,
    frames: [
      [
        '..00000000..',
        '.07aaaaaa90.',
        '0a7ddddddd90',
        '0a222aa22290',
        '0aaaa7eaaa90',
        '0addae2a2290',
        '0add29922290',
        '0ad222222290',
        '099999999990',
        '.0000000000.',
      ],
    ],
  },
  coin: {
    fps: 0,
    frames: [
      [
        '..000..',
        '.0aaa0.',
        '0a7aa90',
        '0a7aa90',
        '0aaa990',
        '.09990.',
        '..000..',
      ],
    ],
  },
  // Premium currency: faceted pink gem.
  gem: {
    fps: 0,
    frames: [
      [
        '..000..',
        '.077e0.',
        '07eeee0',
        '0e7e220',
        '.0ee20.',
        '.0e220.',
        '..020..',
        '...0...',
      ],
    ],
  },
  heart: {
    fps: 0,
    frames: [
      [
        '.00.00.',
        '0780880',
        '0788820',
        '.08820.',
        '..080..',
        '...0...',
      ],
    ],
  },
  lock: {
    fps: 0,
    frames: [
      [
        '..000..',
        '.07650.',
        '.06050.',
        '0000000',
        '0776660',
        '066a650',
        '055a550',
        '.00000.',
      ],
    ],
  },
  star: {
    fps: 0,
    frames: [
      [
        '...0...',
        '..070..',
        '000a000',
        '07aaa90',
        '.0aa90.',
        '.0a0a0.',
        '.00.00.',
      ],
    ],
  },
  // Same silhouette as star, hollow and dark so it reads as "not earned".
  starEmpty: {
    fps: 0,
    frames: [
      [
        '...5...',
        '..515..',
        '5551555',
        '5111115',
        '.51115.',
        '.51515.',
        '.55.55.',
      ],
    ],
  },
  // Castle wall top, tiled horizontally along the bottom of the screen (pattern repeats every 16 px).
  wall: {
    fps: 0,
    frames: [
      [
        '.0000000000.....',
        '.0776656650.....',
        '.0766566550.....',
        '.0655555550.....',
        '0000000000000000',
        '0766666607666666',
        '0666666506666665',
        '0555555505555555',
        '0000000000000000',
        '6666076666660766',
        '6665066666650666',
        '5555055555550555',
      ],
    ],
  },
};
