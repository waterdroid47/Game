// FORMAT EXAMPLE (not used by the game). Each sprite: { fps, frames: [frame, ...] }.
// A frame is a list of equal-length rows; one character = one pixel; '.' = transparent,
// '0'-'f' = colours from src/art/palette.js. All frames of a sprite have the same size.
export default {
  example_blob: {
    fps: 4,
    frames: [
      [
        '..0000..',
        '.0bbbb0.',
        '0bb7bbb0',
        '0b0bb0b0',
        '0bbbbbb0',
        '.033330.',
        '..0000..',
      ],
      [
        '........',
        '.000000.',
        '0bb7bbb0',
        '0b0bb0b0',
        '0bbbbbb0',
        '03333330',
        '.000000.',
      ],
    ],
  },
};
