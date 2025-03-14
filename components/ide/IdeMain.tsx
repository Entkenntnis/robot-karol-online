import {
  faArrowPointer,
  faCaretRight,
  faCode,
  faDownload,
  faExclamationTriangle,
  faLock,
  faPencil,
  faPlay,
  faPuzzlePiece,
  faQuestionCircle,
  faSpinner,
  faStop,
  faUpload,
  faWarning,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import {
  closeHighlightDescription,
  setMode,
  updatePlaygroundHashToMode,
} from '../../lib/commands/mode'
import {
  closeOutput,
  restartProgram,
  runTask,
  startTesting,
} from '../../lib/commands/quest'
import { useCore } from '../../lib/state/core'
import { EditArea } from './EditArea'
import { FaIcon } from '../helper/FaIcon'
import { Output } from './Output'
import { Structogram } from './Structogram'
import { Tasks } from './Tasks'
import { WorldEditor } from './WorldEditor'
import { HFullStyles } from '../helper/HFullStyles'
import { abort } from '../../lib/commands/vm'
import { showModal } from '../../lib/commands/modal'
import { useEffect, useState } from 'react'
import { JavaInfo } from './JavaInfo'
import { showJavaInfo, setLanguage } from '../../lib/commands/language'
import { Settings } from '../../lib/state/types'
import { saveCodeToFile } from '../../lib/commands/save'
import { startButtonClicked } from '../../lib/commands/start'
import { deserializeQuest } from '../../lib/commands/json'
import { switchToPage } from '../../lib/commands/page'

export function IdeMain() {
  const core = useCore()

  const [toH, setToH] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const onBeforeUnload = (ev: BeforeUnloadEvent) => {
      if (
        core.ws.page == 'shared' &&
        core.ws.vm.bytecode &&
        core.ws.vm.bytecode.length > 0
      ) {
        ev.preventDefault()
        return "Anything here as well, doesn't matter!"
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const skipWait = core.ws.quest.description.length < 100

    core.mutateWs((ws) => {
      ws.ui.showOk = skipWait
    })

    function test() {
      const el = document.getElementById('progress-bar')
      if (el) {
        el.style.width = '0%'
        el.style.backgroundColor = '#a21caf'
        setToH(
          setTimeout(
            () => {
              core.mutateWs((ws) => {
                ws.ui.showOk = true
              })
            },
            skipWait ? 0 : 5000
          )
        )
      } else {
        setTimeout(test, 10)
      }
    }

    if (core.ws.ui.isHighlightDescription && !core.ws.ui.showOk) {
      test()
    }
  }, [core, core.ws.ui.isHighlightDescription])

  const dontChangeLanguage =
    core.ws.ui.state !== 'ready' || !!core.ws.ui.lockLanguage

  return (
    <>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement
          className="h-full !overflow-hidden relative"
          minSize={0}
          onResize={() => {
            if (core.blockyResize) {
              core.blockyResize()
            }
          }}
        >
          {core.ws.ui.isHighlightDescription && (
            <div
              className="fixed inset-0 bg-black/30 z-[200]"
              onClick={() => {
                if (!core.ws.ui.showOk && toH !== null) {
                  clearTimeout(toH)
                }
                closeHighlightDescription(core)
              }}
            ></div>
          )}
          <div className="h-full flex flex-col">
            <div className="flex-none h-8 bg-gray-50 flex justify-center items-start relative ">
              <div className="absolute inset-0 z-20 flex justify-center items-start pointer-events-none">
                {core.ws.ui.lockLanguage ? (
                  <span></span>
                ) : (
                  <button
                    className={clsx(
                      'ml-4 mr-14 border-t-4 px-3  pb-1 z-10 bg-gray-100 pointer-events-auto max-h-7 overflow-hidden',
                      core.ws.settings.mode == 'blocks'
                        ? 'border-t-blue-500'
                        : 'border-t-transparent',
                      core.ws.settings.mode == 'code' &&
                        (core.ws.ui.state === 'error' ||
                          core.ws.ui.state === 'running' ||
                          core.ws.ui.toBlockWarning ||
                          core.ws.quest.testerHandler ||
                          core.ws.ui.proMode) &&
                        'text-gray-400',
                      core.ws.settings.mode == 'code' &&
                        core.ws.ui.state == 'ready' &&
                        !core.ws.ui.toBlockWarning &&
                        !core.ws.quest.testerHandler &&
                        !core.ws.ui.proMode
                        ? 'hover:border-t-gray-300 hover:bg-gray-200'
                        : 'cursor-default'
                    )}
                    onClick={() => {
                      setMode(core, 'blocks')
                    }}
                  >
                    <FaIcon icon={faPuzzlePiece} className="mr-3" />
                    {core.strings.ide.blocks}
                  </button>
                )}
                <button
                  className={clsx(
                    'border-t-4 px-3 pb-1 z-10 bg-gray-100 pointer-events-auto max-h-7 overflow-hidden',
                    core.ws.settings.mode == 'code'
                      ? 'border-t-blue-500'
                      : 'border-t-transparent',
                    core.ws.settings.mode == 'blocks' &&
                      (core.ws.ui.state !== 'ready' ||
                        core.ws.quest.testerHandler) &&
                      'text-gray-400 cursor-default',
                    core.ws.settings.mode == 'blocks' &&
                      core.ws.ui.state == 'ready' &&
                      !core.ws.quest.testerHandler
                      ? 'hover:bg-gray-200 hover:border-t-gray-300'
                      : 'cursor-default'
                  )}
                  onClick={() => {
                    setMode(core, 'code')
                  }}
                >
                  <FaIcon icon={faCode} className="mr-3" />
                  Code
                </button>
              </div>
            </div>

            <div
              className={clsx(
                'flex-none h-8 bg-gray-50 flex justify-between items-start relative',
                core.ws.settings.language == 'python' ||
                  core.ws.settings.mode == 'blocks'
                  ? 'min-w-[620px]'
                  : 'min-w-[450px]'
              )}
            >
              <div className="flex">
                {core.ws.settings.lng == 'de' &&
                  core.ws.settings.mode === 'code' && (
                    <div className="">
                      {core.ws.ui.proMode &&
                      core.ws.settings.language == 'java' ? (
                        <div
                          className={clsx(
                            'px-2 py-1 bg-yellow-200 rounded pl-2',
                            core.ws.ui.state !== 'ready' &&
                              'pointer-events-none'
                            // core.ws.ui.state == 'error' && 'invisible',
                            // core.ws.ui.state == 'running' && 'invisible'
                          )}
                        >
                          {core.ws.ui.lockLanguage ? (
                            <FaIcon icon={faLock} />
                          ) : (
                            <button
                              onClick={() => {
                                showJavaInfo(core)
                              }}
                            >
                              <FaIcon icon={faQuestionCircle} />
                            </button>
                          )}{' '}
                          Java Profi-Modus (im Aufbau)
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            'p-1 pl-2 whitespace-nowrap',
                            core.ws.ui.state !== 'ready' &&
                              'pointer-events-none'
                            // core.ws.ui.state == 'error' && 'invisible',
                            // core.ws.ui.state == 'running' && 'invisible'
                          )}
                        >
                          {core.ws.ui.lockLanguage ? (
                            <FaIcon icon={faLock} />
                          ) : (
                            <button
                              onClick={() => {
                                showJavaInfo(core)
                              }}
                            >
                              <FaIcon
                                icon={faQuestionCircle}
                                className="text-gray-600"
                              />
                            </button>
                          )}{' '}
                          {core.strings.ide.language}:
                          <select
                            className={clsx(
                              'px-1 py-0.5 inline-block ml-2 bg-white rounded',
                              !dontChangeLanguage &&
                                'cursor-pointer hover:bg-gray-100',
                              core.ws.ui.proMode && 'pointer-events-none'
                            )}
                            value={core.ws.settings.language}
                            onChange={(e) => {
                              setLanguage(
                                core,
                                e.target.value as Settings['language']
                              )
                            }}
                            disabled={dontChangeLanguage}
                          >
                            <option value="robot karol">Robot Karol</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                          </select>{' '}
                        </div>
                      )}
                    </div>
                  )}
                {core.ws.settings.mode === 'blocks' && (
                  <div className="ml-3 mt-1 text-gray-600">
                    <FaIcon icon={faArrowPointer} className="mr-2" />
                    {core.strings.ide.blockExplainer}
                  </div>
                )}
                {core.ws.settings.mode == 'code' &&
                  core.ws.settings.language == 'python' &&
                  (core.ws.ui.proMode ||
                    window.location.hostname == 'localhost') && (
                    <div className="ml-3 mt-1 max-h-6 overflow-hidden">
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          checked={core.ws.ui.proMode}
                          onChange={(e) => {
                            core.mutateWs(({ ui }) => {
                              ui.proMode = e.target.checked
                            })
                            updatePlaygroundHashToMode(core)
                          }}
                        />{' '}
                        Profi-Modus (Python 3.12)
                      </label>
                    </div>
                  )}
              </div>
              <div className="max-h-7 overflow-hidden">
                <button
                  className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 hover:text-black"
                  onClick={() => {
                    saveCodeToFile(core)
                  }}
                >
                  <FaIcon icon={faDownload} className="mr-1 text-gray-500" />{' '}
                  {core.strings.ide.save}
                </button>
                <button
                  className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 hover:text-black"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.txt,.json'

                    const reader = new FileReader()
                    reader.addEventListener('load', (e) => {
                      if (
                        e.target != null &&
                        typeof e.target.result === 'string'
                      ) {
                        if (e.target.result.startsWith('{"version":"v1",')) {
                          deserializeQuest(core, JSON.parse(e.target.result))
                          history.pushState(null, '', '/')
                          switchToPage(core, 'shared')
                        } else {
                          const code = e.target.result
                          core.mutateWs((s) => {
                            if (core.ws.settings.language == 'java') {
                              s.javaCode = code
                            } else if (core.ws.settings.language == 'python') {
                              s.pythonCode = code
                            } else {
                              s.code = code
                            }
                            s.ui.needsTextRefresh = true
                          })
                          if (core.ws.settings.mode == 'blocks') {
                            setMode(core, 'code')
                            const check = () => {
                              if (core.ws.ui.needsTextRefresh) {
                                setTimeout(check, 10)
                              } else {
                                setMode(core, 'blocks')
                              }
                            }
                            check()
                          }
                        }
                      }
                    })

                    input.addEventListener('change', () => {
                      if (input.files != null) {
                        let file = input.files[0]
                        reader.readAsText(file)
                      }
                    })

                    const evt = new MouseEvent('click', {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                    })

                    input.dispatchEvent(evt)
                  }}
                >
                  <FaIcon icon={faUpload} className="mr-1 text-gray-500" />{' '}
                  {core.strings.ide.load}
                </button>
              </div>
            </div>
            {!(
              core.ws.ui.isTesting &&
              core.ws.ui.state == 'ready' &&
              core.ws.quest.testerHandler
            ) &&
              !(
                core.ws.ui.isEndOfRun && core.ws.ui.controlBarShowFinishQuest
              ) &&
              !core.ws.ui.isHighlightDescription &&
              core.ws.modal !== 'name' && (
                <div className="absolute top-20 right-4 z-[101]">
                  {core.ws.ui.state == 'error' &&
                    core.ws.settings.mode == 'blocks' && (
                      <button
                        className="mr-3 bg-red-300 px-1.5 py-0.5 rounded"
                        onClick={() => {
                          showModal(core, 'error')
                        }}
                      >
                        <FaIcon icon={faExclamationTriangle} />
                        <span className="inline-block rounded-full bg-red-500 text-white w-6 ml-2 my-1">
                          {core.ws.ui.errorMessages.length}
                        </span>
                      </button>
                    )}
                  <button
                    className={clsx(
                      'rounded px-6 pt-1 pb-2 transition-colors whitespace-nowrap',
                      (core.ws.ui.state == 'ready' ||
                        (core.ws.ui.state == 'running' &&
                          core.ws.vm.isDebugging)) &&
                        'bg-green-300 hover:bg-green-400',
                      core.ws.ui.state == 'running' &&
                        !core.ws.vm.isDebugging &&
                        'bg-yellow-500 hover:bg-yellow-600',
                      (core.ws.ui.state == 'error' ||
                        core.ws.ui.state == 'loading') &&
                        'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                    onClick={() => {
                      startButtonClicked(core)
                    }}
                  >
                    <FaIcon
                      icon={
                        core.ws.ui.state == 'running' && !core.ws.vm.isDebugging
                          ? faStop
                          : core.ws.ui.state == 'loading' &&
                            core.ws.ui.proMode &&
                            core.ws.settings.language == 'python'
                          ? faSpinner
                          : faPlay
                      }
                      className={clsx(
                        'mr-2',
                        core.ws.ui.state == 'loading' &&
                          core.ws.ui.proMode &&
                          core.ws.settings.language == 'python' &&
                          'animate-spin-slow'
                      )}
                    />
                    <span className="text-xl">
                      {core.ws.ui.state == 'running'
                        ? core.ws.vm.isDebugging
                          ? core.strings.ide.continue
                          : core.strings.ide.stop
                        : core.strings.ide.start}
                    </span>
                  </button>
                </div>
              )}
            <EditArea />
          </div>
          {core.ws.ui.isHighlightDescription && (
            <span>
              <div
                className={clsx(
                  'absolute right-4 top-10 p-2 bg-white z-[300] rounded'
                )}
              >
                <p>{core.strings.ide.read}</p>
                <p className="text-center mt-2">
                  <button
                    onClick={() => {
                      closeHighlightDescription(core)
                    }}
                    className={clsx(
                      'px-2 py-0.5 rounded bg-green-200 hover:bg-green-300 transition-colors disabled:bg-gray-200'
                    )}
                    disabled={!core.ws.ui.showOk}
                  >
                    OK
                  </button>
                </p>
              </div>
              <div
                className={clsx(
                  'absolute right-0.5 top-10 text-white text-3xl z-[300]'
                )}
              >
                <FaIcon icon={faCaretRight} />
              </div>
            </span>
          )}
        </ReflexElement>

        <ReflexSplitter
          style={{ width: 6 }}
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400"
        />

        <ReflexElement minSize={0}>
          {core.ws.ui.showJavaInfo ? (
            <JavaInfo />
          ) : core.ws.ui.showOutput ? (
            <Output />
          ) : core.ws.ui.showStructogram ? (
            <Structogram />
          ) : core.ws.editor.editWorld !== null ? (
            <WorldEditor />
          ) : (
            <Tasks />
          )}
        </ReflexElement>
      </ReflexContainer>
      <HFullStyles />
    </>
  )
}
