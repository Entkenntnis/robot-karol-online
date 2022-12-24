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
      {
        title: 'Drei Ziegel 2',
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
      Eine weitere nützliche Kontrollstruktur ist die Wiederholung mit Bedingung.
      Mit dem Block \`wiederhole solange\` und einer Bedingung können Befehle bis zu einem bestimmten Ziel wiederholt werden.

      Ein gängiges Beispiel ist das Laufen bis zu einer Wand.
      Karol soll dabei den Befehl \`Schritt\` solange wiederholen, wie die Bedingung \`NichtIstWand\` gilt.
    
      Lege dann eine Marke, sobald du die Wand erreicht hast.
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
      Kontrollstrukturen können sowohl nacheinander ausgeführt werden, als auch ineinander verschachtelt werden.
      Die Kunst besteht darin, die passende Kombination zu finden.
      Manche Quests löst du schnell - bei anderen wirst du eine Weile brauchen.
      Umso mehr kannst du dich freuen, wenn dir eine solche  Quest schließlich gelingt!

      Bereits bei dieser Quest braucht es mehrere Kontrollstrukturen und ein wenig Programmiergeschick.
      Im Norden von Karol befindet sich ein Ziegelstapel. Gehe dahin.
      Baue den Stapel ab, wenn sich dort genau zwei Ziegel befindet. Setze ansonsten eine Marke.

      Die Bedingungen \`IstZiegel(2)\` und \`NichtIstNorden\` helfen dir. 
    `,
    difficulty: 'Tutorial',
    tasks: [
      {
        title: '2 Ziegel ➔ aufheben',
        start: {
          dimX: 5,
          dimY: 7,
          height: 3,
          karol: { x: 2, y: 4, dir: 'west' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 2, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
        target: {
          dimX: 5,
          dimY: 7,
          height: 3,
          karol: { x: 2, y: 3, dir: 'north' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
      },

      {
        title: '1 Ziegel ➔ Marke setzen',
        start: {
          dimX: 5,
          dimY: 7,
          height: 3,
          karol: { x: 2, y: 6, dir: 'east' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
        target: {
          dimX: 5,
          dimY: 7,
          height: 3,
          karol: { x: 2, y: 3, dir: 'north' },
          bricks: [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, true, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false],
            [false, false, false, false, false],
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
}
