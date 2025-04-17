// filepath: c:\Users\dal12\Desktop\_github\robot-karol-online\components\pages\Karolmania.tsx
import { useEffect, useState, useRef } from 'react'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { AnimateInView } from '../helper/AnimateIntoView'
import clsx from 'clsx'
import { FaIcon } from '../helper/FaIcon'
import {
  faArrowLeft,
  faArrowRight,
  faCaretLeft,
  faHome,
} from '@fortawesome/free-solid-svg-icons'
import { levels, Level } from '../../lib/data/karolmaniaLevels'
import { HFullStyles } from '../helper/HFullStyles'
import { navigate } from '../../lib/commands/router'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { getQuestReturnToMode } from '../../lib/storage/storage'

export function Karolmania() {
  const core = useCore()
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Scroll carousel when index changes
  useEffect(() => {
    if (carouselRef.current && carouselIndex >= 0) {
      const cardWidth = 280 // Card width + margins
      carouselRef.current.scrollTo({
        left: carouselIndex * cardWidth,
        behavior: 'smooth',
      })
    }
  }, [carouselIndex])

  // Move carousel to previous level
  const prevLevel = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1)
    } else {
      setCarouselIndex(levels.length - 1)
    }
  }

  // Move carousel to next level
  const nextLevel = () => {
    if (carouselIndex < levels.length - 1) {
      setCarouselIndex(carouselIndex + 1)
    } else {
      setCarouselIndex(0)
    }
  }

  // Dummy start function
  const handleStart = () => {
    alert(
      'Level ' +
        levels[carouselIndex].name +
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
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-700 via-teal-500 to-emerald-400 relative overflow-hidden">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
          aria-label="Zurück zur Startseite"
        >
          <FaIcon icon={faArrowLeft} className="text-2xl" />
        </button>

        {/* Background animation - bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-bubble"
              style={{
                width: `${Math.random() * 150 + 20}px`,
                height: `${Math.random() * 150 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100 + 50}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 8 + 5}s`,
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

        <div className="relative w-full max-w-4xl px-16">
          {/* Navigation arrows */}
          <button
            onClick={prevLevel}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-400 text-white rounded-full p-3 shadow-lg z-10 transition-all hover:scale-110"
            aria-label="Vorheriges Level"
          >
            <FaIcon icon={faArrowLeft} className="text-xl" />
          </button>

          <button
            onClick={nextLevel}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-400 text-white rounded-full p-3 shadow-lg z-10 transition-all hover:scale-110"
            aria-label="Nächstes Level"
          >
            <FaIcon icon={faArrowRight} className="text-xl" />
          </button>

          {/* Carousel container */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {levels.map((level, index) => (
              <div
                key={level.id}
                className={clsx(
                  'flex-shrink-0 w-64 mx-2 snap-center transition-all duration-300',
                  carouselIndex === index
                    ? 'scale-110 z-10'
                    : 'scale-100 opacity-80'
                )}
                onClick={() => setCarouselIndex(index)}
              >
                <div
                  className={clsx(
                    'bg-white rounded-lg shadow-xl overflow-hidden transition-all transform cursor-pointer hover:scale-105',
                    carouselIndex === index && 'ring-4 ring-teal-300'
                  )}
                >
                  <div className="p-1 flex justify-center items-center h-48 bg-gray-50">
                    <View
                      world={level.targetWorld}
                      hideKarol
                      className="max-w-full max-h-full"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg text-gray-800">
                        {level.name}
                      </h3>
                      <span
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
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{level.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="mt-12 px-8 py-4 bg-teal-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-teal-400 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 animate-pulse"
        >
          Start
        </button>
      </div>
      <HFullStyles />
    </>
  )
}
