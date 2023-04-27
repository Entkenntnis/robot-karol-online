import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'

export function LightboxModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="min-h-[310px] w-[500px] bg-white z-[400] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div></div>
        <img
          src={core.ws.ui.imageLightbox!}
          alt="Ein Bild"
          className="w-min mx-auto p-3"
        />
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
