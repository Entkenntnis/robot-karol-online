import {
  faArrowLeft,
  faCaretRight,
  faCode,
  faExclamationTriangle,
  faPlayCircle,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { closeHighlightDescription } from '../../lib/commands/mode'
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
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { InteractionBar } from './InteractionBar'
import { FlyoutMenu } from './FlyoutMenu'
import { is } from 'date-fns/locale'
import { exitQuest } from '../../lib/commands/quest'
import { navigate } from '../../lib/commands/router'
import { deleteEditorSnapshot } from '../../lib/storage/storage'

export function IdeMain() {
  const core = useCore()

  const [toH, setToH] = useState<NodeJS.Timeout | null>(null)

  const [activeTab, setActiveTab] = useState<'program' | 'output'>('output')
  const [isMobileView, setIsMobileView] = useState<boolean>(false)

  // Check if we're in mobile view on mount and when window resizes
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 640
      setIsMobileView(isMobile)
    }

    // Check on mount
    checkMobileView()

    // Add resize listener
    window.addEventListener('resize', checkMobileView)

    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobileView)
    }
  }, [])

  useEffect(() => {
    if (core.ws.ui.state == 'running') {
      if (isMobileView) {
        setActiveTab('output')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core.ws.ui.state])

  useEffect(() => {
    if (core.ws.ui.isHighlightDescription && window.innerWidth < 640) {
      closeHighlightDescription(core)
      core.mutateWs((ws) => {
        ws.ui.collapseDescription = true
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core.ws.ui.isHighlightDescription])

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
      <div className="flex w-full bg-gray-200 border-b border-gray-300 sm:hidden relative">
        <div className="absolute top-1 left-1">
          {(core.ws.page == 'quest' ||
            core.ws.ui.isPlayground ||
            core.ws.page == 'editor') && (
            <button
              className="px-3 py-1 border-gray-300 bg-fuchsia-200 rounded-full transition duration-150 ease-in-out hover:bg-fuchsia-300 mr-2"
              onClick={() => {
                if (core.ws.page == 'quest') {
                  exitQuest(core)
                } else if (core.ws.ui.isPlayground) {
                  navigate(core, '')
                } else if (core.ws.page == 'editor') {
                  const res = confirm(core.strings.editor.leaveWarning)
                  if (res) {
                    deleteEditorSnapshot()
                    navigate(core, '')
                  }
                }
              }}
            >
              <FaIcon icon={faArrowLeft} />
            </button>
          )}
        </div>
        <button
          className={clsx(
            'flex-1 py-2 px-4 text-center font-medium pl-10',
            activeTab === 'program'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          )}
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_ide_mobileTabProgram')
            setActiveTab('program')
            if (core.blockyResize) {
              setTimeout(() => {
                if (core.blockyResize) core.blockyResize()
              }, 10)
              setTimeout(() => {
                if (core.blockyResize) core.blockyResize()
              }, 20)
              setTimeout(() => {
                if (core.blockyResize) core.blockyResize()
              }, 100)
              setTimeout(() => {
                if (core.blockyResize) core.blockyResize()
              }, 400)
            }
          }}
        >
          <FaIcon icon={faCode} className="mr-2" /> Programm
        </button>
        <button
          className={clsx(
            'flex-1 py-2 px-4 text-center font-medium',
            activeTab === 'output'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          )}
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_ide_mobileTabOutput')
            setActiveTab('output')
          }}
        >
          <FaIcon icon={faPlayCircle} className="mr-2" /> Welt
        </button>
      </div>
      <ReflexContainer
        orientation="vertical"
        windowResizeAware
        className={clsx(isMobileView ? '!h-[calc(100%-43px)]' : '')}
      >
        <ReflexElement
          className={clsx(
            'h-full !overflow-hidden relative',
            isMobileView && (activeTab == 'program' ? '!flex-1' : 'hidden')
          )}
          minSize={0}
          size={isMobileView ? (activeTab == 'program' ? 640 : 0) : undefined}
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
          <div className={clsx('flex flex-col h-full')}>
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
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400 hidden sm:block"
        />

        <ReflexElement
          minSize={0}
          size={isMobileView ? (activeTab == 'output' ? 640 : 0) : undefined}
          className={clsx(
            isMobileView && (activeTab == 'output' ? '!flex-1' : 'hidden')
          )}
        >
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
