import { OverviewMapData } from '../state/types'
import { chaptersMap } from './chapters'

export const mapData: {
  [key: number]: OverviewMapData
} = {
  1: { x: 101, y: 0, deps: [] },
  48: { x: 300, y: 30, deps: [1] },
  47: { x: 200, y: 100, deps: [1] },
  39: { x: 90, y: 200, deps: [1] },
  49: { x: 340, y: 160, deps: [47, 48] },
  6: { x: 220, y: 260, deps: [39, 47] },
  41: { x: 400, y: 280, deps: [6, 49] },
  65: { x: 750, y: 30, deps: [44] },

  60: { x: 545, y: 343, deps: [41, 49] },

  18: { x: 110, y: 400, deps: [6, 39] },

  53: { x: 220, y: 540, deps: [18, 30] },

  54: { x: 100, y: 610, deps: [53] },

  44: { x: 450, y: 55, deps: [48] },

  32: { x: 620, y: 95, deps: [44] },

  30: { x: 320, y: 400, deps: [6] },

  2: { x: 510, y: 180, deps: [48, 49] },

  43: { x: 620, y: 300, deps: [2, 41] },

  40: { x: 710, y: 200, deps: [2, 32] },

  17: { x: 870, y: 110, deps: [32, 40] },

  42: { x: 590, y: 450, deps: [30, 41] },

  31: { x: 800, y: 380, deps: [42, 43] },

  10: { x: 920, y: 320, deps: [40, 43] },

  23: { x: 470, y: 510, deps: [30, 41] },

  9: { x: 670, y: 550, deps: [23] },

  7: { x: 830, y: 520, deps: [9, 42] },

  22: { x: 970, y: 500, deps: [7, 10, 31], dir: 'south' },

  // end of part 1

  35: { x: 820, y: 650, deps: [22], dir: 'west' },

  29: { x: 990, y: 630, deps: [22], dir: 'west' },

  25: { x: 1090, y: 680, deps: [22], dir: 'west' },

  26: { x: 1160, y: 810, deps: [25], dir: 'west' },

  36: { x: 650, y: 680, deps: [35], dir: 'west' },

  14: { x: 1000, y: 900, deps: [25], dir: 'west' },

  27: { x: 750, y: 780, deps: [29, 35], dir: 'west' },

  55: { x: 900, y: 820, deps: [25, 29, 35], dir: 'west' },

  24: { x: 570, y: 810, deps: [36, 27], dir: 'west' },

  4: { x: 640, y: 900, deps: [27], dir: 'west' },

  58: { x: 730, y: 950, deps: [55, 14, 27], dir: 'west' },

  56: { x: 830, y: 1030, deps: [55, 14], dir: 'west' },

  45: { x: 690, y: 1180, deps: [56], dir: 'west' },

  12: { x: 490, y: 960, deps: [4, 24, 58], dir: 'west' },

  64: { x: 560, y: 1060, deps: [4, 56, 58], dir: 'west' },

  57: { x: 850, y: 1180, deps: [56], dir: 'west' },

  59: { x: 740, y: 1310, deps: [57], dir: 'west' },

  28: { x: 1100, y: 1040, deps: [14], dir: 'west' },

  5: { x: 410, y: 900, deps: [24], dir: 'west' },

  37: { x: 280, y: 890, deps: [5], dir: 'west' },

  13: { x: 350, y: 1090, deps: [12, 64, 5], dir: 'south' },

  // end of part 2

  16: { x: 180, y: 1050, deps: [13] },

  33: { x: 210, y: 1180, deps: [13] },

  19: { x: 300, y: 1260, deps: [13] },

  15: { x: 500, y: 1220, deps: [13] },

  // 34: {x: 950, y: 600, deps:[22] },

  50: { x: 425, y: 1340, deps: [13] },

  51: { x: 550, y: 1400, deps: [13] },

  52: { x: 180, y: 1330, deps: [13] },

  // python
  // 61: { x: 1000, y: 1470, deps: [], dir: 'south' },
  /*62: { x: 830, y: 1520, deps: [61], dir: 'west' },
  63: { x: 960, y: 1660, deps: [61], dir: 'west' },
  65: { x: 650, y: 1660, deps: [61], dir: 'west' },
  66: { x: 550, y: 1800, deps: [61], dir: 'west' },
  67: { x: 790, y: 1720, deps: [61], dir: 'west' },
  68: { x: 1100, y: 1620, deps: [61], dir: 'west' },
  69: { x: 830, y: 1840, deps: [61], dir: 'west' },*/
  ...chaptersMap,
}
