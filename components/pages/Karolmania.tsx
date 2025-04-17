// filepath: c:\Users\dal12\Desktop\_github\robot-karol-online\components\pages\Karolmania.tsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { AnimateInView } from '../helper/AnimateIntoView'
import clsx from 'clsx'
import { FaIcon } from '../helper/FaIcon'
import {
  faArrowLeft,
  faCaretLeft,
  faCaretRight,
} from '@fortawesome/free-solid-svg-icons'
import { levels } from '../../lib/data/karolmaniaLevels'
import { HFullStyles } from '../helper/HFullStyles'
import { navigate } from '../../lib/commands/router'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import {
  getQuestReturnToMode,
  setKarolmaniaCarouselIndex,
} from '../../lib/storage/storage'
import { deserializeWorld } from '../../lib/commands/json'
import { BubbleBackground } from '../helper/BubbleBackground'

export function Karolmania() {
  const core = useCore()
  const [carouselIndex, setCarouselIndex] = useState(
    core.ws.ui.karolmaniaCarouselIndex || 0
  )
  const carouselRef = useRef<HTMLDivElement>(null)
  const wheelDebounce = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const isFirstScroll = useRef(true) // Track if this is the first scroll
  const audioRef = useRef<HTMLAudioElement | null>(null) // Reference for the audio element

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/audio/pick.mp3')
  }, [])

  // Function to play click sound
  const playClickSound = useCallback(() => {
    if (audioRef.current) {
      setTimeout(() => {
        audioRef.current!.currentTime = 0 // Reset audio to start
        audioRef
          .current!.play()
          .catch((err) => console.error('Error playing sound:', err))
      }, 80) // Add 80ms delay before playing the sound
    }
  }, [])

  // Constants to avoid magic numbers and duplication
  const CARD_WIDTH = 420

  // Calculate scroll position based on index - used in multiple places
  const calculateScrollPosition = useCallback((index: number) => {
    if (!carouselRef.current) return 0
    const paddingWidth = carouselRef.current.clientWidth / 2 - CARD_WIDTH / 2
    return Math.max(0, index * CARD_WIDTH - paddingWidth)
  }, [])

  // Scroll to a specific index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (!carouselRef.current) return
      const scrollPosition = calculateScrollPosition(index)
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: isFirstScroll.current ? 'auto' : behavior,
      })

      if (isFirstScroll.current) {
        isFirstScroll.current = false
      }
    },
    [calculateScrollPosition]
  )

  // Store carousel index to session storage whenever it changes
  useEffect(() => {
    setKarolmaniaCarouselIndex(carouselIndex)
  }, [carouselIndex])

  // Play sound and scroll carousel when index changes
  useEffect(() => {
    if (carouselIndex >= 0) {
      playClickSound() // Play click sound when index changes
      scrollToIndex(carouselIndex)
    }
  }, [carouselIndex, scrollToIndex, playClickSound])

  // Handle scroll wheel events for the carousel
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent the default scroll behavior
    e.preventDefault()

    // Add a sensitivity threshold and debounce to make scrolling less sensitive
    if (Math.abs(e.deltaY) < 30) return // Ignore small scroll movements

    // Use a debounce technique with a flag
    if (wheelDebounce.current) return
    wheelDebounce.current = true

    setTimeout(() => {
      wheelDebounce.current = false
    }, 400) // Debounce for 400ms

    // Determine scroll direction (positive deltaY = scroll down = move right)
    if (e.deltaY > 0) {
      // Scrolling down/right - move to next element if we're not at the last one
      if (carouselIndex < levels.length - 1) {
        setCarouselIndex(carouselIndex + 1)
      }
    } else {
      // Scrolling up/left - move to previous element if we're not at the first one
      if (carouselIndex > 0) {
        setCarouselIndex(carouselIndex - 1)
      }
    }
  }

  return (
    <>
      <div
        className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-700 via-teal-500 to-emerald-400 relative overflow-hidden"
        onWheel={handleWheel}
      >
        {/* Back button */}
        <button
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_karolmania_back')
            navigate(
              core,
              getQuestReturnToMode() == 'path'
                ? ''
                : getQuestReturnToMode() == 'demo'
                ? '#DEMO'
                : '#OVERVIEW'
            )
          }}
          className="absolute top-4 left-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
          aria-label="Zurück zur Startseite"
        >
          <FaIcon icon={faArrowLeft} className="text-2xl" />
        </button>

        {/* Background animation - bubbles */}
        <BubbleBackground />

        <AnimateInView>
          <h1 className="text-6xl font-bold text-white mb-8 text-center drop-shadow-lg animate-float">
            Karolmania
          </h1>
        </AnimateInView>

        <div className="text-2xl text-white mb-8 text-center">
          <span className="bg-teal-600/50 px-6 py-2 rounded-full shadow-lg">
            Wähle ein Level
          </span>
        </div>

        <div className="relative w-full max-w-4xl px-16 h-[346px]">
          {/* Navigation arrows */}
          {carouselIndex > 0 && (
            <button
              onClick={() =>
                carouselIndex > 0 && setCarouselIndex(carouselIndex - 1)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-400 text-white rounded-full p-3 shadow-lg z-10 transition-all hover:scale-110"
              aria-label="Vorheriges Level"
            >
              <FaIcon icon={faCaretLeft} className="text-xl" />
            </button>
          )}

          {carouselIndex < levels.length - 1 && (
            <button
              onClick={() =>
                carouselIndex < levels.length - 1 &&
                setCarouselIndex(carouselIndex + 1)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-400 text-white rounded-full p-3 shadow-lg z-10 transition-all hover:scale-110"
              aria-label="Nächstes Level"
            >
              <FaIcon icon={faCaretRight} className="text-xl" />
            </button>
          )}

          {/* Carousel container with fixed content width and scroll snapping */}
          <div className="pointer-events-none" onWheel={handleWheel}>
            <div
              ref={carouselRef}
              className="pt-6 flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-20"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={() => {
                // Clear any existing timeout
                if (scrollTimeout.current) {
                  clearTimeout(scrollTimeout.current)
                }

                // Set a new timeout to detect when scrolling stops
                scrollTimeout.current = setTimeout(() => {
                  if (carouselRef.current) {
                    // Get the scroll position
                    const scrollPosition = carouselRef.current.scrollLeft
                    const paddingWidth =
                      carouselRef.current.clientWidth / 2 - CARD_WIDTH / 2

                    // Calculate the closest index based on scroll position
                    const newIndex = Math.round(
                      (scrollPosition + paddingWidth) / CARD_WIDTH
                    )

                    // Update the active index if needed
                    if (
                      newIndex !== carouselIndex &&
                      newIndex >= 0 &&
                      newIndex < levels.length
                    ) {
                      setCarouselIndex(newIndex)

                      // Ensure scroll is perfectly aligned to card position
                      const perfectPosition = calculateScrollPosition(newIndex)
                      if (Math.abs(scrollPosition - perfectPosition) > 10) {
                        scrollToIndex(newIndex)
                      }
                    }
                  }
                }, 500) // Slightly increased to ensure scrolling has fully settled
              }}
            >
              <div className="flex-none w-[calc(50%-216px)]"></div>
              {levels.map((level, index) => (
                <div
                  key={level.id}
                  className={clsx(
                    'flex-none w-96 px-5 py-3 snap-center transition-all duration-300 pointer-events-auto',
                    carouselIndex === index
                      ? 'scale-110 z-10'
                      : 'scale-100 opacity-80'
                  )}
                  onClick={() => {
                    setCarouselIndex(index)
                    scrollToIndex(index)
                  }}
                >
                  <div
                    className={clsx(
                      'bg-white rounded-lg shadow-xl overflow-hidden transition-all transform cursor-pointer hover:scale-105 h-72 flex flex-col',
                      carouselIndex === index && 'ring-4 ring-teal-300'
                    )}
                    style={{
                      transformOrigin: 'center center',
                      marginTop: carouselIndex === index ? '10px' : '0',
                    }}
                  >
                    <div className="p-1 flex justify-center items-center h-[220px] flex-shrink-0">
                      <View
                        world={deserializeWorld(level.quest.tasks[0].start)}
                        preview={{
                          world: deserializeWorld(level.quest.tasks[0].target),
                        }}
                        className="max-w-full max-h-full mb-3"
                      />
                    </div>
                    <div className="px-3 py-2 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          {level.quest.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2 flex-1">
                        {level.quest.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex-none w-[calc(50%-216px)]"></div>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(core, `#KAROLMANIA-${levels[carouselIndex].id}`)
          }
          className="mt-12 px-8 py-4 bg-teal-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-teal-400 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300"
        >
          Start
        </button>
      </div>
      <HFullStyles />
    </>
  )
}
