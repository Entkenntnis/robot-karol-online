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
          Herzlich Willkommen! Du hast Spaß am Bauen und Puzzlen? Und du
          möchtest einen Einblick in die Programmierung erhalten? Dann bist du
          hier bei Robot Karol am richtigen Ort!
        </p>
        <p className="mb-2">
          Im Rahmen dieses kleinen Bau- und Puzzlespiels lernst du ein paar
          grundlegende Prinzipien des Programmieren kennen. Schaue dir folgende
          Welt an:
        </p>
        <img
          src="/puzzle/start.png"
          alt="target"
          className="mx-auto my-3 max-h-[120px]"
        ></img>
        <p className="mb-2">
          Ziel der Aufgaben ist es immer, die vorgegebene Welt nachzubauen.
          Manchmal sieht man sofort, was zu tun ist - und manchmal braucht es
          etwas Kreativität. Meistens ist schon ein kleines Programm
          vorbereitet, mit dem man arbeiten kann, wie auch in diesem Fall: Unten
          links siehst du den Code für das Programm und rechts siehts du auch
          eine <em>Vorschau</em>, was das Programm macht. Es ist alles bereit,
          du musst nur noch das Programm starten.
        </p>
      </>
    ),
    targetWorld: {
      dimX: 6,
      dimY: 6,
      height: 6,
      karol: { x: 0, y: 0, dir: 'south' },
      bricks: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      marks: [
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
      ],
      blocks: [
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
      ],
    },
    code: `Schritt
Schritt
LinksDrehen
Schritt
Hinlegen Schritt
RechtsDrehen
Hinlegen
LinksDrehen
Hinlegen
Schritt
RechtsDrehen
Hinlegen`,
  },

  {
    id: 2,
    title: 'Smileys',
    posX: 7,
    posY: 3,
    deps: [1],
    description: (
      <>
        <p className="mb-2">
          An manchen Tagen sind wir glücklich, an manchen nicht. Es ist nur eine
          Frage der Ausrichtung:
        </p>
        <img
          src="/puzzle/smileys.png"
          alt="target"
          className="mx-auto my-3 max-h-[160px]"
        ></img>
        <p className="mb-2">
          Füge den Gesichtern den richtigen Mund hinzu. Diesmal musst du Karol
          ein wenig herumbewegen. Nutze dafür die Pfeiltasten.
        </p>
      </>
    ),
    targetWorld: {
      dimX: 21,
      dimY: 7,
      height: 6,
      karol: { x: 20, y: 0, dir: 'south' },
      bricks: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0],
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
        [
          false,
          false,
          true,
          false,
          true,
          false,
          false,
          false,
          false,
          true,
          false,
          true,
          false,
          false,
          false,
          false,
          true,
          false,
          true,
          false,
          false,
        ],
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
      world.karol.x = 1
      ;[2, 4, 9, 11, 16, 18].forEach((x) => {
        world.bricks[1][x] = 1
        world.marks[1][x] = true
      })
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
