import {
  faArrowLeft,
  faCaretDown,
  faCaretUp,
  faCheck,
  faComment,
  faTrashCan,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { closeOutput, resetOutput } from '../../lib/commands/quest'

import { useCore } from '../../lib/state/core'
import { ControlBar } from './ControlBar'
import { FaIcon } from '../helper/FaIcon'
import { TaskRunnerOverview } from './TaskRunnerOverview'
import { View } from '../helper/View'
import { abort } from '../../lib/commands/vm'
import { showModal } from '../../lib/commands/modal'
import { renderDescription } from '../../lib/helper/processMiniMarkdown'
import { useState } from 'react'
import { View2D } from '../helper/View2D'

export function Output() {
  const core = useCore()
  const variables: { [key: string]: number } = {}
  core.ws.vm.frames.forEach((frame) => {
    for (const key in frame.variables) {
      variables[key] = frame.variables[key]
    }
  })
  const varStr = Object.entries(variables)
    .map((entry) => `${entry[0]} = ${entry[1]}`)
    .join(', ')

  const preview =
    core.ws.ui.showPreviewOfTarget &&
    core.ws.quest.lastStartedTask !== undefined &&
    core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target &&
    core.ws.ui.showPreview
      ? {
          world: core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target!,
        }
      : undefined

  return (
    <div className="flex flex-col h-full relative">
      {core.ws.page !== 'editor' && (
        <div className="border-b-2 border-gray-200">
          <div className="p-4 px-7 bg-yellow-100 relative">
            <button
              className="absolute top-2 right-4 w-8 h-8 rounded-full bg-gray-200/50"
              onClick={() => {
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
              <div>{renderDescription(core)}</div>
            )}
          </div>
        </div>
      )}
      <div className="flex-grow-0 flex-shrink-0 min-h-[82px] bg-gray-100">
        <ControlBar />
      </div>
      <div
        className={clsx(
          'flex-grow flex-shrink h-full',
          'overflow-auto bg-white mb-10'
        )}
      >
        <div className="flex flex-col h-full relative">
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
          <div className="m-auto">
            <div className="w-fit h-fit mb-32 mt-4 mx-4">
              {core.ws.ui.show2D ? (
                <View2D
                  world={core.ws.world}
                  preview={preview}
                  className={clsx(
                    'p-6',
                    core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
                  )}
                />
              ) : (
                <View
                  world={core.ws.world}
                  preview={preview}
                  className={clsx(
                    'p-6',
                    core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
                  )}
                  appearance={core.ws.appearance}
                />
              )}
            </div>
          </div>
          {core.ws.ui.state === 'running' &&
            core.ws.ui.proMode &&
            core.ws.settings.language == 'java' &&
            varStr && (
              <div className="absolute left-2 top-2">Variablen: {varStr}</div>
            )}
        </div>
        {core.ws.quest.lastStartedTask !== undefined && (
          <div className="absolute bottom-1.5 left-2 whitespace-nowrap">
            <button
              className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => {
                if (core.ws.ui.state == 'running') {
                  abort(core)
                }
                closeOutput(core)
              }}
            >
              <FaIcon icon={faArrowLeft} className="mx-1" />{' '}
              {core.strings.ide.back}
            </button>
            {core.ws.ui.isPlayground && core.ws.ui.state !== 'running' && (
              <button
                className="ml-3 px-2 py-0.5 bg-blue-200 hover:bg-blue-300 rounded"
                onClick={() => {
                  showModal(core, 'resize')
                }}
              >
                <FaIcon
                  icon={faUpRightAndDownLeftFromCenter}
                  className="mr-2"
                />
                {core.strings.editor.changeSize}
              </button>
            )}
            {!core.ws.ui.isPlayground && !core.ws.ui.isTesting && (
              <span className="ml-12 bg-white/80 rounded p-1">
                <label className="select-none cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={core.ws.ui.showPreview}
                    onChange={(e) => {
                      core.mutateWs((ws) => {
                        ws.ui.showPreview = e.target.checked
                      })
                    }}
                  />{' '}
                  {core.strings.ide.preview}
                </label>
              </span>
            )}
            {!core.ws.ui.isTesting && (
              <span className="ml-6 bg-white/80 rounded p-1">
                <label className="select-none cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={core.ws.ui.show2D}
                    onChange={(e) => {
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
                resetOutput(core)
              }}
              className="px-2 py-0.5 rounded bg-gray-200 ml-3 absolute bottom-2 right-2 hover:bg-gray-300"
            >
              <FaIcon icon={faTrashCan} className="mr-1" />
              {core.strings.ide.clear}
            </button>
          )}
      </div>
      {core.ws.settings.language == 'python-pro' && (
        <div className="absolute bottom-12 left-2 bg-gray-50">
          {core.ws.ui.messages.map((m) => (
            <div key={`${m.ts}-${m.text}`} className="max-w-full">
              {m.text}
              {m.count > 1 && <span> (x{m.count})</span>}
            </div>
          ))}
        </div>
      )}
      <div className="max-h-[30%] flex-grow flex-shrink-0 overflow-auto bg-gray-100 pl-32">
        {core.ws.ui.isTesting && <TaskRunnerOverview />}
      </div>
    </div>
  )
}
