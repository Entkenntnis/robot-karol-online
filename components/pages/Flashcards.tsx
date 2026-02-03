import { useCallback, useEffect, useRef, useState } from 'react'
import { navigate } from '../../lib/commands/router'
import { useCore } from '../../lib/state/core'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { flashcards } from '../../lib/data/flashcards'
import { FaIcon } from '../helper/FaIcon'
import {
  faArrowLeft,
  faCheckCircle,
  faRepeat,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

interface FlashcardState {
  currentCards: typeof flashcards
  currentIndex: number
  showAnswer: boolean
  againCards: number[]
}

const getRandomCards = (count: number) =>
  [...flashcards].sort(() => Math.random() - 0.5).slice(0, count)

export function Flashcards() {
  const core = useCore()
  const [state, setState] = useState<FlashcardState>({
    currentCards: getRandomCards(10),
    currentIndex: 0,
    showAnswer: false,
    againCards: [],
  })

  const showAnswerRef = useRef(state.showAnswer)
  showAnswerRef.current = state.showAnswer

  const initializeFlashcards = useCallback(() => {
    setState({
      currentCards: getRandomCards(10),
      currentIndex: 0,
      showAnswer: false,
      againCards: [],
    })
    submitAnalyzeEvent(core, 'ev_flashcards_initialize')
  }, [core])

  const goToNextCard = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1
      if (nextIndex < prev.currentCards.length) {
        return { ...prev, currentIndex: nextIndex, showAnswer: false }
      }

      if (prev.againCards.length > 0) {
        return {
          currentCards: prev.againCards.map((i) => prev.currentCards[i]),
          currentIndex: 0,
          showAnswer: false,
          againCards: [],
        }
      }

      return {
        currentCards: getRandomCards(10),
        currentIndex: 0,
        showAnswer: false,
        againCards: [],
      }
    })
  }, [])

  const handleResponse = useCallback(
    (action: 'again' | 'good') => {
      submitAnalyzeEvent(core, `ev_flashcards_${action}`)

      if (action === 'again') {
        setState((prev) => ({
          ...prev,
          againCards: prev.againCards.includes(prev.currentIndex)
            ? prev.againCards
            : [...prev.againCards, prev.currentIndex],
        }))
      }

      goToNextCard()
    },
    [core, goToNextCard],
  )

  const revealAnswer = useCallback(() => {
    submitAnalyzeEvent(core, 'ev_flashcards_reveal')
    setState((prev) => ({ ...prev, showAnswer: true }))
  }, [core])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showAnswerRef.current) {
        if ([' ', 'Enter'].includes(e.key)) revealAnswer()
        return
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
        case 'ArrowRight':
        case 'n':
          handleResponse('good')
          break
        case 'ArrowLeft':
        case 'a':
          handleResponse('again')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleResponse, revealAnswer])

  const { currentCards, currentIndex, showAnswer, againCards } = state
  const currentCard = currentCards[currentIndex]
  const progress = `${currentIndex + 1} / ${currentCards.length}`
  const hasAgainCards = againCards.length > 0

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
      <div className="w-full max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <button
            className="text-gray-600 hover:text-gray-800 flex items-center"
            onClick={() => navigate(core, '')}
          >
            <FaIcon icon={faArrowLeft} className="mr-2" /> zurück
          </button>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <div className="text-sm text-gray-500">{progress}</div>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 min-h-[300px]">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Frage:</h2>
            <div className="text-lg">
              {processMarkdown(currentCard.question)}
            </div>
          </div>

          {showAnswer && (
            <div className="border-t pt-6 mt-4">
              <h2 className="text-xl font-semibold mb-4">Antwort:</h2>
              <div className="text-lg">
                {processMarkdown(currentCard.answer)}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-8">
          {!showAnswer ? (
            <button
              className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
              onClick={revealAnswer}
            >
              Antwort zeigen
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                className="px-8 py-3 bg-amber-500 text-white rounded-lg shadow hover:bg-amber-600 flex items-center"
                onClick={() => handleResponse('again')}
              >
                <FaIcon icon={faRepeat} className="mr-2" /> Nochmal
              </button>
              <button
                className="px-8 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 flex items-center"
                onClick={() => handleResponse('good')}
              >
                <FaIcon icon={faCheckCircle} className="mr-2" /> Gewusst
              </button>
            </div>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              hasAgainCards ? 'bg-amber-400' : 'bg-green-400',
            )}
            style={{
              width: `${((currentIndex + 1) / currentCards.length) * 100}%`,
            }}
          />
        </div>

        {hasAgainCards && (
          <div className="text-center text-sm text-amber-600 mb-4">
            {againCards.length} Karten werden wiederholt
          </div>
        )}

        <div className="text-center">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            onClick={initializeFlashcards}
          >
            Neue Kartenserie starten
          </button>
        </div>
      </div>
    </div>
  )
}
