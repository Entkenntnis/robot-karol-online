import {
  faChevronDown,
  faChevronRight,
  faX,
} from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { useCore } from '../../lib/state/core'
import { CodeBox } from './Cheatsheet'
import { useState } from 'react'
import clsx from 'clsx'

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
    <div className="absolute inset-0 bg-black/20">
      <div className="absolute bottom-6 left-3 bg-white border-indigo-600 border-[2px] w-[400px] top-6 rounded flex flex-col shadow shadow-indigo-200/80">
        <div className="h-10 flex justify-between items-center bg-indigo-100">
          <h2 className="ml-3 text-lg">PROGRAMMIERHILFE</h2>
          <button
            className="h-10 w-10 flex justify-center items-center bg-indigo-200 hover:bg-indigo-300"
            onClick={() => {
              core.mutateWs((ws) => {
                ws.ui.showQuickReference = false
              })
            }}
          >
            <FaIcon icon={faX} className="text-lg" />
          </button>
        </div>
        <div className="overflow-auto flex-grow">
          {section(
            0,
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
            1,
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
                'while karol.istZiegel():\n    karol.aufheben() ',
              )}
            </>,
          )}
          {section(
            2,
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
            3,
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
            4,
            <h3 className="font-bold">Karol-Befehle</h3>,
            <>
              {listing(
                'Beispiel',
                `# einmal am Anfang des Programms
karol = Robot()

# geht ein Feld in Blickrichtung
karol.schritt()
karol.schritt(5)

karol.linksDrehen()
karol.linksDrehen(2)
karol.rechtsDrehen()
karol.rechtsDrehen(2)

# legt Ziegel auf Feld VOR sich
karol.hinlegen()
karol.hinlegen(2)
karol.aufheben()
karol.aufheben(2)

# setzt Marke auf Feld UNTER sich
karol.markeSetzen()
karol.markeLöschen()

karol.beenden()`,
              )}
            </>,
          )}
          {section(
            5,
            <h3 className="font-bold">Karol-Bedingungen</h3>,
            <>
              {listing(
                'Liste',
                `# Rand oder Quader
karol.istWand()
karol.nichtIstWand()

# prüft Marke UNTER sich
karol.istMarke()
karol.nichtIstMarke()

# MINDESTENS ein Ziegel auf Feld voraus
karol.istZiegel()
# KEIN Ziegel
karol.nichtIstZiegel()

# GENAU 2 Ziegel
karol.istZiegel(2)
karol.nichtIstZiegel(2)

# Oben = Norden
karol.istNorden()
karol.nichtIstNorden()
karol.istOsten()
karol.nichtIstOsten()
karol.istSüden()
karol.nichtIstSüden()
karol.istWesten()
karol.nichtIstWesten()`,
              )}
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
    </div>
  )

  function listing(title: string, code: string) {
    return (
      <div className="mx-3 my-3 border">
        {title && (
          <div
            className={clsx(
              'pl-2 text-sm py-0.5',
              title.includes('Aufbau') ? 'bg-indigo-50' : 'bg-pink-50',
            )}
          >
            {title}
          </div>
        )}
        <CodeBox doc={code} language="python-pro" />
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
          className="flex items-center ml-1"
          onClick={() => {
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
}
