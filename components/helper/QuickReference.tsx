import { faX } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { useCore } from '../../lib/state/core'
import { CodeBox } from './Cheatsheet'

export function QuickReference() {
  const core = useCore()
  return (
    <div className="absolute inset-0 bg-black/20">
      <div className="absolute bottom-6 left-3 bg-white border-indigo-600 border-[2px] w-[400px] top-6 rounded flex flex-col">
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
          <div>
            <h3 className="ml-3 mt-3 font-bold">
              <img
                src="/icons/for.png"
                className="inline-block mr-1"
                style={{ verticalAlign: '-1px' }}
              />{' '}
              Wiederholung (Zählschleife)
            </h3>
            {listing(
              'Aufbau',
              'for <VARIABLE> in range(<ZAHL>):\n    # Aktion(en)',
            )}
            <div className="h-0.5"></div>
            {listing(
              'Beispiel',
              'for i in range(5):\n    karol.schritt()\n    karol.markeSetzen()',
            )}
          </div>
          <div>
            <h3 className="ml-3 mt-9 font-bold">
              <img
                src="/icons/while.png"
                className="inline-block mr-1"
                style={{ verticalAlign: '-1px' }}
              />{' '}
              Bedingte Wiederholung
            </h3>
            {listing('Aufbau', 'while <BEDINGUNG>:\n    # Aktion(en)')}
            <div className="h-0.5"></div>
            {listing(
              'Beispiel',
              'while karol.istZiegel():\n    karol.aufheben() ',
            )}
          </div>
          <div>
            <h3 className="ml-3 mt-9 font-bold">
              <img
                src="/icons/if.png"
                className="inline-block mr-1"
                style={{ verticalAlign: '-1px' }}
              />{' '}
              <img
                src="/icons/ifElse.png"
                className="inline-block mr-1"
                style={{ verticalAlign: '-1px' }}
              />{' '}
              Bedingte Anweisungen
            </h3>
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
          </div>
          <div className="h-[150px]"></div>
        </div>
      </div>
    </div>
  )

  function listing(title: string, code: string) {
    return (
      <div className="mx-3 my-3 border">
        <div className="pl-2 bg-indigo-50 text-sm py-0.5">{title}</div>
        <CodeBox doc={code} language="python-pro" />
      </div>
    )
  }
}
