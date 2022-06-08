import { Puzzle } from '../state/types'

export const p9_linksundrechts: Puzzle = {
  id: 9,
  title: 'Links und Rechts',
  posX: 20,
  posY: 11,
  deps: [4],
  description: (
    <>
      <p className="mb-2">
        Das vorliegende Programm soll aus Ziegeln eine Form legen, die ein wenig
        an ein Mensch-Ärger-Dich-Nicht-Spielfeld erinnert. Allerdings hatte der
        Programmierer einige Male <em>LinksDrehen</em> und <em>RechtsDrehen</em>{' '}
        verwechselt.
      </p>
      <img
        src="/puzzle/p9.png"
        alt="target"
        className="mx-auto my-3 max-h-[160px]"
      ></img>
      <p className="mb-2">
        Korrigiere die Drehungen. Du siehst außerdem öfters den Befehl
        ZweiZiegel. Karol hat die Möglichkeit, eigene Befehle mit dem
        Schlüsselwort <em>Anweisung</em> zu definieren. Der Befehl ZweiZiegel
        wird am Ende des Programms definiert.
      </p>
      <p className="mb-2">
        Tipp: Du kannst die Vorschau mit der Taste V an- und ausschalten.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 9,
    dimY: 9,
    height: 6,
    karol: { x: 1, y: 3, dir: 'east' },
    bricks: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    marks: [
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
    ],
    blocks: [
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
    ],
  },
  code: `ZweiZiegel
LinksDrehen
ZweiZiegel
LinksDrehen
ZweiZiegel
RechtsDrehen
ZweiZiegel
LinksDrehen
ZweiZiegel
RechtsDrehen
ZweiZiegel
RechtsDrehen
ZweiZiegel
RechtsDrehen
ZweiZiegel
RechtsDrehen
ZweiZiegel
RechtsDrehen
ZweiZiegel
LinksDrehen
ZweiZiegel
LinksDrehen
ZweiZiegel
RechtsDrehen

Anweisung ZweiZiegel
  Hinlegen
  Schritt
  Hinlegen
  Schritt
endeAnweisung
`,
  initWorld: (world) => {
    world.karol.dir = 'east'
    world.karol.x = 1
    world.karol.y = 3
  },
}
