import {
  faArrowLeft,
  faCaretDown,
  faCaretUp,
  faCheck,
  faComment,
  faLeftLong,
  faRightLong,
  faTrashCan,
  faUpLong,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { closeOutput, resetOutput } from '../../lib/commands/quest'

import { useCore } from '../../lib/state/core'
import { ControlBar } from './ControlBar'
import { FaIcon } from '../helper/FaIcon'
import { TaskRunnerOverview } from './TaskRunnerOverview'
import { View } from '../helper/View'
import { abort } from '../../lib/commands/vm'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { View2D } from '../helper/View2D'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { sliderToDelay } from '../../lib/helper/speedSlider'
import { exitBench } from '../../lib/commands/bench'
import { PythonConsole } from '../helper/PythonConsole'
import {
  left,
  right,
  forward,
  toggleMark,
  brick,
  toggleBlock,
  unbrick,
} from '../../lib/commands/world'

export function Output() {
  const core = useCore()

  const actions: { [key: string]: () => boolean } = {
    ArrowLeft: () => {
      left(core)
      return true
    },
    ArrowRight: () => {
      right(core)
      return true
    },
    ArrowUp: () => {
      return forward(core)
    },
    ArrowDown: () => {
      return forward(core, { reverse: true })
    },
    KeyM: () => {
      toggleMark(core)
      return true
    },
    KeyH: () => {
      return brick(core)
    },
    KeyA: () => {
      return unbrick(core)
    },
  }

  function runAction(action: string) {
    if (core.ws.editor.showWorldPreview) return
    if (!actions[action]()) {
      core.mutateWs((ws) => {
        ws.ui.karolCrashMessage = undefined
      })
    }
  }

  const variables: { [key: string]: number } = {}
  core.ws.vm.frames.forEach((frame) => {
    for (const key in frame.variables) {
      variables[key] = frame.variables[key]
    }
  })
  const varStr = Object.entries(variables)
    .map((entry) => `${entry[0]} = ${entry[1]}`)
    .join(', ')

  const hasPreview =
    core.ws.quest.lastStartedTask !== undefined &&
    !!core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target

  const preview = core.ws.ui.isTesting
    ? core.ws.quest.lastStartedTask !== undefined
      ? {
          world:
            core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target ??
            core.ws.quest.tasks[core.ws.quest.lastStartedTask!].start,
        }
      : undefined
    : hasPreview && core.ws.ui.showPreview
    ? {
        world: core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target!,
      }
    : undefined

  const minimalModeForQuestScript = core.ws.editor.questScript && !hasPreview

  return (
    <div className="flex flex-col h-full relative">
      <div className="border-b-2 border-gray-200">
        <div className="p-4 px-7 bg-yellow-100 relative">
          <button
            className="absolute top-2 right-4 w-8 h-8 rounded-full bg-gray-200/50"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_ide_toggleDescriptionCollapse')
              core.mutateWs((ws) => {
                ws.ui.collapseDescription = !ws.ui.collapseDescription
              })
            }}
          >
            {!core.ws.ui.collapseDescription ? (
              <FaIcon className="text-xl" icon={faCaretUp} />
            ) : (
              <FaIcon className="text-xl" icon={faCaretDown} />
            )}
          </button>
          <h1
            className={clsx(
              'text-xl font-bold mt-1',
              !core.ws.ui.collapseDescription ? 'mb-4' : 'mb-0'
            )}
          >
            {core.ws.quest.title}
            {core.ws.ui.isAlreadyCompleted && (
              <span className="text-base font-normal text-green-600 ml-4">
                <FaIcon icon={faCheck} /> {core.strings.ide.taskCompleted}
              </span>
            )}
          </h1>
          {!core.ws.ui.collapseDescription && (
            <div>{processMarkdown(core.ws.quest.description)}</div>
          )}
        </div>
      </div>
      <div
        className={clsx(
          'flex-grow-0 flex-shrink-0 min-h-[82px] bg-gray-100',
          minimalModeForQuestScript && 'hidden'
        )}
      >
        <ControlBar />
      </div>
      <div className="flex-grow flex-shrink relative h-full">
        <div
          className={clsx(
            'absolute top-0 left-0 right-0',
            'overflow-auto bg-white',
            core.ws.ui.isTesting ? 'bottom-0' : 'bottom-10'
          )}
        >
          <div className="flex flex-col h-full">
            <div
              className={clsx(
                'm-auto transition-opacity',
                core.ws.ui.questPrompt && 'opacity-30'
              )}
            >
              <div
                className={clsx(
                  'w-fit h-fit mt-4 mx-4',
                  !core.ws.ui.show2D && 'mb-32'
                )}
              >
                {core.ws.ui.show2D ? (
                  <View2D
                    world={core.ws.world}
                    preview={preview}
                    className={clsx(
                      'p-6',
                      core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
                    )}
                    canvas={core.ws.canvas}
                  />
                ) : (
                  <View
                    world={core.ws.world}
                    preview={preview}
                    className={clsx(
                      'p-6',
                      core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
                    )}
                    robotImageDataUrl={core.ws.robotImageDataUrl}
                    animationDuration={Math.min(
                      200,
                      sliderToDelay(core.ws.ui.speedSliderValue)
                    )}
                    activeRobot={core.ws.__activeRobot}
                    canvas={core.ws.canvas}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        {core.ws.ui.state === 'running' &&
          core.ws.ui.proMode &&
          core.ws.settings.language == 'java' &&
          varStr && (
            <div className="absolute left-2 top-2">Variablen: {varStr}</div>
          )}
        {core.ws.ui.inputPrompt && (
          <form
            className="bg-lime-200 px-2 py-3 flex gap-4 items-baseline absolute top-0 left-0 right-0 z-10"
            onSubmit={(e) => {
              const el = document.getElementById('input-prompt') as
                | HTMLInputElement
                | undefined
              if (el && core.worker) {
                core.worker.input(el.value)
              }
              e.preventDefault()
            }}
          >
            <span>
              <FaIcon icon={faComment} className="mr-2 animate-pulse" />
              {core.ws.ui.inputPrompt}
            </span>
            <input
              id="input-prompt"
              className="flex-grow px-1"
              maxLength={200}
              autoFocus
              required
              autoComplete="off"
            ></input>
            <button
              className="px-2 py-0.5 bg-lime-400 hover:bg-lime-500 rounded"
              type="submit"
            >
              Enter
            </button>
          </form>
        )}
        {core.ws.ui.keybindings.length > 0 && (
          <div className="top-3 left-3 absolute">
            <div>Tasten:</div>
            <div className="flex gap-4 mt-2">
              {core.ws.ui.keybindings.map((el, i) => {
                return (
                  <div
                    key={i}
                    className={clsx(
                      'px-5 py-3 border-2 cursor-pointer select-none hover:bg-lime-50 rounded-lg active:bg-lime-200 active:scale-95 transition-all',
                      el.pressed && 'bg-lime-200'
                    )}
                    title={el.title}
                    onPointerDown={(e) => {
                      // set pressed to true
                      core.mutateWs((ws) => {
                        const binding = ws.ui.keybindings.find(
                          (binding) => binding.key === el.key
                        )
                        if (binding) {
                          binding.pressed = true
                        }
                      })
                    }}
                    onPointerUp={(e) => {
                      // set pressed to false
                      core.mutateWs((ws) => {
                        const binding = ws.ui.keybindings.find(
                          (binding) => binding.key === el.key
                        )
                        if (binding) {
                          binding.pressed = false
                        }
                      })
                    }}
                    onPointerCancel={(e) => {
                      // ensure pressed is false if the pointer is canceled
                      core.mutateWs((ws) => {
                        const binding = ws.ui.keybindings.find(
                          (binding) => binding.key === el.key
                        )
                        if (binding) {
                          binding.pressed = false
                        }
                      })
                    }}
                  >
                    {el.key}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <PythonConsole />
      </div>
      {core.ws.canvas.manualControl && (
        <div className="absolute bottom-10 bg-gray-200/20 rounded left-2">
          <button
            className="mx-3 py-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('ArrowLeft')
            }}
            title="LinksDrehen"
          >
            <FaIcon icon={faLeftLong} />
          </button>
          <button
            className="px-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('ArrowUp')
            }}
            title="Schritt"
          >
            <FaIcon icon={faUpLong} />
          </button>
          <button
            className="mx-3 py-2 enabled:hover:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('ArrowRight')
            }}
            title="RechtsDrehen"
          >
            <FaIcon icon={faRightLong} />
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('KeyH')
            }}
            title="Hinlegen"
          >
            <u>H</u>inlegen
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('KeyA')
            }}
            title="Aufheben"
          >
            <u>A</u>ufheben
          </button>
          <button
            className="mx-2 hover:enabled:text-black text-gray-700 disabled:text-gray-300"
            disabled={core.ws.editor.showWorldPreview}
            onClick={() => {
              runAction('KeyM')
            }}
            title="MarkeSetzen / MarkeLöschen"
          >
            <u>M</u>arke setzen/löschen
          </button>
        </div>
      )}
      {core.ws.quest.lastStartedTask !== undefined && (
        <div className="absolute bottom-1.5 left-2 whitespace-nowrap">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              if (core.ws.ui.isBench) {
                exitBench(core)
              } else if (
                core.ws.settings.language == 'python-pro' &&
                core.worker &&
                core.ws.ui.state == 'running'
              ) {
                core.worker.reset()
              } else if (core.ws.ui.state == 'running') {
                abort(core)
              }
              closeOutput(core)
            }}
          >
            <FaIcon icon={faArrowLeft} className="mx-1" />{' '}
            {core.strings.ide.back}
          </button>
          {!core.ws.ui.isPlayground &&
            !core.ws.ui.isTesting &&
            core.ws.quest.id <= 0 &&
            !minimalModeForQuestScript &&
            hasPreview && (
              <span className="ml-12 bg-white/80 rounded p-1 small:inline">
                <label className="select-none cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={core.ws.ui.showPreview}
                    onChange={(e) => {
                      submitAnalyzeEvent(core, 'ev_click_ide_togglePreview')
                      core.mutateWs((ws) => {
                        ws.ui.showPreview = e.target.checked
                      })
                    }}
                  />{' '}
                  {core.strings.ide.preview}
                </label>
              </span>
            )}
          {!core.ws.ui.isTesting && !minimalModeForQuestScript && (
            <span className="ml-6 bg-white/80 rounded p-1">
              <label className="select-none cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={core.ws.ui.show2D}
                  onChange={(e) => {
                    submitAnalyzeEvent(core, 'ev_click_ide_toggle2DView')
                    core.mutateWs((ws) => {
                      ws.ui.show2D = e.target.checked
                    })
                  }}
                />{' '}
                2D-Ansicht
              </label>
            </span>
          )}
        </div>
      )}
      {core.ws.ui.isEndOfRun &&
        !core.ws.ui.controlBarShowFinishQuest &&
        !core.ws.ui.isTesting && (
          <button
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_ide_clear')
              resetOutput(core)
            }}
            className="px-2 py-0.5 rounded bg-gray-200 ml-3 absolute bottom-2 right-2 hover:bg-gray-300"
          >
            <FaIcon icon={faTrashCan} className="mr-1" />
            {core.strings.ide.clear}
          </button>
        )}
      <div className="max-h-[30%] flex-grow flex-shrink-0 overflow-auto bg-gray-100 pl-32">
        {core.ws.ui.isTesting && <TaskRunnerOverview />}
      </div>
    </div>
  )
}
