export const puzzles = [
  {
    id: 1,
    title: 'Start',
    posX: 240,
    posY: 91,
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
      chips: [],
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
]
