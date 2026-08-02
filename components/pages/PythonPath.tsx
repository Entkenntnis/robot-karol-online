import {
  faArrowLeft,
  faCaretDown,
  faExternalLink,
  faFloppyDisk,
  faFolderOpen,
  faTable,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { Fragment, useEffect, useMemo } from 'react'

import { forceRerender, setLng } from '../../lib/commands/mode'
import { questList } from '../../lib/data/overview'
import { questData as questDataDe } from '../../lib/data/quests'
import { isQuestDone } from '../../lib/helper/session'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { showModal } from '../../lib/commands/modal'
import {
  getLng,
  getRobotImage,
  loadFromJSON,
  saveToJSON,
  setLearningPathScroll,
  setOverviewScroll,
  setQuestReturnToMode,
  setRobotImage,
} from '../../lib/storage/storage'
import { HFullStyles } from '../helper/HFullStyles'
import { QuestIcon } from '../helper/QuestIcon'
import { mapData } from '../../lib/data/map'
import { questDataEn } from '../../lib/data/questsEn'
import { submitAnalyzeEvent } from '../../lib/helper/submit'
import { AnimateInView } from '../helper/AnimateIntoView'
import { navigate } from '../../lib/commands/router'
import { chapterData } from '../../lib/data/chapters'
import { pythonKarolExamples } from '../../lib/data/pythonExamples'
import { PersistNotice } from '../helper/PersistNotice'
import { PythonMiniProjects } from '../helper/PythonMiniProjects'
import type { PythonProjectGroup } from '../../lib/state/types'

export function PythonPath() {
  const core = useCore()

  const questData = core.ws.settings.lng == 'de' ? questDataDe : questDataEn

  const numberOfSolvedQuests = Object.keys(mapData).filter(
    (id) => parseInt(id) < 10000 && isQuestDone(parseInt(id)),
  ).length

  const numberOfSolvedQuestsPython = Object.keys(mapData).filter(
    (id) =>
      parseInt(id) >= 100 && parseInt(id) < 10000 && isQuestDone(parseInt(id)),
  ).length

  const maxMapY =
    Math.max(
      ...Object.entries(mapData)
        .filter(([id]) => isQuestVisible(parseInt(id)))
        .map(([, quest]) => quest.y),
    ) +
    (core.ws.page == 'demo' || core.ws.page == 'analyze'
      ? 250
      : !isQuestDone(10001)
        ? 1000
        : isQuestDone(10010)
          ? 250
          : 1000)
  // todo: if all quests are unlocked, I can reduce the spacing a bit, but I'm not at that point yet

  const mapYAfterMiniProjects =
    maxMapY + (core.ws.ui.miniProjectsOpen ? 880 : 200)

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

  const groupedExamples = useMemo(() => {
    const groups: PythonProjectGroup[] = []
    let currentGroup: PythonProjectGroup | null = null

    pythonKarolExamples
      .filter((e) => !e.hidden)
      .forEach((example) => {
        // A "spacer" item marks the beginning of a new category
        if (example.link === 'spacer') {
          currentGroup = {
            title: example.title,
            color: example.color,
            highlightColor: example.highlightColor,
            tasks: [],
          }
          groups.push(currentGroup)
        } else if (currentGroup) {
          // Add the task to the currently active group
          currentGroup.tasks.push(example)
        }
      })
    return groups
  }, [pythonKarolExamples]) // Re-calculates only if data changes

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
        <div className="flex flex-col relative min-h-full min-w-fit background-element-python">
          <div className="absolute top-3 left-3">
            <a
              href="/"
              className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={(e) => {
                setOverviewScroll(0)
                setLearningPathScroll(0)
                navigate(core, '')
                e.preventDefault()
              }}
            >
              <FaIcon icon={faArrowLeft} /> zurück zu Robot Karol Online
            </a>
          </div>
          <div className="flex md:justify-center justify-start mt-6 ml-3 md:m-0">
            <div
              className={clsx(
                'flex mt-8 items-center rounded-xl',
                'p-2 px-6 bg-[#3776ab]/40',
              )}
            >
              <h1 className="text-3xl whitespace-nowrap">Python Lernpfad</h1>
            </div>
          </div>
          <div className="fixed top-2 right-2 z-[1000] hidden">
            <button
              className="rounded-full bg-yellow-300 hover:bg-yellow-400 transition-colors py-0.5 px-2"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_landing_donate')
                window.open('https://paypal.me/Dav1dL1', '_blank')
              }}
            >
              Spenden
            </button>
          </div>
          <div className="mx-8 md:mx-auto mt-6 hidden">
            <a
              href="/#SPIELWIESE"
              className="hover:underline mr-8"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_landing_playground')
              }}
            >
              {core.strings.overview.playground}
            </a>
            <a
              href="/#EDITOR"
              className="mr-2 hover:underline cursor-pointer"
              onClick={() => {
                setOverviewScroll(0)
                setLearningPathScroll(0)
                submitAnalyzeEvent(core, 'ev_click_landing_editor')
              }}
            >
              {core.strings.overview.editor}
            </a>
            <div className="dropdown dropdown-hover">
              <div
                tabIndex={0}
                role="button"
                className="hover:underline cursor-pointer ml-6 mr-2 select-none pb-1"
                id="overview-self-learning-path"
              >
                {core.strings.overview.path}{' '}
                <FaIcon icon={faCaretDown} className="text-gray-600" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content bg-white rounded-lg z-[11] w-56 p-2 shadow [&>li>a]:px-4 [&>li>*]:py-2 [&>li>*]:cursor-pointer hover:[&>li]:bg-gray-200/50 [&>li]:text-sm [&>li]:rounded-lg [&>li]:transition-colors active:[&>li]:bg-gray-500/50  [&_a]:block [&_button]:block [&_button]:w-full [&_button]:text-left [&_button]:pl-4"
              >
                <li>
                  <a
                    href="/#OVERVIEW"
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_landing_listOfAll')
                      //  document.getElementById('scroll-container')!.scrollTop = 0
                      try {
                        // @ts-ignore
                        document.activeElement?.blur()
                        const dropdown = document.querySelector(
                          '.dropdown.dropdown-hover',
                        ) as HTMLDivElement
                        dropdown.classList.remove('dropdown-hover')
                        setTimeout(() => {
                          dropdown.classList.add('dropdown-hover')
                        }, 50)
                      } catch (e) {}
                    }}
                  >
                    <FaIcon icon={faTable} className="text-gray-600 mr-1" />{' '}
                    {core.strings.overview.showAll}
                  </a>
                </li>
                <li>
                  <button
                    title={core.strings.overview.saveTooltip}
                    onClick={() => {
                      submitAnalyzeEvent(
                        core,
                        'ev_click_landing_exportProgress',
                      )
                      saveToJSON(core)
                    }}
                  >
                    <FaIcon
                      icon={faFloppyDisk}
                      className="text-green-600 mr-1"
                    />{' '}
                    {core.strings.overview.save}
                  </button>
                </li>
                <li>
                  <button
                    title={core.strings.overview.loadTooltip}
                    onClick={async () => {
                      submitAnalyzeEvent(
                        core,
                        'ev_click_landing_importProgress',
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
                    <FaIcon
                      icon={faFolderOpen}
                      className="text-yellow-500 mr-1"
                    />{' '}
                    {core.strings.overview.load}
                  </button>
                </li>{' '}
                <li>
                  <button
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_landing_promotePython')
                      try {
                        document
                          .getElementById('python-listing-button')
                          ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          })
                        // @ts-ignore
                        document.activeElement?.blur()
                        const dropdown = document.querySelector(
                          '.dropdown.dropdown-hover',
                        ) as HTMLDivElement
                        dropdown.classList.remove('dropdown-hover')
                        setTimeout(() => {
                          dropdown.classList.add('dropdown-hover')
                        }, 50)
                      } catch (e) {}
                    }}
                  >
                    <img
                      src={'/python-logo-only.png'}
                      className="w-4 inline-block mr-1"
                    />{' '}
                    Python-Lernpfad
                  </button>
                </li>
                <li>
                  <a
                    href="/#PROFIL"
                    onClick={() => {
                      submitAnalyzeEvent(core, 'ev_click_landing_profile')
                      try {
                        // @ts-ignore
                        document.activeElement?.blur()
                        const dropdown = document.querySelector(
                          '.dropdown.dropdown-hover',
                        ) as HTMLDivElement
                        dropdown.classList.remove('dropdown-hover')
                        setTimeout(() => {
                          dropdown.classList.add('dropdown-hover')
                        }, 50)
                      } catch (e) {}
                    }}
                  >
                    {core.strings.overview.profile}
                  </a>
                </li>
                <li className="hidden">
                  <a
                    href="/#HIGHSCORE"
                    onClick={() => {
                      setOverviewScroll(0)
                      setLearningPathScroll(0)
                      submitAnalyzeEvent(core, 'ev_click_landing_highscore')
                    }}
                  >
                    Highscore
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="w-[1240px] mx-auto relative mt-5"
            style={{
              height: `${mapYAfterMiniProjects + 300}px`,
            }}
          >
            {core.ws.settings.lng === 'de' &&
              !isQuestDone(10001) &&
              numberOfSolvedQuestsPython == 0 &&
              core.ws.page !== 'demo' &&
              core.ws.page !== 'analyze' && (
                <div className="absolute top-[270px] left-[690px] z-10">
                  <AnimateInView dontFade={numberOfSolvedQuestsPython > 0}>
                    <div
                      className="bg-white/50 rounded-lg p-2 w-[410px] shadow-lg rainbow ranbow-always cursor-pointer relative"
                      onClick={() => {
                        submitAnalyzeEvent(core, 'ev_click_landing_pythonIntro')
                        core.mutateWs((ws) => {
                          ws.overview.explanationId = 10001
                        })
                        showModal(core, 'explanation')
                      }}
                    >
                      <p>
                        In den ruhigen Jahren in Jackson beschließt Ellie, sich
                        das Programmieren beizubringen. Keine einfache Sache!
                        Zum Glück stehen ihr Joel und das Dorf immer treu zur
                        Seite. Begleite Ellie, wie sie die Grundlagen von Python
                        lernt, von Ein-/Ausgabe über Variablen und Schleifen bis
                        hin zu ihrem großen Projekt.
                      </p>
                    </div>
                  </AnimateInView>
                </div>
              )}
            <div className="absolute top-[330px] left-[90px] z-10">
              <button
                id="python-listing-button"
                className="px-2 py-0.5 bg-yellow-500/50 rounded hover:bg-yellow-500/80"
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_landing_pythonListing')
                  showModal(core, 'python-listing')
                }}
              >
                Übersicht aller Aufgaben
              </button>
            </div>
            <PythonMiniProjects maxMapY={maxMapY} groups={groupedExamples} />
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
                      submitAnalyzeEvent(core, 'ev_click_landing_closeNewKarol')
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
                      submitAnalyzeEvent(core, 'ev_click_landing_saveNewKarol')
                    }}
                  >
                    Laden
                  </button>
                </p>
              </div>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 1240 ${mapYAfterMiniProjects + 300}`}
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
              if (id >= 10000) {
                // chapter marker
                // lower bound 48 = 0%, 14 = 100%
                let colorHeight = isQuestDone(id) ? 14 : 48
                let isPerfect = false
                // check if this chapter is the latest one, e.g. the next id is not done
                const isLatestChapter = !isQuestDone(id + 1)
                const idsInThisChapter = Object.entries(mapData)
                  .filter(([, data]) => data.chapter === id)
                  .map(([i]) => parseInt(i))
                const doneCount = idsInThisChapter.filter(isQuestDone).length

                isPerfect =
                  doneCount == idsInThisChapter.length &&
                  doneCount > chapterData[id].requiredCount &&
                  doneCount > 0
                if (isLatestChapter && isQuestDone(id)) {
                  const percentage =
                    100 *
                    ((doneCount + 1) / (chapterData[id].requiredCount + 1))

                  colorHeight = Math.max(
                    14,
                    Math.min(
                      48,
                      Math.round(((100 - percentage) / 100) * (48 - 14) + 14),
                    ),
                  )
                }

                return (
                  <div
                    className="absolute z-10"
                    key={id}
                    style={{
                      left: `${entry[1].x - 22}px`,
                      top: `${entry[1].y + 20}px`,
                    }}
                  >
                    <AnimateInView
                      dontFade={numberOfSolvedQuests > 0 || id != 10001}
                    >
                      <button
                        className="w-[100px] block hover:bg-white/20 rounded-xl cursor-pointer text-center"
                        onClick={() => {
                          submitAnalyzeEvent(
                            core,
                            'ev_click_landing_explanation_chapter_' + id,
                          )
                          core.mutateWs((ws) => {
                            ws.overview.explanationId = id
                          })
                          showModal(core, 'explanation')
                        }}
                        id={`explanation-icon-${id}`}
                      >
                        <p className="text-center whitespace-nowrap flex justify-center">
                          <span className="bg-white/85 px-2 rounded">
                            {chapterData[id].title}
                          </span>
                          {core.ws.page == 'analyze' && (
                            <span>
                              [{core.ws.analyze.chapters[id]?.explanation}]
                            </span>
                          )}
                        </p>
                        <div className="w-[80px] h-[60px] relative mx-auto mb-2 isolate">
                          <img
                            src={'/motte.png'}
                            alt=""
                            className="w-[80px] inset-0 absolute z-10"
                          />
                          <img
                            src={'/motte_farbe.png'}
                            alt=""
                            className="w-[80px] inset-0 absolute z-20 object-cover object-bottom"
                            style={{
                              top: `${colorHeight}px`,
                              height: `${60 - colorHeight}px`,
                            }}
                          />
                          {isPerfect && (
                            <img
                              className="absolute bottom-1.5 right-3 w-[22px] z-30 
                                    [--tw-drop-shadow:drop-shadow(0_0_8px_rgba(255,215,0,0.8))] 
                                    hover:[--tw-drop-shadow:drop-shadow(0_0_12px_rgba(255,215,0,1))]
                                    filter transition-all duration-300"
                              src="/stern.png"
                              alt="Perfect Score Star"
                            />
                          )}
                        </div>
                      </button>
                    </AnimateInView>
                  </div>
                )
              }
              return (
                <QuestIcon
                  x={entry[1].x}
                  y={entry[1].y}
                  title={questData[parseInt(entry[0])].title}
                  solved={
                    isQuestDone(parseInt(entry[0])) && core.ws.page != 'demo'
                  }
                  onClick={() => {
                    if (parseInt(entry[0]) == 1) {
                      submitAnalyzeEvent(core, 'ev_click_landing_startKarol')
                    }
                    setQuestReturnToMode(
                      core.ws.page == 'demo' ? '#DEMO' : 'python',
                    )
                    setLearningPathScroll(
                      document.getElementById('scroll-container')?.scrollTop ??
                        -1,
                    )
                    navigate(core, '#QUEST-' + entry[0])
                  }}
                  key={entry[0]}
                  dir={entry[1].dir}
                  id={parseInt(entry[0])}
                  python={
                    questData[parseInt(entry[0])].script && entry[0] != '60'
                  }
                  dontFade
                />
              )
            })}
          </div>
          <div className="flex-auto"></div>

          <div className="text-center mb-12 mt-24">
            <button
              className="hover:underline mr-6"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_landing_impressum')
                showModal(core, 'impressum')
              }}
            >
              {core.strings.overview.imprint}
            </button>
            <button
              className="hover:underline mr-6"
              onClick={() => {
                submitAnalyzeEvent(core, 'ev_click_landing_privacy')
                showModal(core, 'privacy')
              }}
            >
              {core.strings.overview.privacy}
            </button>
            {renderExternalLink('Blog', 'https://blog.arrrg.de/')}
          </div>
          <PersistNotice />
        </div>
      </div>
      {(core.ws.page == 'overview' ||
        core.ws.page == 'demo' ||
        core.ws.page == 'python-path') && <HFullStyles />}
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
        <FaIcon icon={faExternalLink} className="text-xs text-gray-600" />
      </a>
    )
  }

  function isQuestVisible(id: number) {
    if (id < 100) return false // ignore non-python stuff
    const position = questList.indexOf(id)

    const questsInPreviousChapter = Object.entries(mapData)
      .filter(([i, data]) => data.chapter === id - 1 && parseInt(i) < 10000)
      .map(([id]) => parseInt(id))

    return (
      core.ws.page == 'demo' ||
      core.ws.page == 'analyze' ||
      core.ws.overview.showOverviewList ||
      position == 0 ||
      id == 10001 || // Einleitung
      isQuestDone(id) ||
      (id < 10000
        ? mapData[id]?.deps.some(isQuestDone)
        : questsInPreviousChapter.filter(isQuestDone).length >
            chapterData[id - 1]?.requiredCount - 1 ||
          (questsInPreviousChapter.length == 0 && isQuestDone(id - 1)))
    )
  }
}
