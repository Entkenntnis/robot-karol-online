import {
  faCaretRight,
  faCode,
  faExclamationTriangle,
  faPencil,
  faPlay,
  faPuzzlePiece,
  faStop,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { closeHighlightDescription, setMode } from '../../lib/commands/mode'
import {
  closeOutput,
  restartProgram,
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

export function IdeMain() {
  const core = useCore()

  const [toH, setToH] = useState<NodeJS.Timeout | null>(null)

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
            <div className="flex-none h-8 bg-gray-50 flex justify-center items-start">
              <button
                className={clsx(
                  'ml-4 mr-4 border-t-4 px-3  pb-1',
                  core.ws.settings.mode == 'blocks'
                    ? 'border-t-blue-500'
                    : 'border-t-transparent',
                  core.ws.settings.mode == 'code' &&
                    (core.ws.ui.state === 'error' ||
                      core.ws.ui.state === 'running' ||
                      core.ws.ui.toBlockWarning ||
                      core.ws.quest.testerHandler) &&
                    'text-gray-400',
                  core.ws.settings.mode == 'code' &&
                    core.ws.ui.state == 'ready' &&
                    !core.ws.ui.toBlockWarning &&
                    !core.ws.quest.testerHandler
                    ? 'hover:border-t-gray-300 hover:bg-gray-200'
                    : 'cursor-default'
                )}
                onClick={() => {
                  setMode(core, 'blocks')
                }}
              >
                <FaIcon icon={faPuzzlePiece} className="mr-3" />
                Blöcke
              </button>
              <button
                className={clsx(
                  'border-t-4 px-3 pb-1',
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
                <div className="absolute top-10 right-4 z-[101]">
                  {core.ws.ui.state == 'error' &&
                    core.ws.settings.mode == 'blocks' && (
                      <button
                        className="mr-3 bg-red-300 px-1.5 py-0.5 rounded"
                        onClick={() => {
                          showModal(core, 'error')
                        }}
                      >
                        <FaIcon icon={faExclamationTriangle} />
                      </button>
                    )}
                  <button
                    className={clsx(
                      'rounded px-2 py-0.5 transition-colors',
                      core.ws.ui.state == 'ready' &&
                        'bg-green-300 hover:bg-green-400',
                      core.ws.ui.state == 'running' &&
                        'bg-yellow-500 hover:bg-yellow-600',
                      (core.ws.ui.state == 'error' ||
                        core.ws.ui.state == 'loading') &&
                        'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                    onClick={() => {
                      if (core.ws.ui.isTesting && core.ws.ui.state == 'ready') {
                        startTesting(core)
                        return
                      }
                      if (
                        !core.ws.ui.showOutput &&
                        core.ws.ui.state == 'ready'
                      ) {
                        startTesting(core)
                        return
                      }

                      if (core.ws.ui.state == 'running') {
                        abort(core)
                        return
                      }

                      if (
                        core.ws.ui.showOutput &&
                        core.ws.ui.state == 'ready'
                      ) {
                        restartProgram(core)
                      }
                    }}
                  >
                    <FaIcon
                      icon={core.ws.ui.state == 'running' ? faStop : faPlay}
                      className="mr-1"
                    />
                    {core.ws.ui.state == 'running' ? 'Stopp' : 'Start'}
                  </button>
                </div>
              )}
            <EditArea />
          </div>
          {core.ws.ui.isHighlightDescription && (
            <>
              <div
                className={clsx(
                  'absolute right-4 top-10 p-2 bg-white z-[300] rounded'
                )}
              >
                <p>Lies die Anleitung.</p>
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
            </>
          )}
        </ReflexElement>

        <ReflexSplitter
          style={{ width: 6 }}
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400"
        />

        <ReflexElement minSize={0}>
          {core.ws.ui.showOutput ? (
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
