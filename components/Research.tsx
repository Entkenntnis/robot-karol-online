import clsx from 'clsx'
import { switchToWorkspace } from '../lib/commands/researchCenter'
import { useCore } from '../lib/state/core'

export function Research() {
  const core = useCore()
  return (
    <div className="bg-blue-200 h-full">
      <div>
        <h1 className="ml-4 mt-4 text-2xl">Forschungszentrum</h1>
        <p className="mt-3 mx-4">Spieler: David | Fortschritt: 43%</p>
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
            {ws.title}
          </div>
        ))}
      </div>
      <p className="mt-3 mx-4">Abgeschlossene Projekte:</p>
      <p className="mt-3 mx-4">Noch zu entdeckende Projekte:</p>
    </div>
  )
}
