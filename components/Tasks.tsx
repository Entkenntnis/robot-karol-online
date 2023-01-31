import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faListCheck,
  faPencil,
  faPlay,
  faPlus,
  faShareNodes,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, useEffect } from 'react'

import {
  addNewTask,
  deleteTask,
  editWorld,
  moveTaskDown,
  moveTaskUp,
  setShareModal,
  setTaskTitle,
} from '../lib/commands/editor'
import { serializeQuest } from '../lib/commands/json'
import { setShowStructogram, showQuestOverview } from '../lib/commands/mode'
import {
  openTask,
  setTaskScroll,
  startTesting,
  storeQuestToSession,
} from '../lib/commands/quest'
import { questData } from '../lib/data/quests'
import { processMiniMarkdown } from '../lib/helper/processMiniMarkdown'
import { submit_event } from '../lib/helper/submit'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'
import { QuestEditor } from './QuestEditor'
import { View } from './View'

export function Tasks() {
  const core = useCore()

  const taskContainer = createRef<HTMLDivElement>()

  useEffect(() => {
    if (taskContainer.current && core.ws.ui.taskScroll > 0) {
      taskContainer.current.scrollTop = core.ws.ui.taskScroll
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-auto relative overflow-auto">
        <div className="overflow-auto bg-gray-100 h-full" ref={taskContainer}>
          <div className="h-20 from-gray-100 bg-gradient-to-t left-0 right-0 bottom-0 absolute pointer-events-none"></div>
          <div>
            <div className="p-4 px-7 bg-yellow-100">
              {core.ws.ui.isEditor ? (
                <QuestEditor />
              ) : (
                <>
                  <h1 className="mb-2 text-xl font-bold mt-1">
                    {core.ws.quest.title}
                    {core.ws.ui.isAlreadyCompleted && core.ws.quest.id < 0 && (
                      <span className="text-base font-normal text-green-600 ml-4">
                        <FaIcon icon={faCheck} /> abgeschlossen
                      </span>
                    )}
                  </h1>
                  {!core.ws.ui.isImportedProject &&
                    !core.ws.ui.editorLoading &&
                    core.ws.quest.id >= 0 && (
                      <div className="mb-4">
                        <button
                          className={clsx(
                            'text-blue-500 hover:text-blue-600 hover:underline'
                          )}
                          onClick={() => {
                            storeQuestToSession(core)
                            showQuestOverview(core)
                          }}
                        >
                          zurück
                        </button>
                      </div>
                    )}
                  <div>{processMiniMarkdown(core.ws.quest.description)}</div>
                </>
              )}
            </div>
            <div className="flex-grow flex-shrink overflow-y-auto pb-12">
              {core.ws.quest.tasks.map((task, index) => (
                <div
                  className={clsx(
                    'm-3 rounded-xl bg-white flex justify-between',
                    !core.ws.ui.isEditor && 'cursor-pointer hover:bg-gray-50'
                  )}
                  key={index}
                  tabIndex={0}
                  onClick={() => {
                    setTaskScroll(core, taskContainer.current?.scrollTop ?? -1)
                    if (core.ws.ui.isEditor) return
                    openTask(core, index)
                  }}
                >
                  <div className="ml-4 mt-6">
                    <h2 className="text-lg font-bold">
                      {core.ws.ui.isEditor ? (
                        <input
                          value={task.title}
                          className="bg-gray-100"
                          onChange={(e) => {
                            setTaskTitle(core, index, e.target.value)
                          }}
                        />
                      ) : (
                        task.title
                      )}
                    </h2>
                    {core.ws.ui.isEditor && (
                      <>
                        <p className="mt-4">
                          <button
                            className="rounded px-2 py-0.5 bg-gray-100 hover:bg-gray-200"
                            onClick={() => {
                              openTask(core, index)
                            }}
                          >
                            <FaIcon icon={faPlay} className="mr-2" />
                            Testen
                          </button>
                          <button
                            className="ml-3 rounded px-2 py-0.5 bg-blue-100 hover:bg-blue-200"
                            onClick={() => {
                              editWorld(core, index)
                            }}
                          >
                            <FaIcon icon={faPencil} className="mr-2" />
                            Welt bearbeiten
                          </button>
                        </p>
                        <p className="mt-20 text-sm text-gray-700">
                          <button
                            className="hover:text-black disabled:text-gray-200"
                            disabled={index == 0}
                            onClick={() => {
                              moveTaskUp(core, index)
                            }}
                          >
                            <FaIcon icon={faArrowUp} /> hoch
                          </button>
                          <button
                            className="hover:text-black disabled:text-gray-200 ml-5"
                            disabled={index + 1 == core.ws.quest.tasks.length}
                            onClick={() => {
                              moveTaskDown(core, index)
                            }}
                          >
                            <FaIcon icon={faArrowDown} /> runter
                          </button>
                          <button
                            className="hover:text-red-600 ml-5"
                            onClick={() => {
                              deleteTask(core, index)
                            }}
                          >
                            <FaIcon
                              icon={faTrashCan}
                              className="text-gray-500 mr-0.5"
                            />{' '}
                            Auftrag löschen
                          </button>
                        </p>
                      </>
                    )}
                  </div>
                  <div
                    className="h-48 mb-6 mr-8 cursor-pointer"
                    onClick={() => {
                      if (core.ws.ui.isEditor) {
                        editWorld(core, index)
                      }
                    }}
                  >
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
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-10 flex-shrink-0 flex-grow-0 flex bg-gray-100 py-1">
        <div className="flex justify-center relative items-center flex-grow">
          {core.ws.ui.isImportedProject ? (
            <p className="z-10">
              <a
                className="px-2 py-0.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                href={window.location.protocol + '//' + window.location.host}
              >
                Robot Karol Online
              </a>
            </p>
          ) : core.ws.ui.isEditor ? (
            <p className="w-full ml-4">
              <button
                className="px-2 py-0.5 bg-green-300 hover:bg-green-400 rounded mr-4"
                onClick={() => {
                  addNewTask(core)
                }}
              >
                <FaIcon icon={faPlus} className="mr-2" />
                Auftrag hinzufügen
              </button>

              <button
                className="px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 rounded"
                onClick={() => {
                  setShareModal(core, true)

                  // for debugging
                  const obj = serializeQuest(core)
                  const json = JSON.stringify(obj)
                  // console.log('output size', json.length, json)
                }}
              >
                <FaIcon icon={faShareNodes} className="mr-2" />
                Aufgabe freigeben
              </button>
              {window.location.hostname == 'localhost' && (
                <button
                  className="ml-2"
                  onClick={() => {
                    console.log(JSON.stringify(serializeQuest(core)))
                    alert(JSON.stringify(serializeQuest(core)))
                  }}
                >
                  json
                </button>
              )}
              {window.location.hostname == 'localhost' && (
                <button
                  className="ml-2"
                  onClick={() => {
                    const id = parseInt(prompt('Nummer der Quest:') ?? '')
                    const obj = questData[id]
                    if (obj) {
                      core.mutateWs((ws) => {
                        ws.quest.title = obj.title
                        ws.quest.description = obj.description
                        ws.quest.tasks = obj.tasks
                      })
                    }
                  }}
                >
                  load quest
                </button>
              )}
            </p>
          ) : (
            !core.ws.ui.isTesting &&
            !core.ws.ui.isAlreadyCompleted &&
            !core.ws.ui.editorLoading && (
              <p className="z-10">
                <button
                  className="px-2 py-0.5 rounded-lg bg-yellow-300 hover:bg-yellow-400"
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
        </div>
        <div
          className={clsx(
            'flex-grow-0 flex-shrink-0',
            core.ws.ui.isEditor && 'hidden'
          )}
        >
          <button
            className="mx-2 py-0.5 bg-gray-200 hover:bg-gray-300 px-2 rounded"
            onClick={() => {
              setShowStructogram(core, true)
              submit_event('show_structogram', core)
            }}
          >
            Struktogramm
          </button>
        </div>
      </div>
    </div>
  )
}
