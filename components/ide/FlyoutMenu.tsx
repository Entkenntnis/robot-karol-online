import clsx from 'clsx'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import {
  faDownload,
  faGlobe,
  faPencil,
  faTimes,
  faUpload,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { deserializeQuest } from '../../lib/commands/json'
import { setLng, setMode } from '../../lib/commands/mode'
import { switchToPage } from '../../lib/commands/page'
import { saveCodeToFile } from '../../lib/commands/save'
import { setLngStorage } from '../../lib/storage/storage'
import { showModal } from '../../lib/commands/modal'

export function FlyoutMenu() {
  const core = useCore()

  const isVisible = core.ws.ui.showFlyoutMenu

  function closeFlyoutMenu() {
    core.mutateWs(({ ui }) => {
      ui.showFlyoutMenu = false
    })
  }

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
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={() => {
            closeFlyoutMenu()
          }}
        >
          <FaIcon icon={faTimes} />
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
            className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 hover:text-black"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_ide_saveToFile')
              saveCodeToFile(core)
              closeFlyoutMenu()
            }}
          >
            <FaIcon icon={faDownload} className="mr-1 text-gray-500" />{' '}
            {core.strings.ide.save}
          </button>
        </p>
        <p className="px-2 pt-4">
          <button
            className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 hover:text-black"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_ide_loadFromFile')
              const input = document.createElement('input')
              input.type = 'file'
              input.accept =
                core.ws.settings.language == 'python-pro' ? '.py' : '.txt,.json'

              const reader = new FileReader()
              reader.addEventListener('load', (e) => {
                if (e.target != null && typeof e.target.result === 'string') {
                  if (e.target.result.startsWith('{"version":"v1",')) {
                    deserializeQuest(core, JSON.parse(e.target.result))
                    history.pushState(null, '', '/')
                    switchToPage(core, 'shared')
                  } else {
                    const code = e.target.result
                    core.mutateWs((s) => {
                      if (core.ws.settings.language == 'java') {
                        s.javaCode = code
                      } else if (
                        core.ws.settings.language == 'python' ||
                        core.ws.settings.language == 'python-pro'
                      ) {
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
            <FaIcon icon={faUpload} className="mr-1 text-gray-500" />{' '}
            {core.strings.ide.load}
          </button>
        </p>
        {(core.ws.page === 'shared' || core.ws.page === 'imported') && (
          <>
            <p className="px-2 pt-4">
              <button
                className="px-2 py-0.5 hover:bg-gray-300 rounded"
                onClick={() => {
                  closeFlyoutMenu()
                  submitAnalyzeEvent(core, 'ev_click_ide_openInEditor')
                  core.mutateWs((ws) => {
                    ws.editor.keepQuest = true
                  })
                  switchToPage(core, 'editor')
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
      </div>
    </div>
  )
}
