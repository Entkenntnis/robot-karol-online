import { deserializeQuest, deserlizeQuestToData } from '../commands/json'
import { QuestData } from '../state/types'

export const questData: { [key: number]: QuestData } = {
  1: {
    title: 'Start',
    description: `
      Herzlich Willkommen bei Robot Karol Online.
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
    title: 'Bedingte Anweisung',
    description: `
      Diese Aufgabe enthält zwei Aufträge, die scheinbar ganz unterschiedliche Dinge tun:
      Einmal wird ein Ziegel vor Karol abgelegt, einmal dahinter.
      Trotzdem sollen beide Aufträge mit einem Programm gelöst werden.

      Möglich macht das eine bedingte Anweisung, erkennbar an dem Schlüsselwort \`wenn\`.
      Damit kann Karol auf die Welt um sie herum reagieren.
      In diesem Fall soll Karol erkennen, ob sie auf einer Marke steht oder nicht.

      Nutze für diese Aufgabe zum Beispiel den Block \`wenn dann sonst\` und die Bedingung \`IstMarke\`.
      Es gibt auch andere Lösungswege.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Steht auf Marke ➔ lege Ziegel vor sich',
        start: {
          dimX: 5,
          dimY: 3,
          height: 6,
          karol: { x: 2, y: 1, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, true, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
        target: {
          dimX: 5,
          dimY: 3,
          height: 6,
          karol: { x: 1, y: 1, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, true, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
      },
      {
        title: 'Steht nicht auf Marke ➔ lege Ziegel hinter sich',
        start: {
          dimX: 5,
          dimY: 3,
          height: 6,
          karol: { x: 2, y: 1, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
        target: {
          dimX: 5,
          dimY: 3,
          height: 6,
          karol: { x: 1, y: 1, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
      },
    ],
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
    ...deserlizeQuestToData(require('./quests/test.json')),
    difficulty: 'einfach',
  },
}
