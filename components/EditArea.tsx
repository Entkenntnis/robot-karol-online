import { EditorView } from '@codemirror/view'
import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { StaticImageData } from 'next/image'

import { Editor } from './Editor'

import schrittImg from '../public/schritt.png'
import hinlegenImg from '../public/hinlegen.png'
import aufhebenImg from '../public/aufheben.png'
import linksdrehenImg from '../public/linksdrehen.png'
import rechtsdrehenImg from '../public/rechtsdrehen.png'
import markesetzenImg from '../public/markesetzen.png'
import markeloeschenImg from '../public/markeloeschen.png'

import wenndannImg from '../public/wenndann.png'
import wenndannsonstImg from '../public/wenndannsonst.png'
import wiederholenmalImg from '../public/wiederholenmal.png'
import wiederholesolangeImg from '../public/wiederholesolange.png'
import beendenImg from '../public/beenden.png'

import istwandImg from '../public/istwand.png'
import nichtistwandImg from '../public/nichtistwand.png'
import istziegenImg from '../public/istziegel.png'
import nichtistziegelImg from '../public/nichtistziegel.png'
import istmarkeImg from '../public/istmarke.png'
import nichtistmarkeImg from '../public/nichtistmarke.png'

import anweisungImg from '../public/anweisung.png'
import unterbrechenImg from '../public/unterbrechen.png'

import { autoFormat, editable } from '../lib/codemirror/basicSetup'
import { useCore } from '../lib/state/core'
import { abort, confirmStep, run, setSpeed } from '../lib/commands/vm'
import { FaIcon } from './FaIcon'
import { faArrowRight, faArrowTurnUp } from '@fortawesome/free-solid-svg-icons'
import { execPreview } from '../lib/commands/preview'

export function EditArea() {
  const [section, setSection] = useState('')

  const [menuVisible, setMenuVisible] = useState(false)

  const core = useCore()

  const codeState = core.ws.ui.state

  const view = useRef<EditorView>()

  useEffect(() => {
    if (core.ws.ui.needsTextRefresh && view.current) {
      view.current.dispatch({
        changes: {
          from: 0,
          to: view.current.state.doc.length,
          insert: core.ws.code,
        },
      })
      core.mutateWs(({ ui }) => (ui.needsTextRefresh = false))
    }
  })

  useEffect(() => {
    if (codeState == 'ready') {
      view.current?.dispatch({
        effects: editable.reconfigure(EditorView.editable.of(true)),
      })
    }
  }, [codeState])

  // eslint is not able to detect deps properly ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const blockMenu = useMemo(renderBlockMenu, [section, menuVisible]) // block menu is slow to render

  return (
    <>
      <div className="w-full text-base h-full overflow-auto flex flex-col outline-none">
        <div className="flex h-full overflow-y-auto relative">
          <div className={clsx(codeState == 'running' ? 'hidden' : 'block')}>
            {blockMenu}
          </div>

          <div className="w-full overflow-auto h-full flex">
            {codeState == 'running' && (
              <div
                data-label="gutter"
                className="w-8 h-full relative flex-shrink-0"
              >
                {core.ws.ui.gutter > 0 && (
                  <div
                    className="text-blue-500 absolute w-5 h-5 left-1.5"
                    style={{
                      top: `${4 + (core.ws.ui.gutter - 1) * 22.4 - 2}px`,
                    }}
                  >
                    <FaIcon icon={faArrowRight} />
                  </div>
                )}{' '}
                {Array.from(new Set(core.ws.ui.gutterReturns)).map((pos, i) => (
                  <div
                    key={i}
                    className="text-yellow-300 absolute w-5 h-5 left-2"
                    style={{
                      top: `${4 + (pos - 1) * 22.4 - 2}px`,
                    }}
                  >
                    <FaIcon icon={faArrowTurnUp} className="rotate-180" />
                  </div>
                ))}
              </div>
            )}
            <div className="w-full h-full flex flex-col">
              <Editor innerRef={view} />
              <div
                className="flex-grow flex"
                onClick={() => {
                  view.current?.focus()
                }}
              >
                <div className="w-[31px] border-r h-full bg-neutral-100 border-[#ddd]"></div>
                <div className="w-full cursor-text"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white flex justify-between items-center border-t min-h-[48px]">
          {renderProgramControl()}
        </div>
      </div>
    </>
  )

  function renderProgramControl() {
    if (codeState == 'ready') {
      if (!core.ws.vm.bytecode || core.ws.vm.bytecode.length == 0) {
        return (
          <div className="m-[11px]">
            Klicke auf Karol, um ihn mit der Tastatur zu steuern oder schreibe
            ein Programm.
          </div>
        )
      } else {
        return (
          <>
            <span>
              <button
                className={clsx(
                  'bg-green-300 rounded px-2 py-0.5 m-1 ml-2 transition-colors',
                  'hover:bg-green-400'
                )}
                onClick={() => {
                  if (view.current) {
                    autoFormat(view.current)
                    view.current.dispatch({
                      effects: editable.reconfigure(
                        EditorView.editable.of(false)
                      ),
                    })
                    view.current.contentDOM.blur()
                  }
                  run(core)
                }}
              >
                Programm ausführen
              </button>
              {core.ws.type == 'free' && (
                <label>
                  <input
                    type="checkbox"
                    className="inline-block ml-3"
                    checked={core.ws.ui.showPreview}
                    onChange={(e) => {
                      if (e.target.checked) {
                        core.mutateWs(({ ui }) => {
                          ui.showPreview = true
                        })
                        execPreview(core)
                      } else {
                        core.mutateWs(({ ui }) => {
                          ui.showPreview = false
                        })
                      }
                    }}
                  />{' '}
                  Vorschau
                </label>
              )}
            </span>
            <select
              className="h-8 mr-2"
              value={core.ws.settings.speed}
              onChange={(e) => {
                setSpeed(core, e.target.value)
              }}
            >
              <option value="turbo">Turbo</option>
              <option value="fast">schnell</option>
              <option value="slow">langsam</option>
              <option value="step">Einzelschritt</option>
            </select>
          </>
        )
      }
    }

    if (codeState == 'loading') {
      return (
        <button
          className="bg-green-50 rounded px-2 py-0.5 m-1 text-gray-400 ml-2"
          disabled
        >
          ... wird eingelesen
        </button>
      )
    }

    if (codeState == 'error') {
      return (
        <div className="text-red-600 px-3">
          Programm enthält Fehler. Bitte überprüfen!
        </div>
      )
    }

    if (codeState == 'running') {
      return (
        <>
          <span>
            {core.ws.settings.speed == 'step' && (
              <button
                className={clsx(
                  'bg-yellow-400 rounded px-2 py-0.5 ml-2 transition-colors',
                  'hover:bg-yellow-500'
                )}
                onClick={() => {
                  confirmStep(core)
                }}
              >
                Weiter
              </button>
            )}
            <button
              className="bg-red-400 rounded px-2 py-0.5 ml-2 hover:bg-red-500 transition-colors"
              onClick={() => {
                abort(core)
              }}
            >
              Stopp
            </button>
          </span>
          <select
            className="h-8 mr-2"
            value={core.ws.settings.speed}
            onChange={(e) => {
              setSpeed(core, e.target.value)
            }}
          >
            <option value="turbo">Turbo</option>
            <option value="fast">schnell</option>
            <option value="slow">langsam</option>
            <option value="step">Einzelschritt</option>
          </select>
        </>
      )
    }

    return <div>unbekannt</div>
  }

  function renderBlockMenu() {
    return (
      <div className="bg-gray-50 flex relative h-full border-r-4 border-gray-100">
        <div className="bg-white flex flex-col h-full justify-between">
          <div className="flex flex-col">
            {renderCategory('Bewegung')}
            {renderCategory('Steuerung')}
            {renderCategory('Fühlen')}
            {renderCategory('Anweisung')}
          </div>
        </div>

        <div className={clsx('h-full', !menuVisible && 'hidden')}>
          <div
            className="w-52 h-full overflow-y-scroll"
            onScroll={(e: any) => {
              const scrollTop = e.currentTarget.scrollTop
              if (scrollTop < 465) {
                setSection('Bewegung')
              } else if (scrollTop < 976) {
                setSection('Steuerung')
              } else if (scrollTop < 1299) {
                setSection('Fühlen')
              } else {
                setSection('Anweisung')
              }
            }}
          >
            {renderCategoryTitle('Bewegung')}
            {buildProtoBlock('schritt', schrittImg, 'Schritt')}
            {buildProtoBlock('linksdrehen', linksdrehenImg, 'LinksDrehen')}
            {buildProtoBlock('rechtsdrehen', rechtsdrehenImg, 'RechtsDrehen')}
            {buildProtoBlock('hinlegen', hinlegenImg, 'Hinlegen')}
            {buildProtoBlock('aufheben', aufhebenImg, 'Aufheben')}
            {buildProtoBlock('markesetzen', markesetzenImg, 'MarkeSetzen')}
            {buildProtoBlock('markeloeschen', markeloeschenImg, 'MarkeLöschen')}
            {renderCategoryTitle('Steuerung')}
            {buildProtoBlock(
              'wiederholenmal',
              wiederholenmalImg,
              'wiederhole 3 mal\n  \nendewiederhole'
            )}
            {buildProtoBlock(
              'wiederholesolange',
              wiederholesolangeImg,
              'wiederhole solange \n  \nendewiederhole'
            )}
            {buildProtoBlock(
              'wenndann',
              wenndannImg,
              'wenn  dann\n  \nendewenn'
            )}
            {buildProtoBlock(
              'wenndannsonst',
              wenndannsonstImg,
              'wenn  dann\n  \nsonst\n  \nendewenn'
            )}
            {buildProtoBlock('beenden', beendenImg, 'Beenden')}
            {renderCategoryTitle('Fühlen')}
            {buildProtoBlock('istwand', istwandImg, 'IstWand')}
            {buildProtoBlock('nichtistwand', nichtistwandImg, 'NichtIstWand')}
            {buildProtoBlock('istziegel', istziegenImg, 'IstZiegel')}
            {buildProtoBlock(
              'nichtistziegel',
              nichtistziegelImg,
              'NichtIstZiegel'
            )}{' '}
            {buildProtoBlock('istmarke', istmarkeImg, 'IstMarke')}{' '}
            {buildProtoBlock(
              'nichtistmarke',
              nichtistmarkeImg,
              'NichtIstMarke'
            )}
            <div className="h-[calc(100vh-48px)]">
              {renderCategoryTitle('Anweisung')}
              {buildProtoBlock(
                'anweisung',
                anweisungImg,
                'Anweisung NeueAnweisung\n  \nendeAnweisung'
              )}
              {buildProtoBlock('unterbrechen', unterbrechenImg, 'Unterbrechen')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderCategory(name: string) {
    return (
      <div
        className={clsx(
          'flex flex-col items-center pb-3 px-2 mt-2',
          'hover:cursor-pointer text-gray-800 hover:text-blue-500',
          'transition-colors select-none',
          name == section && 'bg-gray-200'
        )}
        onClick={() => {
          if (section == name) {
            setSection('')
            setMenuVisible(false)
            return
          }
          setSection(name)
          setMenuVisible(true)
          setTimeout(() => document.getElementById(name)?.scrollIntoView(), 10)
        }}
      >
        <div
          className={clsx('w-5 h-5 rounded-full border border-gray-800 mt-3', {
            'bg-blue-500': name == 'Bewegung',
            'bg-yellow-400': name == 'Steuerung',
            'bg-[#06B6D4]': name == 'Fühlen',
            'bg-red-500': name == 'Anweisung',
          })}
        ></div>
        <div className="text-xs">{name}</div>
      </div>
    )
  }

  function renderCategoryTitle(name: string) {
    return (
      <>
        <div id={name} className="pb-[1px]" />
        <h2 className="my-3 ml-2 text-sm font-bold">{name}</h2>
      </>
    )
  }

  function buildProtoBlock(id: string, image: StaticImageData, code: string) {
    return (
      <div className="mb-2 mx-2">
        <img
          className="cursor-pointer inline-block mb-[5.5px]"
          onDoubleClick={() => {
            if (view.current) {
              view.current.dispatch(view.current.state.replaceSelection(code))
              view.current.focus()
            }
          }}
          src={image.src}
          height={image.height}
          width={image.width}
          alt={id}
          id={`protoblock-${id}`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setDragImage(
              document.getElementById(`protoblock-${id}`)!,
              0,
              0
            )
            e.dataTransfer.setData('text/plain', code)
          }}
        />
      </div>
    )
  }
}
