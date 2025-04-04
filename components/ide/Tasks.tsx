import {
  faArrowDown,
  faArrowLeft,
  faArrowUp,
  faCheck,
  faClone,
  faComment,
  faMessage,
  faPaintBrush,
  faPencil,
  faPlay,
  faPlus,
  faShareNodes,
  faShirt,
  faTrashCan,
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
import { closeModal, showModal } from '../../lib/commands/modal'
import { setShowStructogram } from '../../lib/commands/mode'
import { switchToPage } from '../../lib/commands/page'
import {
  openTask,
  setTaskScroll,
  storeQuestToSession,
} from '../../lib/commands/quest'
import {
  processMiniMarkdown,
  renderDescription,
} from '../../lib/helper/processMiniMarkdown'
import { submit_event } from '../../lib/helper/submit'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { QuestEditor } from './QuestEditor'
import { View } from '../helper/View'
import { setLngStorage } from '../../lib/storage/storage'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { sub } from 'date-fns'

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
                    {core.ws.ui.isAlreadyCompleted && (
                      <span className="text-base font-normal text-green-600 ml-4">
                        <FaIcon icon={faCheck} />{' '}
                        {core.strings.ide.taskCompleted}
                      </span>
                    )}
                  </h1>
                  <div>{renderDescription(core)}</div>
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
              <div className="ml-3 mt-3">
                {core.strings.editor.editOptions}:
                <select
                  className="p-2 ml-3"
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
                  <option value="python-only">
                    {core.strings.editor.pythonOnly}
                  </option>
                  <option value="java-only">
                    {core.strings.editor.javaOnly}
                  </option>
                  <option value="python-pro-only">
                    {core.strings.editor.pythonProOnly}
                  </option>
                </select>
                <span className="ml-14 inline-block">
                  <label className="select-none">
                    <input
                      type="checkbox"
                      checked={core.ws.editor.saveProgram}
                      onChange={(e) => {
                        core.mutateWs(({ editor }) => {
                          editor.saveProgram = e.target.checked
                        })
                      }}
                    />{' '}
                    {core.strings.editor.includeProgram}
                  </label>
                </span>
              </div>
            )}
            <div className="flex-grow flex-shrink overflow-y-auto pb-12">
              {core.ws.quest.tasks.map((task, index) => (
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
                    setTaskScroll(core, taskContainer.current?.scrollTop ?? -1)
                    if (core.ws.page == 'editor') {
                      if (core.ws.editor.showQuestPreview) {
                        openTask(core, index)
                      }
                      return
                    }
                    if (core.ws.ui.isHighlightDescription && !core.ws.ui.showOk)
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
                                openTask(core, index)
                              }}
                            >
                              <FaIcon icon={faPlay} className="mr-2" />
                              {core.strings.editor.test}
                            </button>
                            <button
                              className="ml-3 rounded px-2 py-0.5 bg-blue-100 hover:bg-blue-200"
                              onClick={() => {
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
                                moveTaskUp(core, index)
                              }}
                            >
                              <FaIcon icon={faArrowUp} />{' '}
                              {core.strings.editor.up}
                            </button>
                            <button
                              className="hover:text-black disabled:text-gray-200 ml-5"
                              disabled={index + 1 == core.ws.quest.tasks.length}
                              onClick={() => {
                                moveTaskDown(core, index)
                              }}
                            >
                              <FaIcon icon={faArrowDown} />{' '}
                              {core.strings.editor.down}
                            </button>
                            <button
                              className="hover:text-black ml-5"
                              onClick={() => {
                                cloneTask(core, index)
                              }}
                            >
                              <FaIcon icon={faClone} className="mr-0.5" />{' '}
                              {core.strings.editor.duplicate}
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
            ? 'min-w-[400px]'
            : core.ws.page == 'editor'
            ? 'min-w-[550px]'
            : 'min-w-[380px]'
        )}
      >
        <div className="flex justify-start relative items-center flex-grow">
          {core.ws.page == 'editor' ? (
            <p className="w-full ml-4">
              <button
                className="px-2 py-0.5 bg-green-300 hover:bg-green-400 rounded mr-4"
                onClick={() => {
                  addNewTask(core)
                }}
              >
                <FaIcon icon={faPlus} className="mr-2" />
                {core.strings.editor.addTask}
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
          ) : core.ws.page == 'quest' ? (
            <p className="z-[300] relative ml-2">
              <button
                className="px-2 py-0.5 rounded-lg bg-fuchsia-100 hover:bg-fuchsia-200 whitespace-nowrap"
                onClick={() => {
                  if (!core.ws.ui.isHighlightDescription) {
                    // reshow highlight
                    storeQuestToSession(core)
                  }
                  closeModal(core)
                  switchToPage(
                    core,
                    core.ws.ui.returnToDemoPage ? 'demo' : 'overview'
                  )
                }}
              >
                <FaIcon icon={faArrowLeft} className="mx-1" />{' '}
                {core.strings.ide.backToOverview}
              </button>
            </p>
          ) : core.ws.page == 'shared' || core.ws.page == 'imported' ? (
            <p className="z-10 w-full ml-3 overflow">
              {core.ws.ui.isPlayground ? (
                <a
                  className="underline text-gray-600 cursor-pointer"
                  onClick={() => {
                    switchToPage(core, 'overview')
                  }}
                >
                  zurück zu Robot Karol Online
                </a>
              ) : (
                <a
                  className="underline cursor-pointer text-gray-600"
                  onClick={() => {
                    switchToPage(core, 'overview')
                  }}
                >
                  Robot Karol Online
                </a>
              )}
            </p>
          ) : null}
        </div>
        <div className={clsx('flex-grow-0 flex-shrink-0')}>
          {!core.ws.ui.proMode && core.ws.settings.language != 'python-pro' && (
            <button
              className="mx-2 py-0.5 bg-gray-200 hover:bg-gray-300 px-2 rounded"
              onClick={() => {
                if (core.ws.page == 'editor') {
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
            core.ws.page === 'quest') && (
            <button
              className="mx-1 px-2 bg-gray-200 py-0.5 hover:bg-gray-300 rounded text-gray-600"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_ide_appearance')
                showModal(core, 'appearance')
              }}
            >
              <FaIcon icon={faPaintBrush} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
