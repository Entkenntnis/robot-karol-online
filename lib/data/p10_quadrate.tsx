import { Puzzle } from '../state/types'

export const p10_quadrate: Puzzle = {
  id: 10,
  title: 'Quadrate',
  posX: 18,
  posY: 16,
  deps: [4],
  description: (
    <>
      <p className="mb-2">
        Ein zentraler Aspekt von Programmierung ist die Wiederverwendung von
        Code. Dadurch kann man Arbeit, die man einmal getan hat, immer wieder
        nutzen.
      </p>
      <img
        src="/puzzle/p10.png"
        alt="target"
        className="mx-auto my-3 max-h-[160px]"
      ></img>
      <p className="mb-2">
        Diesmal ist kein Programm vorgegeben. Allerdings spricht nichts dagegen,
        sich den Code aus einer vorherigen Aufgabe zu kopieren.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 10,
    dimY: 10,
    height: 6,
    karol: { x: 3, y: 6, dir: 'south' },
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
  code: `\n`,
}
