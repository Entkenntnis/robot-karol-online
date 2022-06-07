import { Puzzle } from '../state/types'

export const p3_tippfehler: Puzzle = {
  id: 3,
  title: 'Tippfehler',
  posX: 9,
  posY: 3,
  deps: [1],
  description: (
    <>
      <p className="mb-2">
        Gründlichkeit ist beim Programmieren ganz wichtig: Denn der Computer ist
        sehr pingelig, wenn es um Code geht. Das folgende Programm soll dieses
        Kreuz bauen:
      </p>
      <img
        src="/puzzle/p3.png"
        alt="target"
        className="mx-auto my-3 max-h-[120px]"
      ></img>
      <p className="mb-2">
        Allerdings enthält es einige Tippfehler. Kannst du sie korrigieren?
      </p>
    </>
  ),
  targetWorld: {
    dimX: 5,
    dimY: 5,
    height: 6,
    karol: { x: 0, y: 0, dir: 'south' },
    bricks: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    marks: [
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
    ],
  },
  code: `Schritt
Schritt
LinksDrehen
Hinlegen
Schritt
Hinlegen
Schrit
Hinlägen
Rechts Drehen
Hinlegen
LinksDrehen
LinkDrehen
Hinlegen
Schritt
Schrittt
LinksTrehen
Schritt
Schritt
LinksDrehen
`,
  startSpeed: 'slow',
}
