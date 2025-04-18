import { useCore } from '../../lib/state/core'
import { HFullStyles } from '../helper/HFullStyles'
import { View } from '../helper/View'
import { useEffect, useCallback } from 'react'
import {
  forward,
  left,
  right,
  brick,
  unbrick,
  toggleMark,
} from '../../lib/commands/world'
import { View2D } from '../helper/View2D'

export function KarolmaniaGame() {
  const core = useCore()

  // Handle keyboard commands to control the robot - match WorldEditor keymap
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    [core]
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
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-700 via-teal-500 to-emerald-400 relative overflow-hidden">
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
      <div className="fixed right-3 bottom-3 bg-white">
        <View2D
          world={core.ws.world}
          preview={{ world: core.ws.quest.tasks[0].target! }}
          className="w-[200px] h-[200px]"
        />
      </div>
      <div className="mt-4 text-left text-gray-700 fixed left-3 bottom-3">
        <h3 className="font-bold">Steuerung:</h3>
        <div className=" mt-2">
          Pfeiltasten, (H)inlegen, (A)ufheben, (M)arkeSetzen/Löschen
        </div>
      </div>
    </>
  )
}
