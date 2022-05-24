import clsx from 'clsx'
import { switchToEditor, switchToPuzzle } from '../lib/commands/menu'
import { paths, puzzles } from '../lib/data/puzzles'
import { useCore } from '../lib/state/core'
import { ExternalLink } from './ExternalLink'
import { Ping } from './Ping'

export function Menu() {
  const core = useCore()

  return (
    <div className="h-full flex flex-col">
      {renderTopbar()}
      {renderMiddle()}
      {renderFooter()}
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
              const path = paths[puzzle.id][d]
              for (const p of path) {
                if (
                  bricks.findIndex(({ x, y }) => x == p.x && y == p.y) === -1
                ) {
                  bricks.push(p)
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
            title="Befehlsübersicht"
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
          | Datenschutzerklärung
        </div>
      </div>
    )
  }
}
