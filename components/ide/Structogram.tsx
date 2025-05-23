import { TreeCursor } from '@lezer/common'
import clsx from 'clsx'
import { parser } from '../../lib/codemirror/parser/parser'
import { setShowStructogram } from '../../lib/commands/mode'
import { useCore } from '../../lib/state/core'
import { ReactNode } from 'react'

// new approach: parse AST into nested document, which allows queries on rendering

type Node = Command | Comment | RepeatN | RepeatForever | RepeatWhile | Branch

interface Command {
  type: 'command'
  custom?: boolean
  text: string
}

interface Comment {
  type: 'comment'
  text: string
}

interface RepeatN {
  type: 'repeat-n'
  count: number
  children: Node[]
}

interface RepeatForever {
  type: 'repeat-forever'
  children: Node[]
}

interface RepeatWhile {
  type: 'repeat-while'
  condition: string
  children: Node[]
}

interface Branch {
  type: 'branch'
  condition: string
  childrenT: Node[]
  childrenF: Node[]
}

export function Structogram() {
  const core = useCore()
  const code = core.ws.code
  const keyCounter = { val: 0 }

  const isJavaOrPython =
    core.ws.settings.language === 'python-pro' ||
    core.ws.settings.language === 'java'

  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute right-4 top-4">
        <button
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={() => {
            setShowStructogram(core, false)
          }}
        >
          {core.strings.ide.close}
        </button>
      </div>
      <h1 className="ml-8 text-2xl pt-8">{core.strings.ide.structogram}</h1>
      <h2 className="mt-5 font-bold ml-8">Hauptprogramm</h2>
      <div className="overflow-auto flex-auto">
        <div className="ml-4 p-4">
          <div className="inline-block">{renderStructogram()}</div>
        </div>
      </div>
    </div>
  )

  function renderStructogram() {
    if (core.ws.ui.state == 'error')
      return (
        <em>
          Probleme im Programm
          <br />
          {core.ws.ui.errorMessages.join(', ')}
        </em>
      )

    const tree = parser.parse(code)

    let nodes: Node[] = []

    try {
      nodes = cursorToNodes(tree.cursor())
    } catch (e) {
      console.log(e)
      return <em>Fehler bei der Generierung des Struktogramms.</em>
    }

    if (nodes.length == 0) {
      return <em>Leeres Programm</em>
    }

    // debug
    //console.log(nodes)

    return <>{render(nodes)}</>
  }

  function cursorToNodes(cursor: TreeCursor): Node[] {
    const output: Node[] = []
    do {
      if (['RepeatEnd', 'IfEndKey'].includes(cursor.name)) {
        // skip list
        continue
      } else if (cursor.name == 'Program') {
        const newCursor = cursor.node.cursor()
        if (!newCursor.next()) break
        output.push(...cursorToNodes(newCursor))
      } else if (cursor.name == 'Command') {
        output.push({
          type: 'command',
          text: code.substring(cursor.from, cursor.to),
        })
      } else if (cursor.name == 'CustomRef') {
        output.push({
          type: 'command',
          custom: true,
          text: code.substring(cursor.from, cursor.to),
        })
      } else if (cursor.name == 'LineComment') {
        if (!isJavaOrPython) {
          output.push({
            type: 'comment',
            text: code.substring(cursor.from, cursor.to),
          })
        }
      } else if (cursor.name == 'Repeat') {
        const subCursor = cursor.node.cursor()
        subCursor.next() // within repeat
        subCursor.nextSibling() // I can now check the type
        if (subCursor.name == 'Times') {
          const count = parseInt(code.substring(subCursor.from, subCursor.to))
          subCursor.nextSibling() // repeat times key
          subCursor.nextSibling()
          // from here, the remaining stuff are children
          output.push({
            type: 'repeat-n',
            count,
            children: cursorToNodes(subCursor),
          })
        } else if (subCursor.name == 'RepeatWhileKey') {
          subCursor.nextSibling() // condition
          const condition = code.substring(subCursor.from, subCursor.to)
          subCursor.nextSibling()
          output.push({
            type: 'repeat-while',
            condition,
            children: cursorToNodes(subCursor),
          })
        } else if (subCursor.name == 'RepeatAlwaysKey') {
          subCursor.nextSibling()
          output.push({
            type: 'repeat-forever',
            children: cursorToNodes(subCursor),
          })
        }
      } else if (cursor.name == 'IfThen') {
        const subCursor = cursor.node.cursor()
        subCursor.next() // within ifthen
        subCursor.nextSibling() // condition
        const condition = code.substring(subCursor.from, subCursor.to)
        subCursor.nextSibling() // ifthenkey
        subCursor.nextSibling()
        const childrenT = cursorToNodes(subCursor)
        let childrenF: Node[] = []
        if (subCursor.name == 'ElseKey') {
          subCursor.nextSibling()
          childrenF = cursorToNodes(subCursor)
        }
        output.push({ type: 'branch', condition, childrenT, childrenF })
      } else if (cursor.name == 'ElseKey') {
        // stop parsing here (because it's handled in the next step)
        break
      } else if (cursor.name == 'Cmd') {
        continue
        //throw 'bad'
      } else {
        console.log(
          `TODO: Node ${cursor.name} from ${cursor.from} to ${cursor.to}`
        )
      }
    } while (cursor.nextSibling())

    return output
  }

  function calculateInnerHeight(nodes: Node[]) {
    let height = nodes.length - 1
    nodes.forEach((node) => {
      if (node.type == 'command' || node.type == 'comment') {
        height += 32
      } else if (
        node.type == 'repeat-forever' ||
        node.type == 'repeat-n' ||
        node.type == 'repeat-while'
      ) {
        height += 32 + 1 + calculateInnerHeight(node.children)
      } else {
        height +=
          65 +
          1 +
          Math.max(
            calculateInnerHeight(node.childrenT),
            calculateInnerHeight(node.childrenF),
            32
          )
      }
    })
    return height
  }

  function render(nodes: Node[], nested: boolean = false) {
    const output: ReactNode[] = []
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.type == 'command' || node.type == 'comment') {
        output.push(
          <div
            className={clsx(
              'border border-black p-1 min-w-[190px]',
              i > 0 && 'border-t-0',
              nested && i == nodes.length - 1 && 'border-b-0',
              nested && 'border-r-0',
              node.type == 'comment' && 'text-gray-500',
              node.type == 'command' && node.custom && 'italic'
            )}
            key={keyCounter.val++}
          >
            {node.type == 'command' && isJavaOrPython
              ? node.text.slice(0, 1).toLowerCase() +
                node.text.slice(1) +
                (node.text.includes('(') ? '' : '()')
              : node.text}
          </div>
        )
      } else if (node.type == 'branch') {
        const heightT = calculateInnerHeight(node.childrenT)
        const heightF = calculateInnerHeight(node.childrenF)
        output.push(
          <div
            className={clsx(
              'border border-black min-w-[190px] border-l-0',
              i > 0 && 'border-t-0',
              nested && 'border-r-0',
              nested && i == nodes.length - 1 && 'border-b-0'
            )}
            key={keyCounter.val++}
          >
            <div className="flex relative">
              <div className="absolute left-0 right-0 top-0 p-1 text-center">
                <strong>
                  {isJavaOrPython
                    ? node.condition.slice(0, 1).toLowerCase() +
                      node.condition.slice(1) +
                      (node.condition.includes('(') ? '' : '()')
                    : node.condition}
                  ?
                </strong>
              </div>
              <div className="basis-1/2 flex flex-col">
                <div className="relative p-1 border-black border-l font-bold">
                  <div className="h-[33px]">&nbsp;</div>w
                  <div className="absolute inset-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      version="1.1"
                      viewBox="0 0 50 50"
                      preserveAspectRatio="none"
                      className="w-full h-full"
                    >
                      <line
                        vectorEffect="non-scaling-stroke"
                        style={{
                          stroke: 'rgb(0,0,0)',
                          strokeWidth: '1',
                          strokeDasharray: 'none',
                          strokeLinecap: 'butt',
                          strokeDashoffset: '0',
                          strokeLinejoin: 'round',
                          strokeMiterlimit: '4',
                          fill: 'rgb(0,0,0)',
                          fillRule: 'nonzero',
                          opacity: '1',
                        }}
                        x1="0"
                        y1="0"
                        x2="50"
                        y2="50"
                      />
                    </svg>
                  </div>
                </div>
                {render(node.childrenT, true)}
                {node.childrenT.length == 0 /* placeholders */ ? (
                  <div className="h-full border-black border-t border-l min-w-[190px] min-h-[33px] bg-gray-100"></div>
                ) : (
                  <div
                    className={clsx(
                      'h-full border-black border-l',
                      heightT < heightF && 'border-t'
                    )}
                  ></div>
                )}
              </div>
              <div className="basis-1/2 flex flex-col">
                <div className="relative text-right p-1 font-bold">
                  <div className="h-[33px]">&nbsp;</div>f
                  <div className="absolute inset-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      version="1.1"
                      viewBox="0 0 50 50"
                      preserveAspectRatio="none"
                      className="w-full h-full"
                    >
                      <line
                        vectorEffect="non-scaling-stroke"
                        style={{
                          stroke: 'rgb(0,0,0)',
                          strokeWidth: '1',
                          strokeDasharray: 'none',
                          strokeLinecap: 'butt',
                          strokeDashoffset: '0',
                          strokeLinejoin: 'round',
                          strokeMiterlimit: '4',
                          fill: 'rgb(0,0,0)',
                          fillRule: 'nonzero',
                          opacity: '1',
                        }}
                        x1="0"
                        y1="50"
                        x2="50"
                        y2="0"
                      />
                    </svg>
                  </div>
                </div>
                {render(node.childrenF, true)}
                {node.childrenF.length == 0 /* placeholders */ ? (
                  <div className="h-full border-black border-t border-l min-w-[190px] min-h-[33px] bg-gray-100"></div>
                ) : (
                  <div
                    className={clsx(
                      'h-full border-black border-l',
                      heightT > heightF && 'border-t'
                    )}
                  ></div>
                )}
              </div>
            </div>
          </div>
        )
      } else {
        let heading = null
        if (node.type == 'repeat-forever') {
          heading = <strong>wiederhole immer</strong>
        } else if (node.type == 'repeat-while') {
          heading = (
            <>
              <strong>wiederhole solange</strong>{' '}
              {isJavaOrPython
                ? node.condition.slice(0, 1).toLowerCase() +
                  node.condition.slice(1) +
                  (node.condition.includes('(') ? '' : '()')
                : node.condition}
            </>
          )
        } else {
          heading = (
            <>
              <strong>wiederhole</strong> {node.count} <strong>mal</strong>
            </>
          )
        }
        output.push(
          <div
            className={clsx(
              'border border-black min-w-[190px]',
              i > 0 && 'border-t-0',
              nested && i == nodes.length - 1 && 'border-b-0',
              nested && 'border-r-0'
            )}
            key={keyCounter.val++}
          >
            <div className="p-1">{heading}</div>
            <div className="ml-8">{render(node.children, true)}</div>
          </div>
        )
      }
    }
    return output
  }
}
