import { Puzzle } from '../state/types'

export const p1_start: Puzzle = {
  id: 1,
  title: 'Start',
  posX: 3,
  posY: 3,
  deps: [],
  description: (
    <>
      <p className="mb-2">
        Herzlich Willkommen bei Robot Karol! Hier kannst du auf spielerische Art
        deine ersten Schritte in die Programmierung tun. In einer Reihe von
        Aufgaben mit zunehmender Schwierigkeit wird dein Verständnis von Code
        herausgefordert und du lernst einige wichtige Ideen kennen.
      </p>
      <p className="mb-2">
        Das findet in einer übersichtlichen Umgebung statt. Schaue dir folgende
        Welt an:
      </p>
      <img
        src="/puzzle/p1.png"
        alt="target"
        className="mx-auto my-3 max-h-[120px]"
      ></img>
      <p className="mb-2">
        Ziel der Aufgaben ist es immer, die vorgegebene Welt nachzubauen.
        Manchmal sieht man sofort, was zu tun ist - und manchmal braucht es
        etwas Kreativität. Meistens ist schon ein kleines Programm vorbereitet,
        mit dem man arbeiten kann, wie auch in diesem Fall: Unten links siehst
        du den Code für das Programm und rechts siehts du auch eine Vorschau,
        was das Programm macht. Es ist alles bereit, du musst nur noch das
        Programm starten.
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
Hinlegen
Schritt
RechtsDrehen
Hinlegen
LinksDrehen
Hinlegen
Schritt
RechtsDrehen
Hinlegen`,
  startSpeed: 'slow',
}
