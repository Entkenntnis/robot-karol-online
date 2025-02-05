import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'

export function SurveyModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="h-[80vh] w-[790px] bg-white z-[400] rounded-xl relative flex justify-between flex-col items-center"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSeoiPIl9eI2g0sfCeWGIJ3EVfJlWAAB98hvLAHJlrokea_rhQ/viewform?embedded=true"
          width="730"
          height="1315"
        >
          Wird geladen…
        </iframe>
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              closeModal(core)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
