import { TreeCursor } from '@lezer/common'
import clsx from 'clsx'
import { parser } from '../../lib/codemirror/parser/parser'
import { setShowStructogram } from '../../lib/commands/mode'
import { useCore } from '../../lib/state/core'

export function Structogram() {
  const core = useCore()
  const code = core.ws.code
  const keyCounter = { val: 0 }

  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute right-4 top-4">
        <button
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
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
          if (cursor.name.includes('Comment')) continue
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
            'border border-black min-w-[190px] border-l-0 border-b-0',
            index > 0 && 'border-t-0',
            nested && 'border-r-0'
          )}
          key={keyCounter.val++}
        >
          <div className="flex relative">
            <div className="absolute left-0 right-0 top-0 p-1 text-center">
              <strong>{condition}?</strong>
            </div>
            <div className="basis-1/2 flex flex-col">
              <div className="relative p-1 border-black border-l font-bold">
                &nbsp;
                <br />w
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
              {childrenLeft.length == 0 ? (
                <div className="h-full border-black border-t border-l min-w-[190px] bg-gray-100"></div>
              ) : (
                childrenLeft.map((arr, i) =>
                  transformSubtree(arr, i, childrenLeft.length, true)
                )
              )}
              <div
                className={clsx(
                  'flex-grow border-black border-l',
                  nested && index == arrLength - 1 ? 'border-b-0' : 'border-b',
                  !isLeft && 'border-t' // <- this is causing duplicated borders in if-else
                )}
              ></div>
            </div>
            <div className="basis-1/2 flex flex-col">
              <div className="relative text-right p-1 font-bold">
                &nbsp;
                <br />f
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
              {isLeft ? (
                <div className="h-full border-black border-t border-l min-w-[190px] bg-gray-100"></div>
              ) : (
                childrenRight.map((arr, i) =>
                  transformSubtree(arr, i, childrenRight.length, true)
                )
              )}
              <div
                className={clsx(
                  'flex-grow border-black border-l min-w-[190px]',
                  nested && index == arrLength - 1 ? 'border-b-0' : 'border-b',
                  isLeft ? 'border-t-0' : 'border-t' // <- this is causing duplicated borders in if else
                )}
              ></div>
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
          if (cursor.name.includes('Comment')) continue
          if (cursor.name == 'RepeatStart') {
            heading.push(
              <strong key={keyCounter.val++}>wiederhole&nbsp;</strong>
            )
          } else if (cursor.name == 'Times') {
            heading.push(code.substring(cursor.from, cursor.to))
          } else if (cursor.name == 'RepeatTimesKey') {
            heading.push(<strong key={keyCounter.val++}> mal</strong>)
          } else if (cursor.name == 'RepeatWhileKey') {
            heading.push(<strong key={keyCounter.val++}>solange&nbsp;</strong>)
          } else if (cursor.name == 'Condition') {
            heading.push(code.substring(cursor.from, cursor.to))
          } else if (cursor.name == 'RepeatAlwaysKey') {
            heading.push(<strong key={keyCounter.val++}>immer</strong>)
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

    console.log(cursor.name)

    return (
      <div className="border border-black" key={keyCounter.val++}>
        Unknown
      </div>
    )
  }
}
