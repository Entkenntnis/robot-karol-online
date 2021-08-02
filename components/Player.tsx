import clsx from 'clsx'
import { useState } from 'react'
import { useCore } from '../lib/core'
import { View } from './View'

export function Player() {
  const core = useCore()

  const [showNewWorldModal, setShowNewWorldModal] = useState(false)

  function addMessage(text: string) {
    return
  }

  return (
    <div className="flex flex-col min-w-min h-full">
      <div className="flex-grow overflow-auto flex flex-col justify-center h-full relative">
        <div className="min-h-0 w-full">
          <div
            onKeyDown={(e) => {
              if (e.code == 'ArrowLeft') {
                core.left()
                e.preventDefault()
              }
              if (e.code == 'ArrowRight') {
                core.right()
                e.preventDefault()
              }
              if (e.code == 'ArrowUp') {
                core.forward()
                e.preventDefault()
              }
              if (e.code == 'ArrowDown') {
                core.forward({ reverse: true })
                e.preventDefault()
              }
              if (e.code == 'KeyM') {
                core.toggleMark()
                e.preventDefault()
              }
              if (e.code == 'KeyH') {
                core.brick()
                e.preventDefault()
              }
              if (e.code == 'KeyQ') {
                core.toggleBlock()
                e.preventDefault()
              }
              if (e.code == 'KeyA') {
                core.unbrick()
                e.preventDefault()
              }
            }}
            tabIndex={1}
            className="focus:border-green-200 border-white border-2 mb-32 mt-12 w-max h-max mx-auto"
          >
            <View world={core.current.world} />
          </div>
          <div className="absolute bottom-3 left-3">
            {core.current.ui.messages.map((m) => (
              <div key={`${m.ts}`}>
                {m.text}
                {m.count > 1 && <span> (x{m.count})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 flex justify-between items-center border-t">
        <div>
          <button
            className="mx-3 text-xl py-2"
            onClick={() => core.left()}
            title="LinksDrehen"
          >
            🠔
          </button>{' '}
          <button
            className="mx-3 text-xl px-2"
            onClick={() => core.forward()}
            title="Schritt"
          >
            🠕
          </button>
          <button
            className="mx-3 text-xl py-2"
            onClick={() => core.right()}
            title="RechtsDrehen"
          >
            🠖
          </button>
          <button
            className="mx-3"
            onClick={() => core.brick()}
            title="Hinlegen"
          >
            H
          </button>
          <button
            className="mx-3 "
            onClick={() => core.unbrick()}
            title="Aufheben"
          >
            A
          </button>
          <button
            className="mx-3"
            onClick={() => core.toggleMark()}
            title="MarkeSetzen / MarkeLöschen"
          >
            M
          </button>
          <button
            className="mx-3"
            onClick={() => {
              core.toggleBlock()
            }}
            title="Quader setzen oder löschen"
          >
            Q
          </button>
        </div>
        <div>
          <button
            className="px-2 py-1 m-1 rounded-2xl bg-indigo-400"
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
            className="fixed top-[30vh] mx-auto z-[300] bg-white opacity-100 w-[400px]"
          >
            <NewWorldSettings
              dimX={core.current.world.dimX}
              dimY={core.current.world.dimY}
              height={core.current.world.height}
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

  const core = useCore()

  return (
    <>
      <div className="m-3 mb-6 text-xl font-bold">Neue Welt erstellen</div>
      <div className="flex justify-between m-3">
        <span>⟷ Breite:</span>
        <input
          type="number"
          className="border-2"
          value={localDimX}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (val >= 0 && val <= 100) {
              setLocalDimX(val)
            }
          }}
        />
      </div>
      <div className="flex justify-between m-3">
        <span>
          <span className="inline-block -rotate-45">⟷</span> Länge:
        </span>
        <input
          type="number"
          className="border-2"
          value={localDimY}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (val && val > 0 && val <= 100) {
              setLocalDimY(val)
            }
          }}
        />
      </div>
      <div className="flex justify-between m-3">
        <span>
          <span className="inline-block rotate-90">⟷</span> Höhe:
        </span>
        <input
          value={localHeight}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (val && val > 0 && val <= 10) {
              setLocalHeight(val)
            }
          }}
          type="number"
          className="border-2"
        />
      </div>
      <div className="my-4">
        <button
          className={clsx(
            'ml-4 rounded-2xl px-2 py-1',
            localDimX && localDimY && localHeight
              ? 'bg-green-300'
              : 'bg-gray-50'
          )}
          disabled={localDimX && localDimY && localHeight ? undefined : true}
          onClick={() => {
            core.createWorld(localDimX, localDimY, localHeight)
            onDone()
          }}
        >
          Welt erstellen
        </button>
      </div>
    </>
  )
}
