import {
  faCheckCircle,
  faExternalLink,
  faGlobe,
  faPencil,
  faPenToSquare,
  faShirt,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { Fragment, useEffect, useState } from 'react'

import {
  forceRerender,
  hideOverviewList,
  hideProfile,
  hideSaveHint,
  setLng,
  setPersist,
  showOverviewList,
  showProfile,
} from '../../lib/commands/mode'
import { setOverviewScroll, startQuest } from '../../lib/commands/quest'
import { questDeps } from '../../lib/data/dependencies'
import { questList } from '../../lib/data/overview'
import { questData } from '../../lib/data/quests'
import { isQuestDone, isQuestStarted } from '../../lib/helper/session'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { View } from '../helper/View'
import { switchToPage } from '../../lib/commands/page'
import { showModal } from '../../lib/commands/modal'
import {
  getAppearance,
  getLng,
  getUserName,
  isPersisted,
  loadFromJSON,
  resetStorage,
  saveToJSON,
  setLngStorage,
} from '../../lib/storage/storage'
import { HFullStyles } from '../helper/HFullStyles'
import { appearanceRegistry } from '../../lib/data/appearance'
import { getName, isSetName } from '../../lib/helper/events'
import TimeAgo from 'timeago-react'
import { QuestIcon } from '../helper/QuestIcon'
import { mapData } from '../../lib/data/map'
import { submit_event } from '../../lib/helper/submit'

export function Overview() {
  const core = useCore()

  const name = getUserName()

  const [openUsers, setOpenUsers] = useState<string[]>([])

  const numberOfSolvedQuests = Object.keys(mapData).filter((id) =>
    isQuestDone(parseInt(id))
  ).length

  useEffect(() => {
    if (core.ws.overview.overviewScroll > 0) {
      document.getElementById('scroll-container')!.scrollTop =
        core.ws.overview.overviewScroll
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <div className="h-full overflow-auto" id="scroll-container">
        <div
          className="flex flex-col relative min-h-full min-w-fit"
          style={{ backgroundImage: "url('/canvas_background.jpg')" }}
        >
          <div className="flex justify-center">
            <div
              className={clsx(
                'flex mt-8 items-center rounded-xl',
                'p-2 px-6 bg-white/30'
              )}
            >
              <h1 className="text-2xl whitespace-nowrap">Robot Karol Online</h1>
            </div>
          </div>
          <div className="absolute top-2 left-2">
            <FaIcon icon={faGlobe} />
            <select
              className="p-1 ml-2 bg-white/40 rounded"
              value={core.ws.settings.lng}
              onChange={(e) => {
                const lng = e.target.value
                if (lng == 'de' || lng == 'en') {
                  setLng(core, lng)
                  setLngStorage(lng)
                }
              }}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="mx-auto mt-6">
            <button
              className="mr-7 hover:underline"
              onClick={() => {
                hideOverviewList(core)
                if (core.ws.overview.showProfile) {
                  hideProfile(core)
                } else {
                  showProfile(core)
                }
              }}
            >
              {core.strings.overview.profile}
            </button>
            <button
              className="mr-7 hover:underline"
              onClick={() => {
                setOverviewScroll(core, 0)
                switchToPage(core, 'highscore')
              }}
            >
              Highscore
            </button>
            <button
              className="mr-7 hover:underline"
              onClick={() => {
                setOverviewScroll(core, 0)
                switchToPage(core, 'editor')
              }}
            >
              <FaIcon icon={faPenToSquare} className="mr-1 text-sm" />
              {core.strings.overview.editor}
            </button>
            <button
              className="mr-7 hover:underline"
              title="In eine Datei speichern"
              onClick={() => {
                saveToJSON()
              }}
            >
              {core.strings.overview.save}
            </button>
            <button
              className="mr-7 hover:underline"
              title="Aus einer Datei laden"
              onClick={async () => {
                await loadFromJSON()
                const appearance = getAppearance()
                if (appearance) {
                  core.mutateWs((ws) => {
                    ws.appearance = appearance
                  })
                }
                setLng(core, getLng())
                forceRerender(core)
              }}
            >
              {core.strings.overview.load}
            </button>
          </div>
          {core.ws.page == 'analyze' && (
            <div className="bg-white px-16 pb-8 mt-4">
              <p className="my-6">
                Daten ab {core.ws.analyze.cutoff}, insgesamt{' '}
                {core.ws.analyze.count} Einträge
              </p>
              <h2 className="mt-6 mb-4 text-lg">Freigegebene Aufgaben</h2>
              {core.ws.analyze.published.map((entry, i) => (
                <p key={i} className="my-2">
                  <a
                    href={`/#${entry.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {entry.id}
                  </a>{' '}
                  - {entry.date}
                </p>
              ))}
              <p className="mt-6 mb-4">
                {core.ws.analyze.showEditor} mal Editor angezeigt,{' '}
                {core.ws.analyze.showPlayground} mal Spielwiese,{' '}
                {core.ws.analyze.showDemo} mal Demo,{' '}
                {core.ws.analyze.showStructogram} mal Struktogramm,{' '}
                {core.ws.analyze.usePersist} mal Fortschritt gespeichert,{' '}
                {core.ws.analyze.useJava} mal Java verwendet,{' '}
                {core.ws.analyze.usePython} mal Python verwendet,{' '}
                {core.ws.analyze.playSnake} mal Snake gespielt
              </p>
              <h2 className="mt-6 mb-4 text-lg">Bearbeitungen</h2>
              {Object.entries(core.ws.analyze.customQuests).map((entry, i) => (
                <p key={i} className="my-2">
                  <a
                    href={`/#${entry[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {entry[0]}
                  </a>{' '}
                  - {entry[1].start} mal gestartet, {entry[1].complete} mal
                  abgeschlossen
                </p>
              ))}
              <h2 className="mt-6 mb-4 text-lg">Aussehen</h2>
              <p>
                {(() => {
                  const appearance = Object.entries(core.ws.analyze.appearance)
                  appearance.sort((a, b) => b[1].count - a[1].count)

                  return appearance.map((entry) => (
                    <span key={entry[0]} className="mr-3">
                      {entry[0]}:{appearanceRegistry[parseInt(entry[0])].type}-
                      {appearanceRegistry[parseInt(entry[0])].title} (x
                      {entry[1].count})
                    </span>
                  ))
                })()}
              </p>
              <h2 className="mt-6 mb-4 text-lg">Legacy</h2>{' '}
              {Object.entries(core.ws.analyze.legacy).map((entry, i) => (
                <p key={i} className="my-2">
                  <a
                    href={`/?id=${entry[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {entry[0]}
                  </a>{' '}
                  - {entry[1].count} mal gestartet
                </p>
              ))}
              <h2 className="mt-6 mb-4 text-lg">Zeiten</h2>
              <p className="mb-2">
                Median: {format(median(core.ws.analyze.userTimes))}
              </p>
              {/*<p>{core.ws.analyze.userTimes.map(format).join(', ')}</p>*/}
              {/*<h2 className="mt-6 mb-4 text-lg">Anzahl gelöste Aufgaben</h2>
              <p className="mb-2">
                Median: {median(core.ws.analyze.solvedCount)}
              </p>
              <p>{core.ws.analyze.solvedCount.join(', ')}</p>*/}
            </div>
          )}
          {core.ws.overview.showProfile && (
            <div className="mx-auto w-[600px] mt-12 p-3 bg-white/50 rounded relative">
              <h2 className="text-lg font-bold">Profil</h2>
              <div className="absolute right-2 top-3">
                <button
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => {
                    hideProfile(core)
                  }}
                >
                  Schließen
                </button>
              </div>
              <div className="my-4">
                Benutzername:{' '}
                {name ? (
                  <strong>{name}</strong>
                ) : (
                  <span className="italic text-gray-600">
                    noch kein Name gesetzt
                  </span>
                )}
              </div>
              <div className="my-4">
                Gelöste Aufgaben:{' '}
                <strong>
                  {
                    Object.keys(mapData).filter((id) =>
                      isQuestDone(parseInt(id))
                    ).length
                  }
                </strong>{' '}
                von {Object.keys(mapData).length}
              </div>
              <div className="my-4">
                <label>
                  <input
                    type="checkbox"
                    checked={isPersisted()}
                    onChange={(e) => {
                      setPersist(core, e.target.checked)
                      hideSaveHint(core)
                      forceRerender(core)
                    }}
                  />{' '}
                  Fortschritt dauerhaft auf diesem Gerät speichern
                </label>
              </div>
              <div className="my-8">
                <button
                  className="px-2 py-0.5 bg-green-300 hover:bg-green-400 rounded mr-2"
                  onClick={() => {
                    showModal(core, 'appearance')
                  }}
                >
                  <FaIcon icon={faShirt} className="mr-1" />
                  Aussehen von Karol anpassen
                </button>
              </div>
              <div className="mt-8 text-right">
                <button
                  className="hover:underline text-red-500"
                  onClick={() => {
                    const res = confirm('Fortschritt jetzt zurücksetzen?')
                    if (res) {
                      resetStorage()
                      forceRerender(core)
                      setLng(core, 'de')
                      core.mutateWs((ws) => {
                        ws.appearance = {
                          cap: 0,
                          skin: 1,
                          shirt: 2,
                          legs: 3,
                        }
                      })
                      hideProfile(core)
                    }
                  }}
                >
                  Fortschritt zurücksetzen
                </button>
              </div>
            </div>
          )}
          {core.ws.overview.showOverviewList && (
            <>
              <div className="mx-auto mt-6 mb-3">
                <button
                  className="px-1 py-0.5 bg-blue-200 hover:bg-blue-300 rounded"
                  onClick={() => {
                    hideOverviewList(core)
                  }}
                >
                  Liste aller Aufgaben schließen
                </button>
              </div>
              <div className="w-[1240px] h-[2700px] mx-auto relative bg-white/50">
                {questList.map(renderQuest)}
              </div>
            </>
          )}
          {!core.ws.overview.showOverviewList &&
            !core.ws.overview.showProfile && (
              <div className="w-[1240px] h-[1650px] mx-auto relative mt-6">
                <img
                  src="klecks1.png"
                  className="w-[150px] top-[10px] left-[50px] absolute user-select-none"
                  alt="Farbklecks 1"
                />
                <img
                  src="klecks2.png"
                  className="w-[170px] top-[500px] left-[900px] absolute user-select-none"
                  alt="Farbklecks 2"
                />
                <img
                  src="klecks3.png"
                  className="w-[150px] top-[1100px] left-[300px] absolute user-select-none"
                  alt="Farbklecks 3"
                />
                {(numberOfSolvedQuests >= 5 ||
                  core.ws.page == 'analyze' ||
                  core.ws.page == 'demo') && (
                  <button
                    className="absolute top-[210px] left-[1050px] w-[100px] block z-10 hover:bg-gray-100/60 rounded-xl"
                    onClick={() => {
                      submit_event('play_snake', core)
                      if (window.location.hostname == 'localhost') {
                        window.open('/snake', '_blank')
                      } else {
                        window.open('/snake.html', '_blank')
                      }
                    }}
                  >
                    <p className="text-center text-lg mb-1">Mini-Spiel</p>
                    <img
                      src="/snake.png"
                      alt="Snake-Icon"
                      className="w-[60px] mx-auto"
                    />
                  </button>
                )}
                <button
                  className="absolute top-[680px] left-[370px] w-[120px] block z-10 hover:bg-gray-100/60 rounded-xl"
                  onClick={() => {
                    showModal(core, 'goodluck')
                  }}
                >
                  <p className="text-center text-lg mb-1">Auf gut Glück</p>
                  <img
                    src="/kleeblatt.png"
                    alt="Kleeblatt mit 4 Blättern"
                    className="w-[60px] mx-auto"
                  />
                </button>
                <button
                  className="absolute top-[50px] left-[730px] w-[80px] block z-10 hover:bg-gray-100/60 rounded-xl"
                  onClick={() => {
                    showModal(core, 'appearance')
                  }}
                >
                  <p className="text-center text-lg mb-1">Outfit</p>
                  <img
                    src="/outfit.png"
                    alt="Kleidung"
                    className="w-[60px] mx-auto"
                  />
                </button>
                <button
                  className="absolute top-[1350px] left-[860px] w-[120px] block z-10 hover:bg-gray-100/60 rounded-xl"
                  onClick={() => {
                    window.open('https://einhorn.arrrg.de/', '_blank')
                  }}
                >
                  <p className="text-center text-lg mb-1">
                    Einhorn der Mathematik
                  </p>
                  <img
                    src="https://einhorn.arrrg.de/einhorn.png"
                    alt="Einhorn"
                    className="w-[80px] mx-auto"
                  />
                </button>
                <button
                  className="absolute top-[1550px] left-[160px] w-[120px] block z-10 hover:bg-gray-100/60 rounded-xl"
                  onClick={() => {
                    window.open('https://hack.arrrg.de/', '_blank')
                  }}
                >
                  <p className="text-center text-lg mb-1">Hack The Web </p>
                  <img
                    src="htw.png"
                    alt="H"
                    className="w-[40px] mx-auto mb-2"
                  />
                </button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1240 1650"
                  className="relative"
                >
                  {Object.entries(mapData).map(([id, data]) => {
                    if (isQuestVisible(parseInt(id))) {
                      return (
                        <Fragment key={id}>
                          {data.deps.map((dep) => {
                            if (
                              isQuestDone(dep) ||
                              core.ws.page == 'analyze' ||
                              core.ws.page == 'demo'
                            ) {
                              return (
                                <line
                                  key={`connect-${id}-${dep}`}
                                  x1={data.x + 26}
                                  y1={data.y + 76}
                                  x2={mapData[dep].x + 26}
                                  y2={mapData[dep].y + 76}
                                  strokeWidth="10"
                                  stroke="rgba(148, 163, 184, 0.8)"
                                />
                              )
                            } else {
                              return null
                            }
                          })}
                        </Fragment>
                      )
                    }
                    return null
                  })}
                </svg>
                {Object.entries(mapData).map((entry) => {
                  if (!isQuestVisible(parseInt(entry[0]))) return null
                  return (
                    <QuestIcon
                      x={entry[1].x}
                      y={entry[1].y}
                      title={questData[parseInt(entry[0])].title}
                      solved={isQuestDone(parseInt(entry[0]))}
                      onClick={() => {
                        setOverviewScroll(
                          core,
                          document.getElementById('scroll-container')
                            ?.scrollTop ?? -1
                        )
                        startQuest(core, parseInt(entry[0]))
                      }}
                      key={entry[0]}
                      dir={entry[1].dir}
                      id={parseInt(entry[0])}
                    />
                  )
                })}
              </div>
            )}
          <div className="flex-auto"></div>

          {core.ws.page == 'analyze' && (
            <div className="bg-gray-50 p-4">
              {(() => {
                const entries = Object.entries(core.ws.analyze.userEvents)

                const entriesSorted = entries
                  .filter((entry) =>
                    entry[1].events.some((e) => isSetName(e.event))
                  )
                  .map((entry) => {
                    const events = entry[1].events.slice(0)
                    const solutions = core.ws.analyze.solutions[entry[0]]
                    if (solutions) {
                      solutions.forEach((sol, i) => {
                        events.push({
                          userId: entry[0],
                          createdAt: sol.createdAt,
                          event: 'solution_' + i.toString(),
                        })
                      })
                    }
                    events.sort((a, b) =>
                      a.createdAt.localeCompare(b.createdAt)
                    )
                    return [
                      entry[0],
                      {
                        events,
                        goodEvents: events.filter(
                          (ev) => ev.event != 'delete_user'
                        ),
                      },
                    ] as const
                  })

                entriesSorted.sort(
                  (a, b) =>
                    b[1].goodEvents
                      .at(-1)
                      ?.createdAt.localeCompare(
                        a[1].goodEvents.at(-1)?.createdAt ?? ''
                      ) ?? 0
                )

                return entriesSorted.map(([userId, obj]) => {
                  const { events, goodEvents } = obj

                  const nameEvent = events.find((el) => isSetName(el.event))!

                  const name = getName(nameEvent.event)

                  const isDeleted = events.find(
                    (el) => el.event == 'delete_user'
                  )

                  const startTime = new Date(goodEvents[0].createdAt)

                  const lastActive = new Date(goodEvents.at(-1)!.createdAt)

                  goodEvents.reverse()

                  function prettiPrintEvent(event: string) {
                    if (isSetName(event)) {
                      return 'Setze Name'
                    }

                    const startQuest = /^start_quest_(.+)/.exec(event)
                    if (startQuest) {
                      return `Öffne '${
                        questData[parseInt(startQuest[1])].title
                      }'`
                    }

                    const questComplete = /^quest_complete_(.+)/.exec(event)
                    if (questComplete) {
                      return (
                        <span className="font-bold">{`Löse '${
                          questData[parseInt(questComplete[1])].title
                        }'`}</span>
                      )
                    }

                    if (event.startsWith('solution_')) {
                      const index = parseInt(event.substring(9))
                      const entry = core.ws.analyze.solutions[userId][index]
                      return (
                        <div
                          className={clsx(
                            'border rounded p-2 min-w-[200px] max-w-[600px] overflow-x-auto inline-block',
                            entry.isAttempt
                              ? 'border-red-500'
                              : 'border-green-500'
                          )}
                        >
                          <p className="text-right text-sm text-gray-600 mb-2">
                            {entry.isCode && <span className="mr-2">CODE</span>}
                          </p>
                          <pre>{entry.solution}</pre>
                        </div>
                      )
                    }

                    return <i className="text-gray-600">{event}</i>
                  }

                  let appearanceStack: string[] = []

                  const completedQuests = new Set()

                  const ratedQuests = new Set()
                  const ratings: number[] = []

                  events.forEach((entry) => {
                    const questComplete = /^quest_complete_(.+)/.exec(
                      entry.event
                    )
                    if (questComplete) {
                      const id = parseInt(questComplete[1])
                      if (questList.includes(id)) completedQuests.add(id)
                    }

                    const rating = /^rate_quest_([\d]+)_(.+)/.exec(entry.event)

                    if (rating) {
                      const id = parseInt(rating[1])
                      const value = parseInt(rating[2])

                      if (!ratedQuests.has(id)) {
                        ratedQuests.add(id)
                        ratings.push(value)
                      }
                    }
                  })

                  ratings.reverse()

                  return (
                    <div
                      key={userId}
                      className="my-4 bg-white rounded p-3 pl-5"
                    >
                      <p className="mb-2">
                        {isDeleted ? (
                          <span className="mb-2 italic">gelöscht</span>
                        ) : (
                          <span className="font-bold mb-2 text-xl">{name}</span>
                        )}
                        <span className="ml-5 text-sm">
                          zuletzt aktiv{' '}
                          <TimeAgo
                            datetime={lastActive}
                            live={false}
                            locale="de"
                          />
                        </span>
                        <span className="text-gray-600 ml-4 text-sm">
                          beigetreten am {startTime.toLocaleString()},{' '}
                          {completedQuests.size} Aufgaben gelöst in{' '}
                          {format(
                            new Date(goodEvents[0].createdAt).getTime() -
                              startTime.getTime()
                          )}
                        </span>
                        <span>{JSON.stringify(ratings)}</span>
                        <span className="ml-4">
                          <button
                            onClick={() => {
                              if (openUsers.includes(userId)) {
                                setOpenUsers(
                                  openUsers.filter((x) => x != userId)
                                )
                              } else {
                                setOpenUsers([...openUsers, userId])
                              }
                            }}
                          >
                            zeige Details
                          </button>
                        </span>
                      </p>
                      {openUsers.includes(userId) &&
                        events.map((event, i) => {
                          if (event.event.startsWith('select_appearance_')) {
                            appearanceStack.push(event.event)
                            if (appearanceStack.length == 4) {
                              const look = appearanceStack
                              appearanceStack = []
                              return (
                                <div key={i}>
                                  <span className="w-24 text-gray-600 inline-block text-right pr-4 align-top">
                                    {format(
                                      new Date(event.createdAt).getTime() -
                                        startTime.getTime()
                                    )}
                                  </span>
                                  <span className="inline-block -mt-2">
                                    <View
                                      appearance={{
                                        cap: parseInt(look[0].substring(18)),
                                        shirt: parseInt(look[1].substring(18)),
                                        legs: parseInt(look[2].substring(18)),
                                        skin: parseInt(look[3].substring(18)),
                                      }}
                                      world={{
                                        dimX: 1,
                                        dimY: 1,
                                        karol: {
                                          x: 0,
                                          y: 0,
                                          dir: 'east',
                                        },
                                        blocks: [[false]],
                                        marks: [[false]],
                                        bricks: [[0]],
                                        height: 1,
                                      }}
                                    />
                                  </span>
                                </div>
                              )
                            } else {
                              return null
                            }
                          }

                          return (
                            <div key={i}>
                              <span className="w-24 text-gray-600 inline-block text-right pr-4 align-top">
                                {format(
                                  new Date(event.createdAt).getTime() -
                                    startTime.getTime()
                                )}
                              </span>
                              {prettiPrintEvent(event.event)}
                            </div>
                          )
                        })}
                    </div>
                  )
                })
              })()}
            </div>
          )}

          <div className="text-center mb-12 mt-24">
            Version: Dezember 2023 |{' '}
            <a
              className="hover:underline cursor-pointer"
              href={
                window.location.protocol +
                '//' +
                window.location.host +
                '/?id=Z9xO1rVGj'
              }
            >
              Spielwiese
            </a>{' '}
            |{' '}
            <button
              className="hover:underline"
              onClick={() => {
                showModal(core, 'impressum')
              }}
            >
              Impressum
            </button>{' '}
            |{' '}
            <button
              className="hover:underline"
              onClick={() => {
                showModal(core, 'privacy')
              }}
            >
              Datenschutz
            </button>{' '}
            |{' '}
            <button
              className="hover:underline"
              onClick={() => {
                showOverviewList(core)
                hideProfile(core)
                document.getElementById('scroll-container')!.scrollTop = 0
              }}
            >
              Liste aller Aufgaben
            </button>{' '}
            |{' '}
            {renderExternalLink(
              'Infos',
              'https://github.com/Entkenntnis/robot-karol-online#readme'
            )}
          </div>
          {!isPersisted() &&
            isQuestDone(1) &&
            core.ws.overview.showSaveHint &&
            core.ws.page != 'analyze' && (
              <div className="fixed left-0 right-0 bottom-0 h-10 bg-yellow-100 text-center pt-1.5 z-20">
                Fortschritt auf diesem Gerät speichern?{' '}
                <button
                  className="px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 ml-6 rounded"
                  onClick={() => {
                    setPersist(core, true)
                    hideSaveHint(core)
                    forceRerender(core)
                  }}
                >
                  Speichern
                </button>{' '}
                <button
                  className="text-gray-500 underline ml-6"
                  onClick={() => {
                    hideSaveHint(core)
                  }}
                >
                  später
                </button>
              </div>
            )}
        </div>
      </div>
      {(core.ws.page == 'overview' || core.ws.page == 'demo') && (
        <HFullStyles />
      )}
    </>
  )

  function renderExternalLink(title: string, href: string) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        <span className="hover:underline">{title}</span>{' '}
        <FaIcon icon={faExternalLink} className="text-xs" />
      </a>
    )
  }

  function isQuestVisible(id: number) {
    const position = questList.indexOf(id)

    return (
      core.ws.page == 'demo' ||
      core.ws.page == 'analyze' ||
      core.ws.overview.showOverviewList ||
      position == 0 ||
      isQuestDone(id) ||
      mapData[id]?.deps.some(isQuestDone)
    )
  }

  function renderQuest(index: number, i: number) {
    const row = Math.floor(i / 4) // zig zag
    const col = (i % 4) + [0.5, 0, 0.5, 1][row % 4]
    const top = `${row * 190 + (row + 1) * 50}px`
    const left = `${(col + 1) * 35 + col * 200}px`

    if (!isQuestVisible(index)) {
      if (questDeps[index].some(isQuestVisible)) {
        return (
          <div
            key={index}
            className="absolute w-[200px] h-[210px] border-2 rounded-md border-dashed"
            style={{ top, left }}
          ></div>
        )
      } else {
        return null
      }
    }

    const data = questData[index]

    const questDone = core.ws.page == 'analyze' ? false : isQuestDone(index)

    //const reachableCount = core.ws.analyze.reachable[index]

    const task = questData[index].tasks[0]

    //const times = quartiles(core.ws.analyze.questTimes[index] ?? [0])

    return (
      <Fragment key={index}>
        <div className="absolute" style={{ top, left }}>
          <div
            className={clsx(
              'p-3 bg-white rounded-md relative z-10',
              'w-[200px] cursor-pointer',
              !questDone && 'rainbow',
              core.ws.page == 'analyze' ? 'h-[230px]' : 'h-[210px]'
            )}
            tabIndex={0}
            onClick={() => {
              setOverviewScroll(
                core,
                document.getElementById('scroll-container')?.scrollTop ?? -1
              )
              startQuest(core, index)
            }}
          >
            <div>
              <div>
                <span
                  className={clsx(
                    'py-1 inline-block',
                    questDone ? 'text-gray-600' : 'font-bold'
                  )}
                >
                  {data.title}
                  {core.ws.page == 'analyze' && <small>&nbsp;({index})</small>}
                </span>
              </div>
            </div>
            <div className="">
              {!questDone && (
                <div className="absolute right-3 top-3">
                  {isQuestStarted(index) && (
                    <span className="text-yellow-600">
                      <FaIcon icon={faPencil} />
                    </span>
                  )}
                </div>
              )}
              {/*core.ws.page == 'analyze' && (
                <div
                  className="-mt-2 [&>span]:align-[2px]"
                  title={`${
                    core.ws.analyze.ratings[index]?.values.filter((x) => x == 1)
                      .length ?? 0
                  } / ${
                    core.ws.analyze.ratings[index]?.values.filter((x) => x == 2)
                      .length ?? 0
                  } / ${
                    core.ws.analyze.ratings[index]?.values.filter((x) => x == 3)
                      .length ?? 0
                  } / ${
                    core.ws.analyze.ratings[index]?.values.filter((x) => x == 4)
                      .length ?? 0
                  } / ${
                    core.ws.analyze.ratings[index]?.values.filter((x) => x == 5)
                      .length ?? 0
                  }`}
                >
                  <Rating
                    SVGclassName="inline"
                    readonly
                    allowFraction
                    initialValue={core.ws.analyze.ratings[index]?.average ?? 0}
                    size={16}
                  />{' '}
                  <small className="text-gray-400 inline-block">
                    {Math.round(core.ws.analyze.ratings[index]?.average * 10) /
                      10}{' '}
                    / {core.ws.analyze.ratings[index]?.count ?? 0} Bew.
                  </small>
                </div>
                )*/}
              {core.ws.page == 'analyze' &&
                (() => {
                  const entry = core.ws.analyze.quests[index]
                  if (index == 1 && entry) {
                    return <span>{entry.complete} Spieler*innen</span>
                  }
                  if (entry) {
                    return <span>{entry.complete}</span>
                  }
                  return null
                })()}
              <div className="overflow-hidden -mt-6 h-[144px]">
                <View
                  world={questDone ? task.target! : task.start}
                  preview={
                    task.target === null ? undefined : { world: task.target }
                  }
                  hideKarol={questDone}
                  wireframe={false}
                  className={clsx(
                    'block mx-auto max-h-full',
                    questDone && 'opacity-30'
                  )}
                  appearance={core.ws.appearance}
                />{' '}
                {questDone && (
                  <div className="absolute inset-0 flex justify-center items-center">
                    <FaIcon
                      icon={faCheckCircle}
                      className="text-green-300/40 text-[72px]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .rainbow:before {
            content: '';
            background: linear-gradient(
              46deg,
              #ff0000,
              #ff7300,
              #fffb00,
              #48ff00,
              #00ffd5,
              #002bff,
              #7a00ff,
              #ff00c8,
              #ff0000,
              #ff7300,
              #fffb00
            );
            position: absolute;
            top: -2px;
            left: -2px;
            background-size: 400%;
            z-index: -1;
            filter: blur(5px);
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            animation: glowing 60s linear infinite;
            opacity: 0;
            transition: opacity 0.1s ease-in-out;
            border-radius: 8px;
          }

          .rainbow:active {
            color: #000;
          }

          .rainbow:hover:before {
            opacity: 1;
          }

          .rainbow:after {
            z-index: -1;
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: white;
            border-radius: 8px;
            left: 0;
            top: 0;
          }

          @keyframes glowing {
            0% {
              background-position: 2400% 0;
            }
            100% {
              background-position: 0 0;
            }
          }
        `}</style>
      </Fragment>
    )
  }
}

function median(arr: number[]) {
  const middle = Math.floor(arr.length / 2)
  if (arr.length % 2 === 0) {
    return (arr[middle - 1] + arr[middle]) / 2
  } else {
    return arr[middle]
  }
}

function format(t: number) {
  const s = Math.round(t / 1000)
  if (s < 60) {
    return `${s} s`
  }
  const m = Math.round(s / 60)
  if (m < 120) {
    return `${m} min`
  }
  const h = Math.round(m / 60)
  if (h < 48) {
    return `${h} h`
  }
  const d = Math.round(h / 24)
  return `${d} Tage`
}
