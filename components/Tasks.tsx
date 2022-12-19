import {
  faBars,
  faCheck,
  faCircleCheck,
  faEye,
  faPlay,
  faRotateRight,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useEffect } from 'react'
import { showMenu } from '../lib/commands/mode'
import { endTaskWaiting, runTask } from '../lib/commands/quest'

import { run } from '../lib/commands/vm'
import { useCore } from '../lib/state/core'
import { QuestTask } from '../lib/state/types'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Tasks() {
  const core = useCore()

  const completed = core.ws.quest.completed.length
  const completedPercent = Math.round(
    (completed / core.ws.quest.tasks.length) * 100
  )

  useEffect(() => {
    if (core.ws.ui.state !== 'loading') {
      if (core.ws.ui.taskWaitingToLoad !== undefined) {
        const taskIndex = core.ws.ui.taskWaitingToLoad
        endTaskWaiting(core)
        runTask(core, taskIndex)
      }
    }
  }, [core, core.ws.ui.state])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 px-7 flex-shrink-0 flex-grow-0 bg-yellow-100">
        <h1 className="mb-3 text-xl font-bold">
          {core.ws.quest.title}{' '}
          {completedPercent == 100 && (
            <span className="text-green-600 text-base ml-4">
              <FaIcon icon={faCircleCheck} /> Quest abgeschlossen
            </span>
          )}
        </h1>
        <p>{core.ws.quest.description}</p>
      </div>
      <div className="flex-grow flex-shrink overflow-y-auto bg-gray-100">
        {core.ws.quest.tasks.map(renderTask)}
      </div>
      <div className="h-10 flex-shrink-0 flex-grow-0 flex bg-gray-100 py-1">
        <div className="flex justify-center relative items-center flex-grow">
          {completed == core.ws.quest.tasks.length ? (
            <p className="z-10">
              <button className="px-2 py-0.5 rounded-lg bg-yellow-600 text-white font-bold">
                Neue Quest auswählen
              </button>
            </p>
          ) : (
            <p className="z-10">
              {completed} von {core.ws.quest.tasks.length}{' '}
              {core.ws.quest.tasks.length == 1 ? 'Auftrag' : 'Aufträgen'}{' '}
              erledigt
            </p>
          )}
          <div className="absolute inset-1 rounded-md bg-white left-3 right-2">
            <div
              className={clsx(
                'h-full',
                completedPercent > 90
                  ? 'rounded-md'
                  : 'rounded-tl-md rounded-bl-md',
                completedPercent < 100 ? 'bg-green-200' : 'bg-gray-100'
              )}
              style={{
                width: `${completedPercent}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex-grow-0 flex-shrink-0">
          <button
            className="mx-2 mt-1 bg-gray-200 hover:bg-gray-300 px-2 rounded"
            onClick={() => {
              showMenu(core)
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
          <p className="mt-6 flex flex-wrap">
            {core.ws.quest.completed.includes(index) ? (
              <>
                <div className="text-green-600 mr-5 whitespace-nowrap">
                  <FaIcon icon={faCheck} /> abgeschlossen
                </div>
                <div>
                  <button
                    className="underline text-gray-700 select-none whitespace-nowrap"
                    onClick={() => {
                      runTask(core, index)
                    }}
                  >
                    <FaIcon
                      icon={faRotateRight}
                      className="mr-1 text-sm"
                      style={{ verticalAlign: '-2.5px' }}
                    />
                    erneut ausführen
                  </button>
                </div>
              </>
            ) : (
              <button
                className={clsx(
                  'bg-yellow-300 rounded px-2 py-0.5 mr-2 transition-colors',
                  'hover:bg-yellow-400'
                )}
                onClick={() => {
                  runTask(core, index)
                }}
                disabled={core.ws.ui.taskWaitingToLoad !== undefined}
              >
                {core.ws.ui.taskWaitingToLoad !== index ? (
                  <FaIcon icon={faPlay} className="mr-2" />
                ) : (
                  <FaIcon icon={faSpinner} className="mr-2 animate-spin" />
                )}
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
