import { faTimes } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useState } from 'react'
import { switchToWorkspace } from '../lib/commands/researchCenter'
import { levels } from '../lib/data/levels'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'

export function Research() {
  const core = useCore()

  return (
    <div className="bg-blue-200 h-full relative flex flex-col">
      <h1 className="ml-4 mt-2 text-2xl mb-2">Robot Karol Web - Lernzentrum</h1>
      <button
        className="absolute right-4 top-2 text-2xl"
        onClick={() => {
          switchToWorkspace(core, core.coreState.currentWorkspace)
        }}
      >
        <FaIcon icon={faTimes}></FaIcon>
      </button>
      <div className="flex-grow bg-gray-50 flex justify-center items-center">
        <div className="bg-blue-200 border w-[400px] h-[350px] -mt-40">
          <LoginRegisterForm />
        </div>
        {/*<div className="ml-4 mt-4">
          <p>Login</p>
          <label>
            Benutzername: <input></input>
          </label>
          <label>
            Passwort: <input type="password"></input>
          </label>
        </div>
        <div className="ml-4 mt-10">
          <p>Registrierung</p>
          <label>
            Benutzername: <input></input>
          </label>
          <label>
            Passwort: <input type="password"></input>
          </label>
      </div>*/}
      </div>
      <p className="mt-3 mx-4 mb-3">
        Version: Mai 2022 |{' '}
        <a
          href="https://github.com/Entkenntnis/robot-karol-web"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 underline"
        >
          GitHub
        </a>
      </p>
    </div>
  )

  return (
    <div className="bg-blue-200 h-full overflow-auto relative">
      <h1 className="ml-4 mt-4 text-2xl">Robot Karol Web</h1>
      <button
        className="absolute right-2 top-2 text-2xl"
        onClick={() => {
          switchToWorkspace(core, core.coreState.currentWorkspace)
        }}
      >
        <FaIcon icon={faTimes}></FaIcon>
      </button>
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

      <div className="mb-96 ml-4 mt-4">
        <p>Neuer Workspace-Manager:</p>
      </div>
      <p className="mt-3 mx-4">Kreativ:</p>
      <div className=" w-full flex flex-wrap">
        {core.coreState.workspaces.map(
          (ws, i) =>
            ws.type == 'free' && (
              <div
                className={clsx(
                  'w-48 h-64 border-2 rounded m-4 cursor-pointer',
                  core.coreState.currentWorkspace == i && 'border-yellow-400'
                )}
                key={ws.title}
                onClick={() => {
                  switchToWorkspace(core, i)
                }}
              >
                <p className="text-center mt-3 font-bold text-ellipsis overflow-hiddeny">
                  {ws.title}
                </p>
                <div className="px-3 mt-2">
                  <img src="/levels/preview_free.png" alt="Vorschau" />
                </div>
                <div className="flex justify-around mt-3">
                  <button className="rounded px-2 py-0.5 bg-blue-400">
                    Öffnen
                  </button>
                </div>
              </div>
            )
        )}
      </div>
      <p className="mt-3 mx-4">Übe dich im Programmieren mit Robot Karol:</p>
      <div className=" w-full flex flex-wrap overflow-y-auto">
        {core.coreState.workspaces.map(
          (ws, i) =>
            ws.type == 'level' && (
              <div
                className={clsx(
                  'w-48 h-64 border-2 rounded m-4 cursor-pointer',
                  core.coreState.currentWorkspace == i && 'border-yellow-400'
                )}
                key={ws.title}
                onClick={() => {
                  switchToWorkspace(core, i)
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
      <p className="mt-3 mx-4">
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
      </p>
      <p className="mt-6 mx-4 mb-3">Software-Version: Mai 2022</p>
    </div>
  )
}

function LoginRegisterForm() {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="h-12 flex-grow-0 flex bg-blue-200">
        <div
          className={clsx(
            'w-1/2 text-center cursor-pointer pt-2',
            tab == 'login' && 'bg-white'
          )}
          onClick={() => {
            setTab('login')
          }}
        >
          Login
        </div>
        <div
          className={clsx(
            'w-1/2 text-center cursor-pointer pt-2',
            tab == 'register' && 'bg-white'
          )}
          onClick={() => {
            setTab('register')
          }}
        >
          Registrieren
        </div>
      </div>
      <div className="flex-grow ">
        {tab == 'login' && (
          <div className="ml-4 mt-4">
            <p>
              <label>
                Name:
                <br />
                <input className="border"></input>
              </label>
            </p>
            <p>
              <label>
                Passwort:
                <br />
                <input className="border" type="password"></input>
              </label>
            </p>
            <p className="mt-3">
              <button className="px-2 py-1 bg-green-300 rounded">Los</button>
            </p>
          </div>
        )}
        {tab == 'register' && (
          <div className="mx-4 mt-4">
            <p>
              Erstelle kostenlos einen Account und steige spielerisch in die
              Programmierung ein!
            </p>
            <p className="mt-3">
              <label>
                Name:
                <br />
                <input className="border"></input>
              </label>
            </p>
            <p>
              <label>
                Passwort:
                <br />
                <input className="border" type="password"></input>
              </label>
            </p>
            <p>
              <label>
                Passwort wiederholen:
                <br />
                <input className="border" type="password"></input>
              </label>
            </p>
            <p className="mt-3">
              <button className="px-2 py-1 bg-green-300 rounded">
                Registrieren
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
