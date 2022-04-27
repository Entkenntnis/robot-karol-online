import clsx from 'clsx'
import { switchToWorkspace } from '../lib/commands/researchCenter'
import { levels } from '../lib/data/levels'
import { useCore } from '../lib/state/core'
import { WorkspaceState, WorkspaceStateLevelMode } from '../lib/state/types'

export function Research() {
  const core = useCore()
  return (
    <div className="bg-blue-200 h-full overflow-auto">
      <div>
        <h1 className="ml-4 mt-4 text-2xl">Forschungszentrum</h1>
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
        <p className="mt-3 mx-4">Kreativ:</p>
      </div>
      <div className=" w-full flex flex-wrap overflow-y-auto">
        {core.state.workspaces.map(
          (ws, i) =>
            ws.type == 'free' && (
              <div
                className={clsx(
                  'w-48 h-64 border-2 rounded m-4 cursor-pointer',
                  core.state.currentWorkspace == i && 'border-yellow-400'
                )}
                key={ws.title}
                onClick={() => {
                  switchToWorkspace(core, i)
                }}
              >
                <p className="text-center mt-3 font-bold text-ellipsis overflow-hidden">
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
      <p className="mt-3 mx-4 mb-3">Software-Version: Mai 2022</p>
    </div>
  )
}
