import { useEffect, useState } from 'react'
import TimeAgo from 'timeago-react'
import de from 'timeago.js/lib/lang/de'
import * as timeago from 'timeago.js'

import { backend } from '../backend'
import { useCore } from '../lib/state/core'
import { forceRerender } from '../lib/commands/mode'
import { userIdKey } from '../lib/helper/submit'
import clsx from 'clsx'

timeago.register('de', function (number, index, total_sec) {
  // Convert weeks to days.
  if ([8, 9].includes(index) && total_sec) {
    const days = Math.round(total_sec / (60 * 60 * 24))
    return ['vor ' + days + ' Tagen', '...']
  }
  return de(number, index)
})

export function Highscore() {
  const core = useCore()
  const [data, setData] = useState<
    {
      userId: string
      firstActive: number
      lastActive: number
      solved: number[]
      name: string
    }[]
  >([])

  const [mode, setMode] = useState<'count' | 'active'>('count')

  const [showAll, setShowAll] = useState(false)

  const userId =
    localStorage.getItem(userIdKey) ?? sessionStorage.getItem(userIdKey)

  useEffect(() => {
    if (backend.highscoreEndpoint) {
      fetch(backend.highscoreEndpoint)
        .then((res) => res.json())
        .then((val: typeof data) => {
          val.sort((a, b) =>
            a.solved.length == b.solved.length
              ? b.lastActive - a.lastActive
              : b.solved.length - a.solved.length
          )
          setMode('count')
          setData(val)
        })
    }
  }, [])

  useEffect(() => {
    if (mode == 'count') {
      data.sort((a, b) =>
        a.solved.length == b.solved.length
          ? b.lastActive - a.lastActive
          : b.solved.length - a.solved.length
      )
    } else {
      data.sort((a, b) => b.lastActive - a.lastActive)
    }
    setData(data)
    forceRerender(core)
  }, [mode, data, core])

  return (
    <div className="w-[700px] mx-auto">
      <h1 className="mb-4 text-3xl">Highscore</h1>
      {data.length == 0 ? (
        <p>Daten werden geladen ...</p>
      ) : (
        <>
          <p className="text-right my-4">
            {data.length} Spieler*innen in den letzten 28 Tagen
          </p>
          <p className="text-right my-4">
            {mode == 'count' && (
              <button
                className="text-blue-500 hover:underline"
                onClick={() => {
                  setMode('active')
                }}
              >
                sortieren nach letzter Aktivität
              </button>
            )}
            {mode == 'active' && (
              <button
                className="text-blue-500 hover:underline"
                onClick={() => {
                  setMode('count')
                }}
              >
                sortieren nach gelösten Aufgaben
              </button>
            )}
          </p>
          <table className="table-auto w-full mt-8">
            <thead>
              <tr>
                {mode == 'count' && <th>Platz</th>}
                <th>Name</th>
                <th>gelöste Aufgaben</th>
                <th>zuletzt aktiv</th>
              </tr>
            </thead>
            <tbody>
              {(showAll || mode == 'active' ? data : data.slice(0, 10))
                .filter((entry) => entry.solved.length > 0)
                .map((entry, i, arr) => (
                  <tr
                    key={entry.userId}
                    className={clsx(
                      'border-t-2',
                      entry.userId == userId && 'bg-blue-200'
                    )}
                  >
                    {mode == 'count' && (
                      <td className="text-center p-2">
                        {getPlacement(i, arr)}
                      </td>
                    )}
                    <td className="text-center p-2">
                      {entry.name ? entry.name : '---'}
                    </td>
                    <td className="text-center font-bold p-2">
                      {entry.solved.length}
                    </td>
                    <td className="p-2 text-center">
                      <TimeAgo
                        datetime={entry.lastActive}
                        live={false}
                        locale="de"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!showAll && mode == 'count' && (
            <p>
              [
              <button
                onClick={() => {
                  setShowAll(true)
                }}
                className="mt-8 text-blue-500 hover:underline"
              >
                alle anzeigen
              </button>
              ]
            </p>
          )}
        </>
      )}
    </div>
  )
}

function getPlacement(i: number, arr: any[]) {
  let mycount = arr[i].solved.length
  while (i >= 0 && arr[i].solved.length <= mycount) {
    i--
  }
  return i + 2
}
