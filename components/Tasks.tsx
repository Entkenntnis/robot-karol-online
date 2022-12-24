import {
  faCheck,
  faCircle,
  faCircleCheck,
  faExternalLink,
  faGear,
  faGrip,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, useEffect } from 'react'

import { showMenu, showQuestOverview } from '../lib/commands/mode'
import {
  openTask,
  startTesting,
  storeQuestToSession,
} from '../lib/commands/quest'
import { replaceWithJSX } from '../lib/helper/replaceWithJSX'
import { submit_event } from '../lib/helper/submit'
import { useCore } from '../lib/state/core'
import { QuestTask } from '../lib/state/types'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Tasks() {
  const core = useCore()

  const taskContainer = createRef<HTMLDivElement>()

  const completed = core.ws.quest.completed.length
  const completedPercent = Math.round(
    (completed / core.ws.quest.tasks.length) * 100
  )

  useEffect(() => {
    if (taskContainer.current && core.ws.ui.taskScroll > 0) {
      taskContainer.current.scrollTop = core.ws.ui.taskScroll
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 px-7 flex-shrink-0 flex-grow-0 bg-yellow-100 relative">
        <h1 className="mb-2 text-xl font-bold mt-1">{core.ws.quest.title}</h1>
        {!core.ws.ui.isImportedProject && (
          <div className="mb-4">
            <button
              className={clsx(
                'text-blue-500 hover:text-blue-600 hover:underline disabled:invisible'
              )}
              disabled={
                completedPercent == 100 && !core.ws.ui.isAlreadyCompleted
              }
              onClick={() => {
                storeQuestToSession(core)
                showQuestOverview(core)
              }}
            >
              zurück
            </button>
          </div>
        )}
        <div>
          {replaceWithJSX(
            replaceWithJSX(
              [core.ws.quest.description],
              /(^\s*(?:$\s*)*$)/gm,
              (_, i) => <div className="h-3" key={`space-${i}`}></div>
            ),
            /`(.+?)`/,
            (str, i) => (
              <span key={`code-${i}`} className="font-[hack] font-bold">
                {str}
              </span>
            )
          )}
        </div>
      </div>
      <div
        className="flex-grow flex-shrink overflow-y-auto bg-gray-100"
        ref={taskContainer}
      >
        {core.ws.quest.tasks.map(renderTask)}
      </div>
      <div className="h-10 flex-shrink-0 flex-grow-0 flex bg-gray-100 py-1">
        <div className="flex justify-center relative items-center flex-grow">
          {core.ws.ui.isImportedProject ? (
            <p className="z-10">
              <a
                className="px-2 py-0.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                href={window.location.protocol + '//' + window.location.host}
                target="_blank"
                rel="noreferrer"
              >
                Robot Karol Online öffnen <FaIcon icon={faExternalLink} />
              </a>
            </p>
          ) : (
            !core.ws.ui.isTesting &&
            !core.ws.ui.isAlreadyCompleted && (
              <p className="z-10">
                <button
                  className={clsx('px-2 py-0.5 rounded-lg bg-yellow-300')}
                  onClick={() => {
                    startTesting(core)
                  }}
                >
                  <FaIcon icon={faListCheck} className="mx-1" /> Überprüfung
                  starten
                </button>
              </p>
            )
          )}
          {!core.ws.ui.isImportedProject && (
            <div
              className={clsx(
                'absolute inset-1 rounded-md left-3 right-2',
                core.ws.ui.isTesting ? 'bg-white' : 'bg-gray-100'
              )}
            >
              <div
                className={clsx(
                  'h-full',
                  completedPercent > 90
                    ? 'rounded-md'
                    : 'rounded-tl-md rounded-bl-md',
                  completedPercent == 100 ? 'bg-gray-100' : 'bg-green-200'
                )}
                style={{
                  width: `${completedPercent}%`,
                }}
              ></div>
            </div>
          )}
        </div>
        <div className="flex-grow-0 flex-shrink-0">
          <button
            className="mx-2 mt-1 bg-gray-200 hover:bg-gray-300 px-2 rounded"
            onClick={() => {
              showMenu(core)
            }}
          >
            <FaIcon icon={faGear} className="mr-1" /> Optionen
          </button>
        </div>
      </div>
    </div>
  )

  function renderTask(task: QuestTask, index: number) {
    return (
      <div
        className={clsx(
          'm-3 rounded-xl bg-white flex justify-between',
          'cursor-pointer hover:bg-gray-50'
        )}
        key={index}
        tabIndex={0}
        onClick={() => {
          openTask(core, index)
          core.mutateWs(({ ui }) => {
            ui.taskScroll = taskContainer.current?.scrollTop ?? -1
          })
        }}
      >
        <div className="ml-4 mt-6">
          <h2
            className={clsx(
              'text-lg',
              !core.ws.quest.completed.includes(index) && 'font-bold'
            )}
          >
            {task.title}
          </h2>
          <div className="mt-6 flex flex-wrap">
            {core.ws.quest.completed.includes(index) ? (
              <>
                <div className="text-green-600 mr-5 whitespace-nowrap">
                  <FaIcon icon={faCheck} /> überprüft
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="h-48 mb-6 mr-8">
          <View
            world={task.start}
            preview={
              task.target === null
                ? undefined
                : { track: [], world: task.target }
            }
            hideKarol={false}
            wireframe={false}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    )
  }
}
