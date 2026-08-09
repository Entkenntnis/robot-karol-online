import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { Fragment, useEffect, useMemo } from 'react'

import { questList } from '../../lib/data/overview'
import { questData } from '../../lib/data/quests'
import { isQuestDone } from '../../lib/helper/session'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { showModal } from '../../lib/commands/modal'
import {
  setLearningPathScroll,
  setOverviewScroll,
  setQuestReturnToMode,
} from '../../lib/storage/storage'
import { HFullStyles } from '../helper/HFullStyles'
import { QuestIcon } from '../helper/QuestIcon'
import { mapData } from '../../lib/data/map'
import { ____submitAnalyzeEvent } from '../../lib/helper/submit'
import { navigate } from '../../lib/commands/router'
import { chapterData } from '../../lib/data/chapters'
import { pythonKarolExamples } from '../../lib/data/pythonExamples'
import { PythonMiniProjects } from '../helper/PythonMiniProjects'
import type { PythonProjectGroup } from '../../lib/state/types'

export function PythonPath() {
  const core = useCore()

  const numberOfSolvedQuestsPython = Object.keys(mapData).filter(
    (id) =>
      parseInt(id) >= 100 && parseInt(id) < 10000 && isQuestDone(parseInt(id)),
  ).length

  const maxMapY = 1700 // TODO: check if this is a good value

  const mapYAfterMiniProjects =
    maxMapY + (core.ws.ui.miniProjectsOpen ? 880 : 200)

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
        className={clsx('h-full overflow-auto overscroll-none')}
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
          {/*
          
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
                </li>
                
          */}
          <div
            className="w-[1240px] mx-auto relative mt-5"
            style={{
              height: `${mapYAfterMiniProjects + 220}px`,
            }}
          >
            {!isQuestDone(10001) &&
              numberOfSolvedQuestsPython == 0 &&
              !core.ws.ui.demoModus && (
                <div className="absolute top-[270px] left-[590px] z-10">
                  <div className="bg-white/80 rounded-lg p-2 w-[540px] shadow-lg cursor-pointer relative">
                    <p>
                      In den ruhigen Jahren in Jackson beschließt Ellie, sich
                      das Programmieren beizubringen. Keine einfache Sache! Zum
                      Glück stehen ihr Joel und das Dorf immer treu zur Seite.
                      Begleite Ellie, wie sie die Grundlagen von Python lernt,
                      von Ein-/Ausgabe über Variablen und Schleifen bis hin zu
                      ihrem großen Projekt.
                    </p>
                    <p className="mt-4 text-gray-600 italic">
                      Der Lernpfad ist für komplette AnfängerInnen geeignet,
                      aber anspruchsvoll. Ein bisschen Programmier-Vorerfahrung
                      oder irgendeine Form von weiterer Unterstütztung ist
                      hilfreich für die Bearbeitung.
                    </p>
                    <p className="mt-6 flex justify-center z-10 isolate">
                      <button
                        className="block relative rainbow rainbow-always px-6 py-2 text-lg bg-green-300 rounded-lg hover:bg-green-400 transition-colors"
                        onClick={() => {
                          ____submitAnalyzeEvent(
                            core,
                            'ev_click_landing_pythonIntro',
                          )
                          core.mutateWs((ws) => {
                            ws.overview.explanationId = 10001
                          })
                          showModal(core, 'explanation')
                        }}
                      >
                        Starten
                      </button>
                    </p>
                  </div>
                </div>
              )}
            <div className="absolute top-[330px] left-[90px] z-10">
              <button
                id="python-listing-button"
                className="px-2 py-0.5 bg-yellow-500/50 rounded hover:bg-yellow-500/80"
                onClick={() => {
                  ____submitAnalyzeEvent(core, 'ev_click_landing_pythonListing')
                  showModal(core, 'python-listing')
                }}
              >
                Übersicht aller Aufgaben
              </button>
            </div>
            <PythonMiniProjects maxMapY={maxMapY} groups={groupedExamples} />
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
                        if (isQuestDone(dep) || core.ws.ui.demoModus) {
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
                    <button
                      className="w-[100px] block hover:bg-white/20 rounded-xl cursor-pointer text-center"
                      onClick={() => {
                        ____submitAnalyzeEvent(
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
                      ____submitAnalyzeEvent(
                        core,
                        'ev_click_landing_startKarol',
                      )
                    }
                    setQuestReturnToMode(
                      core.ws.ui.demoModus ? 'python#DEMO' : 'python',
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
          </div>
        </div>
      </div>
      <HFullStyles />
    </>
  )

  function isQuestVisible(id: number) {
    if (id < 100) return false // ignore non-python stuff
    const position = questList.indexOf(id)

    const questsInPreviousChapter = Object.entries(mapData)
      .filter(([i, data]) => data.chapter === id - 1 && parseInt(i) < 10000)
      .map(([id]) => parseInt(id))

    return (
      core.ws.ui.demoModus ||
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
