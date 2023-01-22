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
    <div className="">
      <div className="flex justify-end mt-4 mr-4">
        <button
          className="px-2 py-0.5 bg-gray-200 rounded"
          onClick={() => {
            setShowStructogram(core, false)
          }}
        >
          Schließen
        </button>
      </div>
      <div className="ml-4 mt-4 overflow-auto h-full p-4">
        <div className="inline-block bg-pink-100">{renderStructogram()}</div>
      </div>
    </div>
  )

  function renderStructogram() {
    const tree = parser.parse(code)

    let cursor = tree.cursor()

    if (!cursor.firstChild()) {
      return <em>Leeres Programm</em>
    }

    const cursors: TreeCursor[] = []

    do {
      cursors.push(cursor.node.cursor())
    } while (cursor.nextSibling())

    return <>{cursors.map(transformSubtree)}</>
  }

  function transformSubtree(cursor: TreeCursor, index: number) {
    const type = cursor.name

    if (type == 'Command') {
      return (
        <div
          className={clsx(
            'border border-black p-1 min-w-[190px]',
            index > 0 && 'border-t-0'
          )}
          key={keyCounter.val++}
        >
          {code.substring(cursor.from, cursor.to)}
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
            heading.push(code.substring(cursor.from, cursor.to))
          } else if (cursor.name == 'Times') {
            heading.push(code.substring(cursor.from, cursor.to))
          } else if (cursor.name == 'RepeatTimesKey') {
            heading.push(code.substring(cursor.from, cursor.to))
          } else if (cursor.name !== 'RepeatEnd') {
            children.push(cursor.node.cursor())
          }
        } while (cursor.nextSibling())
      }

      //console.log('wiederhole children', children)

      return (
        <div
          className={clsx(
            'border border-black min-w-[190px]',
            index > 0 && 'border-t-0'
          )}
          key={keyCounter.val++}
        >
          <div className="p-1">{heading.join(' ')}</div>
          <div className="ml-8">{children.map(transformSubtree)}</div>
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
