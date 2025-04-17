import { useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { navigate } from '../../lib/commands/router'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { getQuestReturnToMode } from '../../lib/storage/storage'

export function KarolmaniaGame() {
  const core = useCore()

  // Extract level ID from hash
  useEffect(() => {
    const hash = window.location.hash
    const levelIdMatch = hash.match(/#KAROLMANIA-(\d+)/)
    const levelId = levelIdMatch ? parseInt(levelIdMatch[1]) : null

    // Log analytics event
    submitAnalyzeEvent(core, `ev_karolmania_game_level_${levelId || 'unknown'}`)
  }, [core])

  // Function to navigate back to Karolmania level selection
  const handleBack = () => {
    submitAnalyzeEvent(core, 'ev_click_karolmania_game_back')
    navigate(core, '#KAROLMANIA')
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-700 via-teal-500 to-emerald-400 relative overflow-hidden">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
        aria-label="Zurück zur Levelauswahl"
      >
        <FaIcon icon={faArrowLeft} />
      </button>

      <div className="bg-white/30 p-8 rounded-xl shadow-xl max-w-4xl w-full">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Karolmania Game
        </h1>
        <p className="text-white text-center">
          Diese Seite ist noch in Entwicklung. Hier wird in Zukunft das
          ausgewählte Level spielbar sein.
        </p>
      </div>
    </div>
  )
}
