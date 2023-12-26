import { impressum } from '../../impressum'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'

export function ImpressumModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="h-[250px] w-[500px] bg-white z-[200] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div>
          {' '}
          <p className="font-bold text-lg mt-6 mb-4 text-center">
            {core.strings.imprint.title}
          </p>
          <p className="m-3 mb-6 text-center">
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
              closeModal(core)
            }}
          >
            {core.strings.imprint.close}
          </button>
        </p>
      </div>
    </div>
  )
}
