import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { resetOutput } from '../lib/commands/quest'

import { useCore } from '../lib/state/core'
import { ControlBar } from './ControlBar'
import { FaIcon } from './FaIcon'
import { TaskRunnerOverview } from './TaskRunnerOverview'
import { View } from './View'

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
                        track: [],
                      }
                    : undefined
                }
                className={clsx(
                  'p-6',
                  core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
                )}
              />
            </div>
          </div>
        </div>
        {!core.ws.ui.isTesting && (
          <div className="absolute bottom-3 left-4">
            {core.ws.quest.tasks[core.ws.quest.lastStartedTask!].title}
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
      {core.ws.ui.isTesting && <TaskRunnerOverview />}
    </div>
  )
}
