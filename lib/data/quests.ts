import { deserlizeQuestToData } from '../commands/json'
import { QuestData } from '../state/types'

export const questData: { [key: number]: QuestData } = {
  1: {
    ...deserlizeQuestToData(require('./quests/1.json')),
  },

  2: {
    ...deserlizeQuestToData(require('./quests/2.json')),
  },

  /* 3: {
    ...deserlizeQuestToData(require('./quests/3.json')),
  },*/

  4: {
    ...deserlizeQuestToData(require('./quests/4.json')),
  },

  5: {
    ...deserlizeQuestToData(require('./quests/5.json')),
  },

  6: {
    ...deserlizeQuestToData(require('./quests/6.json')),
  },

  7: {
    ...deserlizeQuestToData(require('./quests/7.json')),
  },

  /*8: {
    ...deserlizeQuestToData(require('./quests/8.json')),
  },*/

  9: {
    ...deserlizeQuestToData(require('./quests/9.json')),
  },

  10: {
    ...deserlizeQuestToData(require('./quests/10.json')),
  },

  /*11: {
    ...deserlizeQuestToData(require('./quests/11.json')),
  },*/

  12: {
    ...deserlizeQuestToData(require('./quests/12.json')),
  },

  13: {
    ...deserlizeQuestToData(require('./quests/13.json')),
  },

  14: {
    ...deserlizeQuestToData(require('./quests/14.json')),
  },

  15: {
    ...deserlizeQuestToData(require('./quests/15.json')),
  },

  16: {
    ...deserlizeQuestToData(require('./quests/16.json')),
  },

  17: {
    ...deserlizeQuestToData(require('./quests/17.json')),
  },

  18: {
    ...deserlizeQuestToData(require('./quests/18.json')),
  },

  19: {
    ...deserlizeQuestToData(require('./quests/19.json')),
  },

  20: {
    ...deserlizeQuestToData(require('./quests/20.json')),
  },

  21: {
    ...deserlizeQuestToData(require('./quests/21.json')),
  },

  22: {
    ...deserlizeQuestToData(require('./quests/22.json')),
  },

  23: {
    ...deserlizeQuestToData(require('./quests/23.json')),
  },

  24: {
    ...deserlizeQuestToData(require('./quests/24.json')),
  },

  25: {
    ...deserlizeQuestToData(require('./quests/25.json')),
  },

  26: {
    ...deserlizeQuestToData(require('./quests/26.json')),
  },

  27: {
    ...require('./quests/27.json'),
  },

  28: {
    ...deserlizeQuestToData(require('./quests/28.json')),
  },

  29: {
    ...deserlizeQuestToData(require('./quests/29.json')),
  },

  30: {
    ...deserlizeQuestToData(require('./quests/30.json')),
  },

  31: {
    ...deserlizeQuestToData(require('./quests/31.json')),
  },

  32: {
    ...deserlizeQuestToData(require('./quests/32.json')),
  },

  33: {
    ...deserlizeQuestToData(require('./quests/33.json')),
  },

  /*34: {
    ...deserlizeQuestToData(require('./quests/34.json')),
  },*/

  35: {
    ...deserlizeQuestToData(require('./quests/35.json')),
  },

  36: {
    ...deserlizeQuestToData(require('./quests/36.json')),
  },

  37: {
    ...deserlizeQuestToData(require('./quests/37.json')),
  },

  38: {
    ...deserlizeQuestToData(require('./quests/38.json')),
  },

  39: {
    ...deserlizeQuestToData(require('./quests/39.json')),
  },

  40: {
    ...deserlizeQuestToData(require('./quests/40.json')),
  },

  41: {
    ...deserlizeQuestToData(require('./quests/41.json')),
  },

  42: {
    ...deserlizeQuestToData(require('./quests/42.json')),
  },

  43: {
    ...deserlizeQuestToData(require('./quests/43.json')),
  },

  44: {
    ...deserlizeQuestToData(require('./quests/44.json')),
  },

  45: {
    ...deserlizeQuestToData(require('./quests/45.json')),
  },

  /*46: {
    ...deserlizeQuestToData(require('./quests/46.json')),
  },*/

  47: {
    ...deserlizeQuestToData(require('./quests/47.json')),
  },

  48: {
    ...deserlizeQuestToData(require('./quests/48.json')),
  },

  49: {
    ...deserlizeQuestToData(require('./quests/49.json')),
  },

  50: {
    ...deserlizeQuestToData(require('./quests/50.json')),
  },

  51: {
    ...deserlizeQuestToData(require('./quests/51.json')),
  },

  52: {
    ...deserlizeQuestToData(require('./quests/52.json')),
  },

  53: {
    ...deserlizeQuestToData(require('./quests/53.json')),
  },

  54: {
    ...deserlizeQuestToData(require('./quests/54.json')),
  },

  55: {
    ...deserlizeQuestToData(require('./quests/55.json')),
  },

  56: {
    ...deserlizeQuestToData(require('./quests/56.json')),
  },

  57: {
    ...deserlizeQuestToData(require('./quests/57.json')),
  },

  58: {
    ...deserlizeQuestToData(require('./quests/58.json')),
  },

  59: {
    ...deserlizeQuestToData(require('./quests/59.json')),
  },

  60: {
    ...deserlizeQuestToData(require('./quests/60.json')),
  },

  64: {
    ...deserlizeQuestToData(require('./quests/64.json')),
  },

  // python

  61: {
    ...deserlizeQuestToData(require('./quests/61.json')),
  },

  62: {
    ...deserlizeQuestToData(require('./quests/62.json')),
  },

  63: {
    ...deserlizeQuestToData(require('./quests/63.json')),
  },
}
