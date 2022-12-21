import {
  faCheck,
  faCircleCheck,
  faExternalLink,
  faGear,
  faGrip,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, useEffect } from 'react'
import { showMenu, showQuestOverview } from '../lib/commands/mode'
import { openTask, storeQuestToSession } from '../lib/commands/quest'

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
        <h1 className="mb-3 text-xl font-bold">{core.ws.quest.title}</h1>
        <p>{core.ws.quest.description}</p>
        {!core.ws.ui.isImportedProject && completedPercent !== 100 && (
          <button
            className="absolute right-2 top-2 px-2 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded"
            onClick={() => {
              storeQuestToSession(core)
              showQuestOverview(core)
            }}
          >
            <FaIcon icon={faGrip} className="mr-1" /> Quest auswählen
          </button>
        )}
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
                className="px-2 py-0.5 rounded-lg bg-yellow-600 text-white font-bold"
                href={window.location.protocol + '//' + window.location.host}
                target="_blank"
                rel="noreferrer"
              >
                Quest auswählen <FaIcon icon={faExternalLink} />
              </a>
            </p>
          ) : completedPercent == 100 ? (
            <p className="z-10">
              <button
                className={clsx(
                  'px-2 py-0.5 rounded-lg  ',
                  core.ws.ui.isAlreadyCompleted
                    ? 'bg-yellow-200'
                    : 'bg-yellow-600 text-white font-bold'
                )}
                onClick={() => {
                  storeQuestToSession(core)
                  showQuestOverview(core)
                }}
              >
                <FaIcon
                  icon={core.ws.ui.isAlreadyCompleted ? faGrip : faCircleCheck}
                  className="mr-2"
                />
                {core.ws.ui.isAlreadyCompleted
                  ? 'Neue Quest auswählen'
                  : 'Quest abschließen'}
              </button>
            </p>
          ) : (
            <p className="z-10">
              {completed} von {core.ws.quest.tasks.length}{' '}
              {core.ws.quest.tasks.length == 1 ? 'Auftrag' : 'Aufträgen'}{' '}
              erledigt
            </p>
          )}
          {!core.ws.ui.isImportedProject && (
            <div className="absolute inset-1 rounded-md bg-white left-3 right-2">
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
            <FaIcon icon={faGear} className="mr-2" /> Optionen
          </button>
        </div>
      </div>
    </div>
  )

  function renderTask(task: QuestTask, index: number) {
    return (
      <div
        className="m-3 rounded-xl bg-white flex justify-between cursor-pointer hover:bg-green-50"
        key={index}
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
                  <FaIcon icon={faCheck} /> abgeschlossen
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
