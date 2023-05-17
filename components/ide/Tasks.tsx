import {
  faArrowDown,
  faArrowLeft,
  faArrowUp,
  faAudioDescription,
  faCheck,
  faClone,
  faPencil,
  faPlay,
  faPlus,
  faShareNodes,
  faTrashCan,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, useEffect } from 'react'

import {
  addNewTask,
  cloneTask,
  deleteTask,
  editWorld,
  moveTaskDown,
  moveTaskUp,
  setTaskTitle,
} from '../../lib/commands/editor'
import { showModal } from '../../lib/commands/modal'
import {
  closeHighlightDescription,
  forceRerender,
  setShowStructogram,
} from '../../lib/commands/mode'
import { switchToPage } from '../../lib/commands/page'
import {
  openTask,
  setTaskScroll,
  storeQuestToSession,
} from '../../lib/commands/quest'
import { processMiniMarkdown } from '../../lib/helper/processMiniMarkdown'
import { submit_event } from '../../lib/helper/submit'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { QuestEditor } from './QuestEditor'
import { View } from '../helper/View'

export function Tasks() {
  const core = useCore()

  const audioRef = createRef<HTMLAudioElement>()

  const taskContainer = createRef<HTMLDivElement>()
  const skipWait = core.ws.quest.description.length < 100

  useEffect(() => {
    if (taskContainer.current && core.ws.ui.taskScroll > 0) {
      taskContainer.current.scrollTop = core.ws.ui.taskScroll
    }

    return () => {
      core.mutateWs(({ ui }) => {
        ui.audioStarted = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-auto relative overflow-y-auto">
        <div className="overflow-y-auto bg-gray-100 h-full" ref={taskContainer}>
          <div className="h-20 from-gray-100 bg-gradient-to-t left-0 right-0 bottom-0 absolute pointer-events-none"></div>
          <div>
            {core.ws.quest.audioSrc && (
              <audio ref={audioRef} src={core.ws.quest.audioSrc} />
            )}
            <div
              className={clsx(
                'p-4 px-7 bg-yellow-100',
                core.ws.ui.isHighlightDescription && 'z-[300] relative'
              )}
            >
              {core.ws.page == 'editor' ? (
                <QuestEditor />
              ) : (
                <>
                  <h1 className="mb-4 text-xl font-bold mt-1">
                    {core.ws.quest.title}
                    {core.ws.quest.audioSrc && (
                      <button
                        className="rounded-full ml-6 px-2 py-0.5 text-base font-normal bg-gray-200 hover:bg-gray-300"
                        onClick={() => {
                          if (audioRef.current) {
                            if (core.ws.ui.audioStarted) {
                              audioRef.current.pause()
                              core.mutateWs(({ ui }) => {
                                ui.audioStarted = false
                              })
                            } else {
                              audioRef.current.currentTime = 0
                              audioRef.current.play()
                              submit_event('use_audio', core)
                              core.mutateWs(({ ui }) => {
                                ui.audioStarted = true
                              })

                              audioRef.current.onended = () => {
                                core.mutateWs(({ ui }) => {
                                  ui.audioStarted = false
                                })
                              }
                            }
                          }
                        }}
                      >
                        {core.ws.ui.audioStarted ? (
                          <>
                            <FaIcon
                              icon={faVolumeHigh}
                              className="mr-2 text-sm ml-1 animate-pulse"
                            />
                            Stopp
                          </>
                        ) : (
                          <>
                            <FaIcon
                              icon={faVolumeHigh}
                              className="mr-2 text-sm ml-1"
                            />
                            Vorlesen
                          </>
                        )}
                      </button>
                    )}
                    {core.ws.ui.isAlreadyCompleted && (
                      <span className="text-base font-normal text-green-600 ml-4">
                        <FaIcon icon={faCheck} /> abgeschlossen
                      </span>
                    )}
                  </h1>
                  <div>{processMiniMarkdown(core.ws.quest.description)}</div>
                  {!skipWait && core.ws.ui.isHighlightDescription && (
                    <div className="absolute left-0 right-0 top-0 h-1 w-full flex justify-end">
                      <div
                        className="transition-width w-full h-1 bg-yellow-500 duration-[5000ms] ease-linear"
                        id="progress-bar"
                      ></div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex-grow flex-shrink overflow-y-auto pb-12">
              {core.ws.quest.tasks.map((task, index) => (
                <div
                  className={clsx(
                    'm-3 rounded-xl bg-white flex justify-start',
                    core.ws.page != 'editor' &&
                      (core.ws.ui.isHighlightDescription
                        ? 'relative z-[300]'
                        : 'cursor-pointer hover:bg-gray-50')
                  )}
                  key={index}
                  tabIndex={0}
                  onClick={() => {
                    setTaskScroll(core, taskContainer.current?.scrollTop ?? -1)
                    if (core.ws.page == 'editor') return
                    if (core.ws.ui.isHighlightDescription) return
                    openTask(core, index)
                  }}
                >
                  <div
                    className={clsx(
                      'h-48 mb-6 mx-8',
                      !core.ws.ui.isHighlightDescription && 'cursor-pointer'
                    )}
                    onClick={() => {
                      if (core.ws.page == 'editor') {
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
                  <div className="ml-4 mt-6">
                    <h2 className="text-lg font-bold">
                      {core.ws.page == 'editor' ? (
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
                    {core.ws.page == 'editor' && (
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
                            className="hover:text-black ml-5"
                            onClick={() => {
                              cloneTask(core, index)
                            }}
                          >
                            <FaIcon icon={faClone} className="mr-0.5" /> Auftrag
                            duplizieren
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-10 flex-shrink-0 flex-grow-0 flex bg-gray-100 py-1">
        <div className="flex justify-start relative items-center flex-grow">
          {core.ws.page == 'imported' ? (
            <p className="z-10 text-center w-full">
              <a
                className="px-2 py-0.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold"
                href={window.location.protocol + '//' + window.location.host}
              >
                Robot Karol Online
              </a>
            </p>
          ) : core.ws.page == 'editor' ? (
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
                  showModal(core, 'share')

                  // for debugging
                  //const obj = serializeQuest(core)
                  //const json = JSON.stringify(obj)
                  // console.log('output size', json.length, json)
                }}
              >
                <FaIcon icon={faShareNodes} className="mr-2" />
                Aufgabe freigeben
              </button>
            </p>
          ) : (
            core.ws.page == 'quest' && (
              <p className="z-[300] relative ml-2">
                <button
                  className="px-2 py-0.5 rounded-lg bg-fuchsia-100 hover:bg-fuchsia-200"
                  onClick={() => {
                    if (!core.ws.ui.isHighlightDescription) {
                      // reshow highlight
                      storeQuestToSession(core)
                    }
                    switchToPage(core, 'overview')
                  }}
                >
                  <FaIcon icon={faArrowLeft} className="mx-1" /> zurück zur
                  Übersicht
                </button>
              </p>
            )
          )}
        </div>
        <div className={clsx('flex-grow-0 flex-shrink-0')}>
          <button
            className="mx-2 py-0.5 bg-gray-200 hover:bg-gray-300 px-2 rounded"
            onClick={() => {
              if (core.ws.page == 'editor') {
                showModal(core, 'remix')
              } else {
                setShowStructogram(core, true)
                submit_event('show_structogram', core)
              }
            }}
          >
            {core.ws.page == 'editor' ? 'Aus Vorlage laden' : 'Struktogramm'}
          </button>
        </div>
      </div>
    </div>
  )
}
