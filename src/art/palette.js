// One shared 16-colour palette (the PICO-8 palette) so every sprite looks like it belongs
// to the same game. In sprite pixel maps each character is one pixel:
//   '.' = transparent, '0'-'9' and 'a'-'f' = the colours below.
export const PALETTE = {
  0: '#000000', // black (outlines)
  1: '#1d2b53', // dark blue
  2: '#7e2553', // dark purple
  3: '#008751', // dark green
  4: '#ab5236', // brown
  5: '#5f574f', // dark grey
  6: '#c2c3c7', // light grey
  7: '#fff1e8', // white
  8: '#ff004d', // red
  9: '#ffa300', // orange
  a: '#ffec27', // yellow
  b: '#00e436', // green
  c: '#29adff', // blue
  d: '#83769c', // lavender
  e: '#ff77a8', // pink
  f: '#ffccaa', // peach
};
