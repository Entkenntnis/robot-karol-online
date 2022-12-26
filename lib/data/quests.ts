import { deserializeQuest, deserlizeQuestToData } from '../commands/json'
import { QuestData } from '../state/types'

export const questData: { [key: number]: QuestData } = {
  1: {
    title: 'Start',
    description: `
      Herzlich Willkommen bei Robot Karol Online!
      Das ist dein Einstieg in die spannende Welt der Algorithmen.
      Es warten viele Herausforderungen auf dich, die dein logisches Denken und deine Kreativität unter Beweis stellen.
      
      Mache dich als erstes mit der Programmierumgebung vertraut und löse den Auftrag "Drei Ziegel".
      Ziehe dazu Blöcke auf die Arbeitsfläche und verbinde sie zu einem Programm.
      Öffne den Auftrag, um dein Programm zu testen.

      Für Robot Karol gibt es im Internet viele Anleitungen und Erklärvideos.
      Schaue dir diese an, wenn du unsicher bist, was die Befehle machen.
      Für den Anfang reichen dir \`Hinlegen\` und \`Schritt\`.

      Sobald du fertig bist, kannst du dein Programm überprüfen.
      Wenn du alle Aufträge erfüllst und kein Fehler auftritt, schließst du die Aufgabe ab.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Drei Ziegel',
        start: {
          dimX: 7,
          dimY: 1,
          height: 6,
          karol: { x: 0, y: 0, dir: 'east' },
          bricks: [[0, 0, 0, 0, 0, 0, 0]],
          marks: [[false, false, false, false, false, false, false]],
          blocks: [[false, false, false, false, false, false, false]],
        },
        target: {
          dimX: 7,
          dimY: 1,
          height: 6,
          karol: { x: 0, y: 0, dir: 'east' },
          bricks: [[0, 1, 0, 1, 0, 1, 0]],
          marks: [[false, false, false, false, false, false, false]],
          blocks: [[false, false, false, false, false, false, false]],
        },
      },
    ],
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
    title: 'Kontrollstrukturen verbinden',
    description: `
      Karol kann mehrere Dinge gleichzeitig tun - zum Beispiel bis zur Wand laufen und nach Ziegeln Ausschau halten.
      Wiederholungen und bedingte Anweisungen können nacheinander ausgeführt werden oder auch ineinander verschachtelt sein.
      Die richtige Kombination macht's.

      Laufe bis zur Wand setze auf jedem Ziegel eine Marke. Verschachtle dafür zwei Kontrollstrukturen.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Beispiel 1',
        start: {
          dimX: 9,
          dimY: 3,
          height: 3,
          karol: { x: 0, y: 1, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 1, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
          ],
        },
        target: {
          dimX: 9,
          dimY: 3,
          height: 3,
          karol: { x: 0, y: 1, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 1, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false, false, false, false],
            [false, true, true, false, true, false, true, true, false],
            [false, false, false, false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
          ],
        },
      },

      {
        title: 'Beispiel 2',
        start: {
          dimX: 9,
          dimY: 3,
          height: 3,
          karol: { x: 8, y: 1, dir: 'west' },
          bricks: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 2, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
          ],
        },
        target: {
          dimX: 9,
          dimY: 3,
          height: 3,
          karol: { x: 0, y: 1, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 2, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false, false, false, false],
            [true, false, true, true, true, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
          ],
        },
      },

      {
        title: 'Beispiel 3',
        start: {
          dimX: 3,
          dimY: 9,
          height: 3,
          karol: { x: 1, y: 8, dir: 'north' },
          bricks: [
            [1, 0, 1],
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
            [1, 0, 1],
            [0, 1, 0],
            [0, 1, 0],
            [1, 0, 1],
            [1, 0, 1],
          ],
          marks: [
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
          ],
          blocks: [
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
          ],
        },
        target: {
          dimX: 3,
          dimY: 9,
          height: 3,
          karol: { x: 1, y: 8, dir: 'west' },
          bricks: [
            [1, 0, 1],
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
            [1, 0, 1],
            [0, 1, 0],
            [0, 1, 0],
            [1, 0, 1],
            [1, 0, 1],
          ],
          marks: [
            [false, false, false],
            [false, false, false],
            [false, true, false],
            [false, false, false],
            [false, false, false],
            [false, true, false],
            [false, true, false],
            [false, false, false],
            [false, false, false],
          ],
          blocks: [
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
          ],
        },
      },
    ],
  },

  6: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    difficulty: 'einfach',
  },

  7: {
    ...deserlizeQuestToData(require('./quests/7.json')),
    difficulty: 'einfach',
  },

  8: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 8',
    difficulty: 'mittel',
  },

  9: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 9',
    difficulty: 'mittel',
  },

  10: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 10',
    difficulty: 'einfach',
  },

  11: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 11',
    difficulty: 'einfach',
  },

  12: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 12',
    difficulty: 'mittel',
  },

  13: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 13',
    difficulty: 'schwer',
  },

  14: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 14',
    difficulty: 'einfach',
  },

  15: {
    ...deserlizeQuestToData(require('./quests/6.json')),
    title: 'Quest 15',
    difficulty: 'schwer',
  },
}
