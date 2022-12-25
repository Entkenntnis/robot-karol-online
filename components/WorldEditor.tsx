import {
  faLeftLong,
  faUpLong,
  faRightLong,
  faCaretLeft,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons'
import { createRef, useEffect } from 'react'
import { closeWorldEditor, setShowResizeWorld } from '../lib/commands/editor'
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
    actions[action]()
  }

  useEffect(() => {
    handlerDiv.current?.focus()
  }, [handlerDiv])

  const core = useCore()
  return (
    <div className="h-full flex flex-col">
      <div className="flex-none bg-gray-100 flex justify-between">
        <button
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 ml-3 my-2 rounded"
          onClick={() => {
            closeWorldEditor(core)
          }}
        >
          <FaIcon icon={faCaretLeft} className="mr-1" />
          zurück
        </button>
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
      <div className="flex-grow flex-shrink flex items-center justify-center overflow-scroll">
        <div className="absolute bottom-2 left-2 bg-gray-50">
          {core.ws.ui.messages.map((m) => (
            <div key={`${m.ts}`}>
              {m.text}
              {m.count > 1 && <span> (x{m.count})</span>}
            </div>
          ))}
        </div>
        <div
          tabIndex={0}
          className="border-2 border-white focus:border-green-200 p-8 m-3 cursor-pointer"
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
      <div className="flex-none bg-gray-100 flex justify-around items-baseline">
        <div>
          <button
            className="mx-3 py-2"
            onClick={() => {
              runAction('ArrowLeft')
            }}
            title="LinksDrehen"
          >
            <FaIcon icon={faLeftLong} />
          </button>
          <button
            className=" px-2"
            onClick={() => {
              runAction('ArrowUp')
            }}
            title="Schritt"
          >
            <FaIcon icon={faUpLong} />
          </button>
          <button
            className="mx-3 py-2"
            onClick={() => {
              runAction('ArrowRight')
            }}
            title="RechtsDrehen"
          >
            <FaIcon icon={faRightLong} />
          </button>
          <button
            className="mx-2"
            onClick={() => {
              runAction('KeyH')
            }}
            title="Hinlegen"
          >
            (H)inlegen
          </button>
          <button
            className="mx-3"
            onClick={() => {
              runAction('KeyA')
            }}
            title="Aufheben"
          >
            (A)ufheben
          </button>
          <button
            className="mx-3"
            onClick={() => {
              runAction('KeyM')
            }}
            title="MarkeSetzen / MarkeLöschen"
          >
            (M)arke setzen/löschen
          </button>
          <button
            className="mx-3"
            onClick={() => {
              runAction('KeyQ')
            }}
            title="Quader setzen oder löschen"
          >
            (Q)uader setzen/löschen
          </button>
        </div>
      </div>
    </div>
  )
}
