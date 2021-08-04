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
    <div className="flex flex-col w-full h-full">
      <div className="flex-grow h-full min-h-0 relative">
        <div className="flex-grow overflow-auto flex flex-col justify-center h-full">
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
              className="focus:border-green-200 border-white border-2 mb-32 mt-12 w-max h-max mx-auto cursor-pointer"
            >
              <View world={core.current.world} />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-gray-50">
            {core.current.ui.messages.map((m) => (
              <div key={`${m.ts}`}>
                {m.text}
                {m.count > 1 && <span> (x{m.count})</span>}
              </div>
            ))}
          </div>
          {core.current.ui.originalWorld &&
            core.current.ui.originalWorld != core.current.world && (
              <div className="absolute top-2 left-2 bg-gray-50">
                <button
                  onClick={() => {
                    core.restoreWorld()
                  }}
                >
                  ⭯ Welt wiederherstellen
                </button>
              </div>
            )}
        </div>
      </div>
      <div className="flex-shrink-0 flex justify-between items-center border-t h-12">
        <div>
          <button
            className="mx-3 text-xl py-2"
            onClick={() => core.left()}
            title="LinksDrehen"
          >
            🠔
          </button>{' '}
          <button
            className="text-xl px-2"
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
            className="mx-2"
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
            className="px-2 py-0.5 mr-2 rounded-2xl bg-indigo-300"
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
            className="fixed top-[30vh] mx-auto z-[300] bg-white opacity-100 w-[400px] rounded"
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
          value={localDimX == -1 ? '' : localDimX}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (isNaN(val)) {
              setLocalDimX(-1)
            }
            if (val >= 0 && val <= 100) {
              setLocalDimX(val)
            }
          }}
          min={1}
          max={100}
        />
      </div>
      <div className="flex justify-between m-3">
        <span>
          <span className="inline-block -rotate-45">⟷</span> Länge:
        </span>
        <input
          type="number"
          className="border-2"
          value={localDimY == -1 ? '' : localDimY}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (isNaN(val)) {
              setLocalDimY(-1)
            }
            if (val >= 0 && val <= 100) {
              setLocalDimY(val)
            }
          }}
          min={1}
          max={100}
        />
      </div>
      <div className="flex justify-between m-3">
        <span>
          <span className="inline-block rotate-90">⟷</span> Höhe:
        </span>
        <input
          value={localHeight == -1 ? '' : localHeight}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (isNaN(val)) {
              setLocalHeight(-1)
            }
            if (val >= 0 && val <= 10) {
              setLocalHeight(val)
            }
          }}
          type="number"
          className="border-2"
          min={1}
          max={10}
        />
      </div>
      <div className="my-4">
        <button
          className={clsx(
            'ml-4 rounded-2xl px-2 py-1',
            localDimX > 0 && localDimY > 0 && localHeight > 0
              ? 'bg-green-300'
              : 'bg-gray-50'
          )}
          disabled={
            localDimX > 0 && localDimY > 0 && localHeight > 0 ? undefined : true
          }
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
