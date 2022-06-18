import { EditorView } from '@codemirror/view'
import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { StaticImageData } from 'next/image'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import {
  faArrowLeft,
  faArrowRight,
  faArrowTurnUp,
  faCheckCircle,
  faCircleExclamation,
  faLeftLong,
  faPlay,
  faQuran,
  faWarning,
} from '@fortawesome/free-solid-svg-icons'
import { forceLinting } from '@codemirror/lint'
import { cursorDocEnd } from '@codemirror/commands'
import Blockly, { Block, WorkspaceSvg } from 'blockly'

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

import { autoFormat, setEditable } from '../lib/codemirror/basicSetup'
import { useCore } from '../lib/state/core'
import { abort, confirmStep, patch, run, setSpeed } from '../lib/commands/vm'
import { FaIcon } from './FaIcon'
import { execPreview, hidePreview, showPreview } from '../lib/commands/preview'
import { submit_event } from '../lib/stats/submit'
import { openMenu } from '../lib/commands/menu'
import { Editor } from './Editor'
import { textRefreshDone } from '../lib/commands/json'
import { leavePreMode } from '../lib/commands/puzzle'
import { focusWrapper } from '../lib/commands/focus'
import { setMode } from '../lib/commands/mode'
import { KAROL_TOOLBOX } from '../lib/blockly/toolbox'
import { initCustomBlocks } from '../lib/blockly/customBlocks'
import { compile } from '../lib/language/compiler'
import { Text } from '@codemirror/state'
import { parser } from '../lib/codemirror/parser/parser'
import { Tree } from '@lezer/common'
import { codeToXml } from '../lib/blockly/codeToXml'

initCustomBlocks()

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
      forceLinting(view.current)
      textRefreshDone(core)
    }
  })

  useEffect(() => {
    if (codeState == 'ready') {
      setEditable(view.current, true)
    }
  }, [codeState])

  // eslint is not able to detect deps properly ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const blockMenuInner = useMemo(renderBlockMenuInner, [section, menuVisible]) // block menu is slow to render

  return (
    <>
      <div className="w-full text-base h-full flex flex-col outline-none">
        {core.ws.type == 'puzzle' && (
          <ReflexContainer
            orientation="horizontal"
            windowResizeAware
            className="h-full"
          >
            <ReflexElement minSize={100} propagateDimensions={true}>
              {core.ws.progress < 100 ? (
                <div className="h-full flex flex-col z-50 relative bg-white">
                  <div className="p-3 overflow-y-auto">
                    {core.puzzle.description}
                    {core.ws.preMode && (
                      <p className="text-center mt-5 mb-5">
                        <button
                          className="px-3 py-0.5 rounded z-10 bg-blue-200 mr-4"
                          onClick={() => {
                            openMenu(core)
                          }}
                        >
                          zurück
                        </button>
                        <button
                          className="bg-green-300 px-3 py-0.5 rounded z-10"
                          onClick={() => {
                            leavePreMode(core)
                            focusWrapper(core)
                          }}
                        >
                          Los
                        </button>
                      </p>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white"></div>
                  </div>
                </div>
              ) : (
                <div className="h-full p-3 text-center flex justify-center items-center">
                  <div>
                    <p>
                      <FaIcon
                        icon={faCheckCircle}
                        className="text-3xl text-green-400"
                      />
                    </p>
                    <p className="mt-4 mb-6">Super gemacht!</p>
                    <p>
                      <button
                        onClick={() => {
                          openMenu(core)
                        }}
                        className="bg-blue-200 px-2 py-0.5 rounded"
                      >
                        weiter
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </ReflexElement>
            <ReflexSplitter style={{ height: 3 }} />

            <ReflexElement minSize={100}>{renderEditor()}</ReflexElement>
          </ReflexContainer>
        )}
        {core.ws.type == 'free' &&
          (core.ws.settings.mode == 'code' ? renderEditor() : <BlockEditor />)}
        {
          <div
            className={clsx(
              'absolute top-1 right-2 bg-gray-200 z-20 rounded',
              core.ws.ui.state !== 'ready' && 'opacity-30 cursor-not-allowed'
            )}
          ></div>
        }
        <div className="bg-white flex border-t">
          <div className="w-full overflow-auto min-h-[47px] max-h-[200px]">
            <div className="flex justify-between mt-[9px]">
              {renderProgramControl()}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  function renderEditor() {
    return (
      <div className="flex h-full overflow-y-auto relative">
        <div className="w-full overflow-auto h-full flex">
          {codeState == 'running' ? (
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
          ) : (
            <div className="w-8 h-full relative flex-shrink-0"></div>
          )}
          <div className="w-full h-full flex flex-col">
            <Editor innerRef={view} />
            <div
              className="flex-grow flex"
              onClick={() => {
                if (view.current) {
                  cursorDocEnd(view.current)
                  view.current.focus()
                }
              }}
            >
              <div className="w-[30px] border-r h-full bg-neutral-100 border-[#ddd] flex-grow-0 flex-shrink-0"></div>
              <div className="w-full cursor-text"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderProgramControl() {
    if (core.ws.type == 'puzzle' && core.ws.progress == 100) return null
    if (codeState == 'ready' || codeState == 'running') {
      if (
        core.ws.type == 'free' &&
        (!core.ws.vm.bytecode || core.ws.vm.bytecode.length == 0)
      ) {
        return (
          <div className="m-[11px] mt-[2px]">
            <span className="-ml-3">{renderCodeBlockSwitch()}</span>{' '}
            <FaIcon icon={faArrowLeft} /> Wähle deine Eingabemethode. Du kannst
            jederzeit wechseln.{' '}
          </div>
        )
      } else {
        return (
          <>
            <span>
              {core.ws.type == 'free' &&
                codeState == 'ready' &&
                renderCodeBlockSwitch()}
              <select
                className="h-7 mr-2 ml-2"
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
              {codeState == 'ready' && (
                <label className="ml-2">
                  <input
                    type="checkbox"
                    className="inline-block"
                    checked={core.ws.ui.showPreview}
                    onChange={(e) => {
                      if (e.target.checked) {
                        showPreview(core)
                        focusWrapper(core)
                        execPreview(core)
                      } else {
                        hidePreview(core)
                        focusWrapper(core)
                      }
                    }}
                  />
                  <span className="underline ml-2">V</span>orschau
                </label>
              )}
            </span>
            {codeState == 'running' ? (
              <span>
                <button
                  className="bg-red-400 rounded px-2 py-0.5 mr-2 hover:bg-red-500 transition-colors"
                  onClick={() => {
                    abort(core)
                  }}
                >
                  <span className="underline">S</span>topp
                </button>{' '}
                {core.ws.settings.speed == 'step' && (
                  <button
                    className={clsx(
                      'bg-yellow-400 rounded px-2 py-0.5 mr-2 transition-colors',
                      'hover:bg-yellow-500'
                    )}
                    onClick={() => {
                      confirmStep(core)
                    }}
                  >
                    Weiter
                  </button>
                )}
              </span>
            ) : (
              <button
                className={clsx(
                  'bg-green-300 rounded px-2 py-0.5 mr-2 transition-colors',
                  'hover:bg-green-400'
                )}
                onClick={() => {
                  if (view.current) {
                    autoFormat(view.current)
                    setEditable(view.current, false)
                    view.current.contentDOM.blur()
                  }
                  run(core)
                  submit_event(`run_${core.ws.type}`, core)
                }}
              >
                <FaIcon icon={faPlay} /> <span className="underline">S</span>
                tart
              </button>
            )}
          </>
        )
      }
    }

    if (codeState == 'loading') {
      return (
        <button
          className="bg-green-50 rounded px-2 py-0.5 m-1 mt-0 text-gray-400 ml-2"
          disabled
        >
          ... wird eingelesen
        </button>
      )
    }

    if (codeState == 'error') {
      return (
        <div className="px-3 pb-1 pt-0">
          <p className="mb-2">
            <FaIcon icon={faCircleExclamation} className="text-red-600 mr-2" />
            Beim Einlesen des Programms sind folgende Probleme aufgetreten:
          </p>
          {core.ws.ui.errorMessages.map((err, i) => (
            <p className="mb-2" key={err + i.toString()}>
              {err}
            </p>
          ))}
        </div>
      )
    }

    return <div>unbekannt</div>
  }

  function renderCodeBlockSwitch() {
    return (
      <span className="border mx-2 rounded">
        <button
          className={clsx(
            'px-2 mx-1 my-0.5 rounded',
            core.ws.settings.mode == 'code' && 'bg-orange-300',
            core.ws.ui.state !== 'ready' && 'cursor-not-allowed'
          )}
          onClick={() => {
            setMode(core, 'code')
          }}
          disabled={
            core.ws.settings.mode == 'code' || core.ws.ui.state !== 'ready'
          }
        >
          Code
        </button>
        <button
          className={clsx(
            'px-2 my-0.5 mx-1 rounded',
            core.ws.settings.mode == 'blocks' && 'bg-orange-300',
            core.ws.ui.state !== 'ready' && 'cursor-not-allowed'
          )}
          onClick={() => {
            if (core.ws.ui.toBlockWarning) {
              const result = confirm(
                'Der Code enthält Elemente (z.B. Anweisungen oder Kommentare)' +
                  ' die im Blockeditor nicht unterstützt werden.' +
                  ' Beim Umschalten gehen diese Elemente verloren. Fortfahren?'
              )
              if (!result) return
            }
            setMode(core, 'blocks')
          }}
          disabled={
            core.ws.settings.mode == 'blocks' || core.ws.ui.state !== 'ready'
          }
        >
          Blöcke
          {core.ws.ui.toBlockWarning && (
            <FaIcon icon={faWarning} className="ml-2 text-yellow-300" />
          )}
        </button>
      </span>
    )
  }

  function renderBlockMenu() {
    return (
      <div className="bg-gray-50 flex relative h-full border-r-4 border-gray-100">
        <div className="bg-white flex flex-col h-full justify-start">
          <div className="flex flex-col">
            {renderCategory('Bewegung')}
            {renderCategory('Steuerung')}
            {renderCategory('Fühlen')}
            {renderCategory('Anweisung')}
          </div>
        </div>

        {blockMenuInner}
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

  function renderBlockMenuInner() {
    return (
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
          {buildProtoBlock('wenndann', wenndannImg, 'wenn  dann\n  \nendewenn')}
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
          {buildProtoBlock('nichtistmarke', nichtistmarkeImg, 'NichtIstMarke')}
          <div className="h-[calc(100vh-48px)]">
            {renderCategoryTitle('Anweisung')}
            {buildProtoBlock(
              'anweisung',
              anweisungImg,
              'Anweisung NeueAnweisung\n  \nendeAnweisung'
            )}
          </div>
        </div>
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

function BlockEditor() {
  const editorDiv = useRef<HTMLDivElement>(null)
  const [workspace, setWorkspace] = useState<WorkspaceSvg | null>(null)
  const core = useCore()

  useEffect(() => {
    if (editorDiv.current && !workspace) {
      //console.log('inject blockly')

      const initialXml = codeToXml(core.ws.code)

      console.log('initial', initialXml)

      const blocklyWorkspace = Blockly.inject(
        editorDiv.current,
        {
          toolbox: KAROL_TOOLBOX,
          grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
          },
          trashcan: true,
        } as any /* wtf blockly types are weird*/
      )
      setWorkspace(blocklyWorkspace)

      Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(initialXml),
        blocklyWorkspace
      )
      /*setTimeout(
        () => blockyWorkspace.addTopBlock(new Block(blockyWorkspace, 'step')),
        1000
      )*/

      const blocklyArea = document.getElementById('blocklyArea')!
      var blocklyDiv = document.getElementById('blocklyDiv')!

      var onresize = function () {
        //console.log('on resize function')
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var element = blocklyArea
        var x = 0
        var y = 0
        do {
          x += element.offsetLeft
          y += element.offsetTop
          element = element.offsetParent as any
        } while (element)
        // Position blocklyDiv over blocklyArea.
        blocklyDiv.style.left = x + 'px'
        blocklyDiv.style.top = y + 'px'
        blocklyDiv.style.width = blocklyArea.offsetWidth + 'px'
        blocklyDiv.style.height = blocklyArea.offsetHeight + 'px'
        if (blocklyWorkspace) {
          Blockly.svgResize(blocklyWorkspace)
          //console.log('blocky resize')
        }
      }
      window.addEventListener('resize', onresize, false)
      onresize()
      if (workspace) Blockly.svgResize(workspace)

      core.blockyResize = onresize
      //console.log('mount', core.blockyResize)

      const myUpdateFunction = () => {
        if (blocklyWorkspace.isDragging()) return

        const newXml = Blockly.Xml.domToText(
          Blockly.Xml.workspaceToDom(blocklyWorkspace)
        )
        //console.log('xml', newXml)
        var code = (Blockly as any).karol.workspaceToCode(blocklyWorkspace)

        core.mutateWs((ws) => {
          ws.code = code
        })
        const topBlocks = blocklyWorkspace
          .getTopBlocks(false)
          .filter((bl) => !(bl as any).isInsertionMarker_)

        //console.log(code, topBlocks.length)

        /*topBlocks.forEach((tp) => {
          for (const key in tp) {
            if (typeof tp[key] !== 'function') {
              console.log(key, tp[key])
            }
          }
        })*/

        if (topBlocks.length > 1) {
          core.mutateWs((ws) => {
            ws.ui.state = 'error'
            ws.ui.preview = undefined
            ws.ui.errorMessages = [`Alle Blöcke müssen zusammenhängen.`]
          })
        } else {
          const doc = Text.of(code.split('\n'))
          const tree = parser.parse(code)
          const { warnings, output } = compile(tree, doc)

          //console.log(warnings, output)
          warnings.sort((a, b) => a.from - b.from)

          if (warnings.length == 0) {
            patch(core, output)
            setTimeout(() => {
              execPreview(core)
            }, 10)
          } else {
            core.mutateWs(({ vm, ui }) => {
              vm.bytecode = undefined
              vm.pc = 0
              ui.state = 'error'
              ui.errorMessages = warnings
                .map((w) => `Zeile ${doc.lineAt(w.from).number}: ${w.message}`)
                .filter(function (item, i, arr) {
                  return arr.indexOf(item) == i
                })
              //ui.preview = undefined
            })
          }
        }
        setTimeout(onresize, 10)
      }
      blocklyWorkspace.addChangeListener(myUpdateFunction)

      // Dispose of the workspace when our div ref goes away (Equivalent to didComponentUnmount)
    }
    /*return () => {
      workspace?.dispose()
      console.log('dispose')
      core.blockyResize = undefined
    }*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorDiv.current])

  useEffect(() => {
    if (workspace) {
      // console.log('resize')
      Blockly.svgResize(workspace)
    }
  }, [
    editorDiv.current?.offsetHeight,
    editorDiv.current?.offsetWidth,
    workspace,
  ])

  return (
    <>
      <div id="blocklyArea" className="w-full h-full flex-shrink">
        <div className="absolute" ref={editorDiv} id="blocklyDiv" />
      </div>
      <style jsx global>{`
        svg[display='none'] {
          display: none;
        }
      `}</style>
    </>
  )
}
