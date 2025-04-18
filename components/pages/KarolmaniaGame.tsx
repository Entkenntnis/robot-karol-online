import { useCore } from '../../lib/state/core'
import { HFullStyles } from '../helper/HFullStyles'
import { View } from '../helper/View'
import { useEffect, useCallback, useState, useRef } from 'react'
import {
  forward,
  left,
  right,
  brick,
  unbrick,
  toggleMark,
  twoWorldsEqual,
} from '../../lib/commands/world'
import { View2D } from '../helper/View2D'
import clsx from 'clsx'
import { navigate } from '../../lib/commands/router'
import { FaIcon } from '../helper/FaIcon'
import {
  faArrowLeft,
  faMusic,
  faVolumeHigh,
  faTrophy,
  faMedal,
} from '@fortawesome/free-solid-svg-icons'
import {
  getKarolmaniaMusicEnabled,
  setKarolmaniaMusicEnabled,
  getKarolmaniaSoundEffectsEnabled,
  setKarolmaniaSoundEffectsEnabled,
  saveKarolmaniaHighScore,
  getBestTimeForLevel,
} from '../../lib/storage/storage'
import { levels } from '../../lib/data/karolmaniaLevels'

export function KarolmaniaGame() {
  const core = useCore()
  const [timerMs, setTimerMs] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const isDone = twoWorldsEqual(core.ws.world, core.ws.quest.tasks[0].target!)
  const hasPlayedCountdownSound = useRef(false)
  const hasPlayedWinSound = useRef(false)
  const savedHighScore = useRef(false)
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false)
  const [previousBestTime, setPreviousBestTime] = useState<number | null>(null)
  const levelId = core.ws.ui.karolmaniaLevelId || 0

  // Get the current level's medal times
  const currentLevel = levels.find((level) => level.id === levelId)
  const medalTimes = {
    gold: currentLevel?.gold || 0,
    silver: currentLevel?.silver || 0,
    bronze: currentLevel?.bronze || 0,
    at: currentLevel?.at || 0,
  }

  // Create sorted medals array including personal best if available
  const getSortedMedals = () => {
    const medals = [
      {
        type: 'gold',
        time: medalTimes.gold,
        icon: faMedal,
        color: 'text-yellow-500',
        label: 'Gold',
      },
      {
        type: 'silver',
        time: medalTimes.silver,
        icon: faMedal,
        color: 'text-gray-400',
        label: 'Silber',
      },
      {
        type: 'bronze',
        time: medalTimes.bronze,
        icon: faMedal,
        color: 'text-amber-700',
        label: 'Bronze',
      },
      {
        type: 'at',
        time: medalTimes.at,
        icon: faMedal,
        color: 'text-teal-800',
        label: 'AutorIn',
      },
    ]

    // Add personal best if available
    if (previousBestTime !== null) {
      medals.push({
        type: 'pb',
        time: previousBestTime,
        icon: faTrophy,
        color: 'text-gray-600',
        label: 'Pers. Best',
      })
    }

    // Sort by time (fastest to slowest)
    return medals.sort((a, b) => a.time - b.time)
  }

  // Keep track of countdown state
  const isCountdownRunning = useRef(false)

  // Audio state management
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const countdownSoundRef = useRef<HTMLAudioElement | null>(null)
  const winSoundRef = useRef<HTMLAudioElement | null>(null)
  const silentContextRef = useRef<AudioContext | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(
    getKarolmaniaMusicEnabled()
  )
  const [isSoundEffectsEnabled, setIsSoundEffectsEnabled] = useState(
    getKarolmaniaSoundEffectsEnabled()
  )
  const [shouldPlayMusic, setShouldPlayMusic] = useState(false)

  const playClickSound = useCallback(() => {
    if (!isSoundEffectsEnabled) return

    // Use existing audio element but reset it for immediate playback
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0
      clickSoundRef.current.volume = 0.95
      clickSoundRef.current.play().catch(() => {
        // Silently handle play failures
      })
    }
  }, [isSoundEffectsEnabled])

  const playCountdownSound = useCallback(() => {
    if (!isSoundEffectsEnabled) return

    if (countdownSoundRef.current) {
      console.log('play countdown sound')
      countdownSoundRef.current.currentTime = 0
      countdownSoundRef.current.volume = 0.95
      countdownSoundRef.current.play().catch(() => {
        // Silently handle play failures
      })
    }
  }, [isSoundEffectsEnabled])

  // Function to reset the game
  const resetGame = useCallback(() => {
    // Reset timer
    setTimerMs(0)

    // Reset countdown and game state
    setCountdown(3)
    setIsGameActive(false)

    // Reset sound flags
    hasPlayedCountdownSound.current = false
    hasPlayedWinSound.current = false

    // Reset high score flag
    savedHighScore.current = false
    setIsNewPersonalBest(false)

    // Reset music state
    setShouldPlayMusic(false)

    // Reset audio - restart music from beginning and stop countdown and win sounds
    if (bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0
    }

    if (countdownSoundRef.current) {
      countdownSoundRef.current.pause()
      countdownSoundRef.current.currentTime = 0
    }

    if (winSoundRef.current) {
      winSoundRef.current.pause()
      winSoundRef.current.currentTime = 0
    }

    // Reset the world if needed by re-loading the current quest
    if (core.ws.quest && core.ws.quest.tasks && core.ws.quest.tasks[0]) {
      core.mutateWs((ws) => {
        ws.world = ws.quest.tasks[0].start
      })
    }

    if (isSoundEffectsEnabled) {
      playClickSound()

      // Play countdown sound immediately after reset
      setTimeout(() => {
        if (isSoundEffectsEnabled) {
          playCountdownSound()
          hasPlayedCountdownSound.current = true
        }
      }, 100) // Small delay to ensure click sound plays first
    }

    // Mark that countdown is running
    isCountdownRunning.current = true
  }, [core, isSoundEffectsEnabled, playClickSound, playCountdownSound])

  // Initialize audio system
  useEffect(() => {
    // Create an audio context first to ensure it's properly initialized
    const silentContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    silentContextRef.current = silentContext

    // Play a silent sound to initialize audio context
    const silentSound = silentContext.createOscillator()
    const gainNode = silentContext.createGain()
    gainNode.gain.value = 0 // Silent
    silentSound.connect(gainNode)
    gainNode.connect(silentContext.destination)
    silentSound.start()
    silentSound.stop(0.001) // Stop after a very short time

    // Create audio elements
    bgMusicRef.current = new Audio('/audio/paganini.mp3')
    clickSoundRef.current = new Audio('/audio/pick.mp3')
    countdownSoundRef.current = new Audio('/audio/countdown.mp3')
    winSoundRef.current = new Audio('/audio/win.mp3')

    // Set properties
    if (bgMusicRef.current) {
      bgMusicRef.current.loop = true
      bgMusicRef.current.volume = 1

      // Don't autoplay music initially - wait for countdown to complete
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
        bgMusicRef.current = null
      }

      clickSoundRef.current = null
      countdownSoundRef.current = null
      winSoundRef.current = null

      if (silentContextRef.current) {
        silentContextRef.current.close().catch(() => {
          // Silently handle close failures
        })
        silentContextRef.current = null
      }
    }
  }, [])

  // Audio control functions
  const playMusic = useCallback(() => {
    if (!bgMusicRef.current || !shouldPlayMusic || isDone) return

    bgMusicRef.current.play().catch(() => {
      // Silently handle play failures
    })
  }, [shouldPlayMusic, isDone])

  const pauseMusic = useCallback(() => {
    if (!bgMusicRef.current) return

    bgMusicRef.current.pause()
  }, [])

  const toggleMusic = useCallback(() => {
    const newState = !isMusicPlaying
    setIsMusicPlaying(newState)
    setKarolmaniaMusicEnabled(newState)

    if (newState && !isDone) {
      playMusic()
    } else {
      pauseMusic()
    }
  }, [isMusicPlaying, playMusic, pauseMusic, isDone])

  const toggleSoundEffects = useCallback(() => {
    setIsSoundEffectsEnabled((prev) => {
      setKarolmaniaSoundEffectsEnabled(!prev)
      return !prev
    })
  }, [])

  const playWinSound = useCallback(() => {
    if (!isSoundEffectsEnabled) return

    if (winSoundRef.current) {
      winSoundRef.current.currentTime = 0
      winSoundRef.current.volume = 1
      winSoundRef.current.play().catch(() => {
        // Silently handle play failures
      })
    }
  }, [isSoundEffectsEnabled])

  // Keep music playback in sync with state
  useEffect(() => {
    if (isDone) {
      // Stop music when game is complete
      pauseMusic()
    } else if (isMusicPlaying && shouldPlayMusic) {
      playMusic()
    } else {
      pauseMusic()
    }
  }, [isMusicPlaying, playMusic, pauseMusic, shouldPlayMusic, isDone])

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      // Mark that countdown is running
      isCountdownRunning.current = true

      // Play countdown sound once at the start
      // Only play if sound effects are enabled AND we haven't played it yet for this countdown
      if (!hasPlayedCountdownSound.current && isSoundEffectsEnabled) {
        playCountdownSound()
        hasPlayedCountdownSound.current = true
      }

      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(countdownTimer)
    } else if (countdown === 0) {
      // Start game after countdown finishes
      setIsGameActive(true)
      setCountdown(-1) // Set to -1 to indicate countdown is done
      // Reset the flag for next time
      hasPlayedCountdownSound.current = false
      isCountdownRunning.current = false

      // Now that countdown is done, enable music playback
      setShouldPlayMusic(true)
    }
  }, [countdown, isSoundEffectsEnabled, playCountdownSound])

  // Timer effect, updates every 10ms, stops when isDone is true
  useEffect(() => {
    // Don't start timer if already done or game isn't active yet
    if (isDone || !isGameActive) return

    const startTime = Date.now()
    const timerInterval = setInterval(() => {
      setTimerMs(Date.now() - startTime)
    }, 10)

    return () => clearInterval(timerInterval)
  }, [isDone, isGameActive])

  // Play sound when game is completed
  useEffect(() => {
    if (isDone && isGameActive && !hasPlayedWinSound.current) {
      // Stop background music
      pauseMusic()

      // Play win sound when game is completed
      if (isSoundEffectsEnabled) {
        playWinSound()
        hasPlayedWinSound.current = true
      }
    }
  }, [isDone, isGameActive, isSoundEffectsEnabled, pauseMusic, playWinSound])

  // Save high score when level is completed
  useEffect(() => {
    if (isDone && isGameActive && !savedHighScore.current) {
      savedHighScore.current = true

      // Convert milliseconds to seconds with 2 decimal precision
      const timeInSeconds = Math.round(timerMs / 10) / 100

      // Check if this is a new high score
      const isNewPB = saveKarolmaniaHighScore(levelId, timeInSeconds)

      // Update state to show high score notification
      setIsNewPersonalBest(isNewPB)

      // Update the previous best time if this was a new personal best
      if (isNewPB) {
        setPreviousBestTime(timeInSeconds)
      }

      // Track the event
      /*submitAnalyzeEvent(core, 'ev_karolmania_complete', {
        levelId,
        timeInSeconds,
        isNewPB,
      })*/
    }
  }, [isDone, isGameActive, timerMs, levelId, core])

  // Load previous best time when component mounts
  useEffect(() => {
    const bestTime = getBestTimeForLevel(levelId)
    setPreviousBestTime(bestTime)
  }, [levelId])

  // Format timer as MM:SS:HH
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const hundredths = Math.round((ms % 1000) / 10)

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}:${String(hundredths).padStart(2, '0')}`
  }

  // Handle keyboard commands to control the robot - match WorldEditor keymap
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if Enter key is pressed to reset the game
      if (event.code === 'Enter') {
        resetGame()
        return
      }

      // Don't allow controls when done or game isn't active yet
      if (isDone || !isGameActive) return

      const actions: { [key: string]: () => void } = {
        ArrowLeft: () => {
          left(core)
        },
        ArrowRight: () => {
          right(core)
        },
        ArrowUp: () => {
          forward(core)
        },
        ArrowDown: () => {
          forward(core, { reverse: true })
        },
        KeyM: () => {
          toggleMark(core)
        },
        KeyH: () => {
          brick(core)
        },
        KeyA: () => {
          unbrick(core)
        },
      }

      const action = actions[event.code]
      if (action) {
        event.preventDefault()
        action()
        if (isSoundEffectsEnabled) {
          playClickSound()
        }
      }
    },
    [
      core,
      isDone,
      isGameActive,
      isSoundEffectsEnabled,
      playClickSound,
      resetGame,
    ]
  )

  // Set up keyboard event listeners when component mounts
  useEffect(() => {
    // Add the keyboard event listener directly to window
    window.addEventListener('keydown', handleKeyDown)

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <>
      <div
        className={`h-full w-full flex flex-col items-center justify-center ${
          isDone
            ? 'bg-gradient-to-br from-green-700 via-green-500 to-emerald-400 transition-colors duration-1000'
            : 'bg-gradient-to-br from-teal-700 via-teal-500 to-emerald-400'
        } relative overflow-hidden`}
      >
        {/* Back button */}
        <button
          onClick={() => {
            // First, immediately stop and reset all audio playing
            // This is crucial to prevent sounds continuing after navigation
            if (countdownSoundRef.current) {
              // Force stop the countdown sound
              countdownSoundRef.current.pause()
              countdownSoundRef.current.currentTime = 0
              countdownSoundRef.current.volume = 0
            }

            if (bgMusicRef.current) {
              // Force stop the background music
              bgMusicRef.current.pause()
              bgMusicRef.current.currentTime = 0
              // Remove the source to ensure complete cleanup
              bgMusicRef.current.src = ''
              bgMusicRef.current.load()
            }

            if (winSoundRef.current) {
              // Force stop any win sound
              winSoundRef.current.pause()
              winSoundRef.current.currentTime = 0
              // Remove the source to ensure complete cleanup
              winSoundRef.current.src = ''
              winSoundRef.current.load()
            }

            if (clickSoundRef.current) {
              // Force stop any click sound
              clickSoundRef.current.pause()
              clickSoundRef.current.currentTime = 0
              // Remove the source to ensure complete cleanup
              clickSoundRef.current.src = ''
              clickSoundRef.current.load()
            }

            // Stop countdown and reset game state when navigating away
            if (isCountdownRunning.current) {
              setCountdown(-1) // Set to -1 to indicate countdown is done
              isCountdownRunning.current = false
              hasPlayedCountdownSound.current = false
            }

            // Navigate back after cleanup is done
            navigate(core, '#KAROLMANIA')
          }}
          className="absolute top-4 left-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
          aria-label="Zurück zur Startseite"
        >
          <FaIcon icon={faArrowLeft} className="text-2xl" />
        </button>

        {/* Reset game button - moved to left side with text */}
        <button
          onClick={resetGame}
          className="absolute top-4 left-20 bg-white/30 hover:bg-white/50 text-white rounded-full px-4 py-3 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
          aria-label="Spiel zurücksetzen"
        >
          Neustart [Enter]
        </button>

        {/* Music toggle button */}
        <button
          onClick={toggleMusic}
          className="absolute top-4 right-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
          aria-label="Musik umschalten"
        >
          <div className="relative">
            <FaIcon icon={faMusic} className="text-2xl" />
            {!isMusicPlaying && (
              <div className="absolute top-1/2 left-0 w-8 border-t-2 border-red-500 transform -rotate-45"></div>
            )}
          </div>
        </button>

        {/* Sound effects toggle button */}
        <button
          onClick={toggleSoundEffects}
          className="absolute top-4 right-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all hover:scale-105"
          aria-label="Soundeffekte umschalten"
        >
          <div className="relative">
            <FaIcon icon={faVolumeHigh} className="text-2xl" />
            {!isSoundEffectsEnabled && (
              <div className="absolute top-1/2 left-0 w-8 border-t-2 border-red-500 transform -rotate-45"></div>
            )}
          </div>
        </button>

        {/* Medal Box */}
        <div className="fixed left-3 top-[30vh] bg-white/50 p-3 rounded shadow-lg w-[200px]">
          <h3 className="font-bold text-center border-b pb-1 mb-2">
            Medaillen
          </h3>
          <div className="space-y-2">
            {getSortedMedals().map((medal, index) => (
              <div
                key={index}
                className={clsx(
                  'flex items-center',
                  medal.type == 'pb' && 'text-sky-800'
                )}
              >
                <FaIcon icon={medal.icon} className={`${medal.color} mr-2`} />
                <span className="text-sm w-[188px] inline-block">
                  <span>{medal.label}:</span>
                </span>
                <span className="inline-block text-right text-sm">
                  {formatTime(medal.time * 1000)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl">
          <View
            robotImageDataUrl={core.ws.robotImageDataUrl}
            world={core.ws.world}
            preview={{ world: core.ws.quest.tasks[0].target! }}
            animationDuration={100}
            className="ml-2 -mt-2 mr-2"
          />
        </div>

        <HFullStyles />
      </div>

      {/* Countdown animation */}
      {countdown > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-9xl font-bold text-white shadow-text">
            {countdown}
          </div>
        </div>
      )}

      <div className="fixed right-3 bottom-3 bg-white p-2 rounded shadow w-[300px] h-[200px] flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <View2D
            world={core.ws.world}
            preview={{ world: core.ws.quest.tasks[0].target! }}
            className="object-contain max-w-full max-h-full"
          />
        </div>
      </div>
      <div className="mt-4 text-left text-gray-700 fixed left-3 bottom-3">
        <h3 className="font-bold">Steuerung:</h3>
        <div className=" mt-2">
          Pfeiltasten, (H)inlegen, (A)ufheben, (M)arkeSetzen/Löschen
        </div>
      </div>
      <div className="fixed top-3 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow">
        <div className="text-center">
          <div
            className={clsx(
              'font-bold',
              isDone
                ? isNewPersonalBest
                  ? 'text-green-600 text-3xl'
                  : 'text-3xl text-gray-700'
                : 'text-gray-800 text-lg'
            )}
          >
            {formatTime(timerMs)}
          </div>
        </div>
      </div>

      {/* Personal Best notification */}
      {isDone && isNewPersonalBest && (
        <div className="fixed top-24 left-0 right-0 flex justify-center">
          <div className=" bg-yellow-100 p-3 rounded-lg shadow-lg border-2 border-yellow-400 animate-bounce">
            <div className="text-center flex items-center">
              <FaIcon
                icon={faTrophy}
                className="text-yellow-500 mr-2 text-xl"
              />
              <span className="font-bold text-yellow-700">Neue Bestzeit!</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
