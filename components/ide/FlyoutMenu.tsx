import clsx from 'clsx'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import {
  faExpand,
  faFloppyDisk,
  faFolderOpen,
  faMinusCircle,
  faPlusCircle,
  faRotateRight,
  faTimes,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons'
import { ____submitAnalyzeEvent } from '../../lib/helper/submit'
import { setMode } from '../../lib/commands/mode'
import { loadProgram, saveCodeToFile } from '../../lib/commands/save'
import { showModal } from '../../lib/commands/modal'
import { setLanguage } from '../../lib/commands/language'
import { useEffect } from 'react'
import { questData } from '../../lib/data/quests'
import { questDataEn } from '../../lib/data/questsEn'
import { refreshEditArea } from '../../lib/commands/editing'
import {
  decreaseZoomLevel,
  getZoom,
  increaseZoomLevel,
} from '../../lib/commands/zoom'

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
        isVisible ? 'left-0' : '-left-[300px] opacity-0 pointer-events-none',
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
        <h2 className="font-semibold pl-4 pt-4 mb-4">{core.ttung('Menü')}</h2>
        <hr />
        <button
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 rounded-lg bg-gray-50 hover:bg-gray-100 px-2 py-0.5"
          onClick={() => {
            closeFlyoutMenu()
          }}
        >
          <FaIcon icon={faTimes} /> {core.ttung('Schließen')}
        </button>

        {core.ws.ui.isPlayground && (
          <p className="px-2 pt-4">
            <button
              className="px-2 py-0.5 hover:bg-gray-300 rounded"
              onClick={() => {
                core.mutateWs((ws) => {
                  ws.world = ws.quest.tasks[0].start
                })
                showModal(core, 'resize')
                closeFlyoutMenu()
              }}
            >
              <FaIcon icon={faUpRightAndDownLeftFromCenter} className="mr-2" />
              {core.ttung('Größe der Welt ändern')}
            </button>
          </p>
        )}

        <p className="px-2 py-4">
          <button
            className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left"
            onClick={() => {
              saveCodeToFile(core)
              closeFlyoutMenu()
            }}
          >
            <FaIcon icon={faFloppyDisk} className="mr-1" />{' '}
            {core.ws.page == 'spielwiese'
              ? core.ttung('Programm speichern')
              : core.ttung('Bearbeitung speichern')}
          </button>
        </p>
        <p className="px-2">
          <button
            className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left"
            onClick={() => {
              ____submitAnalyzeEvent(core, 'ev_click_ide_loadFromFile')
              const input = document.createElement('input')
              input.type = 'file'
              input.accept =
                core.ws.settings.language == 'python' ? '.py' : '.txt'

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
                  // remove headers prepended by save.ts
                  code = code.replace(
                    /^(\/\/|#) Spielwiese: \d+, \d+, \d+\n\n/,
                    '',
                  )
                  code = code.replace(
                    /^(\/\/|#) Bearbeitung von ".*" \(.*\)\n\n/,
                    '',
                  )
                  core.mutateWs((s) => {
                    if (core.ws.settings.language == 'java') {
                      s.javaCode = code
                    } else if (core.ws.settings.language == 'python') {
                      s.pythonCode = code
                    } else {
                      s.code = code
                    }
                  })
                  refreshEditArea(core)
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
            {core.ws.page == 'spielwiese'
              ? core.ttung('Programm laden')
              : core.ttung('Bearbeitung laden')}
          </button>
        </p>
        {core.ws.ui.sharedQuestId &&
          core.ws.ui.resetCode[core.ws.ui.sharedQuestId] && (
            <p className="px-2 pt-4">
              <button
                className="hover:bg-red-100 px-2 py-2 rounded w-full text-left"
                onClick={() => {
                  closeFlyoutMenu()
                  ____submitAnalyzeEvent(core, 'ev_click_ide_resetQuestCode')
                  const [language, program] =
                    core.ws.ui.resetCode[core.ws.ui.sharedQuestId!]

                  if (language == 'blocks') {
                    loadProgram(core, program, language as any)
                  } else {
                    setMode(core, 'code')
                    setLanguage(core, language as any)
                    loadProgram(core, program, language as any)
                  }
                  refreshEditArea(core)
                }}
              >
                <FaIcon icon={faRotateRight} className="mr-2" />
                {core.ttung('Code zurücksetzen')}
              </button>
            </p>
          )}
        {((core.ws.quest.id > 0 && core.ws.editor.questScript) ||
          (core.ws.quest.id > 100 &&
            questData[core.ws.quest.id].script &&
            questData[core.ws.quest.id].script!.program.length > 0)) && (
          <p className="px-2 pt-4">
            <button
              className="hover:bg-red-100 px-2 py-2 rounded w-full text-left"
              onClick={() => {
                closeFlyoutMenu()
                ____submitAnalyzeEvent(
                  core,
                  'ev_click_ide_resetQuestScriptProgram',
                )
                const id = core.ws.quest.id
                const data =
                  core.ws.settings.lng == 'de' ? questData[id] : questDataEn[id]
                core.mutateWs((ws) => {
                  ws.pythonCode = data.script!.program
                })
                refreshEditArea(core)
              }}
            >
              <FaIcon icon={faRotateRight} className="mr-2" />
              {core.ttung('Code zurücksetzen')}
            </button>
          </p>
        )}
        {/*(core.ws.page === 'shared' || core.ws.page === 'imported') && (
          <>
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
                        ____submitAnalyzeEvent(core, 'ev_click_ide_english')
                      } else if (lng == 'de') {
                        ____submitAnalyzeEvent(core, 'ev_click_ide_german')
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
        )*/}
        {core.ws.page == 'spielwiese' && (
          <p className="px-2 pt-4">
            <button
              className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left"
              onClick={() => {
                // core.mutateWs((ws) => {
                //   ws.world = ws.quest.tasks[0].start
                // })
                showModal(core, 'resize')
                closeFlyoutMenu()
              }}
            >
              <FaIcon icon={faUpRightAndDownLeftFromCenter} className="mr-2" />
              {core.ttung('Größe der Welt ändern')}
            </button>
          </p>
        )}
        <hr className="my-3 mx-4" />
        {!core.ws.ui.isChatMode && (
          <>
            <p className="px-4 pb-4 pt-1 flex justify-between">
              <span>Zoom:</span>
              <span>
                <button
                  onClick={() => {
                    decreaseZoomLevel(core)
                  }}
                >
                  <FaIcon
                    icon={faMinusCircle}
                    className="text-gray-500 hover:text-gray-600 ml-10"
                  />
                </button>
                <input
                  readOnly
                  disabled
                  value={Math.round(getZoom(core) * 100) + '%'}
                  className="mx-4 inline-block w-[70px] outline-none border-2 rounded text-center"
                />
                <button
                  onClick={() => {
                    increaseZoomLevel(core)
                  }}
                >
                  <FaIcon
                    icon={faPlusCircle}
                    className="text-gray-500 hover:text-gray-600"
                  />
                </button>
              </span>
            </p>
            {core.ws.page == 'shared' && (
              <p className="px-2 pb-4">
                <label className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left block cursor-pointer">
                  <input
                    type="checkbox"
                    className="cursor-pointer mr-1"
                    checked={core.ws.ui.showPreview}
                    onChange={(e) => {
                      core.mutateWs((ws) => {
                        ws.ui.showPreview = e.target.checked
                      })
                    }}
                  />{' '}
                  {core.ttung('Auftragsvorschau')}
                </label>
              </p>
            )}
            <p className="px-2 pb-4">
              <label className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left block cursor-pointer">
                <input
                  type="checkbox"
                  className="cursor-pointer mr-1"
                  checked={core.ws.ui.show2D}
                  onChange={(e) => {
                    core.mutateWs((ws) => {
                      ws.ui.show2D = e.target.checked
                    })
                  }}
                />{' '}
                {core.ttung('2D-Ansicht')}
              </label>
            </p>
          </>
        )}
        <p className="px-2">
          <button
            className="hover:bg-gray-200 px-2 py-2 rounded w-full text-left"
            onClick={() => {
              closeFlyoutMenu()
              ____submitAnalyzeEvent(core, 'ev_click_ide_fullscreen')
              // open fullscreen via browser API
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen()
              }
            }}
          >
            <FaIcon icon={faExpand} className="mr-1" /> {core.ttung('Vollbild')}
          </button>
        </p>
      </div>
    </div>
  )
}
