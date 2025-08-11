import clsx from 'clsx'
import { useState } from 'react'
import { FaIcon } from './FaIcon'
import {
  faExternalLink,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { useCore } from '../../lib/state/core'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { navigate } from '../../lib/commands/router'
import {
  setLearningPathScroll,
  setMiniProjectCollapsed,
  setQuestReturnToMode,
} from '../../lib/storage/storage'
import { getExampleId } from '../../lib/data/pythonExamples'
import { PythonProjectGroup } from '../../lib/state/types'

interface PythonMiniProjectsProps {
  maxMapY: number
  groups: PythonProjectGroup[]
}

export function PythonMiniProjects({
  maxMapY,
  groups,
}: PythonMiniProjectsProps) {
  const core = useCore()

  return (
    <div
      className="absolute left-[200px] z-10"
      style={{ top: `${maxMapY + 100}px` }}
    >
      <div className="bg-white/20 rounded-lg p-4 shadow-lg w-[880px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center rounded-md"
            aria-expanded={core.ws.ui.miniProjectsOpen}
            aria-controls="python-mini-projects-content"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_landing_toggleMiniProjects')
              core.mutateWs((ws) => {
                ws.ui.miniProjectsOpen = !ws.ui.miniProjectsOpen
                if (ws.ui.miniProjectsOpen) {
                  setMiniProjectCollapsed(false)
                } else {
                  setMiniProjectCollapsed(true)
                }
              })
            }}
          >
            <img
              src="/python-logo-only.png"
              alt="Python"
              className="h-9 mr-2"
            />
            <p className="font-bold mb-1 text-gray-500 text-lg">
              Bonus: Python Mini-Projekte
            </p>
            <FaIcon
              icon={faChevronDown}
              className={clsx(
                'ml-2 text-gray-500 transition-transform transform',
                core.ws.ui.miniProjectsOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </button>
          <a
            className="link text-gray-600 text-sm"
            href="https://github.com/Entkenntnis/robot-karol-online/blob/main/RKO-MODULE.md"
            target="_blank"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_landing_moduleDocs')
            }}
          >
            <code>rko</code> Modul Dokumentation{' '}
            <FaIcon icon={faExternalLink} className="text-xs text-gray-600" />
          </a>
        </div>

        {core.ws.ui.miniProjectsOpen && (
          <div id="python-mini-projects-content">
            <p className="mb-3 mt-1 text-right hidden">
              {/* ... hidden link for teachers ... */}
            </p>

            <div className="flex flex-col gap-y-3 mt-3">
              {groups.map((group) => (
                <div
                  key={group.title}
                  className="flex gap-x-6 items-start border-t border-gray-300/80 pt-3"
                >
                  <div className="w-1/3 shrink-0 pt-2.5 pl-2">
                    <h3
                      className={clsx('font-semibold text-left', group.color)}
                    >
                      {group.title}
                    </h3>
                  </div>

                  <div className="w-2/3 flex flex-wrap gap-2">
                    {group.tasks.map((example) => (
                      <a
                        href={`/${example.link}`}
                        key={example.link}
                        className={clsx(
                          'p-2.5 rounded-md transition-all hover:shadow-md w-[162px] block cursor-pointer bg-white/50 hover:bg-white/70 border',
                          typeof window !== 'undefined' &&
                            window.localStorage.getItem(
                              `robot_karol_online_shared_quest_${example.link
                                .substring(1)
                                .toLowerCase()}_program`
                            )
                            ? group.highlightColor
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
                            document.getElementById('scroll-container')
                              ?.scrollTop ?? -1
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
          </div>
        )}
      </div>
    </div>
  )
}
