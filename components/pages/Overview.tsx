import {
  faCheckCircle,
  faExternalLink,
  faFloppyDisk,
  faFolderOpen,
  faPaintBrush,
  faPencil,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { Fragment, useEffect } from 'react'

import { forceRerender, setLng } from '../../lib/commands/mode'
import { questList, questListByCategory } from '../../lib/data/overview'
import { questData as questDataDe } from '../../lib/data/quests'
import { isQuestDone, isQuestStarted } from '../../lib/helper/session'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { View } from '../helper/View'
import { showModal } from '../../lib/commands/modal'
import {
  getLng,
  getRobotImage,
  setLearningPathScroll,
  setLngStorage,
  setOverviewScroll,
  setQuestReturnToMode,
  setRobotImage,
} from '../../lib/storage/storage'
import { loadFromJSON, resetStorage, saveToJSON } from '../../lib/storage/quest'
import { HFullStyles } from '../helper/HFullStyles'
import { QuestIcon } from '../helper/QuestIcon'
import { mapData } from '../../lib/data/map'
import { questDataEn } from '../../lib/data/questsEn'
import { ____submitAnalyzeEvent } from '../../lib/helper/submit'
import { AnimateInView } from '../helper/AnimateIntoView'
import { navigate } from '../../lib/commands/router'
import { Reactions } from '../helper/Reactions'
import { SpinningRobot } from '../helper/SpinningRobot'
import { Discover } from '../helper/Discover'
import { News } from '../helper/News'
import { triggerEvent } from '../../lib/commands/experiment'
import { isClassicQuest, isPythonQuest } from '../../lib/commands/categories'

export function Overview() {
  const core = useCore()

  const questData = core.ws.settings.lng == 'de' ? questDataDe : questDataEn

  const numberOfSolvedQuestsRKO = Object.keys(mapData).filter(
    (id) => isClassicQuest(parseInt(id)) && isQuestDone(parseInt(id)),
  ).length

  useEffect(() => {
    if (
      core.ws.overview.overviewScroll > 0 &&
      core.ws.overview.showOverviewList
    ) {
      document.getElementById('scroll-container')!.scrollTop =
        core.ws.overview.overviewScroll
      setOverviewScroll(0)
    }
    if (
      core.ws.overview.learningPathScroll > 0 &&
      !core.ws.overview.showOverviewList
    ) {
      document.getElementById('scroll-container')!.scrollTop =
        core.ws.overview.learningPathScroll
      setLearningPathScroll(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div
        className={clsx('h-full overflow-auto overscroll-none')}
        id="scroll-container"
      >
        <div className="flex flex-col relative min-h-full min-w-fit background-element">
          <div className="flex md:justify-center justify-start mt-6 ml-3 md:m-0">
            <div
              className={clsx(
                'flex mt-8 items-center rounded-xl',
                'p-2 px-6 bg-white/30',
              )}
            >
              <h1 className="text-2xl whitespace-nowrap">Robot Karol Online</h1>
            </div>
          </div>

          {core.ws.settings.lng == 'de' && (
            <div className="absolute left-2 bottom-2 z-[1000] text-left bg-lime-100 border border-lime-300 rounded p-2">
              Dieses Projekt wird ehrenamtlich entwickelt.
              <br />
              Unterstützen Sie es mit einer{' '}
              <a
                href="https://paypal.me/Dav1dL1"
                target="_blank"
                className="link text-blue-700 hover:text-blue-600"
              >
                Spende
              </a>
              .
            </div>
          )}
          <div className="mx-8 md:mx-auto mt-6 mb-2">
            <a
              href="/spielwiese"
              className="hover:underline mr-8"
              onClick={(e) => {
                setOverviewScroll(0)
                setLearningPathScroll(0)
                navigate(core, 'spielwiese')
                e.preventDefault()
              }}
            >
              {core.ttung('Spielwiese')}
            </a>
            <a
              href="/editor"
              className="mr-9 hover:underline cursor-pointer"
              onClick={(e) => {
                setOverviewScroll(0)
                setLearningPathScroll(0)
                navigate(core, 'editor')
                e.preventDefault()
              }}
            >
              {core.ttung('Aufgaben-Editor')}
            </a>
            <button
              title={core.ttung('Als Datei herunterladen')}
              onClick={() => {
                saveToJSON(core)
              }}
              className="hover:underline mr-6"
            >
              <FaIcon icon={faFloppyDisk} className="text-green-600 mr-1" />{' '}
              {core.ttung('Fortschritt speichern')}
            </button>
            <button
              title={core.ttung('Aus einer Datei laden')}
              className="hover:underline"
              onClick={async () => {
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
              <FaIcon icon={faFolderOpen} className="text-yellow-500 mr-1" />{' '}
              {core.ttung('Fortschritt laden')}
            </button>
          </div>
          <div className="my-8 flex ml-8 md:ml-0 md:justify-center items-center">
            <div className="hidden md:block w-[280px] h-[2px] bg-gradient-to-l rounded-full from-gray-400 to-gray-500/0 mr-2"></div>
            <div className="border-2 border-slate-600 rounded-lg flex flex-row text-lg overflow-hidden">
              <button
                className={clsx(
                  'px-6 py-1',
                  !core.ws.overview.showOverviewList && 'bg-yellow-200',
                )}
                onClick={() => {
                  navigate(core, '')
                }}
              >
                {core.ttung('Lernpfad')}
              </button>
              <div className=" border border-slate-600"></div>
              <button
                className={clsx(
                  'px-6 py-1',
                  core.ws.overview.showOverviewList && 'bg-yellow-200',
                )}
                onClick={() => {
                  navigate(core, '#OVERVIEW')
                }}
              >
                {core.ttung('freies Üben')}
              </button>
            </div>
            <div className="hidden md:block w-[280px] h-[2px] bg-gradient-to-r rounded-full from-gray-400 to-gray-500/0 ml-2"></div>
          </div>
          {core.ws.overview.showOverviewList && (
            <>
              <div className="px-6 mt-6 min-w-[360px] relative bg-white/50 mb-24">
                {questListByCategory.map(renderQuestCategory)}

                <div className="p-3 flex justify-end">
                  <button
                    className={clsx(
                      'px-2 py-1 hover:bg-gray-300 bg-gray-200 rounded transition-colors',
                    )}
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.json'
                      const reader = new FileReader()
                      reader.addEventListener('load', (e) => {
                        if (
                          e.target != null &&
                          typeof e.target.result === 'string'
                        ) {
                          navigate(
                            core,
                            '#LOCAL:' + encodeURIComponent(e.target.result),
                          )
                        }
                      })
                      input.addEventListener('change', () => {
                        if (input.files != null && input.files[0]) {
                          reader.readAsText(input.files[0])
                        }
                      })
                      input.dispatchEvent(
                        new MouseEvent('click', {
                          view: window,
                          bubbles: true,
                          cancelable: true,
                        }),
                      )
                    }}
                  >
                    {core.ttung('Aufgabe aus Datei laden')}
                  </button>
                </div>
              </div>
            </>
          )}
          {!core.ws.overview.showOverviewList && (
            <>
              <div className="w-[1240px] h-[1900px] mx-auto relative mt-5">
                <img
                  src="/klecks1.png"
                  className="w-[150px] top-[10px] left-[50px] absolute user-select-none"
                  alt="Farbklecks 1"
                />
                <img
                  src="/klecks2.png"
                  className="w-[170px] top-[500px] left-[900px] absolute user-select-none"
                  alt="Farbklecks 2"
                />
                <img
                  src="/klecks3.png"
                  className="w-[150px] top-[1100px] left-[300px] absolute user-select-none"
                  alt="Farbklecks 3"
                />
                {core.ws.settings.lng === 'de' &&
                  numberOfSolvedQuestsRKO == 0 &&
                  core.ws.page !== 'demo' && (
                    <div className="absolute top-[160px] left-[270px] z-10">
                      <AnimateInView>
                        <div className="relative">
                          <div
                            className="bg-yellow-100/80 rounded-lg p-3 shadow-lg transform rotate-6 border-2 border-yellow-300 cursor-pointer"
                            onClick={() => {
                              setQuestReturnToMode(
                                core.ws.page == 'demo' ? '#DEMO' : '',
                              )
                              setLearningPathScroll(
                                document.getElementById('scroll-container')
                                  ?.scrollTop ?? -1,
                              )
                              navigate(core, '#QUEST-1')
                            }}
                          >
                            <p className="text-lg">
                              {core.ttung('Willkommen 👋 entdecke hier')}
                              <br />
                              {core.ttung('die Welt der Algorithmen!')}
                            </p>
                          </div>
                          <svg
                            className="absolute -left-24 -top-10"
                            width="120"
                            height="130"
                            viewBox="0 0 120 130"
                          >
                            <path
                              d="M 20,10 C 40,40 90,0 100,20"
                              fill="none"
                              stroke="#eab308"
                              strokeWidth="6"
                              strokeLinecap="round"
                              className="animate-pulse"
                            />
                            <polygon points="15,22 30,5 7,0" fill="#eab308" />
                          </svg>
                        </div>
                      </AnimateInView>
                    </div>
                  )}
                <div className="absolute top-[200px] left-[1010px] z-10">
                  <AnimateInView dontFade={numberOfSolvedQuestsRKO > 0}>
                    <button
                      className={clsx(
                        'hover:bg-gray-100/60 rounded-xl',
                        'w-[100px] cursor-pointer',
                      )}
                      onClick={() => {
                        // open feedback form in new tab
                        showModal(core, 'appearance')
                      }}
                    >
                      <p className="text-center">
                        {core.ttung('Figur zeichnen')}
                      </p>
                      <FaIcon
                        icon={faPaintBrush}
                        className="text-3xl inline-block mt-2 pb-2 text-[#C08081]"
                      />
                    </button>
                  </AnimateInView>
                </div>
                <div className="absolute left-[4px] top-[750px] z-10">
                  <ul
                    tabIndex={0}
                    className="bg-white/20 rounded-lg w-60 p-2 mt-1 [&>li]:px-4 [&>li]:py-2 [&>li]:cursor-pointer hover:[&>li]:bg-gray-300/20 [&>li]:text-sm [&>li]:rounded-lg [&>li]:transition-colors active:[&>li]:bg-gray-500/50 [&_a]:block"
                  >
                    <li className="!pb-0">
                      <a
                        href="https://github.com/Entkenntnis/robot-karol-online/blob/main/FIGUREN-GALERIE.md"
                        onClick={() => {
                          triggerEvent(core, { key: 'click-robot-gallery' })
                          setTimeout(() => {
                            window.open(
                              'https://github.com/Entkenntnis/robot-karol-online/blob/main/FIGUREN-GALERIE.md',
                              '_self',
                            )
                          }, 50)
                        }}
                      >
                        <SpinningRobot /> {core.ttung('Figuren-Galerie')}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/#INSPIRATION"
                        onClick={() => {
                          setLearningPathScroll(
                            document.getElementById('scroll-container')
                              ?.scrollTop ?? -1,
                          )
                        }}
                      >
                        {core.ttung('💫 Aufgaben-Galerie')}
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        href="https://github.com/Entkenntnis/robot-karol-online/blob/main/material/MATERIAL-LEHRKRAEFTE.md"
                      >
                        {core.ttung('Material für Lehrkräfte')}{' '}
                        <FaIcon
                          icon={faExternalLink}
                          className="text-gray-600 text-xs"
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        href="https://www.youtube.com/watch?v=xF3YrWzp400&list=PLhnCUqIsz29Bda_ovQPpags58MQcwQSd8"
                      >
                        {core.ttung('Video-Erklärungen')}{' '}
                        <FaIcon
                          icon={faExternalLink}
                          className="text-gray-600 text-xs"
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        href="https://github.com/Entkenntnis/robot-karol-online#readme"
                      >
                        {core.ttung('Dokumentation')}{' '}
                        <FaIcon
                          icon={faExternalLink}
                          className="text-gray-600 text-xs"
                        />
                      </a>
                    </li>
                    {core.ws.settings.lng == 'de' ? (
                      <li
                        onClick={() => {
                          setLng(core, 'en')
                          setLngStorage('en')
                          // scroll to top
                          document.getElementById(
                            'scroll-container',
                          )!.scrollTop = 0
                        }}
                      >
                        <button>Switch to English Version</button>
                      </li>
                    ) : (
                      <li
                        onClick={() => {
                          setLng(core, 'de')
                          setLngStorage('de')
                          // scroll to top
                          document.getElementById(
                            'scroll-container',
                          )!.scrollTop = 0
                        }}
                      >
                        <button>{core.ttung('Zur deutsche Version')}</button>
                      </li>
                    )}
                  </ul>
                </div>

                {core.ws.ui.newRobotImage && (
                  <div className="fixed right-4 bottom-4 bg-white rounded-lg p-3 z-[200] shadow">
                    <p className="mb-2">
                      {core.ttung('Neue Figur verfügbar:')}
                    </p>
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
                        }}
                      >
                        {core.ttung('schließen')}
                      </button>
                      <button
                        className="px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded"
                        onClick={() => {
                          core.mutateWs((ws) => {
                            ws.robotImageDataUrl = ws.ui.newRobotImage
                            ws.ui.newRobotImage = undefined
                          })
                          setRobotImage(core.ws.robotImageDataUrl)
                          triggerEvent(core, { key: 'apply-new-robot' })
                        }}
                      >
                        {core.ttung('Laden')}
                      </button>
                    </p>
                  </div>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox={`0 0 1240 1900`}
                  className="relative"
                >
                  <defs>
                    <filter id="organicTexture">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05"
                        numOctaves="3"
                        result="noise"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="8"
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>
                    <filter id="organicTexture2">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05"
                        numOctaves="3"
                        result="noise"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="2"
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>
                  </defs>
                  {Object.entries(mapData).map(([id, data]) => {
                    if (isQuestVisible(parseInt(id))) {
                      return (
                        <Fragment key={id}>
                          {data.deps.map((dep) => {
                            if (isQuestDone(dep) || core.ws.page == 'demo') {
                              return (
                                <line
                                  key={`connect-${id}-${dep}`}
                                  x1={data.x + 26}
                                  y1={data.y + 76}
                                  x2={mapData[dep].x + 26}
                                  y2={mapData[dep].y + 76}
                                  strokeWidth="10"
                                  filter="url(#organicTexture2)"
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
                  const id = parseInt(entry[0])
                  if (!isQuestVisible(id)) return null
                  return (
                    <QuestIcon
                      x={entry[1].x}
                      y={entry[1].y}
                      title={questData[parseInt(entry[0])].title}
                      solved={
                        isQuestDone(parseInt(entry[0])) &&
                        core.ws.page != 'demo'
                      }
                      onClick={() => {
                        setQuestReturnToMode(
                          core.ws.page == 'demo' ? '#DEMO' : '',
                        )
                        setLearningPathScroll(
                          document.getElementById('scroll-container')
                            ?.scrollTop ?? -1,
                        )
                        navigate(core, '#QUEST-' + entry[0])
                      }}
                      key={entry[0]}
                      dir={entry[1].dir}
                      id={parseInt(entry[0])}
                      dontFade
                    />
                  )
                })}
              </div>
            </>
          )}
          <div className="w-full flex justify-center mb-24">
            <div className="w-[1000px] h-[2px] bg-gradient-to-r rounded-full from-gray-400/0 to-gray-400/0 via-gray-400 ml-2"></div>
          </div>
          {core.ws.settings.lng == 'de' && <News />}
          {core.ws.settings.lng == 'de' && <Discover />}

          <div className="absolute right-[35px] bottom-[15px] z-10 pointer-events-none">
            <Reactions />
          </div>
          <div className="text-center mb-12 mt-24">
            <button
              className="hover:underline mr-6"
              onClick={() => {
                showModal(core, 'impressum')
              }}
            >
              {core.ttung('Impressum')}
            </button>
            <button
              className="hover:underline mr-6"
              onClick={() => {
                ____submitAnalyzeEvent(core, 'ev_click_landing_privacy')
                showModal(core, 'privacy')
              }}
            >
              {core.ttung('Datenschutz')}
            </button>
            {core.ws.settings.lng == 'de' &&
              renderExternalLink('Blog', 'https://blog.arrrg.de/')}
            <button
              className="hover:underline text-red-900 hover:text-red-500 transition-colors ml-12"
              onClick={() => {
                const res = confirm(
                  core.ttung(
                    'Fortschritt jetzt zurücksetzen? Die Aktion kann nicht rückgängig gemacht werden.',
                  ),
                )
                if (res) {
                  resetStorage()
                  forceRerender(core)
                  setLngStorage('de')
                  navigate(core, '')
                }
              }}
            >
              {core.ttung('Fortschritt zurücksetzen')}
            </button>
          </div>
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
        <FaIcon icon={faExternalLink} className="text-xs text-gray-600" />
      </a>
    )
  }

  function isQuestVisible(id: number): boolean {
    if (!isClassicQuest(id)) {
      // we disable all python-path related quests
      return false
    }

    return (
      core.ws.page == 'demo' ||
      core.ws.overview.showOverviewList ||
      questList.indexOf(id) == 0 ||
      mapData[id]?.deps.some((dep) => isQuestDone(dep) && isQuestVisible(dep))
    )
  }

  function renderQuestCategory(cat: (typeof questListByCategory)[number]) {
    if (cat.quests.some(isPythonQuest) || cat.quests.length == 0) return null // skip python quests
    const title = core.ws.settings.lng == 'de' ? cat.title : cat.titleEn
    if (!title) return // no title e.g. for de only quests
    return (
      <div key={cat.title} className="mb-6">
        <h2 className="text-xl ml-6 my-4">{title}</h2>
        <div className="flex flex-wrap">{cat.quests.map(renderQuest)}</div>
      </div>
    )
  }

  function renderQuest(index: number) {
    const data = questData[index]

    const questDone = isQuestDone(index)

    //const reachableCount = core.ws.analyze.reachable[index]
    const task = questData[index].tasks[0]

    //const times = quartiles(core.ws.analyze.questTimes[index] ?? [0])

    return (
      <Fragment key={index}>
        <div className="m-2">
          <a
            href={`/#QUEST-${index}`}
            className={clsx(
              'p-3 bg-white rounded-md relative z-10',
              'w-[200px] cursor-pointer',
              !questDone && 'rainbow',
              'h-[210px]',
              'block',
            )}
            tabIndex={0}
            onClick={(e) => {
              setQuestReturnToMode('#OVERVIEW')
              setOverviewScroll(
                document.getElementById('scroll-container')?.scrollTop ?? -1,
              )
              navigate(core, '#QUEST-' + index)
              e.preventDefault()
            }}
          >
            <div>
              <div>
                <span
                  className={clsx(
                    'py-1 inline-block',
                    questDone ? 'text-gray-600' : 'font-bold',
                  )}
                >
                  {data.title}
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
                    questDone && 'opacity-30',
                  )}
                  robotImageDataUrl={core.ws.robotImageDataUrl}
                  lowQuality
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
          </a>
        </div>
      </Fragment>
    )
  }
}
