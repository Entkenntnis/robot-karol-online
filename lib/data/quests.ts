import { QuestData } from '../state/types'

export const questData: { [key: number]: QuestData } = {
  1: {
    title: 'Erste Schritte',
    description: `
      Herzlich Willkommen bei Robot Karol Quest! Auf dieser Webseite lernst du, wie du die kleine Roboterin Karol
      in ihrer Bildschirmwelt steuerst und stellst dabei dein Programmiergeschick unter Beweis.
      Das Tutorial macht dich mit den Grundlagen dafür vertraut.

      Du programmierst, indem du Blöcke aus der Auswahl auf die Arbeitsfläche ziehst und verbindest.
      Verbundene Blöcke werden von oben nach unten ausgeführt.
      Die grundlegenden Blöcke sind \`Schritt\` und \`Hinlegen\`. 

      Jetzt bist du startklar. Klicke auf den ersten Auftrag "Ziegelsteine legen"
      und schreibe ein Programm, das die drei angezeigten Ziegel legt.
      Starte dann dein Programm.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Ziegelsteine legen',
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
      Konzept Kontrollstruktur

      Aufbau: Einklammerung von Befehlen

      Wiederholung mit fester Anzahl, praktisch für häufig wiederholte Aufgaben

      einzelner Auftrag (Level nachbauen)

      Konzept MarkeSetzen
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Ziegel und Marken im Wechsel',
        start: {
          dimX: 21,
          dimY: 1,
          height: 6,
          karol: { x: 0, y: 0, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
          marks: [
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
          bricks: [
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          ],
          marks: [
            [
              false,
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
      Wenn Karol nur vorgegebene Muster legen soll, dann langweilit sie sich schnell.
      Interessant werden Programme, wenn sie auf die Welt herum reagieren können.
      
      Zusammenhang mit Bedingungen

      Einseitig, zweiseitig

      UI: Quest besteht aus mehreren Aufträgen, diese müssen mit gleichem Programm erfüllt werden.

      Kleine Rundschau von verfügbaren Bedingungen
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Ziegelsteine legen',
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

  4: {
    title: 'Wiederholung mit Bedingung',
    description: `
      Thema: Verbindung von Wiederholung mit Bedingung.  

      Ein solches Element ist die Wiederholung mit Bedingung.

      Der Block dazu heißt \`wiederhole solange\`. Dieser Block enthält zwei Lücken:
      In die Lücke mit der Form eines Puzzle-Stücks kommt die Bedingung.
      Diese gibt an, wie lange die Wiederholung dauern soll, wie zum Beispiel \`NichtIstWand\`.
      In die zweite Lücke plazierst du die Befehle, die wiederholt werden.
      Diese sind dann vom äußeren Block eingeklammert.

      Diese Quest enthält zwei Aufträge, deine Aufgaben in beiden lautet:
      Laufe bis zur Wand und setze eine Marke.

      Block: zählt auch als Wand.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Durch die Ziegel',
        start: {
          dimX: 8,
          dimY: 3,
          height: 6,
          karol: { x: 6, y: 1, dir: 'west' },
          bricks: [
            [1, 1, 0, 0, 0, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
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
            [1, 1, 0, 0, 0, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
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
        title: 'Lücke füllen',
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
    title: 'Ziegel zählen im hohen Norden',
    description: `
      Eigentlich sind damit alle Elemente gezeigt.

      Mehrere Kontrollstrukturen können nacheinander geschaltet werden.
      Kontrollstrukturen können auch verschachtelt werden.

      Zwei Künste:
      
      - Kombination aus Kontrollstrukturen
      
      - sich Dinge merken, indem man die Welt modifiziert (z.B. Marke, etc.)

      Kommentare können den Code erklären.
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: 'Ziegelsteine legen',
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
}
