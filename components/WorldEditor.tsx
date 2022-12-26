import {
  faLeftLong,
  faUpLong,
  faRightLong,
  faCaretLeft,
  faUpRightAndDownLeftFromCenter,
  faClone,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, useEffect } from 'react'
import {
  cloneStartIntoTarget,
  closeWorldEditor,
  setShowResizeWorld,
  showPreview,
  switchCurrentlyEditedWorld,
} from '../lib/commands/editor'
import {
  left,
  right,
  forward,
  toggleMark,
  brick,
  toggleBlock,
  unbrick,
} from '../lib/commands/world'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function WorldEditor() {
  const actions: { [key: string]: () => void } = {
    ArrowLeft: () => {
      left(core)
    },
    ArrowRight: () => {
      right(core)
    },
    ArrowUp: () => {
      forward(core)
    },
    ArrowDown: () => {
      forward(core, { reverse: true })
    },
    KeyM: () => {
      toggleMark(core)
    },
    KeyH: () => {
      brick(core)
    },
    KeyQ: () => {
      toggleBlock(core)
    },
    KeyA: () => {
      unbrick(core)
    },
  }

  const handlerDiv = createRef<HTMLDivElement>()

  function runAction(action: string) {
    if (core.ws.editor.showWorldPreview) return
    actions[action]()
  }

  useEffect(() => {
    handlerDiv.current?.focus()
  }, [handlerDiv])

  const core = useCore()
  return (
    <div className="h-full flex flex-col">
      <div className="flex-none bg-gray-100 flex justify-between items-baseline">
        <button
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 ml-3 my-2 rounded"
          onClick={() => {
            closeWorldEditor(core)
          }}
        >
          <FaIcon icon={faCaretLeft} className="mr-1" />
          zurück
        </button>
        <div className="rounded-full border-2 border-gray-400 bg-white">
          <button
            className={clsx(
              'mr-5 px-2 rounded-full py-0.5 m-0.5',
              core.ws.editor.currentlyEditing == 'start' &&
                !core.ws.editor.showWorldPreview &&
                'bg-yellow-200'
            )}
            onClick={() => {
              switchCurrentlyEditedWorld(core, 'start')
              handlerDiv.current?.focus()
            }}
          >
            Startwelt
          </button>
          <button
            className={clsx(
              'px-2 py-0.5 mr-5 rounded-full',
              core.ws.editor.showWorldPreview && 'bg-yellow-200'
            )}
            onClick={() => {
              showPreview(core)
            }}
          >
            Vorschau
          </button>
          <button
            className={clsx(
              'px-2 rounded-full py-0.5 m-0.5',
              core.ws.editor.currentlyEditing == 'target' &&
                !core.ws.editor.showWorldPreview &&
                'bg-yellow-200'
            )}
            onClick={() => {
              switchCurrentlyEditedWorld(core, 'target')
              handlerDiv.current?.focus()
            }}
          >
            Zielwelt
          </button>
        </div>
        <button
          className="px-2 py-0.5 bg-blue-200 hover:bg-blue-300 mr-3 my-2 rounded"
          onClick={() => {
            setShowResizeWorld(core, true)
          }}
        >
          <FaIcon icon={faUpRightAndDownLeftFromCenter} className="mr-2" />
          Größe der Welt ändern
        </button>
      </div>
      <div className="flex-grow flex-shrink flex justify-center overflow-scroll relative">
        {core.ws.editor.currentlyEditing == 'target' &&
          !core.ws.editor.showWorldPreview && (
            <button
              className="absolute right-2 bottom-2 px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => {
                cloneStartIntoTarget(core)
                handlerDiv.current?.focus()
              }}
            >
              <FaIcon icon={faClone} className="mr-2" />
              Start in Ziel kopieren
            </button>
          )}
        <div className="absolute bottom-2 left-2 bg-gray-50">
          {core.ws.ui.messages.map((m) => (
            <div key={`${m.ts}`}>
              {m.text}
              {m.count > 1 && <span> (x{m.count})</span>}
            </div>
          ))}
        </div>
        <div className="w-full h-full overflow-scroll">
          <div className="flex flex-col h-full">
            <div className="m-auto">
              <div
                tabIndex={0}
                className={clsx(
                  'border-2 border-white p-8 m-6 w-fit h-fit',
                  core.ws.editor.showWorldPreview
                    ? ''
                    : 'focus:border-green-200 cursor-pointer'
                )}
                onKeyDown={(e) => {
                  if (actions[e.code]) {
                    runAction(e.code)
                    e.preventDefault()
                    return
                  }
                }}
                onClick={() => {
                  if (core.ws.editor.showWorldPreview) {
                    switchCurrentlyEditedWorld(core, 'start')
                  }
                }}
                ref={handlerDiv}
              >
                {core.ws.editor.showWorldPreview ? (
                  <View
                    world={core.ws.quest.tasks[core.ws.editor.editWorld!].start}
                    preview={{
                      track: [],
                      world:
                        core.ws.quest.tasks[core.ws.editor.editWorld!].target!,
                    }}
                  />
                ) : (
                  <View world={core.ws.world} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-none bg-gray-100 flex justify-around items-baseline py-1">
        <div>
          <button
            className="mx-3 py-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('ArrowLeft')
            }}
            title="LinksDrehen"
          >
            <FaIcon icon={faLeftLong} />
          </button>
          <button
            className="px-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('ArrowUp')
            }}
            title="Schritt"
          >
            <FaIcon icon={faUpLong} />
          </button>
          <button
            className="mx-3 py-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('ArrowRight')
            }}
            title="RechtsDrehen"
          >
            <FaIcon icon={faRightLong} />
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('KeyH')
            }}
            title="Hinlegen"
          >
            <u>H</u>inlegen
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('KeyA')
            }}
            title="Aufheben"
          >
            <u>A</u>ufheben
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('KeyM')
            }}
            title="MarkeSetzen / MarkeLöschen"
          >
            <u>M</u>arke setzen/löschen
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('KeyQ')
            }}
            title="Quader setzen oder löschen"
          >
            <u>Q</u>uader setzen/löschen
          </button>
        </div>
      </div>
    </div>
  )
}
