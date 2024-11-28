import {
  faArrowLeft,
  faCaretLeft,
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

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-grow-0 flex-shrink-0 min-h-[82px] bg-gray-100">
        <ControlBar />
      </div>
      <div
        className={clsx(
          'flex-grow flex-shrink h-full',
          'overflow-auto bg-white'
        )}
      >
        <div className="flex flex-col h-full relative">
          <div className="m-auto">
            <div className="w-fit h-fit mb-32 mt-4 mx-4">
              <View
                world={core.ws.world}
                preview={
                  core.ws.ui.showPreviewOfTarget &&
                  core.ws.quest.lastStartedTask !== undefined &&
                  core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target &&
                  core.ws.ui.showPreview
                    ? {
                        world:
                          core.ws.quest.tasks[core.ws.quest.lastStartedTask!]
                            .target!,
                      }
                    : undefined
                }
                className={clsx(
                  'p-6',
                  core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
                )}
                appearance={core.ws.appearance}
              />
            </div>
          </div>
          {core.ws.ui.state === 'running' && core.ws.ui.proMode && varStr && (
            <div className="absolute left-2 top-2">Variablen: {varStr}</div>
          )}
        </div>
        {core.ws.quest.lastStartedTask !== undefined && (
          <div className="absolute bottom-1.5 left-2">
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
              <span className="ml-12">
                <label className="select-none cursor-pointer">
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
      <div className="max-h-[30%] flex-grow flex-shrink-0 overflow-auto bg-gray-100 pl-32">
        {core.ws.ui.isTesting && <TaskRunnerOverview />}
      </div>
    </div>
  )
}
