import {
  faCaretDown,
  faCheckCircle,
  faExternalLink,
  faGlobe,
  faLightbulb,
  faMessage,
  faPaintBrush,
  faPencil,
  faPenToSquare,
  faSeedling,
  faTable,
  faTrowelBricks,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { Fragment, useEffect } from 'react'

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
import { questList, questListByCategory } from '../../lib/data/overview'
import { questData as questDataDe } from '../../lib/data/quests'
import { isQuestDone, isQuestStarted } from '../../lib/helper/session'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { View } from '../helper/View'
import { switchToPage } from '../../lib/commands/page'
import { showModal } from '../../lib/commands/modal'
import {
  getLng,
  getRobotImage,
  getUserName,
  isPersisted,
  loadFromJSON,
  resetStorage,
  saveToJSON,
  setLngStorage,
  setRobotImage,
} from '../../lib/storage/storage'
import { HFullStyles } from '../helper/HFullStyles'
import { QuestIcon } from '../helper/QuestIcon'
import { mapData } from '../../lib/data/map'
import { submit_event } from '../../lib/helper/submit'
import { questDataEn } from '../../lib/data/questsEn'
import { AnalyzeResults } from '../helper/AnalyzeResults'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { sub } from 'date-fns'
import { buildPlayground } from '../../lib/commands/init'

export function Overview() {
  const core = useCore()

  const name = getUserName()

  const questData = core.ws.settings.lng == 'de' ? questDataDe : questDataEn

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
              className="p-1 ml-2 bg-white/40 rounded cursor-pointer"
              value={core.ws.settings.lng}
              onChange={(e) => {
                const lng = e.target.value
                if (lng == 'de' || lng == 'en') {
                  setLng(core, lng)
                  setLngStorage(lng)
                  if (lng == 'en') {
                    submitAnalyzeEvent(core, 'ev_click_landing_english')
                  } else if (lng == 'de') {
                    submitAnalyzeEvent(core, 'ev_click_landing_german')
                  }
                }
              }}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="mx-auto mt-6">
            <a
              className="hover:underline cursor-pointer mr-8"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_landing_playground')
                buildPlayground(core)
                switchToPage(core, 'imported')
              }}
            >
              {core.strings.overview.playground}
            </a>
            <button
              className="mr-8 hover:underline"
              onClick={() => {
                setOverviewScroll(core, 0)
                submitAnalyzeEvent(core, 'ev_click_landing_editor')
                switchToPage(core, 'editor')
              }}
            >
              <FaIcon icon={faPenToSquare} className="mr-1 text-sm" />
              {core.strings.overview.editor}
            </button>
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="hover:underline cursor-pointer"
              >
                {core.strings.overview.path} <FaIcon icon={faCaretDown} />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[11] w-52 p-2 shadow mt-1"
              >
                {numberOfSolvedQuests == 0 &&
                core.ws.page !== 'demo' &&
                core.ws.page !== 'analyze' ? (
                  <li>
                    <button
                      onClick={() => {
                        submitAnalyzeEvent(core, 'ev_click_landing_startNow')
                        startQuest(core, 1)
                      }}
                    >
                      <strong>{core.strings.overview.startNow}</strong>
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      onClick={() => {
                        submitAnalyzeEvent(core, 'ev_click_landing_profile')
                        hideOverviewList(core)
                        showProfile(core)
                        try {
                          // @ts-ignore
                          document.activeElement?.blur()
                        } catch (e) {}
                      }}
                    >
                      {core.strings.overview.profile}
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      showOverviewList(core)
                      submitAnalyzeEvent(core, 'ev_click_landing_listOfAll')
                      hideProfile(core)
                      document.getElementById('scroll-container')!.scrollTop = 0
                      try {
                        // @ts-ignore
                        document.activeElement?.blur()
                      } catch (e) {}
                    }}
                  >
                    {core.strings.overview.showAll}
                  </button>
                </li>
                <li>
                  <button
                    title={core.strings.overview.loadTooltip}
                    onClick={async () => {
                      submitAnalyzeEvent(
                        core,
                        'ev_click_landing_importProgress'
                      )
                      await loadFromJSON()
                      const image = getRobotImage()
                      if (image) {
                        core.mutateWs((ws) => {
                          ws.robotImageDataUrl = image
                        })
                      }
                      setLng(core, getLng())
                      forceRerender(core)
                    }}
                  >
                    {core.strings.overview.load}
                  </button>
                </li>
                <li>
                  <button
                    title={core.strings.overview.saveTooltip}
                    onClick={() => {
                      submitAnalyzeEvent(
                        core,
                        'ev_click_landing_exportProgress'
                      )
                      saveToJSON(core)
                    }}
                  >
                    {core.strings.overview.save}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOverviewScroll(core, 0)
                      submitAnalyzeEvent(core, 'ev_click_landing_highscore')
                      switchToPage(core, 'highscore')
                    }}
                  >
                    Highscore
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      // open feedback form in new tab
                      submitAnalyzeEvent(core, 'ev_click_landing_video')
                      window.open(
                        'https://www.youtube.com/watch?v=xF3YrWzp400&list=PLhnCUqIsz29Bda_ovQPpags58MQcwQSd8',
                        '_blank'
                      )
                    }}
                  >
                    Video-Erklärungen <FaIcon icon={faExternalLink} />
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {core.ws.page == 'analyze' && <AnalyzeResults />}
          {core.ws.overview.showProfile && (
            <div className="mx-auto w-[600px] mt-12 p-3 bg-white/50 rounded relative">
              <h2 className="text-lg font-bold">
                {core.strings.profile.title}
              </h2>
              <div className="absolute right-2 top-3">
                <button
                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => {
                    hideProfile(core)
                  }}
                >
                  {core.strings.profile.close}
                </button>
              </div>
              <div className="my-4">
                {core.strings.profile.username}:{' '}
                {name ? (
                  <strong>{name}</strong>
                ) : (
                  <span className="italic text-gray-600">
                    {core.strings.profile.noname}
                  </span>
                )}
              </div>
              <div className="my-4">
                {core.strings.profile.solved}:{' '}
                <strong>{numberOfSolvedQuests}</strong>{' '}
                {core.strings.profile.of} {Object.keys(mapData).length}
              </div>
              <div className="my-4">
                <label>
                  <input
                    type="checkbox"
                    checked={isPersisted()}
                    onChange={(e) => {
                      submitAnalyzeEvent(core, 'ev_click_profile_togglePersist')
                      setPersist(core, e.target.checked)
                      hideSaveHint(core)
                      forceRerender(core)
                    }}
                  />{' '}
                  {core.strings.profile.persist}
                </label>
              </div>
              <div className="mt-8 text-right">
                <button
                  className="hover:underline text-red-500"
                  onClick={() => {
                    const res = confirm(core.strings.profile.resetConfirm)
                    if (res) {
                      submitAnalyzeEvent(core, 'ev_click_profile_reset')
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
                  {core.strings.profile.reset}
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
                  {core.strings.overview.closeShowAll}
                </button>
              </div>
              <div className="mx-6 min-w-[500px] relative bg-white/50">
                {questListByCategory.map(renderQuestCategory)}
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
                    className="absolute top-[350px] left-[1100px] w-[100px] block z-10 hover:bg-gray-100/60 rounded-xl"
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_landing_snake')
                      window.open('/#CDBV', '_blank')
                    }}
                  >
                    <p className="text-center mb-2">
                      {core.strings.overview.game}
                    </p>
                    <img
                      src="/snake.png"
                      alt="Snake-Icon"
                      className="w-[40px] mx-auto mb-1"
                    />
                  </button>
                )}
                {core.ws.settings.lng === 'de' && (
                  <a
                    className={clsx(
                      'absolute top-[760px] left-[170px] block z-10 hover:bg-gray-100/60 rounded-xl',
                      'w-[120px] cursor-pointer'
                    )}
                    href="https://github.com/Entkenntnis/robot-karol-online/blob/main/MATERIAL-LEHRKRAEFTE.md"
                    target="_blank"
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_landing_material')
                    }}
                  >
                    <p className="text-center text-lg mb-1">
                      Material für Lehrkräfte
                    </p>
                    <img
                      src="/kleeblatt.png"
                      alt="Kleeblatt mit 4 Blättern"
                      className="w-[60px] mx-auto"
                    />
                  </a>
                )}
                {core.ws.settings.lng === 'de' && (
                  <a
                    className={clsx(
                      'absolute top-[680px] left-[370px] block z-10 hover:bg-gray-100/60 rounded-xl',
                      'w-[120px] cursor-pointer'
                    )}
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_landing_gallery')
                      switchToPage(core, 'inspiration')
                    }}
                  >
                    <p className="text-center text-lg mb-1">
                      Aufgaben-
                      <br />
                      Galerie
                    </p>
                    <p className="text-center text-3xl text-purple-400">
                      <FaIcon icon={faTable} />
                    </p>
                  </a>
                )}
                {core.ws.ui.newRobotImage && (
                  <div className="fixed right-4 bottom-4 bg-white rounded-lg p-3 z-[200] shadow">
                    <p className="mb-2">Neue Figur verfügbar:</p>
                    <img
                      src={core.ws.ui.newRobotImage}
                      alt="Karol"
                      className="border-2 border-gray-200 shadow-lg"
                    />
                    <p className="text-center mt-2">
                      <button
                        className="hover:underline mr-3"
                        onClick={() => {
                          core.mutateWs((ws) => {
                            ws.ui.newRobotImage = undefined
                          })
                          submitAnalyzeEvent(
                            core,
                            'ev_click_landing_closeNewKarol'
                          )
                        }}
                      >
                        schließen
                      </button>
                      <button
                        className="px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded"
                        onClick={() => {
                          core.mutateWs((ws) => {
                            ws.robotImageDataUrl = ws.ui.newRobotImage
                            ws.ui.newRobotImage = undefined
                          })
                          setRobotImage(core.ws.robotImageDataUrl)
                          submitAnalyzeEvent(
                            core,
                            'ev_click_landing_saveNewKarol'
                          )
                        }}
                      >
                        Laden
                      </button>
                    </p>
                  </div>
                )}
                <button
                  className={clsx(
                    'absolute top-[500px] left-[1100px] block z-10 hover:bg-gray-100/60 rounded-xl',
                    'w-[120px] cursor-pointer'
                  )}
                  onClick={() => {
                    // open feedback form in new tab
                    submitAnalyzeEvent(core, 'ev_click_landing_appearance')
                    showModal(core, 'appearance')
                  }}
                >
                  <p className="text-center">
                    Figur
                    <br />
                    zeichnen
                  </p>
                  <FaIcon
                    icon={faPaintBrush}
                    className="text-3xl animate-pastel-fade inline-block mt-2 pb-2"
                  />
                </button>
                {core.ws.settings.lng == 'de' && (
                  <button
                    className="absolute top-[1520px] left-[880px] w-[120px] block z-10 hover:bg-gray-100/60 rounded-xl"
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_landing_einhorn')
                      window.open('https://einhorn.arrrg.de', '_blank')
                    }}
                  >
                    <p className="text-center text-lg mb-1">
                      Einhorn der Mathematik
                    </p>
                    <img
                      src="/einhorn.png"
                      alt="Einhorn"
                      className="w-[50px] mx-auto"
                    />
                  </button>
                )}
                <button
                  className="absolute top-[1550px] left-[160px] w-[120px] block z-10 hover:bg-gray-100/60 rounded-xl"
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_landing_hacktheweb')
                    window.open(
                      'https://hack.arrrg.de/' +
                        (core.ws.settings.lng === 'en' ? 'en' : ''),
                      '_blank'
                    )
                  }}
                >
                  <p className="text-center text-lg mb-1">Hack The Web</p>
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
                        if (parseInt(entry[0]) == 1) {
                          submitAnalyzeEvent(
                            core,
                            'ev_click_landing_startKarol'
                          )
                        }
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
                {core.ws.settings.lng === 'de' &&
                  numberOfSolvedQuests == 0 &&
                  core.ws.page !== 'demo' &&
                  core.ws.page !== 'analyze' && (
                    <div className="absolute top-72 left-12 bg-gray-100 rounded-lg p-2 w-[550px]">
                      <p>
                        Diese Online-Programmierumgebung führt dich in die
                        Grundlagen von Algorithmen ein: Sequenz, Wiederholung
                        (mit fester Anzahl, kopfgesteuert), bedingte Anweisungen
                        und eigene Methoden. Programmiere mit Blöcken, Karol
                        Code, Python oder Java.
                      </p>
                      <p className="mt-2">
                        Klicke auf „Start“ für den Selbst-Lern-Pfad. Entdecke
                        dort auf eigene Faust die Welt von Robot Karol und löse
                        Aufgaben.
                      </p>
                      <p className="mt-2">
                        Lehrkräfte können mit dem Editor eigene Aufgaben anlegen
                        und mit der Klasse teilen oder sich von der Galerie
                        inspirieren lassen.
                      </p>
                    </div>
                  )}
              </div>
            )}
          <div className="flex-auto"></div>

          <div className="text-center mb-12 mt-24">
            <span className="text-gray-700 mr-7">
              {core.strings.overview.version}
            </span>
            <button
              className="hover:underline"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_landing_impressum')
                showModal(core, 'impressum')
              }}
            >
              {core.strings.overview.imprint}
            </button>{' '}
            |{' '}
            <button
              className="hover:underline"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_landing_privacy')
                showModal(core, 'privacy')
              }}
            >
              {core.strings.overview.privacy}
            </button>{' '}
            | {renderExternalLink('Blog', 'https://blog.arrrg.de/')} |{' '}
            {renderExternalLink(
              core.strings.overview.docs,
              'https://github.com/Entkenntnis/robot-karol-online#readme'
            )}
          </div>
          {!isPersisted() &&
            isQuestDone(1) &&
            core.ws.overview.showSaveHint &&
            core.ws.page != 'analyze' && (
              <div className="fixed left-0 right-0 bottom-0 h-10 bg-yellow-100 text-center pt-1.5 z-20">
                {core.strings.overview.storeOnDevice}{' '}
                <button
                  className="px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 ml-6 rounded"
                  onClick={() => {
                    setPersist(core, true)
                    hideSaveHint(core)
                    forceRerender(core)
                    showModal(core, 'sync')
                    submitAnalyzeEvent(core, 'ev_click_landing_syncProgress')
                  }}
                >
                  {core.strings.overview.syncProgress}
                </button>{' '}
                <button
                  className="text-gray-500 underline ml-6"
                  onClick={() => {
                    hideSaveHint(core)
                    submitAnalyzeEvent(core, 'ev_click_landing_syncLater')
                  }}
                >
                  {core.strings.overview.later}
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
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          submitAnalyzeEvent(core, 'ev_click_landing_' + title.toLowerCase())
        }}
      >
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

  function renderQuestCategory(cat: (typeof questListByCategory)[number]) {
    return (
      <div key={cat.title} className="mb-6">
        <h2 className="text-xl ml-6 my-4">
          {core.ws.settings.lng == 'de' ? cat.title : cat.titleEn}
        </h2>
        <div className="flex flex-wrap mx-3">{cat.quests.map(renderQuest)}</div>
      </div>
    )
  }

  function renderQuest(index: number) {
    const data = questData[index]

    const questDone = core.ws.page == 'analyze' ? false : isQuestDone(index)

    //const reachableCount = core.ws.analyze.reachable[index]

    const task = questData[index].tasks[0]

    //const times = quartiles(core.ws.analyze.questTimes[index] ?? [0])

    return (
      <Fragment key={index}>
        <div className="m-2">
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
                  robotImageDataUrl={core.ws.robotImageDataUrl}
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
