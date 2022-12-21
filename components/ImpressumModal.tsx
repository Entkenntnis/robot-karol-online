import { impressum } from '../impressum'
import { setShowImpressum } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'

export function ImpressumModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setShowImpressum(core, false)
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
          <p className="ml-4 font-bold text-lg mt-2 mb-4">Impressum</p>
          <p className="ml-3">Betreiber:</p>
          <p className="m-3 mb-6">
            {impressum.name}
            <br />
            {impressum.address1}
            <br />
            {impressum.address2}
            <br />
            {impressum.contact}
          </p>
        </div>
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              setShowImpressum(core, false)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
