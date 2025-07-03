import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faClone,
  faInfoCircle,
  faPaintBrush,
  faPencil,
  faPlay,
  faPlus,
  faShareNodes,
  faTimes,
  faTrashCan,
  faUndo,
  faWarning,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, Fragment, useEffect, useRef, useState } from 'react'

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
import { setMode, setShowStructogram } from '../../lib/commands/mode'
import { openTask, setTaskScroll } from '../../lib/commands/quest'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { QuestEditor } from './QuestEditor'
import { View } from '../helper/View'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { navigate } from '../../lib/commands/router'

export function Tasks() {
  const core = useCore()

  const taskContainer = createRef<HTMLDivElement>()
  const skipWait = core.ws.quest.description.length < 100

  const editChat =
    core.ws.ui.isChatMode &&
    core.ws.page === 'editor' &&
    !core.ws.editor.showQuestPreview

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
            <div
              className={clsx(
                'pt-4 pb-1 px-7 bg-yellow-100',
                core.ws.ui.isHighlightDescription && 'z-[300] relative'
              )}
            >
              {core.ws.page == 'editor' ? (
                <QuestEditor />
              ) : (
                <>
                  <h1 className="mb-4 text-xl font-bold mt-1">
                    {core.ws.quest.title}
                    {core.ws.ui.isAlreadyCompleted && (
                      <span className="text-base font-normal text-green-600 ml-4">
                        <FaIcon icon={faCheck} />{' '}
                        {core.strings.ide.taskCompleted}
                      </span>
                    )}
                  </h1>
                  <div>{processMarkdown(core.ws.quest.description)}</div>
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

            {core.ws.page === 'editor' && !core.ws.editor.showQuestPreview && (
              <div className="mx-3 mt-3 justify-between flex text-sm text-gray-700 items-baseline">
                {core.ws.ui.isChatMode ? (
                  <div className="italic text-gray-500">{/* hm ?*/} &nbsp;</div>
                ) : (
                  <div>
                    {core.strings.editor.editOptions}:
                    <select
                      className={clsx(
                        'p-1 rounded ml-3',

                        core.ws.ui.isChatMode &&
                          'disabled opacity-50 pointer-events-none'
                      )}
                      value={core.ws.editor.editOptions}
                      onChange={(e) => {
                        core.mutateWs(({ editor }) => {
                          editor.editOptions = e.target.value as any
                        })
                      }}
                    >
                      <option value="all">{core.strings.editor.all}</option>
                      <option value="karol-only">
                        {core.strings.editor.karolOnly}
                      </option>
                      <option value="java-only">
                        {core.strings.editor.javaOnly}
                      </option>
                      <option value="python-pro-only">
                        {core.strings.editor.pythonProOnly}
                      </option>
                    </select>
                  </div>
                )}
                <div>
                  <label>
                    Auftragstyp:{' '}
                    <select
                      className="p-1 rounded ml-1"
                      value={core.ws.ui.isChatMode ? 'chat' : 'world'}
                      onChange={(e) => {
                        const isChatMode = e.target.value === 'chat'
                        if (isChatMode) {
                          submitAnalyzeEvent(core, 'ev_click_ide_chatMode')
                        }
                        core.mutateWs((ws) => {
                          const { ui, quest, editor, settings } = ws
                          ui.isChatMode = isChatMode
                          if (quest.chats.length === 0) {
                            quest.chats = [
                              {
                                title: 'Chat 1',
                                messages: [],
                              },
                            ]
                          }
                          if (isChatMode) {
                            editor.editOptions = 'python-pro-only'
                            ui.lockLanguage = 'python-pro'
                            settings.language = 'python-pro'
                          } else {
                            ui.lockLanguage = undefined
                            editor.editOptions = 'all'
                          }
                        })
                        if (isChatMode) {
                          setMode(core, 'code')
                          core.mutateWs((ws) => {
                            if (ws.pythonCode == 'karol = Robot()\n\n') {
                              ws.pythonCode = '\n'
                            }
                          })
                        }
                      }}
                    >
                      <option value="world">Welt</option>
                      <option value="chat">Chat</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
            <div className="flex-grow flex-shrink overflow-y-auto pb-12">
              {core.ws.ui.isChatMode
                ? core.ws.quest.chats.map((chat, index) => (
                    <div key={index} className="m-3 rounded-xl bg-white flex">
                      <div className="border-r-2 p-3 pb-1 min-w-[150px] flex-col min-h-[130px] justify-between flex">
                        <div className="font-bold">
                          {editChat ? (
                            <input
                              className="bg-gray-100 border-2 max-w-full"
                              value={chat.title}
                              onChange={(e) => {
                                core.mutateWs(({ quest }) => {
                                  quest.chats[index].title = e.target.value
                                })
                              }}
                            ></input>
                          ) : (
                            <>{chat.title}</>
                          )}
                          {core.ws.vm.chatCursor &&
                            core.ws.vm.chatCursor.chatIndex > index && (
                              <div>
                                <FaIcon
                                  icon={faCheck}
                                  className="text-green-300 text-3xl ml-3 mt-3"
                                />
                              </div>
                            )}
                        </div>
                        <div className={clsx(!editChat && 'hidden')}>
                          <button
                            onClick={() => {
                              if (index > 0) {
                                core.mutateWs(({ quest }) => {
                                  const element = quest.chats.splice(
                                    index,
                                    1
                                  )[0]
                                  quest.chats.splice(index - 1, 0, element)
                                })
                              }
                            }}
                          >
                            <FaIcon
                              icon={faArrowUp}
                              className="text-gray-600"
                            />
                          </button>
                          <button
                            className="ml-3"
                            onClick={() => {
                              if (index + 1 < core.ws.quest.chats.length) {
                                core.mutateWs(({ quest }) => {
                                  const element = quest.chats.splice(
                                    index,
                                    1
                                  )[0]
                                  quest.chats.splice(index + 1, 0, element)
                                })
                              }
                            }}
                          >
                            <FaIcon
                              icon={faArrowDown}
                              className="text-gray-600"
                            />
                          </button>
                          <button
                            className="ml-3"
                            onClick={() => {
                              core.mutateWs(({ quest }) => {
                                quest.chats.splice(index, 0, {
                                  ...quest.chats[index],
                                })
                              })
                            }}
                          >
                            <FaIcon icon={faClone} className="text-gray-400" />
                          </button>
                          <button
                            className="ml-3"
                            onClick={() => {
                              const result = confirm(
                                'Willst du diesen Chat wirklich löschen?'
                              )
                              if (result) {
                                core.mutateWs(({ quest }) => {
                                  quest.chats.splice(index, 1)
                                })
                              }
                            }}
                          >
                            <FaIcon
                              icon={faTrashCan}
                              className="text-red-200 hover:text-red-300"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="flex-grow flex flex-col">
                        <div className="my-3 flex-grow">
                          {chat.messages.map((message, msgIndex) => {
                            const showCursor =
                              core.ws.vm.chatCursor &&
                              core.ws.vm.chatCursor.chatIndex === index &&
                              core.ws.vm.chatCursor.msgIndex === msgIndex

                            const isAboveCursor =
                              !core.ws.vm.chatCursor ||
                              core.ws.vm.chatCursor.chatIndex > index ||
                              (core.ws.vm.chatCursor.chatIndex === index &&
                                core.ws.vm.chatCursor.msgIndex > msgIndex)

                            const nextOnFail =
                              core.ws.vm.chatCursorMode == 'warn' &&
                              core.ws.vm.chatCursor &&
                              core.ws.vm.chatCursor.chatIndex == index &&
                              core.ws.vm.chatCursor.msgIndex == msgIndex

                            return (
                              <Fragment key={msgIndex}>
                                {showCursor && renderChatCursor()}
                                <div
                                  className={clsx(
                                    'flex my-1 mx-2',
                                    message.role == 'in' && 'justify-end'
                                  )}
                                >
                                  <div
                                    className={clsx(
                                      'rounded-lg px-3 py-0.5',
                                      message.role == 'out'
                                        ? 'bg-cyan-100 rounded-bl-none'
                                        : 'bg-orange-100 rounded-br-none',
                                      isAboveCursor
                                        ? core.ws.vm.chatCursor
                                          ? ''
                                          : index > 0
                                          ? 'opacity-50'
                                          : ''
                                        : nextOnFail
                                        ? 'opacity-60'
                                        : 'opacity-30'
                                    )}
                                  >
                                    {message.text}
                                  </div>
                                </div>
                              </Fragment>
                            )
                          })}
                          {core.ws.vm.chatCursor &&
                            core.ws.vm.chatCursor.chatIndex === index &&
                            core.ws.vm.chatCursor.msgIndex ==
                              chat.messages.length &&
                            renderChatCursor()}
                        </div>

                        {editChat && <AddMessageBar index={index} />}
                      </div>
                    </div>
                  ))
                : core.ws.quest.tasks.map((task, index) => (
                    <div
                      className={clsx(
                        'm-3 rounded-xl bg-white flex justify-start',
                        core.ws.page != 'editor' &&
                          (core.ws.ui.isHighlightDescription
                            ? 'relative z-[300]'
                            : 'cursor-pointer hover:bg-gray-50'),
                        core.ws.page != 'editor' &&
                          core.ws.ui.isHighlightDescription &&
                          core.ws.ui.showOk &&
                          'cursor-pointer hover:bg-gray-50',
                        core.ws.page == 'editor' &&
                          core.ws.editor.showQuestPreview &&
                          'cursor-pointer'
                      )}
                      key={index}
                      tabIndex={0}
                      onClick={() => {
                        setTaskScroll(
                          core,
                          taskContainer.current?.scrollTop ?? -1
                        )
                        if (core.ws.page == 'editor') {
                          if (core.ws.editor.showQuestPreview) {
                            openTask(core, index)
                          }
                          return
                        }
                        if (
                          core.ws.ui.isHighlightDescription &&
                          !core.ws.ui.showOk
                        )
                          return
                        if (core.ws.ui.isHighlightDescription) {
                          core.mutateWs((ws) => {
                            ws.ui.isHighlightDescription = false
                          })
                        }
                        openTask(core, index)
                      }}
                    >
                      <div
                        className={clsx(
                          'h-48 mb-6 mx-8',
                          !core.ws.ui.isHighlightDescription && 'cursor-pointer'
                        )}
                        onClick={() => {
                          if (
                            core.ws.page == 'editor' &&
                            !core.ws.editor.showQuestPreview
                          ) {
                            editWorld(core, index)
                          }
                        }}
                      >
                        <View
                          world={task.start}
                          preview={
                            task.target === null
                              ? undefined
                              : { world: task.target }
                          }
                          hideKarol={false}
                          wireframe={false}
                          className="h-full w-full object-contain"
                          robotImageDataUrl={core.ws.robotImageDataUrl}
                        />
                      </div>
                      <div className="ml-4 mt-6">
                        <h2 className="text-lg font-bold">
                          {core.ws.page == 'editor' &&
                          !core.ws.editor.showQuestPreview ? (
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
                        {core.ws.page == 'editor' &&
                          !core.ws.editor.showQuestPreview && (
                            <>
                              <p className="mt-4">
                                <button
                                  className="rounded px-2 py-0.5 bg-gray-100 hover:bg-gray-200"
                                  onClick={() => {
                                    submitAnalyzeEvent(
                                      core,
                                      'ev_click_editor_testWorld'
                                    )
                                    openTask(core, index)
                                  }}
                                >
                                  <FaIcon icon={faPlay} className="mr-2" />
                                  {core.strings.editor.test}
                                </button>
                                <button
                                  className="ml-3 rounded px-2 py-0.5 bg-blue-100 hover:bg-blue-200"
                                  onClick={() => {
                                    submitAnalyzeEvent(
                                      core,
                                      'ev_click_editor_editWorld'
                                    )
                                    editWorld(core, index)
                                  }}
                                >
                                  <FaIcon icon={faPencil} className="mr-2" />
                                  {core.strings.editor.editWorld}
                                </button>
                              </p>
                              <p className="mt-20 text-sm text-gray-700">
                                <button
                                  className="hover:text-black disabled:text-gray-200"
                                  disabled={index == 0}
                                  onClick={() => {
                                    submitAnalyzeEvent(
                                      core,
                                      'ev_click_editor_moveUp'
                                    )
                                    moveTaskUp(core, index)
                                  }}
                                >
                                  <FaIcon icon={faArrowUp} />{' '}
                                  {core.strings.editor.up}
                                </button>
                                <button
                                  className="hover:text-black disabled:text-gray-200 ml-5"
                                  disabled={
                                    index + 1 == core.ws.quest.tasks.length
                                  }
                                  onClick={() => {
                                    submitAnalyzeEvent(
                                      core,
                                      'ev_click_editor_moveDown'
                                    )
                                    moveTaskDown(core, index)
                                  }}
                                >
                                  <FaIcon icon={faArrowDown} />{' '}
                                  {core.strings.editor.down}
                                </button>
                                <button
                                  className="hover:text-black ml-5"
                                  onClick={() => {
                                    submitAnalyzeEvent(
                                      core,
                                      'ev_click_editor_cloneTask'
                                    )
                                    cloneTask(core, index)
                                  }}
                                >
                                  <FaIcon icon={faClone} className="mr-0.5" />{' '}
                                  {core.strings.editor.duplicate}
                                </button>
                                <button
                                  className="hover:text-red-600 ml-5"
                                  onClick={() => {
                                    submitAnalyzeEvent(
                                      core,
                                      'ev_click_editor_deleteTask'
                                    )
                                    deleteTask(core, index)
                                  }}
                                >
                                  <FaIcon
                                    icon={faTrashCan}
                                    className="text-gray-500 mr-0.5"
                                  />{' '}
                                  {core.strings.editor.delete}
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
      <div
        className={clsx(
          'h-10 flex-shrink-0 flex-grow-0 flex bg-gray-100 py-1',
          core.ws.ui.isPlayground
            ? 'sm:min-w-[400px]'
            : core.ws.page == 'editor'
            ? 'sm:min-w-[550px]'
            : 'sm:min-w-[380px]',
          core.ws.editor.showQuestPreview && 'hidden'
        )}
      >
        <div className="flex justify-start relative items-center flex-grow">
          {core.ws.page == 'editor' ? (
            <p className="w-full ml-4">
              <button
                className="px-2 py-0.5 bg-green-300 hover:bg-green-400 rounded mr-4"
                onClick={() => {
                  if (core.ws.ui.isChatMode) {
                    let counter = core.ws.quest.chats.length + 1
                    while (
                      core.ws.quest.chats.some(
                        (x) => x.title === `Chat ${counter}`
                      )
                    ) {
                      counter++
                    }
                    core.mutateWs((ws) => {
                      ws.quest.chats.push({
                        title: `Chat ${counter}`,
                        messages: [],
                      })
                    })
                  } else {
                    addNewTask(core)
                  }
                }}
              >
                <FaIcon icon={faPlus} className="mr-2" />
                {core.ws.ui.isChatMode
                  ? 'Chat hinzufügen'
                  : core.strings.editor.addTask}
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
                {core.strings.editor.publish}
              </button>
            </p>
          ) : core.ws.page == 'quest' ? null : core.ws.page == 'shared' ||
            core.ws.page == 'imported' ? (
            <p className="z-10 w-full ml-3 overflow">
              {core.ws.ui.isPlayground ? (
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
                  Spielwiese freigeben
                </button>
              ) : (
                <a
                  href="/#"
                  onClick={(e) => {
                    navigate(core, '')
                    e.preventDefault()
                  }}
                  className="underline cursor-pointer text-gray-600"
                >
                  Robot Karol Online
                </a>
              )}
            </p>
          ) : null}
        </div>
        <div className={clsx('flex-grow-0 flex-shrink-0')}>
          {(core.ws.page == 'editor' ||
            (!core.ws.ui.proMode && core.ws.ui.pythonProCanSwitch)) &&
            !core.ws.ui.isChatMode && (
              <button
                className="mx-2 py-0.5 bg-gray-200 hover:bg-gray-300 px-2 rounded"
                onClick={() => {
                  if (core.ws.page == 'editor') {
                    submitAnalyzeEvent(core, 'ev_click_ide_remix')
                    showModal(core, 'remix')
                  } else {
                    setShowStructogram(core, true)
                    submitAnalyzeEvent(core, 'ev_click_ide_structogram')
                  }
                }}
              >
                {core.ws.page == 'editor'
                  ? core.strings.editor.loadFrom
                  : core.strings.ide.structogram}
              </button>
            )}
          {(core.ws.page === 'shared' ||
            core.ws.page === 'imported' ||
            core.ws.page === 'quest') &&
            !core.ws.ui.isChatMode && (
              <button
                className="mx-1 px-2 bg-gray-200 py-0.5 hover:bg-gray-300 rounded text-gray-600 hidden sm:inline"
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_ide_appearance')
                  showModal(core, 'appearance')
                }}
              >
                <FaIcon icon={faPaintBrush} />
              </button>
            )}
          {core.ws.ui.isChatMode && core.ws.page != 'editor' && (
            <button
              className="mx-1 px-2 bg-gray-200 py-0.5 hover:bg-gray-300 rounded text-gray-600 hidden sm:inline"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_ide_chatGuide')
                showModal(core, 'chat-guide')
              }}
            >
              <FaIcon icon={faInfoCircle} className="text-gray-500" /> Anleitung
            </button>
          )}
        </div>
      </div>
    </div>
  )

  function renderChatCursor() {
    return (
      <>
        {core.ws.vm.chatSpill.length > 0 && (
          <div className="relative">
            <div className="absolute right-2 top-2">
              <button
                className="rounded-full flex w-6 h-6 items-center justify-center bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  core.mutateWs(({ vm }) => {
                    vm.chatCursor = undefined
                    vm.chatSpill = []
                  })
                }}
              >
                <FaIcon icon={faTimes} className="text-gray-500" />
              </button>
            </div>
            <div
              className={clsx(
                'h-1 w-full my-2',
                core.ws.vm.chatCursorMode == 'play'
                  ? 'bg-green-300'
                  : 'bg-yellow-200'
              )}
            ></div>
            <div className="my-1 mx-2 flex">
              <div className="rounded-lg bg-gray-200 rounded-bl-none px-3 py-0.5">
                {core.ws.vm.chatSpill[0]}
              </div>
            </div>
            <div className="text-sm mx-2 mt-4 mb-2 italic">
              <span className="text-gray-500">Deine Ausgabe</span> stimmt nicht
              mit der <span className="text-cyan-500">erwarteten Ausgabe</span>{' '}
              überein.
            </div>
          </div>
        )}
        {core.ws.vm.chatCursorMode == 'warn' &&
          core.ws.vm.chatSpill.length == 0 && (
            <div className="relative">
              <div className="absolute right-2 top-3">
                <button
                  className="rounded-full flex w-6 h-6 items-center justify-center bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    core.mutateWs(({ vm }) => {
                      vm.chatCursor = undefined
                      vm.chatSpill = []
                    })
                  }}
                >
                  <FaIcon icon={faTimes} className="text-gray-500" />
                </button>
              </div>
              <div className={clsx('h-1 w-full my-2 bg-yellow-200')}></div>
              <div className="text-sm mx-2 mt-4 mb-3 italic mr-7">
                {core.ws.quest.chats[core.ws.vm.chatCursor!.chatIndex].messages[
                  core.ws.vm.chatCursor!.msgIndex
                ].role == 'out' ? (
                  <>
                    Dein Programm ist frühzeitig beendet, erwarte{' '}
                    <span className="text-cyan-500">weitere Ausgaben:</span>
                  </>
                ) : (
                  <>
                    Bitte frage{' '}
                    <span className="text-orange-500">die nächste Eingabe</span>{' '}
                    mit{' '}
                    <code className="not-italic font-bold mx-1">input()</code>{' '}
                    ab.
                  </>
                )}
              </div>
            </div>
          )}
        <div className="w-full relative" id="chat-cursor">
          <div className="absolute -top-3 left-0 right-0 text-center">
            <span
              className={clsx(
                'inline-block px-2 rounded bg-white',
                core.ws.vm.chatCursorMode == 'play'
                  ? 'text-green-400'
                  : 'text-yellow-300'
              )}
            >
              <FaIcon
                icon={core.ws.vm.chatCursorMode == 'play' ? faPlay : faWarning}
              />
            </span>
          </div>
          <div
            className={clsx(
              'h-1 w-full my-2',
              core.ws.vm.chatCursorMode == 'play'
                ? 'bg-green-300'
                : 'bg-yellow-200'
            )}
          ></div>
        </div>
      </>
    )
  }
}

function AddMessageBar({ index }: { index: number }) {
  const core = useCore()
  const [text, setText] = useState('')

  return (
    <div className="flex justify-between mt-2 mb-2 border-t pt-2 border-t-gray-400 px-2">
      <button
        className="border-cyan-200 border-2 hover:bg-cyan-50 px-2 py-0.5 rounded text-sm whitespace-nowrap"
        onClick={() => {
          if (text.trim() == '') return
          core.mutateWs(({ quest }) => {
            quest.chats[index].messages.push({
              role: 'out',
              text,
            })
            setText('')
          })
        }}
      >
        + output
      </button>
      <div className="flex-grow mx-2">
        <input
          className="w-full border-2 px-1"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
          }}
        ></input>
      </div>
      <button
        className="border-orange-200 border-2 hover:bg-orange-50 px-2 py-0.5 rounded text-sm whitespace-nowrap"
        onClick={() => {
          if (text.trim() == '') return
          core.mutateWs(({ quest }) => {
            quest.chats[index].messages.push({
              role: 'in',
              text,
            })
          })
          setText('')
        }}
      >
        + input
      </button>
      <button
        onClick={() => {
          if (core.ws.quest.chats[index].messages.length > 0) {
            core.mutateWs(({ quest }) => {
              const msg = quest.chats[index].messages.pop()
              setText(msg?.text ?? '')
            })
          }
        }}
      >
        <FaIcon icon={faUndo} className="text-gray-400 ml-2" />
      </button>
    </div>
  )
}
