import {
  faCheckCircle,
  faEquals,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, Dispatch, SetStateAction, useEffect, useState } from 'react'

import { toggleWireframe } from '../lib/commands/view'
import {
  brick,
  createWorldCmd,
  forward,
  left,
  resetWorld,
  right,
  toggleBlock,
  toggleMark,
  unbrick,
} from '../lib/commands/world'
import { levels } from '../lib/data/levels'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Player() {
  const core = useCore()

  const [showNewWorldModal, setShowNewWorldModal] = useState(false)

  const [scale, setScale] = useState(1)

  const wrapper = createRef<HTMLDivElement>()

  useEffect(() => {
    wrapper.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-grow h-full min-h-0 relative">
        <div className="flex-grow overflow-auto flex flex-col justify-center h-full">
          <div className="min-h-0 w-full">
            <div
              onKeyDown={(e) => {
                if (e.code == 'ArrowLeft') {
                  left(core)
                  e.preventDefault()
                }
                if (e.code == 'ArrowRight') {
                  right(core)
                  e.preventDefault()
                }
                if (e.code == 'ArrowUp') {
                  forward(core)
                  e.preventDefault()
                }
                if (e.code == 'ArrowDown') {
                  forward(core, { reverse: true })
                  e.preventDefault()
                }
                if (e.code == 'KeyM') {
                  toggleMark(core)
                  e.preventDefault()
                }
                if (e.code == 'KeyH') {
                  brick(core)
                  e.preventDefault()
                }
                if (e.code == 'KeyQ') {
                  toggleBlock(core)
                  e.preventDefault()
                }
                if (e.code == 'KeyA') {
                  unbrick(core)
                  e.preventDefault()
                }
              }}
              tabIndex={1}
              className="focus:border-green-200 border-white border-2 mb-32 mt-12 w-max h-max mx-auto cursor-pointer outline-none"
              ref={wrapper}
              style={{ transform: `scale(${scale})` }}
            >
              <View
                world={core.ws.world}
                wireframe={core.ws.ui.wireframe}
                sparkle={core.level?.sparkle}
              />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-gray-50">
            {core.ws.ui.messages.map((m) => (
              <div key={`${m.ts}`}>
                {m.text}
                {m.count > 1 && <span> (x{m.count})</span>}
              </div>
            ))}
          </div>
          <div className="absolute right-3 bottom-2">
            <span
              onClick={() => {
                setScale((scale) => scale / 1.1)
              }}
            >
              <FaIcon
                icon={faMagnifyingGlassMinus}
                className="cursor-pointer"
              />
            </span>
            <span className="inline-block w-4" />
            <span
              onClick={() => {
                setScale(1)
              }}
            >
              <FaIcon icon={faEquals} className="cursor-pointer" />
            </span>
            <span className="inline-block w-4" />
            <span
              onClick={() => {
                setScale((scale) => scale * 1.1)
              }}
            >
              <FaIcon icon={faMagnifyingGlassPlus} className="cursor-pointer" />
            </span>
          </div>
          {core.ws.type == 'free' ? (
            <button
              className={clsx(
                'absolute left-1 top-1 rounded',
                'px-2 py-0.5 bg-gray-100 hover:bg-gray-200'
              )}
              onClick={() => {
                setShowNewWorldModal(true)
              }}
            >
              Neue Welt
            </button>
          ) : (
            <button
              className={clsx(
                'absolute left-1 top-1 rounded',
                'px-2 py-0.5 bg-gray-100 hover:bg-gray-200'
              )}
              onClick={() => {
                resetWorld(core)
              }}
            >
              Neu starten
            </button>
          )}
        </div>
      </div>
      {core.ws.type == 'level' && (
        <div className="border-t">
          <div className="flex justify-between items-center select-none h-12 border-b">
            {core.ws.progress < levels[core.ws.levelId].target ? (
              <>
                <div className="pl-4 font-bold">{core.ws.title}</div>
                <div className="bg-gray-200 w-full px-1 mx-3 relative flex justify-around items-center">
                  <div
                    className="bg-green-300 absolute left-0 top-0 bottom-0"
                    style={{
                      width: `${Math.round(
                        (core.ws.progress / levels[core.ws.levelId].target) *
                          100
                      )}%`,
                    }}
                  ></div>
                  <div className="z-10">
                    {core.ws.progress} / {levels[core.ws.levelId].target}
                  </div>
                </div>
              </>
            ) : (
              <div className="m-3">
                {core.ws.title}:{' '}
                <span className="text-green-600">
                  abgeschlossen <FaIcon icon={faCheckCircle} />
                </span>
              </div>
            )}
          </div>
          <div className="p-3">{levels[core.ws.levelId].description}</div>
        </div>
      )}
      <div className="flex-shrink-0 flex justify-around items-center border-t h-12">
        <div>
          <button
            className="mx-3 text-xl py-2"
            onClick={() => left(core)}
            title="LinksDrehen"
          >
            🠔
          </button>
          <button
            className="text-xl px-2"
            onClick={() => forward(core)}
            title="Schritt"
          >
            🠕
          </button>
          <button
            className="mx-3 text-xl py-2"
            onClick={() => right(core)}
            title="RechtsDrehen"
          >
            🠖
          </button>
          <button className="mx-2" onClick={() => brick(core)} title="Hinlegen">
            H
          </button>
          <button
            className="mx-3"
            onClick={() => unbrick(core)}
            title="Aufheben"
          >
            A
          </button>
          <button
            className="mx-3"
            onClick={() => toggleMark(core)}
            title="MarkeSetzen / MarkeLöschen"
          >
            M
          </button>
          <button
            className="mx-3"
            onClick={() => {
              toggleBlock(core)
            }}
            title="Quader setzen oder löschen"
          >
            Q
          </button>
          <span className="ml-4 h-7 border-r"></span>
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                core.ws.ui.wireframe
                  ? '/Ansicht_frame.png'
                  : '/Ansicht_voll.png'
              }
              title="Darstellung der Ziegel umschalten"
              alt="umschalten"
              className="inline-block h-5 pb-0.5 pl-1.5 cursor-pointer ml-3"
              onClick={() => {
                toggleWireframe(core)
              }}
            />
          }
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
              dimX={core.ws.world.dimX}
              dimY={core.ws.world.dimY}
              height={core.ws.world.height}
              onDone={() => setShowNewWorldModal(false)}
            />
            <div
              className="absolute top-2 right-2 h-3 w-3 cursor-pointer"
              onClick={() => setShowNewWorldModal(false)}
            >
              <FaIcon icon={faXmark} />
            </div>
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

  const canCreate = localDimX > 0 && localDimY > 0 && localHeight > 0

  return (
    <>
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
      <div className="my-4">
        <button
          className={clsx(
            'ml-4 rounded px-2 py-0.5',
            canCreate ? 'bg-green-300' : 'bg-gray-50'
          )}
          disabled={canCreate ? undefined : true}
          onClick={() => {
            createWorldCmd(core, localDimX, localDimY, localHeight)
            onDone()
          }}
        >
          Welt erstellen
        </button>
      </div>
    </>
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
            createWorldCmd(core, localDimX, localDimY, localHeight)
            onDone()
          }
        }}
        type="number"
        className="border-2"
        min={1}
        max={max}
      />
    )
  }
}
