import { Puzzle } from '../state/types'

export const p7_wiederholesolange: Puzzle = {
  id: 7,
  title: 'Wanderkennung',
  posX: 12,
  posY: 13,
  deps: [2, 4],
  description: (
    <>
      <p className="mb-2">
        Karol ist in der Lage, die nächste Wand zu erkennen und dort stehen zu
        bleiben. Funktionieren tut das mit der Kontrollstruktur{' '}
        <em>wiederhole solange</em>.
      </p>
      <img
        src="/puzzle/p7.png"
        alt="target"
        className="mx-auto my-3 max-h-[120px]"
      ></img>
      <p className="mb-2">
        Wieder ist ein Beispielprogramm vorbereitet. Nutze es, um obiges
        Kunstwerk nachzubauen. Steuere Karol mit den Pfeiltasten. Du kannst das
        Programm auch mit der Taste S starten.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 5,
    dimY: 5,
    height: 6,
    karol: { x: 4, y: 4, dir: 'north' },
    bricks: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    marks: [
      [false, true, false, true, false],
      [true, true, true, true, false],
      [false, true, false, true, false],
      [false, true, true, true, true],
      [false, true, false, true, false],
    ],
    blocks: [
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ],
  },
  code: `MarkeSetzen
wiederhole solange NichtIstWand
  Schritt
  MarkeSetzen
endewiederhole
`,
}
