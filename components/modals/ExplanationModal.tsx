import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
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
    // Der Haupt-Container bleibt unverändert
    <div className="fixed inset-0 z-[1350]">
      {/* Blurred background bleibt unverändert */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{
          backgroundImage: chapterData[core.ws.overview.explanationId].image
            ? `url(${chapterData[core.ws.overview.explanationId].image})`
            : 'url(/story/placeholder.jpg)',
        }}
      />
      {/* Back button bleibt unverändert */}
      <button
        className="absolute top-3 left-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300 z-20" // z-index leicht erhöht, um über dem Modal-Inhalt zu sein
        onClick={() => {
          closeModal(core)
        }}
      >
        <FaIcon icon={faArrowLeft} />
      </button>

      {/* --- START DER ÄNDERUNGEN --- */}

      {/* 1. DIESER CONTAINER WIRD ZUM SCROLL-CONTAINER */}
      {/* `overflow-y-auto` erlaubt vertikales Scrollen */}
      {/* `p-4` oder `md:p-8` gibt dem Modal Abstand zum Rand, auch wenn gescrollt wird */}
      <div className="fixed inset-0 flex justify-center items-start overflow-y-auto p-4 md:p-8">
        {/* 2. DER MODAL-CONTAINER HAT KEINE FESTE HÖHE MEHR */}
        {/* `h-screen` wurde entfernt. `w-full` stellt sicher, dass es die Breite ausfüllt. */}
        {/* `my-8` gibt oben und unten etwas Platz. `rounded-lg` und `shadow-xl` für die Optik. */}
        {/* `items-start` oben und `my-auto` hier sorgen für eine gute Zentrierung, die auch bei Überlänge funktioniert. */}
        <div className="w-full max-w-[720px] bg-white/90 backdrop-blur-lg rounded-lg shadow-xl relative flex flex-col my-auto animate-fadeInUp mt-24 mb-24">
          {/* 3. DER INNERE SCROLL-CONTAINER WURDE VEREINFACHT */}
          {/* `flex-grow` und `overflow-auto` sind nicht mehr nötig. Dies ist jetzt ein einfacher Wrapper. */}
          <div>
            <div className="px-8 sm:px-16 mt-12 mb-8">
              {processMarkdown(
                chapterData[core.ws.overview.explanationId].description,
                { useProse: true }
              )}
            </div>

            <div className="flex justify-center mb-8 font-semibold">
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
            </div>
          </div>
        </div>
      </div>
      {/* --- ENDE DER ÄNDERUNGEN --- */}
    </div>
  )
}
