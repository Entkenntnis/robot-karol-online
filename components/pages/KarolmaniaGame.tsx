import { useCore } from '../../lib/state/core'
import { HFullStyles } from '../helper/HFullStyles'
import { View } from '../helper/View'
import { useEffect, useCallback, useState } from 'react'
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

export function KarolmaniaGame() {
  const core = useCore()
  const [timerMs, setTimerMs] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const isDone = twoWorldsEqual(core.ws.world, core.ws.quest.tasks[0].target!)

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(countdownTimer)
    } else if (countdown === 0) {
      // Start game after countdown finishes
      setIsGameActive(true)
      setCountdown(-1) // Set to -1 to indicate countdown is done
    }
  }, [countdown])

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

  // Format timer as MM:SS:HH
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const hundredths = Math.floor((ms % 1000) / 10)

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}:${String(hundredths).padStart(2, '0')}`
  }

  // Handle keyboard commands to control the robot - match WorldEditor keymap
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
      }
    },
    [core, isDone, isGameActive]
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
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl">
          <View
            robotImageDataUrl={core.ws.robotImageDataUrl}
            world={core.ws.world}
            preview={{ world: core.ws.quest.tasks[0].target! }}
            className="ml-2 -mt-2 mr-2"
          />
        </div>

        <HFullStyles />
      </div>

      {/* Countdown animation */}
      {countdown > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-9xl font-bold text-white animate-bounce shadow-text">
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
              isDone ? 'text-green-600 text-3xl' : 'text-gray-800 text-lg'
            )}
          >
            {formatTime(timerMs)}
          </div>
        </div>
      </div>
    </>
  )
}
