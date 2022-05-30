import { Puzzle } from '../state/types'

export const p7_rechteck: Puzzle = {
  id: 7,
  title: 'Rechteck',
  posX: 27,
  posY: 21,
  deps: [1],
  description: (
    <>
      <p className="mb-2">
        Das Ziel dieser Aufgabe ist es, ein goldenes Rechteck zu bauen. Das
        sieht so aus:
      </p>
      <img
        src="/puzzle/rechteck.png"
        alt="target"
        className="mx-auto my-3 max-h-[120px]"
      ></img>
      <p className="mb-2">
        Diesmal ist kein Programm vorgegeben. Nutze den Code aus vorherigen
        Aufgaben, um diese Aufgabe zu lösen.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 8,
    dimY: 6,
    height: 6,
    karol: { x: 0, y: 5, dir: 'west' },
    bricks: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    marks: [
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
    ],
    blocks: [
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
    ],
  },
  code: '',
}
