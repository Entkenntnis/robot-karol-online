import {
  faCaretRight,
  faDownload,
  faExclamationTriangle,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { closeHighlightDescription, setMode } from '../../lib/commands/mode'
import { useCore } from '../../lib/state/core'
import { EditArea } from './EditArea'
import { FaIcon } from '../helper/FaIcon'
import { Output } from './Output'
import { Structogram } from './Structogram'
import { Tasks } from './Tasks'
import { WorldEditor } from './WorldEditor'
import { HFullStyles } from '../helper/HFullStyles'
import { showModal } from '../../lib/commands/modal'
import { useEffect, useState } from 'react'
import { JavaInfo } from './JavaInfo'
import { saveCodeToFile } from '../../lib/commands/save'
import { deserializeQuest } from '../../lib/commands/json'
import { switchToPage } from '../../lib/commands/page'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { InteractionBar } from './InteractionBar'
import { FlyoutMenu } from './FlyoutMenu'

export function IdeMain() {
  const core = useCore()

  const [toH, setToH] = useState<NodeJS.Timeout | null>(null)

  /*useEffect(() => {
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
  }, [])*/

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
    (core.ws.ui.state !== 'ready' &&
      !(
        core.ws.settings.language == 'python-pro' &&
        core.worker &&
        !core.worker.mainWorkerReady
      )) ||
    !!core.ws.ui.lockLanguage ||
    !core.ws.ui.pythonProCanSwitch

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
                <div className="absolute top-16 right-2 z-[101]">
                  {core.ws.ui.state == 'error' &&
                    core.ws.settings.mode == 'blocks' && (
                      <button
                        className="mr-3 bg-red-300 px-1.5 py-0.5 rounded"
                        onClick={() => {
                          submitAnalyzeEvent(core, 'ev_click_ide_errorMessages')
                          showModal(core, 'error')
                        }}
                      >
                        <FaIcon icon={faExclamationTriangle} />
                        <span className="inline-block rounded-full bg-red-500 text-white w-6 ml-2 my-1">
                          {core.ws.ui.errorMessages.length}
                        </span>
                      </button>
                    )}
                </div>
              )}
            <InteractionBar />
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
      <FlyoutMenu />
    </>
  )
}
