import { faXmark } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useState } from 'react'
import { switchToEditor, switchToPuzzle } from '../lib/commands/menu'
import { paths } from '../lib/data/paths'
import { puzzles } from '../lib/data/puzzles'
import { useCore } from '../lib/state/core'
import { ExternalLink } from './ExternalLink'
import { FaIcon } from './FaIcon'
import { Ping } from './Ping'

export function Menu() {
  const core = useCore()

  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {renderTopbar()}
      {renderMiddle()}
      {renderFooter()}
      {showPrivacy && renderPrivacyModal()}
    </div>
  )

  function renderTopbar() {
    return (
      <div className="h-9 flex-grow-0 border-b flex items-center justify-between border-[blue]">
        <div className="ml-3 text-2xl">
          <img
            src="/favicon.ico"
            alt="Icon"
            className="inline-block h-6 mr-2 -mt-1"
          />
          Robot Karol <span className="italic">Web</span>
        </div>
        <div>
          <button
            className="px-2 py-0.5 rounded mr-1 bg-blue-300 hover:bg-blue-400"
            onClick={() => {
              switchToEditor(core)
            }}
          >
            zurück zum Editor
          </button>
        </div>
      </div>
    )
  }

  function renderMiddle() {
    let bricks: { x: number; y: number }[] = []

    return (
      <div className="flex-grow overflow-scroll">
        <div
          className="relative min-h-[400px] h-full"
          style={{ backgroundImage: 'url("/tile.png")' }}
        >
          {puzzles.map((puzzle, i) => {
            if (
              puzzle.id !== 1 &&
              !puzzle.deps.some((i) => core.state.done.includes(i))
            ) {
              return null // deps failed
            }

            puzzle.deps.forEach((d) => {
              const path = paths[puzzle.id]?.[d]
              if (path) {
                for (const p of path) {
                  if (
                    bricks.findIndex(({ x, y }) => x == p.x && y == p.y) === -1
                  ) {
                    bricks.push(p)
                  }
                }
              }
            })

            return (
              <div
                className="absolute cursor-pointer select-none"
                style={{
                  left: `${105 + puzzle.posX * 30 - puzzle.posY * 15}px`,
                  top: `${3 + puzzle.posY * 15}px`,
                  zIndex: puzzle.posX + 100 * puzzle.posY,
                }}
                onClick={() => {
                  switchToPuzzle(core, puzzle.id)
                }}
                key={puzzle.id}
              >
                <div className="flex justify-center">
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded',
                      core.state.done.includes(puzzle.id)
                        ? 'bg-gray-200'
                        : 'bg-[yellow]'
                    )}
                  >
                    {puzzle.title}
                    {core.retrieveWsFromStorage(puzzle.id) && ' (*)'}
                    {puzzle.id == 1 && core.state.inviteStart && <Ping />}
                  </span>
                </div>
                <img src="/Ziegel.png" alt="Ziegel" className="mt-3"></img>
                <img
                  src={
                    core.state.done.includes(puzzle.id)
                      ? '/marke_grau.png'
                      : '/marke.png'
                  }
                  alt="Marke"
                  className={clsx('-mt-[46px]')}
                ></img>
              </div>
            )
          })}
          {bricks.map(({ x, y }, i) => (
            <img
              src="/Ziegel.png"
              key={i}
              alt="Ziegel"
              className="absolute"
              style={{
                left: `${105 + x * 30 - y * 15}px`,
                top: `${43 + y * 15}px`,
                zIndex: x + 100 * y,
              }}
            ></img>
          ))}
        </div>
      </div>
    )
  }

  function renderFooter() {
    return (
      <div className="h-9 flex-grow-0 border-t flex items-center justify-between border-[blue]">
        <div className="ml-3">
          Version: Juni 2022 (2) |{' '}
          <ExternalLink
            href="https://github.com/Entkenntnis/robot-karol-web#sprache"
            title="Sprachreferenz"
          />{' '}
          |{' '}
          <ExternalLink
            href="https://github.com/Entkenntnis/robot-karol-web#beispiele"
            title="Beispiele"
          />{' '}
          |{' '}
          <ExternalLink
            href="https://github.com/Entkenntnis/robot-karol-web"
            title="Quellcode"
          />
        </div>
        <div className="mr-3">
          <ExternalLink
            href="https://github.com/Entkenntnis/robot-karol-web#kontakt"
            title="Kontakt"
          />{' '}
          |{' '}
          <span
            className="cursor-pointer"
            onClick={() => {
              setShowPrivacy(true)
            }}
          >
            Datenschutzerklärung
          </span>
        </div>
      </div>
    )
  }

  function renderPrivacyModal() {
    return (
      <div
        className={clsx(
          'fixed inset-0 bg-gray-300 bg-opacity-30 flex justify-around',
          'items-center z-[9999]'
        )}
        onClick={() => setShowPrivacy(false)}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className={clsx(
            'fixed mx-auto bg-white rounded w-[600px] z-[99999]',
            'top-[30vh]'
          )}
        >
          <h1 className="m-3 mb-6 text-xl font-bold">Datenschutzerklärung</h1>
          <p className="m-3">
            Diese Website wird auf einem uberspace (https://uberspace.de)
            gehostet. Bei einem Besuch kommen keine Cookies zum Einsatz. Es
            werden grundlegende Statistiken zu Aufrufen und gelösten Aufgaben
            auf dem uberspace gespeichert. Es werden keine Daten an
            Drittanbieter weitergeben. Außerdem findet die Datenverarbeitung
            vollständig in Deutschland statt.
          </p>
          <div
            className="absolute top-2 right-2 h-3 w-3 cursor-pointer"
            onClick={() => setShowPrivacy(false)}
          >
            <FaIcon icon={faXmark} />
          </div>
        </div>
      </div>
    )
  }
}
