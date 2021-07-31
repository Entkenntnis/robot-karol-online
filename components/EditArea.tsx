import { EditorView } from '@codemirror/view'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars'
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

import istwandImg from '../public/istwand.png'
import nichtistwandImg from '../public/nichtistwand.png'
import istziegenImg from '../public/istziegel.png'
import nichtistziegelImg from '../public/nichtistziegel.png'
import istmarkeImg from '../public/istmarke.png'
import nichtistmarkeImg from '../public/nichtistmarke.png'

import anweisungImg from '../public/anweisung.png'
import { parser } from '../lib/parser'
import { useProject } from '../lib/model'
import { editable } from '../lib/basicSetup'
import { EditorState } from '@codemirror/state'
import { ensureSyntaxTree } from '@codemirror/language'

interface ActionOp {
  type: 'action'
  command: 'forward' | 'left' | 'right' | 'brick' | 'unbrick'
  line: number
}

type Op = ActionOp

export function EditArea() {
  const editor = useRef<EditorView | null>(null)

  const [section, setSection] = useState('')

  const [menuVisible, setMenuVisible] = useState(false)

  const [codeState, setCodeState] = useState('loading')

  const [byteCode, setByteCode] = useState<Op[]>([])
  const [pc, setPc] = useState(0)
  const [gutter, setGutter] = useState(0)
  const { project, controller } = useProject()

  const data = useRef({
    pc: 0,
    codeState: 'loading',
    world: project.world,
  })

  useEffect(() => {
    data.current.pc = pc
    data.current.codeState = codeState
    data.current.world = project.world
  }, [pc, codeState, project])

  console.log('gutter', gutter)

  useEffect(() => {
    editor.current?.dispatch({
      effects: editable.reconfigure(
        EditorView.editable.of(codeState != 'running')
      ),
    })
  }, [codeState])

  return (
    <>
      <style jsx global>{`
        .cm-editor {
          outline: none !important;
        }
      `}</style>
      <div className={clsx(codeState == 'running' ? 'hidden' : 'block')}>
        {renderBlockMenu()}
      </div>
      {codeState == 'running' && (
        <div data-label="gutter" className="w-8 h-full bg-gray-400 relative">
          {gutter > 0 && (
            <div
              className="bg-red-500 rounded-full absolute w-5 h-5 left-1"
              style={{ top: `${4 + (gutter - 1) * 22.4}px` }}
            ></div>
          )}
        </div>
      )}
      <div className="w-full text-base h-full overflow-y-auto flex flex-col outline-none">
        <Editor
          setRef={(e: EditorView) => (editor.current = e)}
          onLint={(view: EditorView) => {
            const tree = ensureSyntaxTree(view.state, 1000000, 1000)
            const output: Op[] = []
            if (tree) {
              let cursor = tree.cursor()
              do {
                /*console.log(
                  `Node ${cursor.name} from ${cursor.from} to ${cursor.to}`
                )*/
                if (cursor.name == 'Command') {
                  const code = view.state.doc.sliceString(
                    cursor.from,
                    cursor.to
                  )
                  const line = view.state.doc.lineAt(cursor.from).number
                  console.log(line)
                  if (code == 'Schritt') {
                    output.push({
                      type: 'action',
                      command: 'forward',
                      line,
                    })
                  }
                  if (code == 'LinksDrehen') {
                    output.push({
                      type: 'action',
                      command: 'left',
                      line,
                    })
                  }
                  if (code == 'RechtsDrehen') {
                    output.push({
                      type: 'action',
                      command: 'right',
                      line,
                    })
                  }
                  if (code == 'Hinlegen') {
                    output.push({
                      type: 'action',
                      command: 'brick',
                      line,
                    })
                  }
                  if (code == 'Aufheben') {
                    output.push({
                      type: 'action',
                      command: 'unbrick',
                      line,
                    })
                  }
                }
              } while (cursor.next())
            }
            setByteCode(output)
            setPc(0)
            setCodeState('ready')
            return []
          }}
          onUpdate={(event) => {
            if (event == 'input' || event == 'drop' || event == 'delete') {
              //console.log('update', event)
              setCodeState((state) => (state == 'ready' ? 'loading' : state))
            }
          }}
        />
        <div
          className="bg-gray-50 flex-grow"
          onClick={() => {
            editor.current?.focus()
          }}
        />
        <div className="bg-white h-12">
          {codeState == 'running' ? (
            <button
              className="bg-red-400 rounded-2xl p-1 m-1"
              onClick={async () => {
                setCodeState('ready')
              }}
            >
              Ausführung stoppen
            </button>
          ) : codeState == 'ready' ? (
            <button
              className="bg-green-400 rounded-2xl p-1 m-1"
              onClick={async () => {
                setCodeState('running')
                setTimeout(step, 500)
              }}
            >
              Code ausführen
            </button>
          ) : codeState == 'loading' ? (
            <button
              className="bg-green-50 rounded-2xl p-1 m-1 text-gray-400"
              disabled
            >
              Code ausführen
            </button>
          ) : codeState == 'error' ? (
            <div>Fehler</div>
          ) : (
            <div>unbekannt</div>
          )}
        </div>
      </div>
    </>
  )

  function step() {
    const { pc, codeState, world } = data.current
    if (pc >= byteCode.length) {
      setPc(0)
      setGutter(0)
      setCodeState('ready')
      return // reached end
    }
    if (codeState != 'running') {
      setPc(0)
      setGutter(0)
      return
    }
    const op = byteCode[pc]
    if (op.type == 'action') {
      if (op.command == 'forward') {
        controller.forward(world)
      }
      if (op.command == 'left') {
        controller.left()
      }
      if (op.command == 'right') {
        controller.right()
      }
      if (op.command == 'brick') {
        controller.brick(world)
      }
      if (op.command == 'unbrick') {
        controller.unbrick(world)
      }
      setPc((pc) => pc + 1)
      setGutter(op.line)
      setTimeout(step, 1000)
    }
  }

  function renderBlockMenu() {
    return (
      <div className="bg-gray-50 flex relative h-full border-r border-gray-300">
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
            {buildProtoBlock('schritt', schrittImg, 'Schritt\n')}
            {buildProtoBlock('linksdrehen', linksdrehenImg, 'LinksDrehen\n')}
            {buildProtoBlock('rechtsdrehen', rechtsdrehenImg, 'RechtsDrehen\n')}
            {buildProtoBlock('hinlegen', hinlegenImg, 'Hinlegen\n')}
            {buildProtoBlock('aufheben', aufhebenImg, 'Aufheben\n')}
            {buildProtoBlock('markesetzen', markesetzenImg, 'MarkeSetzen\n')}
            {buildProtoBlock(
              'markeloeschen',
              markeloeschenImg,
              'MarkeLöschen\n'
            )}
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
            <div className="h-[calc(100vh-20px)]">
              {renderCategoryTitle('Anweisung')}
              {buildProtoBlock(
                'anweisung',
                anweisungImg,
                'Anweisung NeueAnweisung\n  \nendeAnweisung'
              )}
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
            if (editor.current) {
              editor.current.dispatch(
                editor.current.state.replaceSelection(code)
              )
              editor.current.focus()
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
