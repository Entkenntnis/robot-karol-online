import { EditorView } from '@codemirror/view'
import { useEffect, useRef } from 'react'
import {
  faArrowRight,
  faArrowTurnUp,
  faCircleExclamation,
  faInfo,
  faInfoCircle,
  faSpinner,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { forceLinting } from '@codemirror/lint'
import { cursorDocEnd } from '@codemirror/commands'

import { setEditable } from '../lib/codemirror/basicSetup'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'
import { Editor } from './Editor'
import { textRefreshDone } from '../lib/commands/json'
import { BlockEditor } from './BlockEditor'
import { setShowCodeInfo } from '../lib/commands/mode'

export function EditArea() {
  const core = useCore()

  const codeState = core.ws.ui.state

  const view = useRef<EditorView>()

  core.view = view

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

  if (core.ws.ui.editorLoading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <FaIcon icon={faSpinner} className="animate-spin text-3xl" />
      </div>
    )
  }

  if (core.ws.settings.mode == 'code') {
    return (
      <div className="h-full flex flex-col overflow-y-auto">
        {renderEditor()}
        {core.ws.ui.state == 'error' && (
          <div className="w-full overflow-auto min-h-[47px] max-h-[200px] flex-grow flex-shrink-0 bg-red-50">
            <div className="flex justify-between mt-[9px]">
              <div className="px-3 pb-1 pt-0">
                <p className="mb-2">
                  <FaIcon
                    icon={faCircleExclamation}
                    className="text-red-600 mr-2"
                  />
                  Beim Einlesen des Programms sind folgende Probleme
                  aufgetreten:
                </p>
                {core.ws.ui.errorMessages.map((err, i) => (
                  <p className="mb-2" key={err + i.toString()}>
                    {err}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return <BlockEditor />

  // TODO for later stage: readd text editor
  function renderEditor() {
    return (
      <div className="flex h-full overflow-y-auto relative flex-shrink">
        <div className="w-full overflow-auto h-full flex">
          {codeState == 'running' || core.ws.ui.karolCrashMessage ? (
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
          <div className="w-full h-full flex flex-col relative">
            {core.ws.ui.showCodeInfo ? (
              <div className="bg-amber-300 px-3 py-4 m-2 rounded relative">
                <button
                  className="w-6 h-6 rounded-full right-4 top-4 absolute hover:bg-gray-100 flex items-end justify-center"
                  onClick={() => {
                    setShowCodeInfo(core, false)
                  }}
                >
                  <FaIcon icon={faTimes} className="text-xl" />
                </button>
                <h2 className="font-bold">Eigene Anweisungen definieren</h2>
                <p className="mt-4">
                  Im Text-Modus kannst du alle Funktionen aus dem Block-Modus
                  verwenden. Zusätzlich kannst du Code-Abschnitte in einer
                  eigenen Anweisung zusammenfassen. Damit lässt sich dein Code
                  übersichtlicher gestalten. Hier ein Beispiel:
                </p>
                <img
                  src="/eigeneanweisung.png"
                  alt="Beispielprogramm"
                  className="mt-4"
                ></img>
              </div>
            ) : (
              <button
                className="inline-block px-1 py-0.5 rounded right-2 top-2 absolute bg-amber-200 hover:bg-amber-300 flex items-end justify-center z-10"
                onClick={() => {
                  setShowCodeInfo(core, true)
                }}
              >
                <FaIcon icon={faInfoCircle} className="ml-1 mb-[3px]" />
                &nbsp;
              </button>
            )}
            <Editor innerRef={view} />
          </div>
        </div>
      </div>
    )
  }
}
