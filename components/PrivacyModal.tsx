import { impressum } from '../impressum'
import { setShowPrivacy } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'

export function PrivacyModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setShowPrivacy(core, false)
      }}
    >
      <div
        className="h-[300px] w-[500px] bg-white z-[200] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div>
          {' '}
          <p className="ml-4 font-bold text-lg mt-2 mb-4">
            Datenschutzerklärung
          </p>
          <p className="m-3 mb-6">
            Diese Website wird auf einem uberspace (https://uberspace.de)
            gehostet. Bei einem Besuch kommen <strong>keine</strong> Cookies zum
            Einsatz. Es werden grundlegende Statistiken zu Aufrufen und gelösten
            Aufgaben auf dem uberspace gespeichert. Es werden keine Daten an
            Drittanbieter weitergeben. Außerdem findet die Datenverarbeitung
            vollständig in Deutschland statt.
          </p>
        </div>
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              setShowPrivacy(core, false)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
