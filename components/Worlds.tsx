import { faEye, faPlay } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { writeSync } from 'fs'
import { run } from '../lib/commands/vm'
import { useCore } from '../lib/state/core'
import { QuestTask } from '../lib/state/types'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Worlds() {
  const core = useCore()

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-yellow-300 flex-shrink-0 flex-grow-0 bg-yellow-100">
        <h1 className="mb-3 text-xl font-bold">Herzlich Willkommen</h1>
        <p>
          Hallo, das ist eine Quest von Robot Karol. Es geht darum, ein Programm
          zu schreiben, dass in der Lage ist, alle Welten auf den Zielzustand zu
          bringen. Baue dazu im Block-Editor deine Welt zusammen und starte dann
          das Programm.
        </p>
      </div>
      <div className="flex-grow flex-shrink overflow-y-auto">
        {core.ws.tasks.map(renderTask)}
      </div>
      <div className="h-8 flex-shrink-0 flex-grow-0 flex justify-center relative items-center border-t">
        <p className="z-10">0 von {core.ws.tasks.length} Aufgaben gelöst</p>
        <div className="absolute inset-0">
          <div className="h-full bg-green-200" style={{ width: '0%' }}></div>
        </div>
      </div>
    </div>
  )

  function renderTask(task: QuestTask) {
    return (
      <div className="m-3 rounded-xl border-2 border-gray-200 flex justify-between">
        <div className="ml-4 mt-6">
          <h2 className="text-lg font-bold">{task.title}</h2>
          <p className="mt-4 whitespace-nowrap">
            {' '}
            <button
              className={clsx(
                'bg-blue-50 rounded px-2 py-0.5 mr-2 transition-colors',
                'hover:bg-blue-100'
              )}
            >
              <FaIcon icon={faEye} className="mr-2" />
              Anzeigen
            </button>
          </p>
          <p className="mt-4">
            <button
              className={clsx(
                'bg-yellow-300 rounded px-2 py-0.5 mr-2 transition-colors',
                'hover:bg-yellow-400'
              )}
              onClick={() => {
                // TODO: make this a command
                if (core.ws.ui.state == 'error') {
                  alert('Programm enthält Fehler, bitte korrigieren!')
                } else {
                  if (core.ws.ui.state == 'loading') {
                    alert('Programm wird geladen, bitte nochmal probieren')
                  } else {
                    core.mutateWs((ws) => {
                      ws.world = task.start
                      ws.ui.showOutput = true
                    })
                    run(core)
                  }
                }
              }}
            >
              <FaIcon icon={faPlay} className="mr-2" />
              Start
            </button>
          </p>
        </div>
        <div className="h-48 mb-6 mr-8">
          <View
            world={task.start}
            preview={{ track: [], world: task.target }}
            hideKarol={false}
            wireframe={false}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    )
  }
}
