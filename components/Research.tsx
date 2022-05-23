import clsx from 'clsx'
import { switchToWorkspace } from '../lib/commands/researchCenter'
import { levels } from '../lib/data/levels'
import { puzzles } from '../lib/data/puzzles'
import { useCore } from '../lib/state/core'
import { submit_event } from '../lib/stats/submit'

export function Research() {
  const core = useCore()

  return (
    <div className="bg-blue-200 h-full overflow-auto">
      <div>
        <h1 className="ml-4 mt-4 text-2xl">Robot Karol Web</h1>
        <div className="mt-3 ml-4 border-b pb-2">
          Finde allgemeine Informationen auf{' '}
          <a
            href="https://github.com/Entkenntnis/robot-karol-web#readme"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
          .
        </div>
      </div>
      <div className=" ml-4 mt-4 border-b pb-4">
        <a
          className="bg-gray-200 cursor-pointer px-2 py-1.5 rounded mr-4"
          target="_blank"
          href={`//${window.location.host}`}
          rel="noreferrer"
        >
          Neues Fenster
        </a>
        <button
          className="bg-green-400 px-2 py-1.5 rounded"
          onClick={() => switchToWorkspace(core, 0)}
        >
          Zurück zum Editor
        </button>
      </div>

      <div className="mx-4 flex justify-center mb-48 mt-8">
        <div>
          <h2 className="mt-3 mb-4 text-xl">Puzzle</h2>
          <p className="mt-3">
            Entdecke die Welt des Programmierens mit Robot Karol:
          </p>
          <div
            className="h-[570px] w-[1059px] mt-4 relative"
            style={{ backgroundImage: 'url(/puzzle/map.png)' }}
          >
            {puzzles.map((puzzle, i) => (
              <div
                className="absolute cursor-pointer select-none"
                style={{ left: `${puzzle.posX}px`, top: `${puzzle.posY}px` }}
                onClick={() => {
                  switchToWorkspace(core, i)
                }}
                key={i}
              >
                <div className="flex justify-center">
                  <span className="bg-yellow-200 px-2 py-0.5 rounded">
                    {puzzle.title}
                  </span>
                </div>
                <img src="/marke.png" alt="Marke"></img>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="mt-3 mb-4 mx-4 text-xl">Aufgaben</h2>
      <p className="mt-3 mx-4">Übe dich im Programmieren mit Robot Karol:</p>
      <div className=" w-full flex flex-wrap overflow-y-auto"></div>
      <div className="mt-3 mx-4 border-b pb-5">
        Hinweise zu den Aufgaben:
        <ul className="list-disc ml-3">
          <li>
            Die schwarze Platte ist der Chip. Jeder Chip hat einen
            Anfangszustand und einen Zielzustand.
          </li>
          <li>
            Je nach Aufgabe soll der Chip 20 - 50 mal aus dem Anfangszustand in
            den Zielzustand gebracht werden. Die Aufgabenbeschreibung enthält
            ein Bild wie der Zielzustand aussieht.
          </li>
          <li>
            Wenn der Zielzustand erreicht ist, muss der Chip durch das Setzen
            einer Marke auf dem Startfeld aktiviert werden. Wenn das erfolgreich
            ist, wird der Fortschritt um eins erhöht.
          </li>
          <li>
            Lösche danach die Marke wieder, um einen neuen Anfangszustand zu
            generieren.
          </li>
          <li>
            Nicht jede Aktivierung ist erfolgreich. In 10% der Fälle schlägt die
            Aktivierung fehl. Wiederhole den Durchlauf nochmal.
          </li>
          <li>Nutze Wiederholungen, um dein Programm mehrfach auszuführen.</li>
          <li>
            Klicke auf Neu Starten, um das Spielfeld aufzuräumen (damit wird
            auch der Fortschritt zurückgesetzt).
          </li>
          <li>
            Sobald die Aufgabe abgeschlossen ist, kann die Marke auf dem
            Startfeld nicht mehr entfernt werden. Dadurch kannst du das Ende der
            Bearbeitung erkennen.
          </li>
        </ul>
      </div>

      <h2 className="mt-5 mb-4 mx-4 text-xl">Beispiele</h2>
      <div className="w-full flex flex-wrap border-b pb-3">
        {demoData.map((data) => (
          <a
            className={clsx(
              'w-48 h-56 border-2 rounded m-4 cursor-pointer block'
            )}
            key={data.title}
            href={`//${window.location.host}?project=${data.projectUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            <p className="text-center mt-3 font-bold">{data.title}</p>
            <div
              className="mx-3 mt-2 h-[110px] bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(${data.imageSrc})`,
              }}
            ></div>
            <div className="flex justify-around mt-3">
              <button className="rounded px-2 py-0.5 bg-blue-400">
                Öffnen
              </button>
            </div>
          </a>
        ))}
      </div>
      <p className="my-4 ml-4 border-b pb-3">
        <input
          type="checkbox"
          checked={core.state.enableStats}
          onChange={(e) => {
            core.mutateCore((core) => {
              core.enableStats = e.target.checked
            })
          }}
        />{' '}
        Zur Entwicklung neuer Funktionen sammelt Robot Karol Web Statistiken zur
        Nutzung (Anzahl Aufrufe, bearbeitete Aufgaben, ausgeführte Programme).
      </p>
      <p className="mt-4 mx-4 mb-3">Version: Juni 2022</p>
    </div>
  )
}

const demoData: { projectUrl: string; title: string; imageSrc: string }[] = [
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/schwimmbad.json',
    title: 'Schwimmbad',
    imageSrc: '/demo/schwimmbad.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/schachbrett.json',
    title: 'Schachbrett',
    imageSrc: '/demo/schachbrett.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/allesinvertieren.json',
    title: 'Alles invertieren',
    imageSrc: '/demo/allesinvertieren.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/stapeln.json',
    title: 'Stapeln',
    imageSrc: '/demo/stapeln.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/raum_verlassen.json',
    title: 'Raum verlassen',
    imageSrc: '/demo/raum_verlassen.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/füllen.json',
    title: 'Füllen',
    imageSrc: '/demo/füllen.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/labyrinth.json',
    title: 'Labyrinth',
    imageSrc: '/demo/labyrinth.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/binär_konverter.json',
    title: 'Binär-Konverter',
    imageSrc: '/demo/konverter.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/sortieren.json',
    title: 'Sortieren',
    imageSrc: '/demo/sortieren.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/game_of_life.json',
    title: 'Game of Life',
    imageSrc: '/demo/gol.png',
  },
  {
    projectUrl:
      'https://entkenntnis.github.io/robot-karol-web/examples/bf.json',
    title: 'BF Interpreter',
    imageSrc: '/demo/bf.png',
  },
]
