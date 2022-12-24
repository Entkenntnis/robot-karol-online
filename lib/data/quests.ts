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

      Nutze für diese Aufgabe den Block \`wenn dann sonst\` und die Bedingung \`IstMarke\`.
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
