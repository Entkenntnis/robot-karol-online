import { EditorView } from '@codemirror/view'
import { useEffect, useRef } from 'react'
import { faArrowRight, faArrowTurnUp } from '@fortawesome/free-solid-svg-icons'
import { forceLinting } from '@codemirror/lint'
import { cursorDocEnd } from '@codemirror/commands'

import { setEditable } from '../lib/codemirror/basicSetup'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'
import { Editor } from './Editor'
import { textRefreshDone } from '../lib/commands/json'
import { BlockEditor } from './BlockEditor'

export function EditArea() {
  const core = useCore()

  const codeState = core.ws.ui.state

  const view = useRef<EditorView>()

  useEffect(() => {
    if (core.ws.ui.needsTextRefresh && view.current) {
      view.current.dispatch({
        changes: {
          from: 0,
          to: view.current.state.doc.length,
          insert: core.ws.code,
        },
      })
      forceLinting(view.current)
      textRefreshDone(core)
    }
  })

  useEffect(() => {
    if (codeState == 'ready') {
      setEditable(view.current, true)
    }
  }, [codeState])

  return <BlockEditor />

  // TODO for later stage: readd text editor
  function renderEditor() {
    return (
      <div className="flex h-full overflow-y-auto relative">
        <div className="w-full overflow-auto h-full flex">
          {codeState == 'running' ? (
            <div
              data-label="gutter"
              className="w-8 h-full relative flex-shrink-0"
            >
              {core.ws.ui.gutter > 0 && (
                <div
                  className="text-blue-500 absolute w-5 h-5 left-1.5"
                  style={{
                    top: `${4 + (core.ws.ui.gutter - 1) * 22.4 - 2}px`,
                  }}
                >
                  <FaIcon icon={faArrowRight} />
                </div>
              )}{' '}
              {Array.from(new Set(core.ws.ui.gutterReturns)).map((pos, i) => (
                <div
                  key={i}
                  className="text-yellow-300 absolute w-5 h-5 left-2"
                  style={{
                    top: `${4 + (pos - 1) * 22.4 - 2}px`,
                  }}
                >
                  <FaIcon icon={faArrowTurnUp} className="rotate-180" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-8 h-full relative flex-shrink-0"></div>
          )}
          <div className="w-full h-full flex flex-col">
            <Editor innerRef={view} />
            <div
              className="flex-grow flex"
              onClick={() => {
                if (view.current) {
                  cursorDocEnd(view.current)
                  view.current.focus()
                }
              }}
            >
              <div className="w-[30px] border-r h-full bg-neutral-100 border-[#ddd] flex-grow-0 flex-shrink-0"></div>
              <div className="w-full cursor-text"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
