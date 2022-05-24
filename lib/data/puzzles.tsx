import { Puzzle } from '../state/types'

export const puzzles: Puzzle[] = [
  {
    id: 1,
    title: 'Start',
    posX: 3,
    posY: 3,
    deps: [],
    description: (
      <>
        <p className="mb-2">
          Herzlich Willkommen bei Robot Karol! In diesem Bereich lernst du im
          Rahmen eines entspanntes Bau- und Puzzlespiel die ersten Grundlagen
          der Programmierung kennen. Fangen wir mit dieser kleinen Welt an:
        </p>
        <img
          src="/puzzle/start.png"
          alt="target"
          className="mx-auto my-3 h-[180px]"
        ></img>
        <p className="mb-2">
          Klicke dafür auf Karol und steuere ihn mit den Pfeiltasten. Es ist
          bereits ein kleines Programm für dich vorbereitet. Die transparenten
          Ziegel zeigen, was bei der Ausführung des Programms passiert. Bewege
          zuerst Karol in die passende Position und drücke dann die Taste{' '}
          <strong>S</strong> (oder die Taste Start) um das Programm zu starten
          und die Ziegel zu legen.
        </p>
      </>
    ),
    targetWorld: {
      dimX: 10,
      dimY: 10,
      height: 6,
      karol: { x: 0, y: 0, dir: 'south' },
      bricks: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      marks: [
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
      ],
      blocks: [
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
      ],
    },
    code: `Hinlegen
Schritt
LinksDrehen
Hinlegen
RechtsDrehen
Hinlegen
Schritt
LinksDrehen
Hinlegen
RechtsDrehen
Schritt`,
  },

  {
    id: 2,
    title: 'Smiley',
    posX: 7,
    posY: 3,
    deps: [1],
    description: (
      <>
        <p className="mb-2">Baue bei dieser Aufgabe einen Smiley:</p>
        <img
          src="/puzzle/smiley.png"
          alt="target"
          className="mx-auto my-3 h-[180px]"
        ></img>
        <p className="mb-2">
          Es gibt wieder ein Programm, doch es ist unvollständig. Du kannst die
          fehlenden Teile per Hand bauen: Deaktiviere zuerst die Vorschau, in
          dem du unten links den Haken entfernst. Drücke die Taste{' '}
          <strong>H</strong>, um vor dir einen Ziegel zu legen und die Taste{' '}
          <strong>M</strong>, um unter dir eine Marke zu setzen. Mit der Taste{' '}
          <strong>A</strong> kannst du Ziegel wieder aufheben.
        </p>
      </>
    ),
    targetWorld: {
      dimX: 7,
      dimY: 7,
      height: 6,
      karol: { x: 6, y: 0, dir: 'east' },
      bricks: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      marks: [
        [false, false, false, false, false, false, false],
        [false, false, true, false, true, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
      ],
      blocks: [
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
      ],
    },
    code: `Hinlegen
Schritt
RechtsDrehen
Schritt
LinksDrehen
Hinlegen
Schritt
Hinlegen
Schritt
Hinlegen
Schritt
Schritt
LinksDrehen
Hinlegen
    `,
    initWorld: (world) => {
      world.karol.dir = 'east'
    },
  },
]

export const paths: {
  [key: number]: { [key: number]: { x: number; y: number }[] }
} = {
  2: {
    1: [
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
    ],
  },
}
