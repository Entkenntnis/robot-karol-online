import { closeMenu, hideErrorModal, setMode } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'

export function ErrorModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        hideErrorModal(core)
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
            Folgende Probleme sind beim Einlesen des Programms aufgetreten:
          </p>
          <div className="overflow-auto max-h-[170px]">
            {core.ws.ui.errorMessages.map((err, i) => (
              <p className="mb-2 ml-4" key={err + i.toString()}>
                {err}
              </p>
            ))}
          </div>
        </div>
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              hideErrorModal(core)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
