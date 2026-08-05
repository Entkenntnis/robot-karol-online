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

export function Overview() {
  const core = useCore()

  const questData = core.ws.settings.lng == 'de' ? questDataDe : questDataEn

  const numberOfSolvedQuestsRKO = Object.keys(mapData).filter(
    (id) => parseInt(id) < 100 && isQuestDone(parseInt(id)),
  ).length

  useEffect(() => {
    if (
      core.ws.overview.overviewScroll > 0 &&
      core.ws.overview.showOverviewList &&
      !core.ws.overview.showProfile
    ) {
      document.getElementById('scroll-container')!.scrollTop =
        core.ws.overview.overviewScroll
      setOverviewScroll(0)
    }
    if (
      core.ws.overview.learningPathScroll > 0 &&
      !core.ws.overview.showOverviewList &&
      !core.ws.overview.showProfile
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
        className={clsx(
          'h-full overflow-auto',
          // this fixes a bug where scrolling is not possible on big content
          core.ws.page !== 'analyze' && 'overscroll-none',
        )}
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
          {/*<div className="absolute top-2 right-24">
            <label>
              <span className="hidden">Sprache</span>
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
            </label>
          </div>*/}
          <div className="absolute top-2 right-2 z-[1000]">
            <button
              className="rounded-full bg-yellow-300 hover:bg-yellow-400 transition-colors py-0.5 px-2"
              onClick={() => {
                ____submitAnalyzeEvent(core, 'ev_click_landing_donate')
                window.open('https://paypal.me/Dav1dL1', '_blank')
              }}
            >
              Spenden
            </button>
          </div>
          <div className="mx-8 md:mx-auto mt-6 mb-2">
            <a
              href="/#SPIELWIESE"
              className="hover:underline mr-8"
              onClick={() => {
                ____submitAnalyzeEvent(core, 'ev_click_landing_playground')
              }}
            >
              {core.strings.overview.playground}
            </a>
            <a
              href="/editor"
              className="mr-9 hover:underline cursor-pointer"
              onClick={(e) => {
                setOverviewScroll(0)
                setLearningPathScroll(0)
                ____submitAnalyzeEvent(core, 'ev_click_landing_editor')
                navigate(core, 'editor')
                e.preventDefault()
              }}
            >
              {core.strings.overview.editor}
            </a>
            <button
              title={core.strings.overview.saveTooltip}
              onClick={() => {
                ____submitAnalyzeEvent(core, 'ev_click_landing_exportProgress')
                saveToJSON(core)
              }}
              className="hover:underline mr-6"
            >
              <FaIcon icon={faFloppyDisk} className="text-green-600 mr-1" />{' '}
              {core.strings.overview.save}
            </button>
            <button
              title={core.strings.overview.loadTooltip}
              className="hover:underline"
              onClick={async () => {
                ____submitAnalyzeEvent(core, 'ev_click_landing_importProgress')
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
              {core.strings.overview.load}
            </button>
          </div>
          <div className="my-8 flex ml-8 md:ml-0 md:justify-center">
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
                Lernpfad
              </button>
              <div className=" border border-slate-600"></div>
              <button
                className={clsx(
                  'px-6 py-1',
                  core.ws.overview.showOverviewList && 'bg-yellow-200',
                )}
                onClick={() => {
                  navigate(core, '#Overview')
                }}
              >
                freies Üben
              </button>
            </div>
          </div>
          {core.ws.overview.showOverviewList && (
            <>
              <div className="px-6 mt-6 min-w-[360px] relative bg-white/50 mb-24">
                {questListByCategory.map(renderQuestCategory)}
              </div>
            </>
          )}
          {!core.ws.overview.showOverviewList &&
            !core.ws.overview.showProfile && (
              <>
                <div className="w-[1240px] h-[1600px] mx-auto relative mt-5">
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
                    core.ws.page !== 'demo' &&
                    core.ws.page !== 'analyze' && (
                      <div className="absolute top-[160px] left-[270px] z-10">
                        <AnimateInView>
                          <div className="relative">
                            <div
                              className="bg-yellow-100/80 rounded-lg p-3 shadow-lg transform rotate-6 border-2 border-yellow-300 cursor-pointer"
                              onClick={() => {
                                ____submitAnalyzeEvent(
                                  core,
                                  'ev_click_landing_tourStart',
                                )
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
                                Willkommen 👋 entdecke hier
                                <br />
                                die Welt der Algorithmen!
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
                          ____submitAnalyzeEvent(
                            core,
                            'ev_click_landing_appearance',
                          )
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
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_robotGallery',
                            )
                            setTimeout(() => {
                              window.open(
                                'https://github.com/Entkenntnis/robot-karol-online/blob/main/FIGUREN-GALERIE.md',
                                '_self',
                              )
                            }, 50)
                          }}
                        >
                          <SpinningRobot /> Figuren-Galerie
                        </a>
                      </li>
                      <li>
                        <a
                          href="/#INSPIRATION"
                          onClick={() => {
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_gallery',
                            )
                            setLearningPathScroll(
                              document.getElementById('scroll-container')
                                ?.scrollTop ?? -1,
                            )
                          }}
                        >
                          💫 Aufgaben-Galerie
                        </a>
                      </li>
                      <li>
                        <a
                          target="_blank"
                          href="https://github.com/Entkenntnis/robot-karol-online/blob/main/material/MATERIAL-LEHRKRAEFTE.md"
                          onClick={() => {
                            // open feedback form in new tab
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_material',
                            )
                          }}
                        >
                          Material für Lehrkräfte{' '}
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
                          onClick={() => {
                            // open feedback form in new tab
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_video',
                            )
                          }}
                        >
                          Video-Erklärungen{' '}
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
                          onClick={() => {
                            // open feedback form in new tab
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_docs',
                            )
                          }}
                        >
                          {core.strings.overview.docs}{' '}
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
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_english',
                            )
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
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_german',
                            )
                            // scroll to top
                            document.getElementById(
                              'scroll-container',
                            )!.scrollTop = 0
                          }}
                        >
                          <button>Zur deutsche Version</button>
                        </li>
                      )}
                    </ul>
                  </div>

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
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_closeNewKarol',
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
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_saveNewKarol',
                            )
                          }}
                        >
                          Laden
                        </button>
                      </p>
                    </div>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 1240 1600`}
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
                          if (parseInt(entry[0]) == 1) {
                            ____submitAnalyzeEvent(
                              core,
                              'ev_click_landing_startKarol',
                            )
                          }
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
          {core.ws.settings.lng == 'de' && <News />}
          {core.ws.settings.lng == 'de' && <Discover />}

          <div className="absolute right-[35px] bottom-[15px] z-10 pointer-events-none">
            <Reactions />
          </div>
          <div className="text-center mb-12 mt-24">
            <button
              className="hover:underline mr-6"
              onClick={() => {
                ____submitAnalyzeEvent(core, 'ev_click_landing_impressum')
                showModal(core, 'impressum')
              }}
            >
              {core.strings.overview.imprint}
            </button>
            <button
              className="hover:underline mr-6"
              onClick={() => {
                ____submitAnalyzeEvent(core, 'ev_click_landing_privacy')
                showModal(core, 'privacy')
              }}
            >
              {core.strings.overview.privacy}
            </button>
            {renderExternalLink('Blog', 'https://blog.arrrg.de/')}
            <button
              className="hover:underline text-red-900 hover:text-red-500 transition-colors ml-12"
              onClick={() => {
                const res = confirm(core.strings.profile.resetConfirm)
                if (res) {
                  ____submitAnalyzeEvent(core, 'ev_click_profile_reset')
                  resetStorage()
                  forceRerender(core)
                  setLngStorage('de')
                  navigate(core, '')
                }
              }}
            >
              {core.strings.profile.reset}
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
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          ____submitAnalyzeEvent(
            core,
            'ev_click_landing_' + title.toLowerCase(),
          )
        }}
      >
        <span className="hover:underline">{title}</span>{' '}
        <FaIcon icon={faExternalLink} className="text-xs text-gray-600" />
      </a>
    )
  }

  function isQuestVisible(id: number) {
    if (id >= 100) {
      // we disable all python-path related quests
      return false
    }
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
    if (cat.quests.some((id) => id >= 100) || cat.quests.length == 0)
      return null // skip python quests
    return (
      <div key={cat.title} className="mb-6">
        <h2 className="text-xl ml-6 my-4">
          {core.ws.settings.lng == 'de' ? cat.title : cat.titleEn}
        </h2>
        <div className="flex flex-wrap">{cat.quests.map(renderQuest)}</div>
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
          <a
            href={`/#QUEST-${index}`}
            className={clsx(
              'p-3 bg-white rounded-md relative z-10',
              'w-[200px] cursor-pointer',
              !questDone && 'rainbow',
              core.ws.page == 'analyze' ? 'h-[230px]' : 'h-[210px]',
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
                    questDone && 'opacity-30',
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
          </a>
        </div>
      </Fragment>
    )
  }
}
