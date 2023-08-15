import { Heading } from '../state/types'

export const mapData: {
  [key: number]: { x: number; y: number; deps: number[]; dir?: Heading }
} = {
  1: {
    x: 101,
    y: 0,
    deps: [],
    dir: 'south',
  },
  48: {
    x: 300,
    y: 30,
    deps: [1],
  },
  47: {
    x: 200,
    y: 100,
    deps: [1],
  },
  39: {
    x: 90,
    y: 200,
    deps: [1],
  },
  49: {
    x: 340,
    y: 180,
    deps: [47, 48],
  },
  6: {
    x: 200,
    y: 260,
    deps: [39, 47],
  },
  41: { x: 400, y: 300, deps: [6, 49] },

  17: { x: 110, y: 400, deps: [6, 39] },

  46: { x: 220, y: 540, deps: [17, 30] },

  45: { x: 100, y: 610, deps: [46] },

  44: { x: 450, y: 55, deps: [48] },

  32: { x: 620, y: 95, deps: [44] },

  30: { x: 320, y: 400, deps: [6] },

  2: { x: 510, y: 180, deps: [48, 49] },

  43: { x: 620, y: 300, deps: [2, 41] },

  40: { x: 710, y: 200, deps: [2, 32] },

  18: { x: 870, y: 110, deps: [32, 40] },

  42: { x: 590, y: 450, deps: [30, 41] },

  31: { x: 800, y: 380, deps: [42, 43] },

  10: { x: 920, y: 320, deps: [40, 43] },

  23: { x: 470, y: 510, deps: [30, 41] },

  9: { x: 670, y: 550, deps: [23] },

  7: { x: 830, y: 520, deps: [9, 42] },

  22: { x: 970, y: 500, deps: [7, 10, 31], dir: 'south' },

  // end of part 1
}
