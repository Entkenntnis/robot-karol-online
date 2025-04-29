import { EditorView } from '@codemirror/view'
import { useEffect, useRef, useState } from 'react'
import {
  faCircleExclamation,
  faExternalLink,
  faPlay,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { forceLinting } from '@codemirror/lint'

import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { Editor } from './Editor'
import { textRefreshDone } from '../../lib/commands/json'
import { JavaEditor } from './JavaEditor'
import clsx from 'clsx'
import { PythonEditor } from './PythonEditor'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { BlockEditor } from './BlockEditor'
import { QuestPrompt } from '../helper/QuestPrompt'
import { Cheatsheet } from '../helper/Cheatsheet'
import { setExecutionMarker } from '../../lib/codemirror/basicSetup'
import { startBench } from '../../lib/commands/bench'
import { InteractiveClassDiagram } from './InteractiveClassDiagram'

export function EditArea() {
  const core = useCore()

  const view = useRef<EditorView>()

  const [showCheatSheet, setShowCheatSheet] = useState(false)

  useEffect(() => {
    setShowCheatSheet(false)
  }, [core.ws.settings.language, core.ws.settings.mode, core.ws.ui.isBench])

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
            : core.ws.settings.language == 'python-pro'
            ? core.ws.pythonCode
            : core.ws.javaCode,
        },
      })
      forceLinting(view.current)
      textRefreshDone(core)
    }
  })

  if (core.ws.settings.mode == 'code') {
    if (core.ws.settings.language == 'python-pro' && core.ws.ui.isBench) {
      return <InteractiveClassDiagram />
    }
    return (
      <div className="h-full flex flex-col overflow-y-auto relative">
        {core.ws.settings.language === 'python-pro' && (
          <>
            <div className="bg-gray-100 px-3 py-2 text-gray-600 flex justify-between">
              <div>
                {core.ws.ui.editQuestScript ? (
                  <a
                    className={clsx(
                      'link',
                      showCheatSheet && 'text-purple-600'
                    )}
                    href="https://github.com/Entkenntnis/robot-karol-online/blob/main/QUESTSCRIPT.md#questscript"
                    target="_blank"
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_ide_questscriptGuide')
                    }}
                  >
                    Anleitung{' '}
                    <FaIcon icon={faExternalLink} className="text-xs" />
                  </a>
                ) : (
                  <button
                    className={clsx(
                      'link',
                      showCheatSheet && 'text-purple-600'
                    )}
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_ide_pythoncheatsheet')
                      setShowCheatSheet((prev) => !prev)
                    }}
                  >
                    Spickzettel
                  </button>
                )}
                {core.ws.ui.isPlayground && (
                  <button
                    className={clsx(
                      'px-2 rounded bg-purple-300 hover:bg-purple-400 ml-5 text-black transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_ide_bench')
                      startBench(core)
                    }}
                    disabled={core.ws.ui.state != 'ready'}
                  >
                    <FaIcon icon={faPlay} className="text-xs" /> Interaktives
                    Klassendiagramm
                  </button>
                )}
              </div>

              {core.ws.page == 'editor' &&
                (core.ws.editor.showQuestPreview &&
                core.ws.settings.language == 'python-pro' &&
                core.ws.settings.mode == 'code' ? (
                  <div className="bg-yellow-300 px-2 rounded">
                    Code wird beim Verlassen der Vorschau zurückgesetzt.
                  </div>
                ) : (
                  <label
                    className={clsx(
                      'ml-8 text-gray-500 cursor-pointer select-none',
                      core.ws.editor.questScript && 'font-semibold'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={core.ws.ui.editQuestScript}
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
                        setShowCheatSheet(false)
                      }}
                    ></input>{' '}
                    QuestScript bearbeiten
                  </label>
                ))}
              {core.ws.editor.questScript && core.ws.page == 'shared' && (
                <div
                  className="select-none text-purple-400 ml-2"
                  title="Diese Aufgabe wird über ein QuestScript gesteuert"
                >
                  QuestScript
                </div>
              )}
            </div>
          </>
        )}
        {core.ws.settings.language === 'robot karol' && (
          <>
            <div className="bg-gray-100 px-3 py-2 text-gray-600 flex justify-between">
              <div>
                <button
                  className={clsx('link', showCheatSheet && 'text-purple-600')}
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_ide_karolcheatsheet')
                    setShowCheatSheet((prev) => !prev)
                  }}
                >
                  Spickzettel
                </button>
              </div>
            </div>
          </>
        )}
        {renderEditor()}
        {(core.ws.ui.state == 'error' ||
          (core.ws.settings.language == 'python-pro' &&
            core.ws.ui.errorMessages.length > 0)) && (
          <div
            className={clsx(
              'absolute right-12 rounded bottom-4 overflow-auto min-h-[47px] max-h-[200px] flex-grow flex-shrink-0 bg-red-50',
              core.ws.settings.language == 'python-pro'
                ? showCheatSheet
                  ? 'left-[340px]'
                  : 'left-20'
                : 'left-20'
            )}
          >
            <div className="flex justify-between mt-[9px] relative">
              <div className="px-3 pb-1 pt-0">
                {core.ws.settings.language == 'python-pro' &&
                core.ws.ui.state !== 'error' ? (
                  <>
                    <pre>{core.ws.ui.errorMessages[0]}</pre>
                    <button
                      className="absolute -top-1 right-2"
                      onClick={() => {
                        core.mutateWs(({ ui }) => {
                          ui.state = 'ready'
                          ui.errorMessages = []
                        })
                        setExecutionMarker(core, 0)
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
          {(core.ws.settings.language == 'python-pro' ||
            core.ws.settings.language == 'robot karol') &&
            showCheatSheet && (
              <Cheatsheet language={core.ws.settings.language} />
            )}
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
