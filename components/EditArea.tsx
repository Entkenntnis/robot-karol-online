import { EditorView } from '@codemirror/view'
import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import Image from 'next/image'

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

import { editable } from '../lib/basicSetup'
import { useCore } from '../lib/core'
import {
  selectAll,
  indentSelection,
  cursorDocStart,
} from '@codemirror/commands'

export function EditArea() {
  const [section, setSection] = useState('')

  const [menuVisible, setMenuVisible] = useState(false)

  const core = useCore()

  const codeState = core.state.ui.state

  //console.log('gutter', gutter)

  useEffect(() => {
    if (core.state.ui.needTextRefresh && core.view) {
      //console.log('refresh editor', core.current.code)
      core.view.dispatch({
        changes: {
          from: 0,
          to: core.view.state.doc.length,
          insert: core.state.code,
        },
      })
      core.refreshDone()
    }
  })

  useEffect(() => {
    if (codeState == 'ready') {
      //console.log('enable editable')
      core.view?.dispatch({
        effects: editable.reconfigure(EditorView.editable.of(true)),
      })
    }
  }, [codeState, core.view])

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
              <div data-label="gutter" className="w-8 h-full relative">
                {core.state.ui.gutter > 0 && (
                  <div
                    className="text-blue-500 absolute w-5 h-5 left-1"
                    style={{
                      top: `${4 + (core.state.ui.gutter - 1) * 22.4 - 2}px`,
                    }}
                  >
                    🡆
                  </div>
                )}{' '}
                {core.state.ui.gutterReturns.map((pos, i) => (
                  <div
                    key={i}
                    className="text-yellow-300 absolute w-5 h-5 left-3"
                    style={{
                      top: `${4 + (pos - 1) * 22.4 - 2}px`,
                    }}
                  >
                    ⮮
                  </div>
                ))}
              </div>
            )}
            <div className="w-full h-full flex flex-col">
              <Editor />
              <div
                className="bg-gray-50 flex-grow border-t"
                onClick={() => {
                  core.view?.focus()
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white h-12 flex justify-between items-center border-t">
          {renderProgramControl()}
        </div>
      </div>
    </>
  )

  function renderProgramControl() {
    if (codeState == 'ready') {
      if (!core.state.vm.bytecode || core.state.vm.bytecode.length == 0) {
        return (
          <div className="m-3 text-yellow-700 font-bold">
            Fange an, im Editor ein Programm zu schreiben!
          </div>
        )
      } else {
        return (
          <>
            <button
              className="bg-green-300 rounded-2xl py-0.5 px-3 m-1 ml-3 hover:bg-green-400 transition-colors"
              onClick={() => {
                if (core.view) {
                  const selection = core.view.state.selection
                  selectAll(core.view)
                  indentSelection(core.view)
                  core.view.dispatch({ selection })
                  //console.log('disable editable')
                  core.view.dispatch({
                    effects: editable.reconfigure(
                      EditorView.editable.of(false)
                    ),
                  })
                  core.view.contentDOM.blur()
                }
                core.run()
              }}
            >
              Programm ausführen
            </button>
            <select
              className="h-8 mr-2"
              value={core.state.settings.speed}
              onChange={(e) => {
                core.setSpeed(e.target.value)
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
          className="bg-green-50 rounded-2xl p-0.5 m-1 text-gray-400 ml-3"
          disabled
        >
          ... wird eingelesen
        </button>
      )
    }

    if (codeState == 'error') {
      return (
        <div className="text-red-600 px-3 ml-3">
          Programm enthält Fehler. Bitte überprüfen!
        </div>
      )
    }

    if (codeState == 'running') {
      return (
        <>
          <span>
            {core.state.settings.speed == 'step' && (
              <button
                className="bg-yellow-400 rounded-2xl p-1 px-3 ml-3 hover:bg-yellow-500 transition-colors"
                onClick={() => {
                  core.step()
                }}
              >
                Weiter
              </button>
            )}
            <button
              className="bg-red-400 rounded-2xl p-0.5 px-3 ml-3 hover:bg-red-500 transition-colors"
              onClick={() => {
                core.abort()
              }}
            >
              Stopp
            </button>
          </span>
          <select
            className="h-9 mr-3"
            value={core.state.settings.speed}
            onChange={(e) => {
              core.setSpeedHot(e.target.value)
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
              if (scrollTop < 470) {
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
            <div className="h-[calc(100vh-32px-48px)]">
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
          'flex flex-col items-center pb-3 px-2',
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
        <Image
          className="cursor-pointer"
          onDoubleClick={() => {
            if (core.view) {
              core.view.dispatch(core.view.state.replaceSelection(code))
              core.view.focus()
            }
          }}
          src={image}
          alt={id}
          id={`protoblock-${id}`}
          draggable
          layout="fixed"
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
