import { useEffect, useState } from 'react'
import TimeAgo from 'timeago-react'
import de from 'timeago.js/lib/lang/de'
import en from 'timeago.js/lib/lang/en_US'
import * as timeago from 'timeago.js'

import { backend } from '../../backend'
import clsx from 'clsx'
import { useCore } from '../../lib/state/core'
import { getUserId } from '../../lib/storage/storage'
import { questList } from '../../lib/data/overview'
import { navigate } from '../../lib/commands/router'
import { FaIcon } from '../helper/FaIcon'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

timeago.register('de', function (number, index, total_sec) {
  // Convert weeks to days.
  if ([8, 9].includes(index) && total_sec) {
    const days = Math.round(total_sec / (60 * 60 * 24))
    return ['vor ' + days + ' Tagen', '...']
  }
  return de(number, index)
})

timeago.register('en', function (number, index, total_sec) {
  // Convert weeks to days.
  if ([8, 9].includes(index) && total_sec) {
    const days = Math.round(total_sec / (60 * 60 * 24))
    return [days + ' days ago', '...']
  }
  return en(number, index)
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
  const [showAllRecent, setShowAllRecent] = useState(false)

  const userId = getUserId()

  function sortData(m: typeof mode) {
    setData((d) => {
      const data = JSON.parse(JSON.stringify(d)) as typeof d
      //console.log(data)
      if (m == 'count') {
        data.sort((a, b) =>
          a.solved.length == b.solved.length
            ? b.lastActive - a.lastActive
            : b.solved.length - a.solved.length
        )
      } else {
        data.sort((a, b) => b.lastActive - a.lastActive)
      }
      return data
    })
  }

  useEffect(() => {
    if (backend.highscoreEndpoint) {
      fetch(backend.highscoreEndpoint)
        .then((res) => res.json())
        .then((val: typeof data) => {
          //console.log(val)
          val.forEach((entry) => {
            entry.solved = entry.solved.filter(
              (id) => questList.includes(id) && id < 10000
            )
            if (entry.solved.length > 35) {
              /*console.log(
                entry.solved.length,
                (entry.lastActive - entry.firstActive) / 1000 / 60,
                'min'
              )*/
            }
          })
          val.sort((a, b) =>
            a.solved.length == b.solved.length
              ? b.lastActive - a.lastActive
              : b.solved.length - a.solved.length
          )
          setMode('count')
          sortData('count')
          setData(val)
        })
    }
    // only on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*useEffect(() => {
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
  }, [mode, data, core])*/

  return (
    <>
      <div className="absolute left-2 top-2">
        <button
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={() => {
            navigate(core, '')
          }}
        >
          <FaIcon icon={faArrowLeft} className="mr-2" />
          {core.strings.editor.back}
        </button>
      </div>
      <div className="mt-12 mb-12">
        <div className="w-[700px] mx-auto">
          <h1 className="mb-4 text-3xl">Highscore</h1>
          {data.length == 0 ? (
            <p>{core.strings.highscore.loading}</p>
          ) : (
            <>
              <p
                className={clsx(
                  'text-right my-4'
                  // mode == 'count' && 'invisible'
                )}
              >
                {data.length} {core.strings.highscore.currentPlayers}
              </p>
              <p className="text-right my-4">
                {/*mode == 'count' && (
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => {
                      setMode('active')
                      sortData('active')
                    }}
                  >
                    {core.strings.highscore.sortByActivity}
                  </button>
                )*/}
                {/*mode == 'active' && (
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => {
                      setMode('count')
                      sortData('count')
                    }}
                  >
                    {core.strings.highscore.sortBySolved}
                  </button>
                )*/}
              </p>
              <table className="table-auto w-full mt-8">
                <thead>
                  <tr>
                    {mode == 'count' && <th>{core.strings.highscore.rank}</th>}
                    <th>{core.strings.highscore.name}</th>
                    <th>{core.strings.highscore.solved}</th>
                    <th>{core.strings.highscore.lastActive}</th>
                  </tr>
                </thead>
                <tbody>
                  {((showAll && mode == 'count') ||
                  (showAllRecent && mode == 'active')
                    ? data.slice(0, 100)
                    : mode == 'active'
                    ? data.slice(0, 200)
                    : data.slice(0, 10)
                  )
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
                          <span
                            title={`${
                              core.strings.highscore.joined
                            } ${timeago.format(
                              new Date(entry.firstActive),
                              core.ws.settings.lng
                            )}`}
                          >
                            {entry.name ? entry.name : '---'}
                          </span>
                        </td>
                        <td className="text-center font-bold p-2">
                          {entry.solved.length}
                        </td>
                        <td className="p-2 text-center">
                          <TimeAgo
                            datetime={entry.lastActive}
                            live={false}
                            locale={core.ws.settings.lng}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!showAll && mode == 'count' && (
                <p>
                  <button
                    onClick={() => {
                      setShowAll(true)
                    }}
                    className="mt-8 text-blue-500 hover:underline"
                  >
                    mehr anzeigen
                  </button>
                </p>
              )}
              {/*!showAllRecent && mode == 'active' && (
                <p>
                  [
                  <button
                    onClick={() => {
                      setShowAllRecent(true)
                    }}
                    className="mt-8 text-blue-500 hover:underline"
                  >
                    alle anzeigen
                  </button>
                  ]
                </p>
                )*/}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function getPlacement(i: number, arr: any[]) {
  let mycount = arr[i].solved.length
  while (i >= 0 && arr[i].solved.length <= mycount) {
    i--
  }
  return i + 2
}
