import clsx from 'clsx'
import { switchToWorkspace } from '../lib/commands/researchCenter'
import { levels } from '../lib/data/levels'
import { useCore } from '../lib/state/core'

export function Research() {
  const core = useCore()
  return (
    <div className="bg-blue-200 h-full">
      <div>
        <h1 className="ml-4 mt-4 text-2xl">Forschungszentrum</h1>
        <p className="mt-3 mx-4">Verfügbare Projekte:</p>
      </div>
      <div className=" w-full flex flex-wrap overflow-y-auto">
        {core.state.workspaces.map((ws, i) => (
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
            {ws.type == 'level' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="px-3 mt-2">
                  <img src="/levels/preview_free.png" alt="Vorschau" />
                </div>
                <div className="flex justify-around mt-3">
                  <button className="rounded px-2 py-0.5 bg-blue-400">
                    Öffnen
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 ml-4">
        Finde weitere Informationen zu Robot Karol Web auf{' '}
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
  )
}
