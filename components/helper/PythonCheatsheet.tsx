import { useEffect, useRef, useState } from 'react'
import { FaIcon } from './FaIcon'
import { faBook, faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { indentUnit, syntaxHighlighting } from '@codemirror/language'
import {
  defaultHighlightStyle,
  editable,
} from '../../lib/codemirror/basicSetup'
import { pythonLanguage } from '../../lib/codemirror/pythonParser/pythonLanguage'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { useCore } from '../../lib/state/core'

export function PythonCheatsheet() {
  const core = useCore()
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    submitAnalyzeEvent(core, 'ev_click_ide_pythoncheatsheet_copy')
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const commands = [
    {
      category: 'Initialisierung',
      items: ['karol = Robot()'],
    },
    {
      category: 'Befehle',
      items: ['karol.linksDrehen()', 'karol.hinlegen(4)'],
    },

    {
      category: 'Wiederholungen',
      items: [
        'for i in range(5):\n    karol.schritt()\n    karol.markeSetzen()',
        'while karol.istZiegel():\n    karol.aufheben()',
      ],
    },
    {
      category: 'Bedingte Anweisungen',
      items: [
        'if karol.istMarke():\n    karol.markeLöschen()',
        'if karol.istWand():\n    karol.linksDrehen()\nelse:\n    karol.schritt()',
        'if karol.istZiegel(3):\n   karol.rechtsDrehen()\nelif karol.istZiegel(2):\n    karol.rechtsDrehen(2)\nelse:\n    karol.schritt()',
      ],
    },
    {
      category: 'Funktionen',
      items: [
        'def umdrehen():\n    karol.linksDrehen(2)\n\nkarol.schritt()\numdrehen()',
      ],
    },
    {
      category: 'Variablen',
      items: [
        'summe = 0\nwhile not karol.istWand():\n    karol.schritt\n    summe += 1\nprint(summe)',
        'name = input("Dein Name?")\nprint("Hallo " + name)',
      ],
    },
    {
      category: 'Zufall',
      items: ['import random\n\nn = random.randint(1, 4)\nkarol.hinlegen(n)'],
    },
    {
      category: 'Kommentar',
      items: ['# Das ist ein Kommentar'],
    },
  ]

  return (
    <div className="bg-gray-50 w-[300px] p-4 border-r border-gray-200  overflow-y-auto flex-shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <FaIcon icon={faBook} className="text-purple-600" />
        <h1 className="text-xl font-bold text-gray-800">Python Spickzettel</h1>
      </div>

      {commands.map((section, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            {section.category}
          </h3>
          <div className="space-y-2">
            {section.items.map((cmd, cmdIndex) => (
              <div
                key={cmdIndex}
                className="group relative py-2 bg-white rounded-lg border border-gray-200 "
                onClick={() => handleCopy(cmd)}
              >
                <CodeBox doc={cmd} />
                <div className="absolute right-3 top-1 opacity-60 group-hover:opacity-100 cursor-pointer">
                  {copied === cmd ? (
                    <FaIcon icon={faCheck} className="text-green-500" />
                  ) : (
                    <FaIcon icon={faCopy} className="text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p>
        <a
          href="https://github.com/Entkenntnis/robot-karol-online/blob/main/MATERIAL-LEHRKRAEFTE.md#karol-x-python"
          target="_blank"
          className="link"
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_ide_pythonMoreExamples')
          }}
        >
          weitere Beispiele
        </a>
      </p>

      {copied && (
        <div className="fixed bottom-4 left-4 bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm">
          In Zwischenablage kopiert!
        </div>
      )}
    </div>
  )
}

function CodeBox({ doc }: { doc: string }) {
  const editorDiv = useRef(null)

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const view: EditorView = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [
            syntaxHighlighting(defaultHighlightStyle),
            indentUnit.of('    '),
            editable.of(EditorView.editable.of(false)),
            pythonLanguage,
            EditorView.theme({
              '&': {
                outline: 'none !important',
              },
              '.cm-scroller': {
                overflow: 'auto',
                fontFamily: 'Hack, monospace',
              },
            }),
          ],
        }),
        parent: currentEditor,
      })

      return () => view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorDiv])
  return <div ref={editorDiv} className="text-sm" />
}
