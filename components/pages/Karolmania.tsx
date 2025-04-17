// filepath: c:\Users\dal12\Desktop\_github\robot-karol-online\components\pages\Karolmania.tsx
import { useEffect, useState, useRef, useMemo } from 'react'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { AnimateInView } from '../helper/AnimateIntoView'
import clsx from 'clsx'
import { FaIcon } from '../helper/FaIcon'
import {
  faArrowLeft,
  faCaretLeft,
  faCaretRight,
  faHome,
} from '@fortawesome/free-solid-svg-icons'
import { levels } from '../../lib/data/karolmaniaLevels'
import { HFullStyles } from '../helper/HFullStyles'
import { navigate } from '../../lib/commands/router'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { getQuestReturnToMode } from '../../lib/storage/storage'
import { deserializeQuest, deserializeWorld } from '../../lib/commands/json'

export function Karolmania() {
  const core = useCore()
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const wheelDebounce = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Memoize background bubbles to prevent regeneration on re-render
  const backgroundBubbles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 150 + 20,
      left: Math.random() * 100,
      top: Math.random() * 100 + 50,
      delay: Math.random() * 8,
      duration: Math.random() * 8 + 5,
    }))
  }, []) // Empty dependency array means this only runs once

  // Scroll carousel when index changes
  useEffect(() => {
    if (carouselRef.current && carouselIndex >= 0) {
      // Add a small offset to account for the edge padding
      const cardWidth = 420 // Increased from 280 to 420 (1.5x larger)
      const scrollPosition = carouselIndex * cardWidth

      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
    }
  }, [carouselIndex])

  // Move carousel to previous level
  const prevLevel = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1)
    }
  }

  // Move carousel to next level
  const nextLevel = () => {
    if (carouselIndex < levels.length - 1) {
      setCarouselIndex(carouselIndex + 1)
    }
  }

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
    }, 200) // Debounce for 200ms

    // Determine scroll direction (positive deltaY = scroll down = move right)
    if (e.deltaY > 0) {
      // Don't wrap - only move if not at the last element
      if (carouselIndex < levels.length - 1) {
        setCarouselIndex(carouselIndex + 1)
      }
    } else {
      // Don't wrap - only move if not at the first element
      if (carouselIndex > 0) {
        setCarouselIndex(carouselIndex - 1)
      }
    }
  }

  // Dummy start function
  const handleStart = () => {
    alert(
      'Level ' +
        levels[carouselIndex].quest.title +
        ' selected! Game implementation coming soon.'
    )
  }

  // Function to navigate back to home page
  const handleBack = () => {
    submitAnalyzeEvent(core, 'ev_click_karolmania_back')
    navigate(
      core,
      getQuestReturnToMode() == 'path'
        ? ''
        : getQuestReturnToMode() == 'demo'
        ? '#DEMO'
        : '#OVERVIEW'
    )
  }

  return (
    <>
      <div
        className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-700 via-teal-500 to-emerald-400 relative overflow-hidden"
        onWheel={handleWheel}
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
          aria-label="Zurück zur Startseite"
        >
          <FaIcon icon={faArrowLeft} className="text-2xl" />
        </button>

        {/* Background animation - bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundBubbles.map((bubble) => (
            <div
              key={bubble.id}
              className="absolute rounded-full bg-white/10 animate-bubble"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.left}%`,
                top: `${bubble.top}%`,
                animationDelay: `${bubble.delay}s`,
                animationDuration: `${bubble.duration}s`,
              }}
            />
          ))}
        </div>

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
              onClick={prevLevel}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-400 text-white rounded-full p-3 shadow-lg z-10 transition-all hover:scale-110"
              aria-label="Vorheriges Level"
            >
              <FaIcon icon={faCaretLeft} className="text-xl" />
            </button>
          )}

          {carouselIndex < levels.length - 1 && (
            <button
              onClick={nextLevel}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-400 text-white rounded-full p-3 shadow-lg z-10 transition-all hover:scale-110"
              aria-label="Nächstes Level"
            >
              <FaIcon icon={faCaretRight} className="text-xl" />
            </button>
          )}

          {/* Carousel container with fixed content width and scroll snapping */}
          <div className=" pointer-events-none" onWheel={handleWheel}>
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

                    // Card width including margins (w-96 = 384px + padding)
                    const cardWidth = 420

                    // Calculate the closest index based on scroll position
                    // Using Math.round for better snapping to nearest card
                    const newIndex = Math.round(scrollPosition / cardWidth)

                    // Update the active index if needed
                    if (
                      newIndex !== carouselIndex &&
                      newIndex >= 0 &&
                      newIndex < levels.length
                    ) {
                      setCarouselIndex(newIndex)

                      // Ensure scroll is perfectly aligned to card position
                      const perfectPosition = newIndex * cardWidth
                      if (Math.abs(scrollPosition - perfectPosition) > 10) {
                        carouselRef.current.scrollTo({
                          left: perfectPosition,
                          behavior: 'smooth',
                        })
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
                    // Immediately set the carousel index on click for instant feedback
                    setCarouselIndex(index)
                    // Also scroll to the item for synchronized UI
                    if (carouselRef.current) {
                      const cardWidth = 420
                      carouselRef.current.scrollTo({
                        left: index * cardWidth,
                        behavior: 'smooth',
                      })
                    }
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
                    <div className="p-1 flex justify-center items-center h-60 bg-gray-50">
                      <View
                        world={deserializeWorld(level.quest.tasks[0].start)}
                        preview={{
                          world: deserializeWorld(level.quest.tasks[0].target),
                        }}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <div className="px-3 py-2 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          {level.quest.title}
                        </h3>
                        {/*<span
                          className={clsx(
                            'px-2 py-1 text-xs rounded-full font-semibold',
                            level.difficulty === 'easy'
                              ? 'bg-green-100 text-green-800'
                              : level.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {level.difficulty === 'easy'
                            ? 'Leicht'
                            : level.difficulty === 'medium'
                            ? 'Mittel'
                            : 'Schwer'}
                        </span>*/}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
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
          onClick={handleStart}
          className="mt-12 px-8 py-4 bg-teal-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-teal-400 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300"
        >
          Start
        </button>
      </div>
      <HFullStyles />
    </>
  )
}
