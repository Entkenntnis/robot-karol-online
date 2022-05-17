import clsx from 'clsx'
import { switchToWorkspace } from '../lib/commands/researchCenter'
import { levels } from '../lib/data/levels'
import { useCore } from '../lib/state/core'
import { WorkspaceState, WorkspaceStateLevelMode } from '../lib/state/types'
import { submit_event } from '../lib/stats/submit'

export function Research() {
  const core = useCore()

  const freeWorkspace = core.state.workspaces.findIndex((x) => x.type == 'free')
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
      <div className=" ml-4 mt-4 border-b pb-4 text-center">
        <button
          className="bg-green-400 px-2 py-1.5 rounded"
          onClick={() => switchToWorkspace(core, freeWorkspace)}
        >
          Zurück zum Editor
        </button>
      </div>
      <h2 className="mt-3 mb-4 mx-4 text-xl">Aufgaben</h2>
      <p className="mt-3 mx-4">Übe dich im Programmieren mit Robot Karol:</p>
      <div className=" w-full flex flex-wrap overflow-y-auto">
        {core.state.workspaces.map(
          (ws, i) =>
            ws.type == 'level' && (
              <div
                className={clsx(
                  'w-48 h-64 border-2 rounded m-4 cursor-pointer',
                  core.state.currentWorkspace == i && 'border-yellow-400'
                )}
                key={ws.title}
                onClick={() => {
                  switchToWorkspace(core, i)
                  submit_event(
                    `open_level_${levels[ws.levelId].title.toLowerCase()}`,
                    core
                  )
                }}
              >
                <p className="text-center mt-3 font-bold">{ws.title}</p>
                <div
                  className="mx-3 mt-2 h-[110px] bg-contain bg-no-repeat bg-center"
                  style={{
                    backgroundImage: `url(${levels[ws.levelId].previewImage})`,
                  }}
                ></div>
                <div
                  className={clsx(
                    'm-3 text-center',
                    ws.progress >= levels[ws.levelId].target && 'text-green-700'
                  )}
                >
                  Fortschritt: {ws.progress} / {levels[ws.levelId].target}
                </div>
                <div className="flex justify-around mt-3">
                  <button className="rounded px-2 py-0.5 bg-blue-400">
                    {ws.progress >= levels[ws.levelId].target
                      ? 'Öffnen'
                      : 'Erforschen'}
                  </button>
                </div>
              </div>
            )
        )}
      </div>
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
        Dein Code und der Inhalt der Welt werden nicht übertragen.
      </p>
      <p className="mt-4 mx-4 mb-3">Version: Juni 2022</p>
    </div>
  )
}
