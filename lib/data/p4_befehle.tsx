import { Puzzle } from '../state/types'

export const p4_befehle: Puzzle = {
  id: 4,
  title: 'Befehle',
  posX: 10,
  posY: 8,
  deps: [1],
  description: (
    <>
      <p className="mb-2">
        Die zwei grundlegenden Befehle für Robot Karol heißen <em>Hinlegen</em>{' '}
        und <em>Schritt</em>. Mit Hinlegen setzt Karol auf das Feld vor sich
        einen Ziegel, mit Schritt bewegt sich Karol ein Feld nach vorne in seine
        Blickrichtung.
      </p>
      <img
        src="/puzzle/p4.png"
        alt="target"
        className="mx-auto my-3 max-h-[80px]"
      ></img>
      <p className="mb-2">
        Das folgende Programm macht einen Anfang, ist aber noch nicht fertig.
        Schreibe es zu Ende.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 5,
    dimY: 1,
    height: 3,
    karol: { x: 0, y: 0, dir: 'east' },
    bricks: [[0, 1, 1, 1, 0]],
    marks: [[false, false, false, false, false]],
    blocks: [[false, false, false, false, false]],
  },
  code: `Hinlegen
Schritt
Hinlegen

`,
  startSpeed: 'slow',
  initWorld: (world) => {
    world.karol.dir = 'east'
  },
}
