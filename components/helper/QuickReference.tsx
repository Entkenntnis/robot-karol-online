import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { useCore } from '../../lib/state/core'
import { CodeBox } from './Cheatsheet'
import { useState } from 'react'
import clsx from 'clsx'
import {
  cursorLineEnd,
  insertNewline,
  simplifySelection,
} from '@codemirror/commands'
import { faPaste } from '@fortawesome/free-regular-svg-icons'
import { triggerEvent } from '../../lib/commands/experiment'

export function QuickReference() {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set())

  function toggleSection(index: number) {
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const core = useCore()
  return (
    <div className="w-[360px] bg-white border-r-4 border-indigo-300 flex flex-col flex-shrink-0 overflow-hidden">
      <div className="overflow-auto flex-grow -mt-2">
        {section(
          0,
          <h3 className="font-bold">Karol-Befehle</h3>,
          <>
            {listing(
              'Initialisierung + Bewegung',
              `# einmal am Anfang des Programms
karol = Robot()

# geht ein Feld in Blickrichtung
karol.schritt()
karol.schritt(5)

karol.linksDrehen()
karol.linksDrehen(2)
karol.rechtsDrehen()
karol.rechtsDrehen(2)`,
            )}
            <div className="h-0.5"></div>
            {listing(
              'Bauen',
              `# legt Ziegel auf Feld VOR sich
karol.hinlegen()
karol.hinlegen(2)
karol.aufheben()
karol.aufheben(2)`,
            )}
            <div className="h-0.5"></div>
            {listing(
              'Markierung',
              `# setzt Marke auf Feld UNTER sich
karol.markeSetzen()
karol.markeLöschen()`,
            )}
            <div className="h-0.5"></div>
            {listing(
              'Sonstiges',
              `# bricht Programm sofort ab\nkarol.beenden()`,
            )}
          </>,
        )}
        <hr className="mt-4 -mb-2" />
        {section(
          1,
          <h3 className="font-bold">
            Wiederholung (Zählschleife){' '}
            <img
              src="/icons/for.png"
              className="inline-block ml-1"
              style={{ verticalAlign: '-1px' }}
            />
          </h3>,
          <>
            {listing(
              'Aufbau',
              'for <VARIABLE> in range(<ZAHL>):\n    # Aktion(en)',
            )}
            <div className="h-0.5"></div>
            {listing(
              'Beispiel',
              'for i in range(5):\n    karol.schritt()\n    karol.markeSetzen()',
            )}
          </>,
        )}
        {section(
          2,
          <h3 className="font-bold">
            Bedingte Wiederholung{' '}
            <img
              src="/icons/while.png"
              className="inline-block ml-1"
              style={{ verticalAlign: '-1px' }}
            />
          </h3>,
          <>
            {listing('Aufbau', 'while <BEDINGUNG>:\n    # Aktion(en)')}
            <div className="h-0.5"></div>
            {listing(
              'Beispiel',
              'while karol.istZiegel():\n    karol.aufheben()',
            )}
          </>,
        )}
        {section(
          3,
          <h3 className="font-bold">
            Bedingte Anweisungen{' '}
            <img
              src="/icons/if.png"
              className="inline-block ml-1"
              style={{ verticalAlign: '-1px' }}
            />{' '}
            <img
              src="/icons/ifElse.png"
              className="inline-block ml-1"
              style={{ verticalAlign: '-1px' }}
            />
          </h3>,
          <>
            {listing(
              'Aufbau einseitig',
              'if <BEDINGUNG>:\n    # JA-Aktion(en)',
            )}
            <div className="h-0.5"></div>
            {listing(
              'Aufbau zweiseitig',
              'if <BEDINGUNG>:\n    # JA-Aktion(en)\nelse:\n    # NEIN-Aktion(en)',
            )}
            <div className="h-0.5"></div>
            {listing(
              'Beispiel 1',
              'if karol.istMarke():\n    karol.markeLöschen() ',
            )}
            <div className="h-0.5"></div>
            {listing(
              'Beispiel 2',
              'if karol.istWand():\n    karol.linksDrehen()\nelse:\n    karol.schritt()',
            )}
          </>,
        )}
        {section(
          4,
          <h3 className="font-bold">
            Funktionen{' '}
            <img
              src="/icons/eigeneMethode.png"
              className="inline-block ml-1"
              style={{ verticalAlign: '-1px' }}
            />
          </h3>,
          <>
            {listing('Aufbau', 'def <NAME>():\n    # Aktion(en)')}
            <div className="h-0.5"></div>
            {listing(
              'Beispiel',
              'def umdrehen():\n    karol.linksDrehen(2)\n\nkarol.schritt()\numdrehen()  # Funktionsaufruf',
            )}
          </>,
        )}
        <hr className="mt-4 -mb-2" />

        {section(
          5,
          <h3 className="font-bold">Liste aller Karol-Abfragen</h3>,
          <>
            <p className="ml-4 mt-2">
              Verwende{' '}
              <span
                style={{ fontFamily: 'Hack, monospace' }}
                className="text-sm"
              >
                karol.<span className="text-purple-600">&lt;ABFRAGE&gt;</span>
              </span>{' '}
              in while, if, elif:
            </p>
            <p
              className="ml-6 mt-5 text-purple-600 text-sm leading-relaxed"
              style={{ fontFamily: 'Hack, monospace' }}
            >
              istWand(){' '}
              <span className="text-gray-500 ml-3"># Rand oder Quader</span>
              <br />
              nichtIstWand()
              <br />
              <br />
              istMarke()
              <br />
              nichtIstMarke()
              <br />
              <br />
              istZiegel(){' '}
              <span className="text-gray-500 ml-3">
                # MINDESTENS ein Ziegel
              </span>
              <br />
              nichtIstZiegel(){' '}
              <span className="text-gray-500 ml-3"># KEIN Ziegel</span>
              <br />
              istZiegel(2){' '}
              <span className="text-gray-500 ml-3"># GENAU zwei Ziegel</span>
              <br />
              nichtIstZiegel(2)
              <br />
              <br />
              istNorden(){' '}
              <span className="text-gray-500 ml-3"># Norden = Oben</span>
              <br />
              nichtIstNorden()
              <br />
              istOsten()
              <br />
              nichtIstOsten()
              <br />
              istSüden()
              <br />
              nichtIstSüden
              <br />
              istWesten()
              <br />
              nichtIstWesten()
            </p>
          </>,
        )}
        <hr className="mt-4 -mb-2" />
        {section(
          6,
          <h3 className="font-bold">Python: Variablen</h3>,
          <>
            {listing(
              'Beispiel',
              'summe = 0\nwhile karol.istZiegel():\n    karol.aufheben()\n    karol.schritt()\n    summe += 1\n\nkarol.hinlegen(summe)',
            )}
          </>,
        )}
        {section(
          7,
          <h3 className="font-bold">Python: Eingabe / Ausgabe</h3>,
          <>
            {listing(
              'Beispiel',
              'name = input("Dein Name?")\nprint(f"Hallo {name}")',
            )}
          </>,
        )}
        {section(
          8,
          <h3 className="font-bold">Python: Zufall</h3>,
          <>
            {listing(
              'Beispiel',
              'import random\n\nkarol = Robot()\nn = random.randint(1, 4)\nkarol.hinlegen(n)',
            )}
          </>,
        )}
        <div className="h-[150px]"></div>
      </div>
    </div>
  )

  function listing(title: string, code: string) {
    return (
      <div className="mx-3 my-3 border">
        {title && (
          <div
            className={clsx(
              'flex justify-between',
              title.includes('Aufbau') ? 'bg-pink-50' : 'bg-indigo-50',
            )}
          >
            <div className={clsx('pl-2 text-sm py-0.5')}>{title}</div>
            <button
              onClick={() => {
                insertCodeSnippet(code.split('\n'), code.length)
                triggerEvent(core, {
                  key: 'python-help-paste-snippet',
                })
              }}
              className="text-gray-600 hover:text-black mr-1"
            >
              <FaIcon icon={faPaste} />
            </button>
          </div>
        )}
        <CodeBox doc={code} language="python" />
      </div>
    )
  }

  function section(
    index: number,
    title: React.ReactNode,
    content: React.ReactNode,
  ) {
    const open = openSections.has(index)
    return (
      <div className="mt-6">
        <button
          className="flex items-center pl-1 w-full"
          onClick={() => {
            if (!open) {
              triggerEvent(core, {
                key: 'open-python-help-section',
                id: index,
              })
            }
            toggleSection(index)
          }}
        >
          <FaIcon
            icon={open ? faChevronDown : faChevronRight}
            className="w-6"
          />
          <span>{title}</span>
        </button>
        {open && content}
      </div>
    )
  }

  function insertCodeSnippet(codeLines: string[], cursorOffset: number) {
    const view = core.view
    if (view && view.current) {
      simplifySelection(view.current)
      cursorLineEnd(view.current)
      const { from, to } = view.current.state.doc.lineAt(
        view.current.state.selection.main.anchor,
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
            codeLines.join('\n' + spaces),
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
}
