import { faDiagramSuccessor, faSquare } from '@fortawesome/free-solid-svg-icons'
import {
  closeMenu,
  setMode,
  setShowStructogram,
  showQuestOverview,
} from '../lib/commands/mode'
import { submit_event } from '../lib/helper/submit'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'

export function OptionsModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        closeMenu(core)
      }}
    >
      <div
        className="h-[400px] w-[500px] bg-white z-[200] rounded-xl relative"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="absolute right-2 top-2">
          <button
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => {
              closeMenu(core)
            }}
          >
            Schließen
          </button>
        </div>
        <p className="ml-4 font-bold text-lg mt-2">Optionen</p>
        <p className="ml-4 mt-7">
          Eingabemethode:{' '}
          {core.ws.settings.mode == 'blocks' ? 'blockbasiert' : 'textbasiert'}
        </p>
        <p className="ml-4 mt-2">{renderSwitch()}</p>
        {!core.ws.ui.isTesting && (
          <p className="ml-4 mt-12">
            <button
              className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => {
                setShowStructogram(core, true)
                closeMenu(core)
              }}
            >
              <FaIcon icon={faDiagramSuccessor} className="mr-1" /> Struktogramm
              anzeigen
            </button>
          </p>
        )}
      </div>
    </div>
  )

  function renderSwitch() {
    if (core.ws.ui.state == 'error') {
      return (
        <span className="text-red-600">
          Modus kann nicht geändert werden, da es Probleme beim Einlesen deines
          Programms gibt.
        </span>
      )
    } else if (core.ws.ui.state == 'loading') {
      return (
        <span className="text-gray-600">
          Dein Programm wird gerade eingelesen ...
        </span>
      )
    } else if (core.ws.ui.state == 'running') {
      return null
    } else {
      // ready
      if (core.ws.ui.isTesting) {
        return (
          <span className="text-gray-600">
            Aktiviere zuerst die Bearbeitung des Programms um den Modus zu
            ändern.
          </span>
        )
      }

      if (core.ws.settings.mode == 'blocks') {
        // nothing preventing me now?
        return (
          <button
            className="text-blue-500 hover:text-blue-600 underline"
            onClick={() => {
              setMode(core, 'code')
              closeMenu(core)
              submit_event('text-editor', core)
            }}
          >
            zum Text-Editor wechseln
          </button>
        )
      } else {
        if (core.ws.ui.toBlockWarning) {
          return (
            <span className="text-yellow-600">
              Modus kann nicht geändert werden, da dein Programm Funktionen
              nutzt, die nur im Textmodus verfügbar sind.
            </span>
          )
        }
        return (
          <button
            className="text-blue-500 hover:text-blue-600 underline"
            onClick={() => {
              setMode(core, 'blocks')
              closeMenu(core)
            }}
          >
            zum Block-Editor wechseln
          </button>
        )
      }
    }

    return null
  }
}
