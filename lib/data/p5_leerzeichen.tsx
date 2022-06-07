import { Puzzle } from '../state/types'

export const p5_leerzeichen: Puzzle = {
  id: 5,
  title: 'Leerzeichen',
  posX: 16,
  posY: 6,
  deps: [3, 4],
  description: (
    <>
      <p className="mb-2">
        Damit der Computer zwei Befehle unterscheiden kann, braucht es
        dazwischen ein Leerzeichen oder eine neue Zeile. Wenn das nicht gemacht
        wird, dann kann Karol nicht erkennen, was gemeint ist. Das folgende
        Programm soll einen Kreis an Ziegeln legen:
      </p>
      <img
        src="/puzzle/p5.png"
        alt="target"
        className="mx-auto my-3 max-h-[100px]"
      ></img>
      <p className="mb-2">
        Allerdings fehlen an einigen Stellen Leerzeichen! Korrigiere sie und
        bringe das Programm zum Laufen.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 3,
    dimY: 3,
    height: 6,
    karol: { x: 0, y: 0, dir: 'south' },
    bricks: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    marks: [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ],
    blocks: [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ],
  },
  code: `Hinlegen
Schritt
Hinlegen
Schritt
LinksDrehen

HinlegenSchrittHinlegenSchrittLinksDrehen

Hinlegen   SchrittHinlegen   SchrittLinksDrehen

HinlegenSchrittHinlegen              SchrittLinksDrehen
`,
  startSpeed: 'slow',
}
