import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { chapterData } from '../../lib/data/chapters'

export function ExplanationModal() {
  const core = useCore()
  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]">
      <div
        className="max-h-[90%] w-[900px] bg-white z-[400] rounded-xl relative overflow-auto"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => {
            closeModal(core)
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <p className="text-center mb-5 px-4 mt-8">
          {chapterData[core.ws.overview.chapter].description}
        </p>
      </div>
    </div>
  )
}
