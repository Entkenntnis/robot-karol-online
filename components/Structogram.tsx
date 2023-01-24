import { TreeCursor } from '@lezer/common'
import clsx from 'clsx'
import { parser } from '../lib/codemirror/parser/parser'
import { setShowStructogram } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'

export function Structogram() {
  const core = useCore()
  const code = core.ws.code
  const keyCounter = { val: 0 }

  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute right-4 top-4">
        <button
          className="px-2 py-0.5 bg-gray-200 rounded"
          onClick={() => {
            setShowStructogram(core, false)
          }}
        >
          Schließen
        </button>
      </div>
      <h1 className="ml-8 text-2xl pt-8">Struktogramm</h1>
      <div className="overflow-auto flex-auto">
        <div className="ml-4 mt-4 p-4">
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

    let cursor = tree.cursor()

    if (!cursor.firstChild()) {
      return <em>Leeres Programm</em>
    }

    const cursors: TreeCursor[] = []

    let hasCmd = false

    do {
      if (cursor.name.includes('Comment')) continue
      if (cursor.name == 'Cmd') {
        hasCmd = true
      }
      cursors.push(cursor.node.cursor())
    } while (cursor.nextSibling())

    if (hasCmd) {
      return (
        <em>
          Struktogramm für Programme mit Anweisungen zurzeit nicht
          implementiert.
        </em>
      )
    }

    return <>{cursors.map((arr, i) => transformSubtree(arr, i))}</>
  }

  function transformSubtree(
    cursor: TreeCursor,
    index: number,
    arrLength = Infinity,
    nested = false
  ) {
    const type = cursor.name

    if (type == 'Command') {
      return (
        <div
          className={clsx(
            'border border-black p-1 min-w-[190px]',
            index > 0 && 'border-t-0',
            nested && index == arrLength - 1 && 'border-b-0',
            nested && 'border-r-0'
          )}
          key={keyCounter.val++}
        >
          {code.substring(cursor.from, cursor.to)}
        </div>
      )
    }

    if (type == 'IfThen') {
      let condition = ''
      const childrenLeft: TreeCursor[] = []
      const childrenRight: TreeCursor[] = []
      let isLeft = true

      if (cursor.firstChild()) {
        do {
          if (cursor.name == 'IfKey') {
            continue
          } else if (cursor.name == 'Condition') {
            condition = code.substring(cursor.from, cursor.to)
          } else if (cursor.name == 'ThenKey') {
            continue
          } else if (cursor.name == 'ElseKey') {
            isLeft = false
          } else if (cursor.name !== 'IfEndKey') {
            if (isLeft) {
              childrenLeft.push(cursor.node.cursor())
            } else {
              childrenRight.push(cursor.node.cursor())
            }
          }
        } while (cursor.nextSibling())
      }

      return (
        <div
          className={clsx(
            'border border-black min-w-[190px] border-l-0',
            index > 0 && 'border-t-0',
            nested && index == arrLength - 1 && 'border-b-0',
            nested && 'border-r-0'
          )}
          key={keyCounter.val++}
        >
          <div className="p-1 text-center border-l border-black relative">
            <p>
              <strong>{condition}?</strong>
            </p>
            <div className="flex justify-between font-bold">
              <div>w</div>
              <div>f</div>
            </div>
            <div className="absolute inset-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                version="1.1"
                viewBox="0 0 200 50"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <desc>Created with Fabric.js 3.6.6</desc>
                <defs></defs>
                <g>
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
                    x2="100"
                    y2="50"
                  />
                </g>
                <g>
                  <line
                    vectorEffect="non-scaling-stroke"
                    style={{
                      stroke: 'rgb(0,0,0)',
                      strokeWidth: '1',
                      strokeDasharray: 'none',
                      strokeLinecap: 'butt',
                      strokeDashoffset: '0',
                      strokeLinejoin: 'miter',
                      strokeMiterlimit: '4',
                      fill: 'rgb(0,0,0)',
                      fillRule: 'nonzero',
                      opacity: '1',
                    }}
                    x1="100"
                    y1="50"
                    x2="200"
                    y2="0"
                  />
                </g>
              </svg>
            </div>
          </div>
          <div className="flex">
            <div className="basis-1/2">
              {childrenLeft.map((arr, i) =>
                transformSubtree(arr, i, childrenLeft.length, true)
              )}
            </div>
            <div className="basis-1/2">
              {childrenRight.length == 0 ? (
                <div className="h-full border-black border-t border-l min-w-[190px] bg-gray-100"></div>
              ) : (
                childrenRight.map((arr, i) =>
                  transformSubtree(arr, i, childrenRight.length, true)
                )
              )}
            </div>
          </div>
        </div>
      )
    }

    if (type == 'Repeat') {
      const heading = []
      // collect children
      const children: TreeCursor[] = []
      if (cursor.firstChild()) {
        do {
          if (cursor.name == 'RepeatStart') {
            heading.push(<strong>wiederhole&nbsp;</strong>)
          } else if (cursor.name == 'Times') {
            heading.push(code.substring(cursor.from, cursor.to))
          } else if (cursor.name == 'RepeatTimesKey') {
            heading.push(<strong> mal</strong>)
          } else if (cursor.name == 'RepeatWhileKey') {
            heading.push(<strong>solange&nbsp;</strong>)
          } else if (cursor.name == 'Condition') {
            heading.push(code.substring(cursor.from, cursor.to))
          } else if (cursor.name == 'RepeatAlwaysKey') {
            heading.push(<strong>immer</strong>)
          } else if (cursor.name.includes('Comment')) {
            continue
          } else if (cursor.name !== 'RepeatEnd') {
            children.push(cursor.node.cursor())
          }
        } while (cursor.nextSibling())
      }

      return (
        <div
          className={clsx(
            'border border-black min-w-[190px]',
            index > 0 && 'border-t-0',
            nested && index == arrLength - 1 && 'border-b-0',
            nested && 'border-r-0'
          )}
          key={keyCounter.val++}
        >
          <div className="p-1">{heading}</div>
          <div className="ml-8">
            {children.map((arr, i) =>
              transformSubtree(arr, i, children.length, true)
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="border border-black" key={keyCounter.val++}>
        Unknown
      </div>
    )
  }
}
