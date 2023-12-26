import {
  faArrowLeft,
  faCaretLeft,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { closeOutput, resetOutput } from '../../lib/commands/quest'

import { useCore } from '../../lib/state/core'
import { ControlBar } from './ControlBar'
import { FaIcon } from '../helper/FaIcon'
import { TaskRunnerOverview } from './TaskRunnerOverview'
import { View } from '../helper/View'
import { abort } from '../../lib/commands/vm'

export function Output() {
  const core = useCore()
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
        <div className="flex flex-col h-full">
          <div className="m-auto">
            <div className="w-fit h-fit mb-32 mt-4 mx-4">
              <View
                world={core.ws.world}
                preview={
                  core.ws.ui.showPreviewOfTarget &&
                  core.ws.quest.lastStartedTask !== undefined &&
                  core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target
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
              Ausgabe leeren
            </button>
          )}
      </div>
      <div className="max-h-[30%] flex-grow flex-shrink-0 overflow-auto bg-gray-100 pl-32">
        {core.ws.ui.isTesting && <TaskRunnerOverview />}
      </div>
    </div>
  )
}
