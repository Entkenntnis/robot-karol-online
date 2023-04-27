import { deserlizeQuestToData } from '../commands/json'
import { QuestData } from '../state/types'

export const questData: { [key: number]: QuestData } = {
  1: {
    ...deserlizeQuestToData(require('./quests/1.json')),
  },

  2: {
    ...deserlizeQuestToData(require('./quests/2.json')),
  },

  3: {
    ...deserlizeQuestToData(require('./quests/3.json')),
  },

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

  8: {
    ...deserlizeQuestToData(require('./quests/8.json')),
  },

  9: {
    ...deserlizeQuestToData(require('./quests/9.json')),
  },

  10: {
    ...deserlizeQuestToData(require('./quests/10.json')),
  },

  11: {
    ...deserlizeQuestToData(require('./quests/11.json')),
  },

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

  34: {
    ...deserlizeQuestToData(require('./quests/34.json')),
  },

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
}
