import { Puzzle } from '../state/types'

export const p8_123: Puzzle = {
  id: 8,
  title: '1, 2, 3',
  posX: 12,
  posY: 20,
  deps: [6, 7],
  description: (
    <>
      <p className="mb-2">
        Mithilfe von geschweiften Klammern kann man zwischen den Programmen
        Kommentare schreiben. Diese sollen den Code erklären, können aber auch
        genutzt werden, um Teile des Programms zu aktivieren oder deaktiveren.
      </p>
      <img
        src="/puzzle/p8.png"
        alt="target"
        className="mx-auto my-3 max-h-[140px]"
      ></img>
      <p className="mb-2">
        In diesem Programm steht alles bereit. Aktiviere die passende Teile, um
        die drei Balken zu bauen.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 7,
    dimY: 5,
    height: 6,
    karol: { x: 6, y: 0, dir: 'west' },
    bricks: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    marks: [
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [true, true, true, true, true, true, true],
    ],
    blocks: [
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
    ],
  },
  code: `{ Teil 1: Marke bis zur Wand setzen }

{
MarkeSetzen
wiederhole solange NichtIstWand
  Schritt
  MarkeSetzen
endewiederhole
}


{ Teil 2: Balken setzen }

{
wiederhole 1 mal
  Hinlegen
  Schritt
endewiederhole
}
`,
}
