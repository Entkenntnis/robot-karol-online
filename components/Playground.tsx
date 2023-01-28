import {
  faLeftLong,
  faUpLong,
  faRightLong,
  faCaretLeft,
  faUpRightAndDownLeftFromCenter,
  faClone,
  faSeedling,
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
import { ControlBar } from './ControlBar'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Playground() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const core = useCore()
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow-0 flex-shrink-0 min-h-[82px] bg-gray-100">
        <ControlBar />
      </div>
      <div className="flex-grow flex-shrink flex justify-center overflow-scroll relative">
        <div className="absolute right-1 bottom-1">
          <button
            className="px-2 py-0.5 bg-blue-200 hover:bg-blue-300 mr-3 my-2 rounded"
            onClick={() => {
              setShowResizeWorld(core, true)
            }}
          >
            <FaIcon icon={faUpRightAndDownLeftFromCenter} className="mr-2" />
            Neue Welt
          </button>
        </div>
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
                  'border-2 border-white p-8 m-6 w-fit h-fit focus:border-green-200 cursor-pointer'
                )}
                onKeyDown={(e) => {
                  if (actions[e.code]) {
                    runAction(e.code)
                    e.preventDefault()
                    return
                  }
                }}
                ref={handlerDiv}
              >
                <View world={core.ws.world} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-none bg-gray-100 flex justify-around items-baseline py-1">
        <div>
          <button
            className="mx-3 py-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            onClick={() => {
              runAction('ArrowLeft')
            }}
            title="LinksDrehen"
          >
            <FaIcon icon={faLeftLong} />
          </button>
          <button
            className="px-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            onClick={() => {
              runAction('ArrowUp')
            }}
            title="Schritt"
          >
            <FaIcon icon={faUpLong} />
          </button>
          <button
            className="mx-3 py-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            onClick={() => {
              runAction('ArrowRight')
            }}
            title="RechtsDrehen"
          >
            <FaIcon icon={faRightLong} />
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            onClick={() => {
              runAction('KeyH')
            }}
            title="Hinlegen"
          >
            <u>H</u>inlegen
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            onClick={() => {
              runAction('KeyA')
            }}
            title="Aufheben"
          >
            <u>A</u>ufheben
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            onClick={() => {
              runAction('KeyM')
            }}
            title="MarkeSetzen / MarkeLöschen"
          >
            <u>M</u>arke setzen/löschen
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
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
