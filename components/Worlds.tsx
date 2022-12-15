import { faPlay } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useCore } from '../lib/state/core'
import { QuestTask } from '../lib/state/types'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Worlds() {
  const core = useCore()

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-[3px] border-yellow-300 flex-shrink-0 flex-grow-0">
        <h1 className="mb-3 text-xl font-bold">Herzlich Willkommen</h1>
        <p>
          Hallo, das ist eine Quest von Robot Karol. Es geht darum, ein Programm
          zu schreiben, dass in der Lage ist, alle Welten auf den Zielzustand zu
          bringen. Baue dazu im Block-Editor deine Welt zusammen und starte dann
          das Programm.
        </p>
      </div>
      <div className="flex-grow flex-shrink overflow-y-scroll">
        {core.ws.tasks.map(renderTask)}
      </div>
      <div className="h-8 flex-shrink-0 flex-grow-0 flex justify-center relative items-center border-t">
        <p className="z-10">2 von 4 Aufgaben gelöst</p>
        <div className="absolute inset-0">
          <div className="h-full bg-green-200" style={{ width: '50%' }}></div>
        </div>
      </div>
    </div>
  )
}

function renderTask(task: QuestTask) {
  return (
    <div className="m-3 border flex justify-between">
      <div className="m-3">
        <h2 className="text-lg font-bold">{task.title}</h2>
        <p className="mt-8">
          <button
            className={clsx(
              'bg-yellow-300 rounded px-2 py-0.5 mr-2 transition-colors',
              'hover:bg-yellow-400'
            )}
          >
            <FaIcon icon={faPlay} className="mr-2" />
            Start
          </button>
        </p>
      </div>
      <div className="h-48 w-72 m-3">
        <View
          world={task.start}
          preview={{ track: [], world: task.target }}
          hideKarol={false}
          wireframe={false}
        />
      </div>
    </div>
  )
}
