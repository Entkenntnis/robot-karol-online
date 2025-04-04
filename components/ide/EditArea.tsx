import { EditorView } from '@codemirror/view'
import { useEffect, useRef } from 'react'
import { faCircleExclamation, faTimes } from '@fortawesome/free-solid-svg-icons'
import { forceLinting } from '@codemirror/lint'

import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { Editor } from './Editor'
import { textRefreshDone } from '../../lib/commands/json'
import { JavaEditor } from './JavaEditor'
import clsx from 'clsx'
import { PythonEditor } from './PythonEditor'
import {
  cursorLineEnd,
  insertNewline,
  simplifySelection,
  toggleComment,
} from '@codemirror/commands'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { BlockEditor } from './BlockEditor'
import { QuestPrompt } from '../helper/QuestPrompt'

export function EditArea() {
  const core = useCore()

  const view = useRef<EditorView>()

  core.view = view

  useEffect(() => {
    if (core.ws.ui.needsTextRefresh && view.current) {
      view.current.dispatch({
        changes: {
          from: 0,
          to: view.current.state.doc.length,
          insert: core.ws.ui.editQuestScript
            ? core.ws.editor.questScript
            : core.ws.settings.language == 'robot karol'
            ? core.ws.code
            : core.ws.settings.language == 'python' ||
              core.ws.settings.language == 'python-pro'
            ? core.ws.pythonCode
            : core.ws.javaCode,
        },
      })
      forceLinting(view.current)
      textRefreshDone(core)
    }
  })

  function insertCodeSnippet(insert: string[], cursorOffset: number) {
    if (view.current) {
      simplifySelection(view.current)
      cursorLineEnd(view.current)
      const { from, to } = view.current.state.doc.lineAt(
        view.current.state.selection.main.anchor
      )
      let lineText = view.current.state.sliceDoc(from, to)
      let spaces = ''
      while (lineText.startsWith(' ')) {
        spaces += ' '
        lineText = lineText.slice(1)
      }

      if (lineText.trim().length > 0) {
        insertNewline(view.current)
      }

      const range = view.current.state.selection.main
      view.current.dispatch({
        changes: {
          from: range.to,
          to: range.to,
          insert:
            (lineText.trim().length > 0 ? spaces : '') +
            insert.join('\n' + spaces),
        },
        selection: {
          anchor:
            range.to +
            cursorOffset +
            (lineText.trim().length > 0 ? spaces.length : 0),
        },
      })
      view.current.focus()
    }
  }

  if (core.ws.settings.mode == 'code') {
    return (
      <div className="h-full flex flex-col overflow-y-auto relative">
        {core.ws.settings.language === 'python' && (
          <>
            <div className="bg-gray-100 pr-2 py-2 flex items-baseline ">
              <div className="mr-4 ml-3">Einfügen:</div>
              <div>
                <button
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_ide_snippetFor')
                    let safeLoopVar = 'i'
                    const candidates =
                      'ijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZi'
                    for (let i = 0; i < candidates.length; i++) {
                      safeLoopVar = candidates[i]
                      if (
                        !view.current?.state.doc
                          .toString()
                          .includes('for ' + safeLoopVar)
                      ) {
                        break // found it
                      }
                    }
                    insertCodeSnippet(
                      [
                        'for ' + safeLoopVar + ' in range():',
                        '    # Aktion(en)',
                        '',
                      ],
                      15
                    )
                  }}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 inline-block mr-3 my-1 rounded"
                >
                  <img
                    src="/icons/for.png"
                    alt="Struktogramm for"
                    className="inline-block -mt-0.5"
                    width={16}
                  ></img>{' '}
                  for<span className="hidden xl:inline">-Anweisung</span>
                </button>
                <button
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_ide_snippetWhile')
                    insertCodeSnippet(
                      ['while # Bedingung :', '    # Aktion(en)', ''],
                      6
                    )
                  }}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 inline-block mr-3 my-1 rounded"
                >
                  <img
                    src="/icons/while.png"
                    alt="Struktogramm while"
                    className="inline-block -mt-0.5"
                    width={16}
                  ></img>{' '}
                  while<span className="hidden xl:inline">-Anweisung</span>
                </button>
                <button
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_ide_snippetIfElse')
                    insertCodeSnippet(
                      [
                        'if # Bedingung :',
                        '    # JA-Aktion(en)',
                        'else:',
                        '    # NEIN-Aktion(en)',
                        '',
                      ],
                      3
                    )
                  }}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 inline-block mr-3 my-1 rounded"
                >
                  <img
                    src="/icons/ifElse.png"
                    alt="Struktogramm if else"
                    className="inline-block -mt-0.5"
                    width={15}
                  ></img>{' '}
                  if-else<span className="hidden xl:inline">-Anweisung</span>
                </button>
                <button
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_ide_snippetIf')
                    insertCodeSnippet(
                      ['if # Bedingung :', '    # JA-Aktion(en)', ''],
                      3
                    )
                  }}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 inline-block mr-3 my-1 rounded"
                >
                  <img
                    src="/icons/if.png"
                    alt="Struktogramm if"
                    className="inline-block -mt-0.5"
                    width={15}
                  ></img>{' '}
                  if<span className="hidden xl:inline">-Anweisung</span>
                </button>
                <button
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_ide_snippetDef')
                    insertCodeSnippet(['def ():', '    # Aktion(en)', ''], 4)
                  }}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 inline-block mr-3 my-1 rounded"
                >
                  <img
                    src="/icons/eigeneMethode.png"
                    alt="Struktogramm for"
                    className="inline-block -mt-0.5"
                    width={16}
                  ></img>{' '}
                  eigene Methode
                </button>
                <button
                  onClick={() => {
                    submitAnalyzeEvent(
                      core,
                      'ev_click_ide_snippetToggleComment'
                    )
                    if (view.current) {
                      toggleComment(view.current)
                      view.current.focus()
                    }
                  }}
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 inline-block mr-3 my-1 rounded"
                >
                  <strong>#</strong> Ein-/Auskommentieren
                </button>
              </div>
            </div>
          </>
        )}
        {core.ws.settings.language === 'python-pro' && (
          <>
            <div className="bg-gray-100 pr-32 py-2 pl-3 text-gray-600">
              <a
                href="https://quickref.me/python.html"
                target="_blank"
                className="link"
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_ide_pythonQuickRef')
                }}
              >
                Spickzettel
              </a>
              <a
                href="https://github.com/Entkenntnis/robot-karol-online/blob/main/MATERIAL-LEHRKRAEFTE.md#karol-x-python"
                target="_blank"
                className="ml-5 link"
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_ide_pythonExamples')
                }}
              >
                Beispiele
              </a>
              {core.ws.page == 'editor' && (
                <label className="ml-8">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked
                      core.mutateWs(({ ui }) => {
                        ui.editQuestScript = checked
                      })
                      core.mutateWs((ws) => {
                        ws.ui.needsTextRefresh = true
                      })
                      if (checked) {
                        core.mutateWs(({ editor }) => {
                          editor.editOptions = 'python-pro-only'
                        })
                      }
                    }}
                  ></input>{' '}
                  QuestScript bearbeiten
                </label>
              )}
            </div>
          </>
        )}
        {renderEditor()}
        {(core.ws.ui.state == 'error' ||
          (core.ws.settings.language == 'python-pro' &&
            core.ws.ui.errorMessages.length > 0)) && (
          <div className="absolute left-20 right-12 rounded bottom-4 overflow-auto min-h-[47px] max-h-[200px] flex-grow flex-shrink-0 bg-red-50">
            <div className="flex justify-between mt-[9px] relative">
              <div className="px-3 pb-1 pt-0">
                {core.ws.settings.language == 'python-pro' ? (
                  <>
                    <pre>{core.ws.ui.errorMessages[0]}</pre>
                    <button
                      className="absolute -top-1 right-2"
                      onClick={() => {
                        core.mutateWs(({ ui }) => {
                          ui.state = 'ready'
                          ui.errorMessages = []
                        })
                      }}
                    >
                      <FaIcon icon={faTimes} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-2">
                      <FaIcon
                        icon={faCircleExclamation}
                        className="text-red-600 mr-2"
                      />
                      {core.strings.ide.problems}:
                    </p>
                    {core.ws.ui.errorMessages.map((err, i) => (
                      <p className="mb-2" key={err + i.toString()}>
                        {err}
                      </p>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {core.ws.ui.errorMessages.length == 0 && core.ws.ui.questPrompt && (
          <QuestPrompt key={core.ws.ui.questPrompt} />
        )}
      </div>
    )
  }

  return <BlockEditor />

  function renderEditor() {
    return (
      <div className="flex h-full overflow-y-auto relative flex-shrink">
        <div className="w-full overflow-auto h-full flex">
          <div
            className={clsx(
              'w-full h-full flex flex-col relative',
              core.ws.ui.state == 'running' &&
                '[&_.cm-activeLine]:bg-transparent [&_.cm-activeLineGutter]:bg-transparent'
            )}
          >
            {core.ws.settings.language == 'robot karol' ? (
              <Editor innerRef={view} />
            ) : core.ws.settings.language == 'java' ? (
              <JavaEditor innerRef={view} />
            ) : (
              <PythonEditor innerRef={view} key={core.ws.settings.language} />
            )}
          </div>
        </div>
      </div>
    )
  }
}
