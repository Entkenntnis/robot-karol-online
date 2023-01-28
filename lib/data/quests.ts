import { deserlizeQuestToData } from '../commands/json'
import { QuestData } from '../state/types'

export const questData: { [key: number]: QuestData } = {
  1: {
    ...deserlizeQuestToData(require('./quests/1.json')),
  },

  2: {
    title: 'Wiederholung mit fester Anzahl',
    description: `
      Häufig soll Karol eine Folge von Befehlen mehrfach wiederholen.
      Um keine langwierigen Programme schreiben zu müssen, gibt es dafür den Block \`wiederhole {anzahl} mal\`.
      
      Erfülle den folgenden Auftrag, indem du das Muster erkennst und passend oft wiederholst.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Ziegel und Marken im Wechsel',
        start: {
          dimX: 17,
          dimY: 1,
          height: 6,
          karol: { x: 0, y: 0, dir: 'east' },
          bricks: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
          marks: [
            [
              true,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
            ],
          ],
          blocks: [
            [
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
            ],
          ],
        },
        target: {
          dimX: 21,
          dimY: 1,
          height: 6,
          karol: { x: 0, y: 0, dir: 'east' },
          bricks: [[0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]],
          marks: [
            [
              true,
              false,
              true,
              false,
              true,
              false,
              true,
              false,
              true,
              false,
              true,
              false,
              true,
              false,
              true,
              false,
              true,
            ],
          ],
          blocks: [
            [
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
            ],
          ],
        },
      },
    ],
  },

  3: {
    ...deserlizeQuestToData(require('./quests/3.json')),
    difficulty: 'Tutorial',
  },

  4: {
    title: 'Wiederholung mit Bedingung',
    description: `
      Karol kann nur das Feld direkt vor sich wahrnehmen.
      Um bis zur Wand laufen zu können, muss sie in kleinen Schritten gehen und stoppen, sobald sie die Wand vor sich hat.

      Für diesen Algorithmus gibt es den Block \`wiederhole solange\`.
      Mit der passenden Bedingung kannst du Karol zur Wand navigieren.
      Setze dann dort eine Marke.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Über den Berg',
        start: {
          dimX: 8,
          dimY: 3,
          height: 6,
          karol: { x: 7, y: 1, dir: 'west' },
          bricks: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 2, 3, 2, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
          ],
        },
        target: {
          dimX: 8,
          dimY: 3,
          height: 6,
          karol: { x: 6, y: 1, dir: 'west' },
          bricks: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 2, 3, 2, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false, false, false],
            [true, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
          ],
        },
      },
      {
        title: 'Lücke schließen',
        start: {
          dimX: 5,
          dimY: 5,
          height: 6,
          karol: { x: 2, y: 4, dir: 'north' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [true, true, false, true, true],
            [true, false, false, false, true],
            [true, false, false, false, true],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
        target: {
          dimX: 5,
          dimY: 5,
          height: 6,
          karol: { x: 2, y: 4, dir: 'north' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [true, true, true, true, true],
            [true, false, false, false, true],
            [true, false, false, false, true],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
      },
    ],
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
}
