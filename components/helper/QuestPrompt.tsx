import { useEffect, useState } from 'react'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { useCore } from '../../lib/state/core'
import clsx from 'clsx'
import { View } from './View'

export function QuestPrompt() {
  const core = useCore()
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (core.ws.ui.questPrompt) {
      setDisplayedText('')
      setCurrentIndex(0)
    }
  }, [core.ws.ui.questPrompt])

  useEffect(() => {
    if (
      !core.ws.ui.questPrompt ||
      currentIndex >= core.ws.ui.questPrompt.length
    )
      return

    const timeout = setTimeout(() => {
      setDisplayedText(
        (prev) => prev + core.ws.ui.questPrompt?.charAt(currentIndex)
      )
      setCurrentIndex((prev) => prev + 1)
    }, 25)

    return () => clearTimeout(timeout)
  }, [currentIndex, core.ws.ui.questPrompt])

  if (!core.ws.ui.questPrompt) return null

  const isComplete = currentIndex >= core.ws.ui.questPrompt.length

  return (
    <div className="absolute left-20 right-12 rounded bottom-4 overflow-auto min-h-[47px] bg-yellow-100 flex items-center">
      <div>
        <View
          robotImageDataUrl={core.ws.robotImageDataUrl}
          world={{
            dimX: 1,
            dimY: 1,
            karol: {
              x: 0,
              y: 0,
              dir: 'east',
            },
            blocks: [[false]],
            marks: [[false]],
            bricks: [[0]],
            height: 1,
          }}
          hideWorld
          className="ml-1 -mt-2 mr-2"
        />
      </div>
      <div className="flex-grow flex justify-between flex-col min-h-[80px]">
        <div className="px-3 py-2">{processMarkdown(displayedText)}</div>
        <div className="flex justify-end mr-2 mb-2">
          <button
            className={clsx(
              'bg-yellow-600 text-white font-semibold py-0.5 px-2 rounded shadow hover:bg-yellow-700 transition duration-200',
              !isComplete && 'invisible'
            )}
            onClick={() => {
              // remove prompt and message worker
              core.mutateWs((ws) => {
                ws.ui.questPrompt = undefined
              })
              if (core.worker && core.worker.questPromptConfirm) {
                core.worker.questPromptConfirm[0] = 1
                Atomics.notify(core.worker.questPromptConfirm, 0)
                core.worker.questPromptConfirm = undefined
              }
            }}
          >
            {core.ws.ui.questPromptConfirm ?? 'weiter'}
          </button>
        </div>
      </div>
    </div>
  )
}
