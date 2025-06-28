import { useEffect, useRef, useState } from 'react'
import { FaIcon } from './FaIcon'
import {
  faBook,
  faCheck,
  faCopy,
  faExternalLink,
} from '@fortawesome/free-solid-svg-icons'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { indentUnit, syntaxHighlighting } from '@codemirror/language'
import {
  defaultHighlightStyle,
  editable,
  exampleLanguage,
} from '../../lib/codemirror/basicSetup'
import { pythonLanguage } from '../../lib/codemirror/pythonParser/pythonLanguage'
import { javaLanguage } from '../../lib/codemirror/javaParser/javaLanguage'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { useCore } from '../../lib/state/core'
import clsx from 'clsx'
import { it } from 'node:test'

interface CheatsheetProps {
  language: 'python-pro' | 'robot karol' | 'java' | 'python-chat'
}

export function Cheatsheet({ language }: CheatsheetProps) {
  const core = useCore()
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    submitAnalyzeEvent(core, 'ev_click_ide_pythoncheatsheet_copy')
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const commands =
    language == 'python-chat'
      ? [
          {
            category: 'Ein-/Ausgabe',
            items: [
              'print("Wie heißt du?")\nname = input()\nprint(f"Hallo, {name}!")',
              'print("Wie alt bist du?")\nage = int(input())',
            ],
          },
          {
            category: 'Zahlen',
            items: ['a = 4\nb = 2\nc = 3\naverage = (a + b + c) / 3'],
          },
          {
            category: 'Kommentare',
            items: ['# Das ist ein Kommentar\n# Nützlich für Erklärungen'],
          },
          {
            category: 'Bedingte Logik',
            items: [
              'if a > b:\n    print("a größer b")\nelse:\n    print("a nicht größer b")',
              'if a == 0:\n    print("a ist Null")\nelif a > 0:\n    print("a ist positiv")\nelse:\n    print("a ist negativ")',
              // and or not
              'if a > 0 and b > 0:\n    print("a und b positiv")\nif not a == 0:\n    print("a ist nicht Null")',
            ],
          },
          {
            category: 'Schleifen',
            items: [
              'for i in range(5):\n    print(i)\n# Ausgabe: 0, 1, 2, 3, 4',
              'a = 0\nwhile a < 10:\n    a += 2\n    print(a)\n# Ausgabe: 2, 4, 6, 8, 10',
              // break continue
              'for i in range(10):\n    if i == 3:\n        break\n    print(i)\n# Ausgabe: 0, 1, 2',
            ],
          },
          {
            category: 'Listen',
            items: [
              'zahlen = [1, 2, 3, 4, 5]\nprint(zahlen[0])\n# Ausgabe: 1\nzahlen.append(6)\nprint(zahlen)\n# Ausgabe: [1, 2, 3, 4, 5, 6]',
              'for zahl in zahlen:\n    print(zahl)\n# Ausgabe: 1, 2, 3, 4, 5, 6',
              'if 3 in zahlen:\n    print("3 ist in Liste")\nelse:\n    print("3 nicht in Liste")',
            ],
          },
          {
            category: 'Funktionen',
            items: [
              'def begruessung(name):\n    print(f"Hallo, {name}!")\n\nbegruessung("Karol")\n# Ausgabe: Hallo, Karol!',
              'def addiere(a, b):\n    return a + b\n\nresultat = addiere(3, 4)\nprint(resultat)\n# Ausgabe: 7',
            ],
          },
        ]
      : language == 'python-pro'
      ? [
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
            ],
          },
          {
            category: 'Ein-/Ausgabe',
            items: ['name = input("Dein Name?")\nprint(f"Hallo {name}")'],
          },
          {
            category: 'Zufall',
            items: [
              'import random\n\nn = random.randint(1, 4)\nkarol.hinlegen(n)',
            ],
          },
          {
            category: 'Kommentar',
            items: ['# Das ist ein Kommentar'],
          },
        ]
      : language == 'java'
      ? [
          {
            category: 'Befehle',
            items: [
              'karol.schritt();\nkarol.schritt(3);\nkarol.linksDrehen();\nkarol.linksDrehen(2);\nkarol.rechtsDrehen();\nkarol.rechtsDrehen(2);',
              'karol.hinlegen();\nkarol.hinlegen(5);\nkarol.aufheben();\nkarol.aufheben(3);\nkarol.markeSetzen();\nkarol.markeLöschen();\nkarol.beenden();',
            ],
          },
          {
            category: 'Schleifen',
            items: [
              'for (int i = 0; i < 4; i++) {\n    karol.schritt();\n}',
              'while (karol.istZiegel()) {\n    karol.aufheben();\n}',
            ],
          },
          {
            category: 'Bedingte Anweisungen',
            items: [
              'if (karol.nichtIstMarke()) {\n    karol.markeSetzen();\n}',
              'if (karol.istZiegel()) {\n    karol.hinlegen();\n} else {\n    karol.schritt();\n}',
            ],
          },
          {
            category: 'Bedingungen',
            items: [
              'karol.istWand()\nkarol.nichtIstWand()\nkarol.istMarke()\nkarol.nichtIstMarke()\nkarol.istZiegel()\nkarol.nichtIstZiegel()\nkarol.istZiegel(2)\nkarol.nichtIstZiegel(2)',
              'karol.istNorden()\nkarol.nichtIstNorden()\nkarol.istOsten()\nkarol.nichtIstOsten()\nkarol.istSüden()\nkarol.nichtIstSüden()\nkarol.istWesten()\nkarol.nichtIstWesten()',
            ],
          },
          {
            category: 'Methoden',
            items: [
              'void umdrehen() {\n    karol.linksDrehen(2);\n}\n\nkarol.schritt();\numdrehen();',
            ],
          },
          {
            category: 'Variablen',
            items: [
              'int schritte = 0;\nwhile (!karol.istWand()) {\n    karol.schritt();\n    schritte++;\n}',
            ],
          },
          {
            category: 'Kommentare',
            items: [
              '// einzeiliger Kommentar',
              '/* Das ist ein\n   mehrzeiliger Kommentar */',
            ],
          },
        ]
      : [
          {
            category: 'Befehle',
            items: [
              'Schritt\nSchritt(3)\nLinksDrehen\nLinksDrehen(2)\nRechtsDrehen\nRechtsDrehen(2)',
              'Hinlegen\nHinlegen(5)\nAufheben\nAufheben(3)\nMarkeSetzen\nMarkeLöschen\nBeenden',
            ],
          },

          {
            category: 'Wiederholungen',
            items: [
              'wiederhole 4 mal\n  Schritt\nendewiederhole',
              'wiederhole solange IstZiegel\n  Aufheben\nendewiederhole',
              'wiederhole immer\n  LinksDrehen\nendewiederhole',
            ],
          },
          {
            category: 'Bedingte Anweisungen',
            items: [
              'wenn NichtIstMarke dann\n  MarkeSetzen\nendewenn',
              'wenn IstZiegel dann\n  Hinlegen\nsonst\n Schritt\nendewenn',
            ],
          },
          {
            category: 'Bedingungen',
            items: [
              'IstWand\nNichtIstWand\nIstMarke\nNichtIstMarke\nIstZiegel\nNichtIstZiegel\nIstZiegel(2)\nNichtIstZiegel(2)',
              'IstNorden\nNichtIstNorden\nIstOsten\nNichtIstOsten\nIstSüden\nNichtIstSüden\nIstWesten\nNichtIstWesten',
            ],
          },
          {
            category: 'Eigene Anweisungen',
            items: [
              'Anweisung Umdrehen\n  LinksDrehen(2)\nendeAnweisung\n\nSchritt\nUmdrehen',
            ],
          },
          {
            category: 'Kommentare',
            items: [
              '{ Das ist ein Kommentar }',
              '// Das ist auch ein Kommentar',
            ],
          },
          {
            category: 'Objekt-Schreibweise (optional)',
            items: [
              'wenn karol.istWand() dann\n  karol.linksDrehen()\nendewenn',
            ],
          },
          {
            category: 'Sternchen-Schreibweise (optional)',
            items: ['wiederhole 10 mal\n  Hinlegen\n*wiederhole'],
          },
        ]

  return (
    <div
      className={clsx(
        'bg-gray-50 p-4 border-r border-gray-200  overflow-y-auto flex-shrink-0',
        language == 'python-pro' ? 'w-[300px]' : 'w-[320px]'
      )}
    >
      <div className="flex items-center gap-2 mb-6">
        <FaIcon icon={faBook} className="text-purple-600" />
        <h1 className="text-xl font-bold text-gray-800">
          {language == 'python-chat'
            ? 'Python'
            : language == 'python-pro'
            ? 'Python'
            : language == 'java'
            ? 'Karol Java'
            : 'Karol Code'}{' '}
          Spickzettel
        </h1>
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
                <CodeBox doc={cmd} language={language} />
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

      {copied && (
        <div className="fixed bottom-4 left-4 bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm">
          In Zwischenablage kopiert!
        </div>
      )}
    </div>
  )
}

export function CodeBox({
  doc,
  language,
}: {
  doc: string
  language: CheatsheetProps['language']
}) {
  const editorDiv = useRef(null)

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const view: EditorView = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [
            syntaxHighlighting(defaultHighlightStyle),
            indentUnit.of(language == 'python-pro' ? '    ' : '  '),
            editable.of(EditorView.editable.of(false)),
            language.startsWith('python-')
              ? pythonLanguage
              : language == 'java'
              ? javaLanguage
              : exampleLanguage('de'),
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
