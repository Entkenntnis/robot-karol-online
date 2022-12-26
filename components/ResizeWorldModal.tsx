import clsx from 'clsx'
import { Dispatch, SetStateAction, useState } from 'react'
import {
  setShowResizeWorld,
  showPreview,
  switchCurrentlyEditedWorld,
} from '../lib/commands/editor'
import { createWorldCmd } from '../lib/commands/world'
import { useCore } from '../lib/state/core'

export function ResizeWorldModal() {
  const core = useCore()

  const [localDimX, setLocalDimX] = useState(core.ws.world.dimX)
  const [localDimY, setLocalDimY] = useState(core.ws.world.dimY)

  const [localHeight, setLocalHeight] = useState(core.ws.world.height)

  const canCreate = localDimX > 0 && localDimY > 0 && localHeight > 0

  const [keep, setKeep] = useState(true)

  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setShowResizeWorld(core, false)
      }}
    >
      <div
        className="h-[340px] w-[500px] bg-white z-[200] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="m-3 mb-6 text-xl font-bold">Neue Welt erstellen</div>
        <div className="flex justify-between m-3">
          <span>⟷ Breite:</span>
          {buildInput(localDimX, setLocalDimX, 100)}
        </div>
        <div className="flex justify-between m-3">
          <span>
            <span className="inline-block -rotate-45">⟷</span> Länge:
          </span>
          {buildInput(localDimY, setLocalDimY, 100)}
        </div>
        <div className="flex justify-between m-3">
          <span>
            <span className="inline-block rotate-90">⟷</span> Höhe:
          </span>
          {buildInput(localHeight, setLocalHeight, 10)}
        </div>
        <div className="ml-4 mt-5">
          <label>
            <input
              type="checkbox"
              checked={keep}
              onChange={(e) => setKeep(e.target.checked)}
            />{' '}
            Inhalt der Welt behalten
          </label>
        </div>
        <div className="my-4">
          <button
            className={clsx(
              'ml-4 rounded px-2 py-0.5',
              canCreate ? 'bg-green-300' : 'bg-gray-50'
            )}
            disabled={canCreate ? undefined : true}
            onClick={() => {
              exec()
            }}
          >
            Welt erstellen
          </button>
          <button
            className="ml-4 px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              setShowResizeWorld(core, false)
            }}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )

  function buildInput(
    val: number,
    setter: Dispatch<SetStateAction<number>>,
    max: number
  ) {
    return (
      <input
        value={val == -1 ? '' : val}
        onChange={(e) => {
          const val = parseInt(e.target.value)
          if (isNaN(val)) {
            setter(-1)
          }
          if (val >= 0 && val <= max) {
            setter(val)
          }
        }}
        onKeyDown={(e) => {
          if (e.key == 'Enter' && canCreate) {
            exec()
          }
        }}
        type="number"
        className="border-2"
        min={1}
        max={max}
      />
    )
  }

  function exec() {
    const isShowPreview = core.ws.editor.showWorldPreview

    const now = core.ws.editor.currentlyEditing
    const other = now == 'start' ? 'target' : 'start'

    switchCurrentlyEditedWorld(core, now)
    createWorldCmd(core, localDimX, localDimY, localHeight, keep)
    switchCurrentlyEditedWorld(core, other)
    createWorldCmd(core, localDimX, localDimY, localHeight, keep)
    switchCurrentlyEditedWorld(core, now)

    if (isShowPreview) {
      showPreview(core)
    }

    setShowResizeWorld(core, false)
  }
}
