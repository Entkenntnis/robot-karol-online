// filepath: c:\Users\dal12\Desktop\_github\robot-karol-online\components\pages\Karolmania.tsx
import { useEffect, useState, useRef } from 'react'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import {
  left,
  right,
  forward,
  brick,
  unbrick,
  toggleMark,
  toggleBlock,
} from '../../lib/commands/world'
import { deserializeWorld } from '../../lib/commands/json'
import { createWorld } from '../../lib/state/create'
import { World } from '../../lib/state/types'

export function Karolmania() {
  const core = useCore()
  const [gameStatus, setGameStatus] = useState<
    'idle' | 'intro' | 'running' | 'finished'
  >('idle')
  const [timeLeft, setTimeLeft] = useState(0)
  const [targetWorld, setTargetWorld] = useState(
    deserializeWorld({
      dimX: 10,
      dimY: 10,
      height: 6,
      karol: { x: 3, y: 6, dir: 'west' },
      bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
      marks: {
        dimX: 4,
        dimY: 4,
        offsetX: 3,
        offsetY: 3,
        data: [
          [true, true, true, true],
          [true, true, true, true],
          [true, true, true, true],
          [true, true, true, true],
        ],
      },
      blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
    })
  )
  const gameRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number>()

  // Tastatursteuerung
  const actions: { [key: string]: () => void } = {
    ArrowLeft: () => left(core),
    ArrowRight: () => right(core),
    ArrowUp: () => forward(core),
    KeyH: () => brick(core),
    KeyA: () => unbrick(core),
    KeyM: () => toggleMark(core),
    KeyQ: () => toggleBlock(core),
  }

  // Spielinitialisierung
  const startGame = () => {
    setGameStatus('intro')
    setTimeLeft(5)

    // 5 Sekunden Intro-Countdown
    const countdown = setInterval(() => {
      setTimeLeft((t) => {
        if (t === 1) {
          clearInterval(countdown)
          setGameStatus('running')
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  // Timer-Logik
  useEffect(() => {
    if (gameStatus === 'running') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((t) => t + 1)
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [gameStatus])

  // Spielende prüfen
  useEffect(() => {
    if (isWorldEqual(core.ws.world, targetWorld)) {
      setGameStatus('finished')
      clearInterval(timerRef.current)
    }
  }, [core.ws.world, targetWorld])

  // Tastaturfokus
  useEffect(() => {
    gameRef.current?.focus()
    core.mutateWs((ws) => {
      ws.world = createWorld(
        targetWorld.dimX,
        targetWorld.dimY,
        targetWorld.height
      )
    })
  }, [])

  // Weltvergleichslogik
  const isWorldEqual = (a: World, b: World) => {
    // Implementiere den tatsächlichen Vergleich
    return false
    return JSON.stringify(a) === JSON.stringify(b)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100">
      <div className="mb-4 text-6xl font-bold">
        {gameStatus === 'intro' ? timeLeft : timeLeft}
      </div>

      {gameStatus === 'finished' && (
        <div className="text-4xl mb-4 text-green-600">
          Geschafft in {timeLeft} Sekunden!
        </div>
      )}

      <div className="flex gap-8">
        <div>
          <h2 className="text-xl mb-2">Zielwelt</h2>
          <View world={targetWorld} hideKarol />
        </div>

        <div>
          <h2 className="text-xl mb-2">Deine Welt</h2>
          <div
            ref={gameRef}
            tabIndex={0}
            className="border-4 border-gray-300 focus:border-blue-400 outline-none"
            onKeyDown={(e) => {
              if (gameStatus === 'running' && actions[e.code]) {
                actions[e.code]()
                e.preventDefault()
              }
            }}
          >
            <View world={core.ws.world} />
          </div>
        </div>
      </div>

      {gameStatus === 'idle' && (
        <button
          onClick={startGame}
          className="mt-8 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-2xl"
        >
          Spiel starten
        </button>
      )}

      {gameStatus === 'finished' && (
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 text-2xl"
        >
          Nochmal spielen
        </button>
      )}

      <div className="mt-8 text-gray-600">
        Steuerung: Pfeiltasten bewegen, H=Hinlegen, A=Aufheben, M=Marke,
        Q=Quader
      </div>
    </div>
  )
}
