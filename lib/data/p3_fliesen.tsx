import { Puzzle } from '../state/types'

export const p3_fliesen: Puzzle = {
  id: 3,
  title: 'Fliesen',
  posX: 11,
  posY: 9,
  deps: [1],
  description: (
    <>
      <p className="mb-2">
        Ein schöner Fußboden macht immer eine Freude. Lege bei dieser Aufgabe
        den Boden einmal komplett mit Fliesen aus:
      </p>
      <img
        src="/puzzle/fliesen.png"
        alt="target"
        className="mx-auto my-3 max-h-[120px]"
      ></img>
      <p className="mb-2">
        Bei diesem Programm kommt eine Schleife zum Einsatz: Mit dem
        Schlüsselwort <em>wiederhole solange</em> kann Karol eine Aktion solange
        wiederholen, bis die Bedingung nicht mehr erfüllt ist. In diesem Fall
        legt er Fliesen bis zur nächsten Wand.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 10,
    dimY: 4,
    height: 6,
    karol: { x: 0, y: 3, dir: 'west' },
    bricks: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    marks: [
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
    ],
    blocks: [
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
    ],
  },
  code: 'wiederhole solange NichtIstWand\n  MarkeSetzen\n  Schritt\nendewiederhole\nMarkeSetzen',
}
