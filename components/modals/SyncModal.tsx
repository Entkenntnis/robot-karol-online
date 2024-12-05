import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'

export function SyncModal() {
  const core = useCore()

  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="min-h-[250px] w-[500px] bg-white z-[400] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div>
          <div className="mt-6 text-xl ml-6">
            {core.strings.overview.syncTitle}
          </div>
          <div className="mx-5 mt-6">{core.strings.overview.syncBody}</div>
        </div>
        <p className="text-center mb-5 mt-3">
          <button
            className="px-4 py-2 bg-green-200 hover:bg-green-300 rounded"
            onClick={() => {
              closeModal(core)
            }}
          >
            OK
          </button>
        </p>
      </div>
    </div>
  )
}
