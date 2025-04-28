import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { chapterData } from '../../lib/data/chapters'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { setQuestData } from '../../lib/storage/storage'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'

export function ExplanationModal() {
  const core = useCore()
  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]">
      <div
        className="max-h-[90%] w-[calc(min(72ch,90vw))] min-h-[30%] bg-white z-[400] rounded-xl relative flex"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300 z-10"
          onClick={() => {
            closeModal(core)
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div className="flex-grow flex-shrink overflow-auto">
          <div className="px-6 mt-12 mb-5">
            {processMarkdown(
              chapterData[core.ws.overview.explanationId].description
            )}
          </div>
          <div className="flex justify-center mb-8 font-semibold">
            <button
              className="px-4 py-2  bg-green-200 hover:bg-green-300 rounded-lg"
              onClick={() => {
                setQuestData({
                  id: core.ws.overview.explanationId,
                  completed: true,
                  code: '',
                  mode: 'blocks',
                  completedOnce: true,
                })
                submitAnalyzeEvent(
                  core,
                  'ev_click_explanation_continue_' +
                    core.ws.overview.explanationId
                )
                closeModal(core)
              }}
            >
              weiter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
