import {
  faDownload,
  faEquals,
  faExternalLink,
  faExternalLinkSquare,
  faFileImport,
  faLeftLong,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faRefresh,
  faRightLong,
  faShare,
  faSpinner,
  faUpLong,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { createRef, Dispatch, SetStateAction, useEffect, useState } from 'react'

import { toggleHideKarol } from '../lib/commands/editing'
import { focusWrapper, focusWrapperDone } from '../lib/commands/focus'
import { serialize } from '../lib/commands/json'
import { restoreProject } from '../lib/commands/load'
import { execPreview, hidePreview, showPreview } from '../lib/commands/preview'
import { share } from '../lib/commands/share'
import { toggleWireframe } from '../lib/commands/view'
import { abort, run } from '../lib/commands/vm'
import {
  brick,
  createWorldCmd,
  forward,
  left,
  right,
  toggleBlock,
  toggleMark,
  unbrick,
} from '../lib/commands/world'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'
import { View } from './View'

export function Player() {
  const core = useCore()

  const [showNewWorldModal, setShowNewWorldModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const [scale, setScale] = useState(1)

  const wrapper = createRef<HTMLDivElement>()

  useEffect(() => {
    wrapper.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (core.ws.ui.shouldFocusWrapper) {
      wrapper.current?.focus()
      focusWrapperDone(core)
    }
  })

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
    KeyQ: () => {
      toggleBlock(core)
    },
    KeyA: () => {
      unbrick(core)
    },
    ...{
      KeyW: () => {
        toggleWireframe(core)
        wrapper.current?.focus()
      },
    },
  }

  function runAction(action: string) {
    actions[action]()
    setTimeout(() => {
      execPreview(core)
    }, 10)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-grow h-full min-h-0 relative">
        <div
          className="flex-grow overflow-auto flex flex-col justify-center h-full"
          onClick={(e) => {
            wrapper.current?.focus()
          }}
        >
          <div className="min-h-0 w-full">
            <div
              onKeyDown={(e) => {
                if (actions[e.code]) {
                  runAction(e.code)
                  e.preventDefault()
                  return
                }
                if (e.code == 'KeyS') {
                  if (
                    core.ws.ui.state == 'ready' &&
                    core.ws.vm.bytecode &&
                    core.ws.vm.bytecode.length > 0
                  ) {
                    run(core)
                  } else if (core.ws.ui.state == 'running') {
                    abort(core)
                  }
                  e.preventDefault()
                }
                if (e.code == 'KeyV') {
                  if (!core.ws.ui.showPreview) {
                    showPreview(core)
                    focusWrapper(core)
                    execPreview(core)
                  } else {
                    hidePreview(core)
                    focusWrapper(core)
                  }
                  e.preventDefault()
                }
                if (e.code == 'Digit0') {
                  toggleHideKarol(core)
                  e.preventDefault()
                }
              }}
              tabIndex={1}
              className={clsx(
                'border-white border-2 mb-32 mt-12 w-max h-max mx-auto cursor-pointer',
                'outline-none focus:border-green-200 active:border-green-200'
              )}
              ref={wrapper}
              style={{ transform: `scale(${scale})` }}
            ></div>
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
            <button
              className="px-2 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded"
              onClick={() => {
                setShowShareModal(true)
              }}
            >
              <FaIcon icon={faShare} /> Teilen
            </button>
          </div>

          <div className="absolute left-1 top-1">
            (
            <>
              <button
                className="rounded px-2 py-0.5 bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  setShowNewWorldModal(true)
                }}
              >
                Neue Welt
              </button>
            </>
            )
          </div>
        </div>
      </div>

      <div
        className={clsx(
          'flex-shrink-0 flex justify-around items-center border-t',
          'h-12'
        )}
      >
        <div>
          <button
            className="mx-3 py-2"
            onClick={() => {
              runAction('ArrowLeft')
            }}
            title="LinksDrehen"
          >
            <FaIcon icon={faLeftLong} />
          </button>
          <button
            className=" px-2"
            onClick={() => {
              runAction('ArrowUp')
            }}
            title="Schritt"
          >
            <FaIcon icon={faUpLong} />
          </button>
          <button
            className="mx-3 py-2"
            onClick={() => {
              runAction('ArrowRight')
            }}
            title="RechtsDrehen"
          >
            <FaIcon icon={faRightLong} />
          </button>

          <button
            className="mx-2"
            onClick={() => {
              runAction('KeyH')
            }}
            title="Hinlegen"
          >
            H
          </button>
          <button
            className="mx-3"
            onClick={() => {
              runAction('KeyA')
            }}
            title="Aufheben"
          >
            A
          </button>
          <button
            className="mx-3"
            onClick={() => {
              runAction('KeyM')
            }}
            title="MarkeSetzen / MarkeLöschen"
          >
            M
          </button>
          <button
            className="mx-3"
            onClick={() => {
              runAction('KeyQ')
            }}
            title="Quader setzen oder löschen"
          >
            Q
          </button>
          {/* <span className="ml-4 h-7 border-r"></span>

          <img
            src={
              core.ws.ui.wireframe ? '/Ansicht_frame.png' : '/Ansicht_voll.png'
            }
            title="Darstellung der Ziegel umschalten"
            alt="umschalten"
            className="inline-block h-5 pb-0.5 pl-1.5 cursor-pointer ml-3 select-none"
            onClick={() => {
              toggleWireframe(core)
              wrapper.current?.focus()
            }}
          />*/}
          <span className="ml-3 h-7 border-r mr-6"></span>
          {renderZoomControls()}
        </div>
      </div>
      {showNewWorldModal && (
        <div
          className={clsx(
            'fixed inset-0 bg-gray-300 bg-opacity-30 flex justify-around',
            'items-center z-[200]'
          )}
          onClick={() => setShowNewWorldModal(false)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className={clsx(
              'fixed mx-auto bg-white opacity-100 rounded w-[400px] z-[300]',
              'top-[30vh]'
            )}
          >
            <NewWorldSettings
              dimX={core.ws.world.dimX}
              dimY={core.ws.world.dimY}
              height={core.ws.world.height}
              onDone={() => {
                setShowNewWorldModal(false)
                wrapper.current?.focus()
              }}
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
      {showShareModal && (
        <div
          className={clsx(
            'fixed inset-0 bg-gray-300 bg-opacity-30 flex justify-around',
            'items-center z-[200]'
          )}
          onClick={() => setShowShareModal(false)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className={clsx(
              'fixed mx-auto bg-white opacity-100 rounded w-[400px] z-[300]',
              'top-[30vh]'
            )}
          >
            <Share onClose={() => setShowShareModal(false)} />
            <div
              className="absolute top-2 right-2 h-3 w-3 cursor-pointer"
              onClick={() => setShowShareModal(false)}
            >
              <FaIcon icon={faXmark} />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderExport() {
    return (
      <button
        className="rounded px-2 py-0.5 bg-gray-100 hover:bg-gray-200 ml-4"
        onClick={() => {
          const date = new Date()
          const filename =
            date.toLocaleDateString('en-CA') +
            '_' +
            date.getHours().toString().padStart(2, '0') +
            date.getMinutes().toString().padStart(2, '0') +
            date.getSeconds().toString().padStart(2, '0') +
            '_robot-karol.json'
          const contentType = 'application/json;charset=utf-8;'
          var a = document.createElement('a')
          a.download = filename
          a.href =
            'data:' +
            contentType +
            ',' +
            encodeURIComponent(JSON.stringify(serialize(core)))
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }}
      >
        <FaIcon icon={faDownload} /> Speichern
      </button>
    )
  }

  function renderZoomControls() {
    return (
      <>
        <span
          onClick={() => {
            setScale((scale) => scale / 1.1)
          }}
          title="Verkleinern"
        >
          <FaIcon icon={faMagnifyingGlassMinus} className="cursor-pointer" />
        </span>
        <span className="inline-block w-4" />
        <span
          onClick={() => {
            setScale(1)
          }}
          title="Zoom zurücksetzen"
        >
          <FaIcon icon={faEquals} className="cursor-pointer" />
        </span>
        <span className="inline-block w-4" />
        <span
          onClick={() => {
            setScale((scale) => scale * 1.1)
          }}
          title="Vergrößern"
        >
          <FaIcon icon={faMagnifyingGlassPlus} className="cursor-pointer" />
        </span>
      </>
    )
  }
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

  const [keep, setKeep] = useState(core.ws.ui.keepWorldPreference)

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
        <p className="mt-7 mx-3 text-sm text-gray-600 text-right">
          Welt{' '}
          <button
            onClick={() => {
              onDone()
              document.getElementById('load_project')?.click()
            }}
            className="text-blue-500 hover:underline"
          >
            aus Datei laden
          </button>
        </p>
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
    createWorldCmd(core, localDimX, localDimY, localHeight, keep)
    setTimeout(() => {
      execPreview(core)
    }, 10)
    onDone()
  }
}

function Share(props: { onClose: () => void }) {
  const [pending, setPending] = useState(false)
  const [id, setId] = useState('')
  const core = useCore()

  const link = `${window.location.protocol}//${window.location.host}/?id=${id}`
  return (
    <>
      <h1 className="m-3 mb-6 text-xl font-bold">Teilen</h1>
      <p className="m-3 mb-6">
        Du kannst den Inhalt der Welt und deinen Code freigeben und mit anderen
        Personen teilen. Dazu wird der aktuelle Stand auf dem Server gespeichert
        und ein eindeutiger Link erstellt:
      </p>
      {id ? (
        <div className="px-3 mb-8">
          <input
            className="w-full border-yellow-300 outline-none border-2"
            value={link}
            readOnly
          />
          <button
            className="px-2 py-0.5 rounded mt-7 bg-green-300"
            onClick={() => {
              window.open(link, '_blank')
            }}
          >
            Link in neuem Tab öffnen <FaIcon icon={faExternalLinkSquare} />
          </button>
        </div>
      ) : (
        <button
          className="px-2 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded ml-3 mb-6"
          onClick={async () => {
            setPending(true)
            try {
              const id = await share(core)
              setId(id)
            } catch (e) {
              alert('Fehler: ' + e)
            }
          }}
          disabled={pending}
        >
          {pending ? (
            <>
              <FaIcon icon={faSpinner} className="animate-spin" /> wird geladen
              ...
            </>
          ) : (
            `Link erstellen`
          )}
        </button>
      )}
      <p className="mt-7 mb-3 mx-3 text-sm text-gray-600 text-right">
        Welt{' '}
        <button
          className="text-blue-500 hover:underline"
          onClick={() => {
            props.onClose()
            const date = new Date()
            const filename =
              date.toLocaleDateString('en-CA') +
              '_' +
              date.getHours().toString().padStart(2, '0') +
              date.getMinutes().toString().padStart(2, '0') +
              date.getSeconds().toString().padStart(2, '0') +
              '_robot-karol.json'
            const contentType = 'application/json;charset=utf-8;'
            var a = document.createElement('a')
            a.download = filename
            a.href =
              'data:' +
              contentType +
              ',' +
              encodeURIComponent(JSON.stringify(serialize(core)))
            a.target = '_blank'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }}
        >
          als Datei herunterladen
        </button>
      </p>
    </>
  )
}
