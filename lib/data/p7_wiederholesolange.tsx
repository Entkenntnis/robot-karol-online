import { Puzzle } from '../state/types'

export const p7_wiederholesolange: Puzzle = {
  id: 7,
  title: 'wiederhole solange',
  posX: 12,
  posY: 13,
  deps: [2, 4],
  description: (
    <>
      <p className="mb-2">
        Herzlich Willkommen! Du hast Spaß am Bauen und Puzzlen? Und du möchtest
        einen Einblick in die Programmierung erhalten? Dann bist du hier bei
        Robot Karol am richtigen Ort!
      </p>
      <p className="mb-2">
        Im Rahmen dieses kleinen Bau- und Puzzlespiels lernst du ein paar
        grundlegende Prinzipien des Programmieren kennen. Schaue dir folgende
        Welt an:
      </p>
      <img
        src="/puzzle/start.png"
        alt="target"
        className="mx-auto my-3 max-h-[120px]"
      ></img>
      <p className="mb-2">
        Ziel der Aufgaben ist es immer, die vorgegebene Welt nachzubauen.
        Manchmal sieht man sofort, was zu tun ist - und manchmal braucht es
        etwas Kreativität. Meistens ist schon ein kleines Programm vorbereitet,
        mit dem man arbeiten kann, wie auch in diesem Fall: Unten links siehst
        du den Code für das Programm und rechts siehts du auch eine{' '}
        <em>Vorschau</em>, was das Programm macht. Es ist alles bereit, du musst
        nur noch das Programm starten.
      </p>
    </>
  ),
  targetWorld: {
    dimX: 6,
    dimY: 6,
    height: 6,
    karol: { x: 0, y: 0, dir: 'south' },
    bricks: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
    marks: [
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
    ],
    blocks: [
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
    ],
  },
  code: `Schritt
Schritt
LinksDrehen
Schritt
Hinlegen Schritt
RechtsDrehen
Hinlegen
LinksDrehen
Hinlegen
Schritt
RechtsDrehen
Hinlegen`,
  startSpeed: 'slow',
}
