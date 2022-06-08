import { Puzzle } from '../state/types'

export const p6_ziegelkette: Puzzle = {
  id: 6,
  title: 'Ziegelkette',
  posX: 7,
  posY: 16,
  deps: [2],
  description: (
    <>
      <p className="mb-2">
        Programme eignen sich besonders dafür, Aufgaben zu erledigen, die sich
        wiederholen, wie zum Beispiel das Legen von Ziegeln:
      </p>
      <img
        src="/puzzle/p6.png"
        alt="target"
        className="mx-auto my-3 max-h-[100px]"
      ></img>
      <p className="mb-2">
        Robot Karol kennt dafür die Kontrollstruktur <em>wiederhole x mal</em>.
        Ein kleines Beispielprogramm ist vorbereitet. Passe es an und löse die
        Aufgabe. Du kannst Karol wieder mit den Pfeiltasten steuern.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 13,
    dimY: 1,
    height: 3,
    karol: { x: 0, y: 0, dir: 'east' },
    bricks: [[0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]],
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
      ],
    ],
  },
  code: `wiederhole 4 mal
  Hinlegen
  Schritt
endewiederhole
`,
  startSpeed: 'slow',
  initWorld: (world) => {
    world.karol.dir = 'east'
  },
}
