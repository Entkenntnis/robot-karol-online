import { faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { chapterData } from '../../lib/data/chapters'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { setQuestData } from '../../lib/storage/storage'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { mapData } from '../../lib/data/map'
import { isQuestDone } from '../../lib/helper/session'

export function ExplanationModal() {
  const core = useCore()
  const questsInPreviousChapter = Object.entries(mapData)
    .filter(([_, data]) => data.chapter === core.ws.overview.explanationId - 1)
    .map(([id]) => parseInt(id))

  const canContinue =
    questsInPreviousChapter.length == 0 ||
    questsInPreviousChapter.some((id) => {
      return isQuestDone(id)
    }) ||
    core.ws.page == 'demo'

  return (
    <div className="fixed inset-0 z-[1350]">
      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{
          backgroundImage: chapterData[core.ws.overview.explanationId].image
            ? `url(${chapterData[core.ws.overview.explanationId].image})`
            : 'url(/story/placeholder.jpg)',
        }}
      />
      {/* Back button */}
      <button
        className="absolute top-3 left-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300 z-10"
        onClick={() => {
          closeModal(core)
        }}
      >
        <FaIcon icon={faArrowLeft} />
      </button>

      {/* Modal content */}
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="h-screen max-w-[620px] bg-white/90 backdrop-blur-lg relative flex flex-col">
          <div className="flex-grow overflow-auto">
            <div className="px-6 mt-12 mb-8 animate-fadeInUp">
              {canContinue ? (
                processMarkdown(
                  chapterData[core.ws.overview.explanationId].description,
                  { useProse: true }
                )
              ) : (
                <p className="mt-20 mb-20">
                  Löse bitte mindestens eine Aufgabe aus dem vorherigen Kapitel,
                  um dieses Kapitel zu starten.
                </p>
              )}
            </div>

            <div className="flex justify-center mb-8 font-semibold">
              {canContinue ? (
                <button
                  className="px-4 py-2 bg-green-200 hover:bg-green-300 rounded-lg"
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
                  Weiter
                </button>
              ) : (
                <button
                  className="px-4 py-2 hover:bg-gray-300 rounded-lg"
                  onClick={() => {
                    closeModal(core)
                  }}
                >
                  Schließen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
