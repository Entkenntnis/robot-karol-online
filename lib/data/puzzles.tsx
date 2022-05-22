export const puzzles = [
  {
    id: 1,
    title: 'Start',
    posX: 253,
    posY: 91,
    description: (
      <>
        <p className="mb-2">
          Herzlich Willkommen bei Robot Karol! Du findest hier ein entspanntes
          Bau- und Puzzlespiel und bekommst dabei einen Einblick in die Welt des
          Programmierens. Fange mit dieser kleinen Welt an:
        </p>
        <img
          src="/puzzle/start.png"
          alt="target"
          className="mx-auto my-3 h-[180px]"
        ></img>
        <p className="mb-2">
          Klicke dafür auf Karol und steuere ihn mit den Pfeiltasten. Wenn sich
          die Vorschau in der richtigen Position befindet, dann drücke die Taste
          S um das Programm zu starten und die Ziegel zu legen.
        </p>
        <p className="mb-2">
          Wenn du dich verbaut hast, kannst du mit einem Klick auf &quot;Neu
          starten&quot; die Welt zurücksetzen.
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
      chips: [],
    },
    code: `Hinlegen
Schritt
RechtsDrehen
Hinlegen
LinksDrehen
Hinlegen
Schritt
RechtsDrehen
Hinlegen
LinksDrehen
Schritt`,
  },
]
