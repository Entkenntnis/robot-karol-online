import { setShareModal } from '../lib/commands/editor'
import { useCore } from '../lib/state/core'

export function ShareModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setShareModal(core, false)
      }}
    >
      <div
        className="h-[300px] w-[520px] bg-white z-[200] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        TODO: UI zum Freigeben von Aufgaben
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              setShareModal(core, false)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
