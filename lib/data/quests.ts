import { QuestData } from '../state/types'

export const questData: { [key: number]: QuestData } = {
  1: {
    title: 'Erste Schritte',
    description: `
      Herzlich Willkommen bei Robot Karol Quest! Auf dieser Website lernst du, wie du die Roboterin Karol
      in ihrer Bildschirmwelt steuerst und stellst dabei dein Programmiergeschick unter Beweis.
      Das Tutorial macht dich mit den Grundlagen dafür vertraut:

      Du programmierst, indem du Blöcke aus der Auswahl auf die Arbeitsfläche ziehst und verbindest.
      Verbundene Blöcke werden von oben nach unten ausgeführt.
      Im ersten Auftrag "Drei Ziegel" geht es darum, die gezeigte Welt nachzubauen.

      Klicke auf den Auftrag und schreibe dein erstes Programm.
      Beginne mit den Blöcken \`Hinlegen\` und \`Schritt\`.
      Starte dann dein Programm.
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
      Die violetten Blöcken stellen Befehle dar, die Karol ausführt.
      Diese kennst aus dem ersten Tutorial.
      Die nächsten Tutorials werden sich mit den grünen Blöcken beschäftigen, die Kontrollstrukturen darstellen.

      In diesem Tutorial geht es um den Block \`wiederhole n mal\`.
      Wie der Name schon andeutet lassen sich damit Befehle mehrfach ausführen.
      In der Fachsprache spricht man von einer Wiederholung mit fester Anzahl.

      Ziehe den Block auf die Arbeitsfläche.
      Wenn du auf die Zahl klickst, kannst du die Anzahl der Wiederholungen ändern.
      Füge nun einen oder mehrere Befehle dazwischen ein, um diese zu wiederholen.

      Beim folgenden Auftrag kommt dir das gelegen, denn du sollst hier ein wiederholendes Muster aus Ziegeln und Marken legen.
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
      Wenn Karol nur vorgegebene Muster legen soll, dann langweilt sie sich schnell.
      Interessant werden Programme, wenn sie auf die Welt herum reagieren können.
      Dazu gibt es die blauen Blöcke, die wie Puzzle-Teile aussehen. Diese stellen Bedingungen dar.
      Damit kann Karol wahrnehmen, was unter und vor ihr passiert.

      Der Block \`wenn dann sonst\` nimmt eine solche Bedingung.
      Ziehe diesen Block auf die Arbeitsfläche.
      Fülle ihn mit der Bedingung \`IstMarke\`.
      Damit erhältst du die Kontrollstruktur der zweiseitig bedingten Anweisung.

      Die zweiseitig bedingte Anweisung enthält zwei Lücken. Die obere Lücke wird ausgeführt, wenn die Bedingung erfüllt ist.
      Die untere Lücke wird ausgeführt, wenn die Bedingung nicht erfüllt ist. Es gibt auch eine Version ohne zweite Lücke.
      Diese heißt entsprechend einseitig bedingte Anweisung.

      Diese Quest besitzt zwei Aufträge. Schreibe ein Programm, dass beide Aufträge erfüllt. Nutze dafür eine bedingte Anweisung.
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
    title: 'Kontrollstrukturen verbinden',
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
