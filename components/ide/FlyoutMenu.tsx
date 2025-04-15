import clsx from 'clsx'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import {
  faExpand,
  faFloppyDisk,
  faFolderOpen,
  faGlobe,
  faPencil,
  faRotateRight,
  faTimes,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { setLng, setMode } from '../../lib/commands/mode'
import { loadProgram, saveCodeToFile } from '../../lib/commands/save'
import { saveEditorSnapshot, setLngStorage } from '../../lib/storage/storage'
import { showModal } from '../../lib/commands/modal'
import { setLanguage } from '../../lib/commands/language'
import { useEffect } from 'react'
import { questData } from '../../lib/data/quests'
import { questDataEn } from '../../lib/data/questsEn'
import { createWorldCmd } from '../../lib/commands/world'
import { createWorld } from '../../lib/state/create'
import { startButtonClicked } from '../../lib/commands/start'
import { navigate } from '../../lib/commands/router'

export function FlyoutMenu() {
  const core = useCore()

  const isVisible = core.ws.ui.showFlyoutMenu

  function closeFlyoutMenu() {
    core.mutateWs(({ ui }) => {
      ui.showFlyoutMenu = false
    })
  }

  // register key down handler on document to close flyout menu as effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        core.mutateWs(({ ui }) => {
          ui.showFlyoutMenu = false
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [core])

  return (
    <div
      className={clsx(
        'fixed inset-0 bg-gray-500/30 z-[200] w-[calc(100%+300px)] transition-all duration-300',
        isVisible ? 'left-0' : '-left-[300px] opacity-0 pointer-events-none'
      )}
      onClick={() => {
        closeFlyoutMenu()
      }}
    >
      <div
        className="w-[300px] bg-white h-full select-none relative rounded-r-xl"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h2 className="font-semibold pl-4 pt-4 mb-4">
          {core.strings.ide.menu}
        </h2>
        <hr />
        <button
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 rounded-lg bg-gray-50 hover:bg-gray-100 px-2 py-0.5"
          onClick={() => {
            closeFlyoutMenu()
          }}
        >
          <FaIcon icon={faTimes} /> {core.strings.ide.close}
        </button>

        {core.ws.ui.isPlayground && (
          <p className="px-2 pt-4">
            <button
              className="px-2 py-0.5 hover:bg-gray-300 rounded"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_ide_playgroundChangeSize')
                core.mutateWs((ws) => {
                  ws.world = ws.quest.tasks[0].start
                })
                showModal(core, 'resize')
                closeFlyoutMenu()
              }}
            >
              <FaIcon icon={faUpRightAndDownLeftFromCenter} className="mr-2" />
              {core.strings.editor.changeSize}
            </button>
          </p>
        )}

        <p className="px-2 pt-4">
          <button
            className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_ide_saveToFile')
              saveCodeToFile(core)
              closeFlyoutMenu()
            }}
          >
            <FaIcon icon={faFloppyDisk} className="mr-1" />{' '}
            {core.strings.ide.save}
          </button>
        </p>
        <p className="px-2 pt-4">
          <button
            className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_ide_loadFromFile')
              const input = document.createElement('input')
              input.type = 'file'
              input.accept =
                core.ws.settings.language == 'python-pro' ? '.py' : '.txt'

              const reader = new FileReader()
              reader.addEventListener('load', (e) => {
                if (e.target != null && typeof e.target.result === 'string') {
                  // if (e.target.result.startsWith('{"version":"v1",')) {
                  //   deserializeQuest(core, JSON.parse(e.target.result))
                  //   history.pushState(null, '', '/')
                  //   // TODO: handle data dependencies
                  //   switchToPage_DEPRECATED_WILL_BE_REMOVED(core, 'shared')
                  // } else {
                  let code = e.target.result
                  if (core.ws.ui.isPlayground) {
                    // check for playground pragma and extract world size
                    const match = code.match(
                      /(\/\/|#) Spielwiese: (\d+), (\d+), (\d+)\n\n/
                    )
                    if (match) {
                      const dimX = parseInt(match[2])
                      const dimY = parseInt(match[3])
                      const height = parseInt(match[4])
                      console.log('create world', dimX, dimY, height)
                      createWorldCmd(core, dimX, dimY, height)
                      core.mutateWs((ws) => {
                        ws.quest.tasks[0].start = createWorld(
                          dimX,
                          dimY,
                          height
                        )
                      })
                      code = code.replace(match[0], '')
                    }
                  }
                  core.mutateWs((s) => {
                    if (core.ws.settings.language == 'java') {
                      s.javaCode = code
                    } else if (core.ws.settings.language == 'python-pro') {
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
                  // }
                  closeFlyoutMenu()
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
            <FaIcon icon={faFolderOpen} className="mr-1" />{' '}
            {core.strings.ide.load}
          </button>
        </p>
        {core.ws.ui.sharedQuestId &&
          core.ws.ui.resetCode[core.ws.ui.sharedQuestId] && (
            <p className="px-2 pt-4">
              <button
                className="px-2 py-0.5 hover:bg-red-100 rounded"
                onClick={() => {
                  closeFlyoutMenu()
                  submitAnalyzeEvent(core, 'ev_click_ide_resetQuestCode')
                  const [language, program] =
                    core.ws.ui.resetCode[core.ws.ui.sharedQuestId!]

                  if (language == 'blocks') {
                    loadProgram(core, program, language as any)
                    if (core.ws.settings.mode == 'blocks') {
                      setMode(core, 'code')
                      core.mutateWs((ws) => {
                        ws.ui.needsTextRefresh = true
                      })
                      const check = () => {
                        if (core.ws.ui.needsTextRefresh) {
                          setTimeout(check, 10)
                        } else {
                          setMode(core, 'blocks')
                        }
                      }
                      check()
                    } else {
                      setMode(core, 'blocks')
                    }
                  } else {
                    setMode(core, 'code')
                    setLanguage(core, language as any)
                    core.mutateWs((ws) => {
                      ws.ui.needsTextRefresh = true
                    })
                    loadProgram(core, program, language as any)
                  }
                }}
              >
                <FaIcon icon={faRotateRight} className="mr-2" />
                {core.strings.ide.resetCode}
              </button>
            </p>
          )}
        {core.ws.quest.id > 0 && core.ws.editor.questScript && (
          <p className="px-2 pt-4">
            <button
              className="px-2 py-0.5 hover:bg-red-100 rounded"
              onClick={() => {
                closeFlyoutMenu()
                submitAnalyzeEvent(core, 'ev_click_ide_resetQuestScriptProgram')
                const id = core.ws.quest.id
                const data =
                  core.ws.settings.lng == 'de' ? questData[id] : questDataEn[id]
                core.mutateWs((ws) => {
                  ws.pythonCode = data.script!.program
                  ws.ui.needsTextRefresh = true
                })
              }}
            >
              <FaIcon icon={faRotateRight} className="mr-2" />
              {core.strings.ide.resetCode}
            </button>
          </p>
        )}
        {(core.ws.page === 'shared' || core.ws.page === 'imported') && (
          <>
            <p className="px-2 pt-4">
              <button
                className="px-2 py-0.5 hover:bg-yellow-300 rounded"
                onClick={() => {
                  if (
                    core.ws.ui.state == 'running' ||
                    core.ws.ui.interactiveClassdiagram
                  ) {
                    startButtonClicked(core)
                  }
                  closeFlyoutMenu()
                  submitAnalyzeEvent(core, 'ev_click_ide_openInEditor')
                  // TODO: handle data dependencies
                  const questId = core.ws.ui.sharedQuestId
                  if (questId && core.ws.ui.resetCode[questId]) {
                    const [language, program] = core.ws.ui.resetCode[questId]
                    loadProgram(core, program, language as any)
                  }
                  core.mutateWs(({ editor, ui }) => {
                    editor.editOptions = 'all'
                    if (ui.lockLanguage == 'java') {
                      editor.editOptions = 'java-only'
                    } else if (ui.lockLanguage == 'karol') {
                      editor.editOptions = 'karol-only'
                    } else if (ui.lockLanguage == 'python-pro') {
                      editor.editOptions = 'python-pro-only'
                    }
                  })
                  saveEditorSnapshot(core)
                  navigate(core, '#EDITOR')
                }}
              >
                <FaIcon icon={faPencil} className="mr-2" />{' '}
                {core.strings.ide.openInEditor}
              </button>
            </p>
            <p className="px-2 pt-4">
              <span className="inline-block mx-2 border px-1 rounded bg-white">
                <FaIcon icon={faGlobe} />
                <select
                  className="p-1 ml-2 rounded bg-white"
                  value={core.ws.settings.lng}
                  onChange={(e) => {
                    const lng = e.target.value
                    if (lng == 'de' || lng == 'en') {
                      setLng(core, lng)
                      setLngStorage(lng)
                      if (lng == 'en') {
                        submitAnalyzeEvent(core, 'ev_click_ide_english')
                      } else if (lng == 'de') {
                        submitAnalyzeEvent(core, 'ev_click_ide_german')
                      }
                    }
                    closeFlyoutMenu()
                  }}
                >
                  <option value="de" className="bg-white">
                    Deutsch
                  </option>
                  <option value="en" className="bg-white">
                    English
                  </option>
                </select>
              </span>
            </p>
          </>
        )}
        <p className="px-2 pt-4">
          <button
            className="ml-2 hover:underline"
            onClick={() => {
              closeFlyoutMenu()
              submitAnalyzeEvent(core, 'ev_click_ide_fullscreen')
              // open fullscreen via browser API
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen()
              }
            }}
          >
            <FaIcon icon={faExpand} /> Vollbild
          </button>
        </p>
      </div>
    </div>
  )
}
