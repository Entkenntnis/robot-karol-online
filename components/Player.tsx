import { useState } from 'react'
import { ProjectProvider, useProject } from '../lib/model'
import { View } from './View'

export function Player() {
  const { project, controller } = useProject()

  const [showNewWorldModal, setShowNewWorldModal] = useState(false)

  const [messages, setMessages] = useState<
    { message: string; ts: number; count: number }[]
  >([])

  function addMessage(text: string) {
    const newMessages = messages.slice(0)
    while (newMessages.length >= 5) {
      newMessages.shift()
    }
    const ts = Date.now()
    const lastMessage = newMessages[newMessages.length - 1]
    if (lastMessage?.message == text && ts - lastMessage.ts < 1000) {
      newMessages[newMessages.length - 1] = {
        message: text,
        ts,
        count: lastMessage.count + 1,
      }
    } else {
      newMessages.push({ message: text, ts, count: 1 })
    }
    setMessages(newMessages)
    setTimeout(() => {
      setMessages((m) => m.filter((m) => m.ts != ts))
    }, 3000)
  }

  return (
    <div className="flex flex-col min-w-min h-full">
      <div className="flex-grow overflow-auto flex flex-col justify-center h-full relative">
        <div className="min-h-0 w-full">
          <div
            onKeyDown={(e) => {
              if (e.code == 'ArrowLeft') {
                controller.left()
                e.preventDefault()
              }
              if (e.code == 'ArrowRight') {
                controller.right()
                e.preventDefault()
              }
              if (e.code == 'ArrowUp') {
                const result = controller.forward(project.world)
                if (result) {
                  addMessage(result)
                }
                e.preventDefault()
              }
              if (e.code == 'ArrowDown') {
                const result = controller.back(project.world)
                if (result) {
                  addMessage(result)
                }
                e.preventDefault()
              }
              if (e.code == 'KeyM') {
                controller.mark()
                e.preventDefault()
              }
              if (e.code == 'KeyH') {
                const result = controller.brick(project.world)
                if (result) {
                  addMessage(result)
                }
                e.preventDefault()
              }
              if (e.code == 'KeyQ') {
                const result = controller.block(project.world)
                if (result) {
                  addMessage(result)
                }
                e.preventDefault()
              }
              if (e.code == 'KeyA') {
                const result = controller.unbrick(project.world)
                if (result) {
                  addMessage(result)
                }
                e.preventDefault()
              }
            }}
            tabIndex={1}
            className="focus:border-green-200 border-white border-2 mb-32 mt-12 w-max h-max mx-auto"
          >
            <View world={project.world} />
          </div>
          <div className="absolute bottom-3 left-3">
            {messages.map((m, i) => (
              <div key={`${m.ts}`}>
                {m.message}
                {m.count > 1 && <span> (x{m.count})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 flex justify-between items-center">
        <div>
          <button className="mx-3" onClick={() => controller.left()}>
            LEFT
          </button>{' '}
          <button
            className="mx-3"
            onClick={() => {
              const result = controller.forward(project.world)
              if (result) {
                addMessage(result)
              }
            }}
          >
            UP
          </button>
          <button className="mx-3" onClick={() => controller.right()}>
            RIGHT
          </button>
          <button
            className="mx-3"
            onClick={() => {
              const result = controller.brick(project.world)
              if (result) {
                addMessage(result)
              }
            }}
          >
            H
          </button>
          <button
            className="mx-3"
            onClick={() => {
              const result = controller.unbrick(project.world)
              if (result) {
                addMessage(result)
              }
            }}
          >
            A
          </button>
          <button className="mx-3" onClick={() => controller.mark()}>
            M
          </button>
          <button
            className="mx-3"
            onClick={() => {
              const result = controller.block(project.world)
              if (result) {
                addMessage(result)
              }
            }}
          >
            Q
          </button>
        </div>
        <div>
          <button
            className="px-2 py-1 m-1 rounded-2xl bg-green-200"
            onClick={() => {
              setShowNewWorldModal(true)
            }}
          >
            Neue Welt
          </button>
        </div>
      </div>
      {showNewWorldModal && (
        <div
          className="fixed inset-0 bg-gray-300 bg-opacity-30 z-[200] flex justify-around items-center"
          onClick={() => setShowNewWorldModal(false)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="fixed top-[30vh] mx-auto z-[300] bg-white opacity-100 w-[500px]"
          >
            <NewWorldSettings
              dimX={project.world.dimX}
              dimY={project.world.dimY}
              height={project.world.height}
              onDone={() => setShowNewWorldModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function NewWorldSettings({
  dimX,
  dimY,
  height,
  onDone,
}: {
  dimX: number
  dimY: number
  height: number
  onDone: () => void
}) {
  const [localDimX, setLocalDimX] = useState(dimX)
  const [localDimY, setLocalDimY] = useState(dimY)

  const [localHeight, setLocalHeight] = useState(height)

  const { controller } = useProject()

  return (
    <>
      <div>Neue Welt erstellen</div>
      <div>
        Breite:{' '}
        <input
          type="number"
          value={localDimX}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (val && val > 0 && val <= 100) {
              setLocalDimX(val)
            }
          }}
        />
      </div>
      <div>
        Länge:{' '}
        <input
          type="number"
          value={localDimY}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (val && val > 0 && val <= 100) {
              setLocalDimY(val)
            }
          }}
        />
      </div>
      <div>
        Höhe:{' '}
        <input
          value={localHeight}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (val && val > 0 && val <= 10) {
              setLocalHeight(val)
            }
          }}
          type="number"
        />
      </div>
      <div className="my-4">
        <button
          className="ml-4 rounded-2xl px-2 py-1 bg-green-300"
          onClick={() => {
            controller.newWorld(localDimX, localDimY, localHeight)
            onDone()
          }}
        >
          Welt erstellen
        </button>
      </div>
    </>
  )
}
