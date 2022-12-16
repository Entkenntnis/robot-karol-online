import {
  faBars,
  faCircleCheck,
  faEye,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

import { run } from '../lib/commands/vm'
import { useCore } from '../lib/state/core'
import { QuestTask } from '../lib/state/types'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Tasks() {
  const core = useCore()

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 flex-shrink-0 flex-grow-0 bg-yellow-100">
        <h1 className="mb-3 text-xl font-bold">{core.ws.quest.title}</h1>
        <p>{core.ws.quest.description}</p>
      </div>
      <div className="flex-grow flex-shrink overflow-y-auto bg-gray-100">
        {core.ws.quest.tasks.map(renderTask)}
      </div>
      <div className="h-8 flex-shrink-0 flex-grow-0 flex">
        <div className="flex justify-center relative items-center flex-grow">
          <p className="z-10">
            0 von {core.ws.quest.tasks.length} Aufträgen erledigt
          </p>
          <div className="absolute inset-0">
            <div className="h-full bg-green-200" style={{ width: '40%' }}></div>
          </div>
        </div>
        <div className="flex-grow-0 flex-shrink-0">
          <button
            className="mx-2 mt-1 bg-gray-100 hover:bg-gray-200 px-2 rounded"
            onClick={() => {
              // TODO: as command
              core.mutateWs(({ ui }) => {
                ui.showMenu = true
              })
            }}
          >
            <FaIcon icon={faBars} className="mr-2" /> Menü
          </button>
        </div>
      </div>
    </div>
  )

  function renderTask(task: QuestTask, index: number) {
    return (
      <div className="m-3 rounded-xl bg-white flex justify-between" key={index}>
        <div className="ml-4 mt-6">
          <h2 className="text-lg font-bold">{task.title}</h2>
          <p className="mt-6">
            {core.ws.quest.completed.includes(index) ? (
              <span className="text-green-600">
                <FaIcon icon={faCircleCheck} /> abgeschlossen
              </span>
            ) : (
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
                        ws.quest.lastStartedTask = index
                      })
                      run(core)
                    }
                  }
                }}
              >
                <FaIcon icon={faPlay} className="mr-2" />
                Start
              </button>
            )}
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
