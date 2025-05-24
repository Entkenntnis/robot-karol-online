import { navigate } from '../../lib/commands/router'
import { useCore } from '../../lib/state/core'
import { useEffect, useState, useCallback } from 'react'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { flashcards } from '../../lib/data/flashcards'
import clsx from 'clsx'
import {
  faArrowLeft,
  faCheckCircle,
  faRepeat,
} from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '../helper/FaIcon'

// Types for our flashcard state
interface FlashcardState {
  // The currently displayed cards
  currentCards: typeof flashcards
  // The index of the current card being shown
  currentIndex: number
  // Whether the answer is revealed
  showAnswer: boolean
  // Cards that the user struggled with and will see again in this session
  againCards: number[]
}

export function Flashcards() {
  const core = useCore()
  const [state, setState] = useState<FlashcardState>({
    currentCards: [],
    currentIndex: 0,
    showAnswer: false,
    againCards: [],
  }) // Function to get 10 random flashcards
  const initializeFlashcards = useCallback(() => {
    // Get a copy of the flashcards array
    const allCards = [...flashcards]
    // Shuffle the array
    const shuffled = allCards.sort(() => Math.random() - 0.5)
    // Take the first 10 items
    const selectedCards = shuffled.slice(0, 10)

    setState({
      currentCards: selectedCards,
      currentIndex: 0,
      showAnswer: false,
      againCards: [],
    })

    submitAnalyzeEvent(core, 'ev_flashcards_initialize')
  }, [core])

  // Function to go to the next card
  const goToNextCard = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1

      // If we've gone through all initial cards, check if we have any "again" cards to review
      if (nextIndex >= prev.currentCards.length) {
        if (prev.againCards.length > 0) {
          return {
            ...prev,
            currentIndex: 0, // Start from beginning of againCards
            showAnswer: false,
            // Create a new current deck from the againCards
            currentCards: prev.againCards.map((idx) => prev.currentCards[idx]),
            againCards: [], // Reset againCards for this round
          }
        } else {
          // We're done with all cards
          return {
            ...prev,
            currentIndex: 0,
            showAnswer: false,
            // Generate 10 new random cards
            currentCards: [...flashcards]
              .sort(() => Math.random() - 0.5)
              .slice(0, 10),
          }
        }
      }

      // Otherwise just show the next card
      return {
        ...prev,
        currentIndex: nextIndex,
        showAnswer: false,
      }
    })
  }, [])

  // Function to reveal the answer
  const revealAnswer = useCallback(() => {
    submitAnalyzeEvent(core, 'ev_flashcards_reveal')
    setState((prev) => ({ ...prev, showAnswer: true }))
  }, [core])

  // Function to handle the "Again" button
  const handleAgain = useCallback(() => {
    submitAnalyzeEvent(core, 'ev_flashcards_again')

    // Add the current card index to againCards if not already there
    if (!state.againCards.includes(state.currentIndex)) {
      setState((prev) => ({
        ...prev,
        againCards: [...prev.againCards, prev.currentIndex],
      }))
    }

    // Move to the next card
    goToNextCard()
  }, [core, state.againCards, state.currentIndex, goToNextCard])

  // Function to handle the "Good" button
  const handleGood = useCallback(() => {
    submitAnalyzeEvent(core, 'ev_flashcards_good')
    // Just move to the next card
    goToNextCard()
  }, [core, goToNextCard])

  // Initialize flashcards and set up keyboard navigation
  useEffect(() => {
    // Initialize the flashcards on first load
    initializeFlashcards()

    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        // Space or Enter toggles answer or goes to next card
        if (!state.showAnswer) {
          revealAnswer()
        } else {
          handleGood()
        }
      } else if (e.key === 'ArrowRight' || e.key === 'n') {
        // Right arrow or 'n' goes to next card (as "good")
        if (state.showAnswer) {
          handleGood()
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        // Left arrow or 'a' marks card for repetition
        if (state.showAnswer) {
          handleAgain()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initializeFlashcards,
    state.showAnswer,
    revealAnswer,
    handleGood,
    handleAgain,
  ])

  // If there are no cards yet (shouldn't happen due to useEffect, but just in case)
  if (state.currentCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Flashcards</h1>
        <p className="text-lg mb-8">Loading flashcards...</p>
      </div>
    )
  }

  const currentCard = state.currentCards[state.currentIndex]
  const progress = `${state.currentIndex + 1} / ${state.currentCards.length}`
  const hasAgainCards = state.againCards.length > 0

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50">
      {/* Navigation and Header */}
      <div className="w-full max-w-3xl px-4">
        <div className="flex justify-between items-center mb-8">
          <button
            className="text-gray-600 hover:text-gray-800 flex items-center"
            onClick={() => {
              navigate(core, '') // Navigate back to the home page
              submitAnalyzeEvent(core, 'ev_flashcards_back')
            }}
          >
            <FaIcon icon={faArrowLeft} className="mr-2" /> zurück
          </button>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <div className="text-sm text-gray-500">{progress}</div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 min-h-[300px] flex flex-col">
          {/* Question */}
          <div className="flex-grow mb-6">
            <h2 className="text-xl font-semibold mb-4">Frage:</h2>
            <div className="text-lg">
              {processMarkdown(currentCard.question)}
            </div>
          </div>

          {/* Answer (conditionally displayed) */}
          {state.showAnswer && (
            <div className="border-t pt-6 mt-4">
              <h2 className="text-xl font-semibold mb-4">Antwort:</h2>
              <div className="text-lg">
                {processMarkdown(currentCard.answer)}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-8">
          {!state.showAnswer ? (
            <button
              className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 font-medium"
              onClick={revealAnswer}
            >
              Antwort zeigen
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                className="px-8 py-3 bg-amber-500 text-white rounded-lg shadow hover:bg-amber-600 font-medium flex items-center"
                onClick={handleAgain}
              >
                <FaIcon icon={faRepeat} className="mr-2" /> Nochmal
              </button>
              <button
                className="px-8 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 font-medium flex items-center"
                onClick={handleGood}
              >
                <FaIcon icon={faCheckCircle} className="mr-2" /> Gewusst
              </button>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              hasAgainCards ? 'bg-amber-400' : 'bg-green-400'
            )}
            style={{
              width: `${
                ((state.currentIndex + 1) / state.currentCards.length) * 100
              }%`,
            }}
          ></div>
        </div>
        {/* Review status */}
        {hasAgainCards && (
          <div className="text-center text-sm text-amber-600 mb-4">
            {state.againCards.length} Karten werden wiederholt
          </div>
        )}

        {/* Reset button */}
        <div className="text-center mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_flashcards_reset')
              initializeFlashcards()
            }}
          >
            Neue Kartenserie starten
          </button>
        </div>
      </div>
    </div>
  )
}
