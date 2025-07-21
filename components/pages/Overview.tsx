import {
  faCaretDown,
  faCheckCircle,
  faExternalLink,
  faFloppyDisk,
  faFolderOpen,
  faGlobe,
  faMedal,
  faHeart,
  faPaintBrush,
  faPencil,
  faTable,
  faArrowDown,
  faTimes,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { Fragment, useEffect, useMemo } from 'react'

import {
  forceRerender,
  hideSaveHint,
  setLng,
  setPersist,
} from '../../lib/commands/mode'
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
  getUserName,
  isPersisted,
  loadFromJSON,
  resetStorage,
  saveToJSON,
  setLearningPathScroll,
  setLngStorage,
  setOverviewScroll,
  setQuestReturnToMode,
  setRobotImage,
} from '../../lib/storage/storage'
import { HFullStyles } from '../helper/HFullStyles'
import { QuestIcon } from '../helper/QuestIcon'
import { mapData } from '../../lib/data/map'
import { questDataEn } from '../../lib/data/questsEn'
import { AnalyzeResults } from '../helper/AnalyzeResults'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { AnimateInView } from '../helper/AnimateIntoView'
import { navigate } from '../../lib/commands/router'
import { twoWorldsEqual } from '../../lib/commands/world'
import { chapterData } from '../../lib/data/chapters'
import {
  getExampleId,
  pythonKarolExamples,
} from '../../lib/data/pythonExamples'
import { Reactions } from '../helper/Reactions'

export function Overview() {
  const core = useCore()

  const name = getUserName()

  const questData = core.ws.settings.lng == 'de' ? questDataDe : questDataEn

  const numberOfSolvedQuests = Object.keys(mapData).filter(
    (id) => parseInt(id) < 10000 && isQuestDone(parseInt(id))
  ).length

  const maxMapY =
    Math.max(
      ...Object.entries(mapData)
        .filter(([id]) => isQuestVisible(parseInt(id)))
        .map(([, quest]) => quest.y)
    ) +
    (core.ws.page == 'demo' || core.ws.page == 'analyze'
      ? 100
      : !isQuestDone(10001)
      ? 800
      : 800)
  // todo: if all quests are unlocked, I can reduce the spacing a bit, but I'm not at that point yet

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
    interface Group {
      title: string
      color?: string
      highlightColor?: string
      tasks: (typeof pythonKarolExamples)[number][]
    }
    const groups: Group[] = []
    let currentGroup: Group | null = null

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
          core.ws.page !== 'analyze' && 'overscroll-none'
        )}
        id="scroll-container"
      >
        <div className="flex flex-col relative min-h-full min-w-fit background-element">
          <div className="flex md:justify-center justify-start mt-6 ml-3 md:m-0">
            <div
              className={clsx(
                'flex mt-8 items-center rounded-xl',
                'p-2 px-6 bg-white/30'
              )}
            >
              <h1 className="text-2xl whitespace-nowrap">Robot Karol Online</h1>
            </div>
          </div>
          <div className="absolute top-2 right-24">
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
          </div>
          <div className="fixed top-2 right-2 z-[1000]">
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
          <div className="mx-8 md:mx-auto mt-6">
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
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="hover:underline cursor-pointer ml-6 mr-2 select-none"
                id="overview-self-learning-path"
              >
                {core.strings.overview.path}{' '}
                <FaIcon icon={faCaretDown} className="text-gray-600" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content bg-white rounded-lg z-[11] w-56 p-2 shadow mt-1 [&>li>a]:px-4 [&>li>*]:py-2 [&>li>*]:cursor-pointer hover:[&>li]:bg-gray-200/50 [&>li]:text-sm [&>li]:rounded-lg [&>li]:transition-colors active:[&>li]:bg-gray-500/50  [&_a]:block [&_button]:block [&_button]:w-full [&_button]:text-left [&_button]:pl-4"
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
                        'ev_click_landing_exportProgress'
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
                    <FaIcon
                      icon={faFolderOpen}
                      className="text-yellow-500 mr-1"
                    />{' '}
                    {core.strings.overview.load}
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
                    navigate(core, '')
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
                {core.strings.profile.of}{' '}
                {Object.keys(mapData).filter((x) => parseInt(x) < 10000).length}
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
                      setLngStorage('de')
                      navigate(core, '')
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
              <h1 className="mt-10 text-2xl text-center">
                Liste aller Aufgaben
              </h1>
              <p className="text-center mt-6">
                <a
                  href="/#"
                  onClick={(e) => {
                    navigate(core, '')
                    e.preventDefault()
                  }}
                  className="link"
                >
                  schließen
                </a>
              </p>
              <div className="px-6 mt-6 min-w-[360px] relative bg-white/50">
                {questListByCategory.map(renderQuestCategory)}
              </div>
            </>
          )}
          {!core.ws.overview.showOverviewList &&
            !core.ws.overview.showProfile && (
              <div
                className="w-[1240px] mx-auto relative mt-6"
                style={{ height: `${maxMapY + 1300}px` }}
              >
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
                {core.ws.settings.lng === 'de' &&
                  numberOfSolvedQuests == 0 &&
                  core.ws.page !== 'demo' &&
                  core.ws.page !== 'analyze' && (
                    <div className="absolute top-[160px] left-[270px] z-10">
                      <AnimateInView>
                        <div className="relative">
                          <div
                            className="bg-yellow-100/80 rounded-lg p-3 w-[288px] shadow-lg transform rotate-6 border-2 border-yellow-300 cursor-pointer"
                            onClick={() => {
                              submitAnalyzeEvent(
                                core,
                                'ev_click_landing_tourStart'
                              )
                              setQuestReturnToMode(
                                core.ws.page == 'demo' ? 'demo' : 'path'
                              )
                              setLearningPathScroll(
                                document.getElementById('scroll-container')
                                  ?.scrollTop ?? -1
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
                <div className="absolute top-[200px] left-[1000px] z-10">
                  <AnimateInView dontFade={numberOfSolvedQuests > 0}>
                    <button
                      className={clsx(
                        'hover:bg-gray-100/60 rounded-xl',
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
                  </AnimateInView>
                </div>
                <div className="absolute left-[35px] top-[530px] z-10 pointer-events-none">
                  <Reactions />
                </div>
                {
                  <a
                    href={'/#DANCE'}
                    className="absolute top-[743px] left-[350px] w-[110px] block z-10 hover:bg-gray-100/60 rounded-xl cursor-pointer text-center"
                    onClick={(e) => {
                      submitAnalyzeEvent(core, 'ev_click_landing_dancedance')
                      setQuestReturnToMode(
                        core.ws.page == 'demo' ? 'demo' : 'path'
                      )
                      setLearningPathScroll(
                        document.getElementById('scroll-container')
                          ?.scrollTop ?? -1
                      )
                      navigate(core, '#DANCE')
                      e.preventDefault()
                    }}
                  >
                    <p className="text-center">Dance, Dance</p>
                    <img
                      src="/dance.png"
                      alt=""
                      className="w-[40px] mx-auto mt-2"
                    />
                  </a>
                }
                <div className="absolute left-[4px] top-[750px] z-10">
                  <ul
                    tabIndex={0}
                    className="bg-white/20 rounded-lg w-60 p-2 mt-1 [&>li]:px-4 [&>li]:py-2 [&>li]:cursor-pointer hover:[&>li]:bg-gray-300/20 [&>li]:text-sm [&>li]:rounded-lg [&>li]:transition-colors active:[&>li]:bg-gray-500/50 [&_a]:block"
                  >
                    <li>
                      <a
                        href="https://github.com/Entkenntnis/robot-karol-online/blob/main/FIGUREN-GALERIE.md"
                        onClick={() => {
                          submitAnalyzeEvent(
                            core,
                            'ev_click_landing_robotGallery'
                          )
                          setTimeout(() => {
                            window.open(
                              'https://github.com/Entkenntnis/robot-karol-online/blob/main/FIGUREN-GALERIE.md',
                              '_self'
                            )
                          }, 50)
                        }}
                      >
                        🤖 Figuren-Galerie
                      </a>
                    </li>
                    <li>
                      <a
                        href="/#INSPIRATION"
                        onClick={() => {
                          submitAnalyzeEvent(core, 'ev_click_landing_gallery')
                          setLearningPathScroll(
                            document.getElementById('scroll-container')
                              ?.scrollTop ?? -1
                          )
                        }}
                      >
                        💫 Aufgaben-Galerie
                      </a>
                    </li>
                    <li>
                      <a
                        href="/#KAROLMANIA"
                        onClick={() => {
                          submitAnalyzeEvent(
                            core,
                            'ev_click_landing_karolmania'
                          )
                          setLearningPathScroll(
                            document.getElementById('scroll-container')
                              ?.scrollTop ?? -1
                          )
                        }}
                      >
                        <FaIcon icon={faMedal} className="mr-2 text-teal-600" />
                        Karolmania
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        href="https://github.com/Entkenntnis/robot-karol-online/blob/main/MATERIAL-LEHRKRAEFTE.md"
                        onClick={() => {
                          // open feedback form in new tab
                          submitAnalyzeEvent(core, 'ev_click_landing_material')
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
                          submitAnalyzeEvent(core, 'ev_click_landing_video')
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
                          submitAnalyzeEvent(core, 'ev_click_landing_material')
                        }}
                      >
                        {core.strings.overview.docs}{' '}
                        <FaIcon
                          icon={faExternalLink}
                          className="text-gray-600 text-xs"
                        />
                      </a>
                    </li>
                  </ul>
                </div>
                {core.ws.settings.lng === 'de' &&
                  !isQuestDone(10001) &&
                  core.ws.page !== 'demo' &&
                  core.ws.page !== 'analyze' && (
                    <div className="absolute top-[1670px] left-[690px] z-10">
                      <AnimateInView dontFade={numberOfSolvedQuests > 0}>
                        <div className="bg-white/50 rounded-lg p-2 w-[410px] shadow-lg">
                          <p>
                            In den ruhigen Jahren in Jackson beschließt Ellie,
                            sich das Programmieren beizubringen. Keine einfache
                            Sache! Zum Glück steht ihr Joel immer treu zur
                            Seite. Begleite Ellie, wie sie die Grundlagen von
                            Python lernt, von Ein-/Ausgabe über Variablen und
                            Schleifen bis hin zu dem Moment, wo sie bereit ist
                            für ihr großes Projekt.
                          </p>
                        </div>
                      </AnimateInView>
                    </div>
                  )}
                <div className="absolute top-[1730px] left-[90px] z-10">
                  <AnimateInView dontFade={numberOfSolvedQuests > 0}>
                    <button
                      className="px-2 py-0.5 bg-white/30 rounded hover:bg-white/50"
                      onClick={() => {
                        submitAnalyzeEvent(
                          core,
                          'ev_click_landing_pythonListing'
                        )
                        showModal(core, 'python-listing')
                      }}
                    >
                      Übersicht Python-Lernpfad
                    </button>
                  </AnimateInView>
                </div>
                {(() => {
                  // =================== AI-GENERATED LAYOUT ===================
                  // 1. Process the flat data into groups.
                  // This logic should be inside your component, before the return statement.

                  // 2. Render the new two-column layout
                  return (
                    <div
                      className="absolute left-[200px] z-10"
                      style={{ top: `${maxMapY + 100}px` }}
                    >
                      <div className="bg-white/20 rounded-lg p-4 shadow-lg w-[880px]">
                        {/* Header remains the same */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              src="/python-logo-only.png"
                              alt="Python"
                              className="h-9 mr-2"
                            />
                            <p className="font-bold mb-1 text-gray-500 text-lg">
                              Bonus: Python Mini-Projekte
                            </p>
                          </div>
                          <a
                            className="link text-gray-600 text-sm"
                            href="https://github.com/Entkenntnis/robot-karol-online/blob/main/RKO-MODULE.md"
                            target="_blank"
                            onClick={() => {
                              submitAnalyzeEvent(
                                core,
                                'ev_click_landing_moduleDocs'
                              )
                            }}
                          >
                            <code>rko</code> Modul Dokumentation{' '}
                            <FaIcon
                              icon={faExternalLink}
                              className="text-xs text-gray-600"
                            />
                          </a>
                        </div>
                        <p className="mb-3 mt-1 text-right hidden">
                          {/* ... hidden link for teachers ... */}
                        </p>

                        {/* --- NEW TWO-COLUMN LAYOUT --- */}
                        <div className="flex flex-col gap-y-3 mt-3">
                          {groupedExamples.map((group) => (
                            <div
                              key={group.title}
                              className="flex gap-x-6 items-start border-t border-gray-300/80 pt-3"
                            >
                              {/* Left Column: Category Title */}
                              <div className="w-1/3 shrink-0 pt-2.5 pl-2">
                                <h3
                                  className={clsx(
                                    'font-semibold text-left',
                                    group.color
                                  )}
                                >
                                  {group.title}
                                </h3>
                              </div>

                              {/* Right Column: Task Buttons */}
                              <div className="w-2/3 flex flex-wrap gap-2">
                                {group.tasks.map((example) => (
                                  <a
                                    href={`/${example.link}`}
                                    key={example.link} // Use a unique key like the link
                                    className={clsx(
                                      'p-2.5 rounded-md transition-all hover:shadow-md w-[162px] block cursor-pointer bg-white/50 hover:bg-white/70 border',
                                      localStorage.getItem(
                                        `robot_karol_online_shared_quest_${example.link
                                          .substring(1)
                                          .toLowerCase()}_program`
                                      )
                                        ? group.highlightColor // Simplified: Get color from the group
                                        : 'border-transparent'
                                    )}
                                    onClick={(e) => {
                                      submitAnalyzeEvent(
                                        core,
                                        `ev_click__landing_pythonExample_${getExampleId(
                                          example.title
                                        )}`
                                      )
                                      if (core.ws.ui.tourModePage == 4) {
                                        core.mutateWs((ws) => {
                                          ws.ui.tourModePage = undefined
                                        })
                                      }
                                      setQuestReturnToMode(
                                        core.ws.page == 'demo' ? 'demo' : 'path'
                                      )
                                      setLearningPathScroll(
                                        document.getElementById(
                                          'scroll-container'
                                        )?.scrollTop ?? -1
                                      )
                                      e.preventDefault()
                                      navigate(core, example.link)
                                    }}
                                  >
                                    <span className="font-medium text-left">
                                      {example.title}
                                      {core.ws.page == 'analyze' && (
                                        <span>
                                          {' '}
                                          [
                                          {
                                            core.ws.analyze.pythonKarol[
                                              getExampleId(example.title)
                                            ]?.count
                                          }
                                          ]
                                        </span>
                                      )}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* --- END OF NEW LAYOUT --- */}
                      </div>
                    </div>
                  )
                })()}
                <div
                  className="absolute left-[301px] z-10"
                  style={{ top: `${maxMapY + 1140}px` }}
                >
                  <AnimateInView dontFade={numberOfSolvedQuests > 0}>
                    <h2 className="text-lg bg-white/20 pl-2 pr-4 py-0.5 rounded-lg">
                      Entdecke auch:
                    </h2>
                  </AnimateInView>
                </div>
                <div
                  className="absolute left-[598px]  z-10"
                  style={{ top: `${maxMapY + 1190}px` }}
                >
                  <AnimateInView dontFade={numberOfSolvedQuests > 0}>
                    <a
                      href={`/#BLUEJ-PLAYGROUND`}
                      className="w-[100px] block hover:bg-gray-100/60 rounded-xl cursor-pointer text-center"
                      onClick={(e) => {
                        submitAnalyzeEvent(
                          core,
                          'ev_click_landing_blueJPlayground'
                        )
                        setLearningPathScroll(
                          document.getElementById('scroll-container')
                            ?.scrollTop ?? -1
                        )
                        navigate(core, '#BLUEJ-PLAYGROUND')
                        e.preventDefault()
                      }}
                    >
                      <p className="text-center">
                        BlueJ-
                        <br />
                        Spielwiese
                      </p>
                      <img
                        src="/bluej.png"
                        alt=""
                        className="w-[50px] mx-auto inline-block mt-2"
                      />
                    </a>
                  </AnimateInView>
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
                {core.ws.settings.lng == 'de' && (
                  <div
                    className="absolute left-[760px] z-10"
                    style={{ top: `${maxMapY + 1200}px` }}
                  >
                    <AnimateInView dontFade={numberOfSolvedQuests > 0}>
                      <button
                        className="w-[120px] hover:bg-gray-100/60 rounded-xl"
                        onClick={() => {
                          submitAnalyzeEvent(core, 'ev_click_landing_einhorn')
                          window.open('https://einhorn.arrrg.de', '_blank')
                        }}
                      >
                        <p className="text-center mb-2">
                          Einhorn der Mathematik
                        </p>
                        <img
                          src="/einhorn.png"
                          alt="Einhorn"
                          className="w-[50px] mx-auto"
                        />
                      </button>
                    </AnimateInView>
                  </div>
                )}
                <div
                  className="absolute left-[400px] z-10"
                  style={{ top: `${maxMapY + 1230}px` }}
                >
                  <AnimateInView dontFade={numberOfSolvedQuests > 0}>
                    <button
                      className=" w-[120px] block hover:bg-gray-100/60 rounded-xl"
                      onClick={() => {
                        submitAnalyzeEvent(core, 'ev_click_landing_hacktheweb')
                        window.open(
                          'https://hack.arrrg.de/' +
                            (core.ws.settings.lng === 'en' ? 'en' : ''),
                          '_blank'
                        )
                      }}
                    >
                      <p className="text-center mb-2">Hack The Web</p>
                      <img
                        src="htw.png"
                        alt="H"
                        className="w-[32px] mx-auto mb-2"
                      />
                    </button>
                  </AnimateInView>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox={`0 0 1240 ${maxMapY + 1000}`}
                  className="relative"
                >
                  <defs>
                    <linearGradient
                      id="pythonGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgb(53, 114, 165)" />
                      <stop offset="25%" stopColor="rgb(100, 105, 160)" />
                      <stop offset="50%" stopColor="rgb(150, 140, 135)" />
                      <stop offset="75%" stopColor="rgb(210, 175, 104)" />
                      <stop offset="100%" stopColor="rgb(255, 213, 79)" />
                    </linearGradient>

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

                  <path
                    d="M 100 1700 C 393 1711 588 1648 726 1547 S 942 1374 1150 1400"
                    stroke="url(#pythonGradient)"
                    strokeWidth="6"
                    fill="none"
                    filter="url(#organicTexture)"
                    strokeLinecap="round"
                    strokeDasharray="20 28"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                </svg>{' '}
                {Object.entries(mapData).map((entry) => {
                  const id = parseInt(entry[0])
                  if (!isQuestVisible(id)) return null
                  if (id >= 10000) {
                    // chapter marker
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
                            onClick={(e) => {
                              submitAnalyzeEvent(
                                core,
                                'ev_click_landing_explanation_chapter_' + id
                              )
                              core.mutateWs((ws) => {
                                ws.overview.explanationId = id
                              })
                              showModal(core, 'explanation')
                            }}
                            id={`explanation-icon-${id}`}
                          >
                            <p className="text-center whitespace-nowrap flex justify-center ">
                              <span className="bg-white/50 px-2 rounded">
                                {chapterData[id].title}
                              </span>
                              {core.ws.page == 'analyze' && (
                                <span>
                                  [{core.ws.analyze.chapters[id]?.explanation}]
                                </span>
                              )}
                            </p>
                            <img
                              src={
                                isQuestDone(id)
                                  ? '/motte_farbig.png'
                                  : '/motte.png'
                              }
                              alt=""
                              className="w-[80px] mx-auto inline-block mb-2"
                            />
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
                        isQuestDone(parseInt(entry[0])) &&
                        core.ws.page != 'demo'
                      }
                      onClick={() => {
                        if (parseInt(entry[0]) == 1) {
                          submitAnalyzeEvent(
                            core,
                            'ev_click_landing_startKarol'
                          )
                        }
                        setQuestReturnToMode(
                          core.ws.page == 'demo' ? 'demo' : 'path'
                        )
                        setLearningPathScroll(
                          document.getElementById('scroll-container')
                            ?.scrollTop ?? -1
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
            )}
          <div className="flex-auto"></div>

          <div className="text-center mb-12 mt-24">
            <span className="text-gray-700 mr-7">
              {core.strings.overview.version}
            </span>
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
          {!isPersisted() &&
            numberOfSolvedQuests > 0 &&
            core.ws.overview.showSaveHint &&
            core.ws.page != 'analyze' && (
              <>
                <div className="fixed left-0 right-0 bottom-0 pb-1.5 sm:pb-0 sm:h-10 bg-yellow-100 text-center pt-1.5 z-20">
                  {core.strings.overview.storeOnDevice}{' '}
                  <div className="relative inline-block">
                    <div className="-top-[170px] -left-24 absolute bg-yellow-100/90 p-4 mx-auto w-[400px] rounded-xl border-2 border-yellow-300 shadow-lg">
                      <div className="text-center text-2xl font-bold text-yellow-800 mb-4">
                        Wir empfehlen dir, deinen Fortschritt zu speichern.
                      </div>{' '}
                      <div className="flex justify-center">
                        <div className="relative animate-bounce">
                          <FaIcon
                            icon={faArrowDown}
                            className="text-4xl text-yellow-600"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      className="px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 ml-6 rounded"
                      onClick={() => {
                        setPersist(core, true)
                        hideSaveHint(core)
                        forceRerender(core)
                        //showModal(core, 'sync')
                        submitAnalyzeEvent(
                          core,
                          'ev_click_landing_syncProgress'
                        )
                      }}
                    >
                      {core.strings.overview.syncProgress}
                    </button>
                  </div>{' '}
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
              </>
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
        <FaIcon icon={faExternalLink} className="text-xs text-gray-600" />
      </a>
    )
  }

  function isQuestVisible(id: number) {
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
        : questsInPreviousChapter.filter(isQuestDone).length > 0 ||
          (questsInPreviousChapter.length == 0 && isQuestDone(id - 1)))
    )
  }

  function renderQuestCategory(cat: (typeof questListByCategory)[number]) {
    if (cat.title.includes('.')) return null // skip python quests
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
    const showPython = data.script && index != 60

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
              'block'
            )}
            tabIndex={0}
            onClick={(e) => {
              setQuestReturnToMode('overview')
              setOverviewScroll(
                document.getElementById('scroll-container')?.scrollTop ?? -1
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
                  hideKarol={
                    questDone ||
                    !!(
                      showPython &&
                      task.target &&
                      twoWorldsEqual(task.start, task.target)
                    )
                  }
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
            {showPython && (
              <img
                src="/python-logo-only.png"
                className={clsx(
                  'absolute bottom-0 right-2 h-8 bg-white/30 rounded-lg pointer-events-auto',
                  questDone && 'opacity-30'
                )}
                alt=""
              />
            )}
          </a>
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
