import clsx from 'clsx'

import { setShowTarget } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'
import { ControlBar } from './ControlBar'
import { View } from './View'

export function Output() {
  const core = useCore()
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow-0 flex-shrink-0 h-[80px] bg-gray-100">
        <ControlBar />
      </div>
      <div
        className={clsx(
          'flex-grow flex-shrink h-full flex items-center',
          'justify-center overflow-auto relative'
        )}
      >
        <View
          world={core.ws.world}
          preview={
            core.ws.ui.showPreviewOfTarget &&
            core.ws.quest.lastStartedTask !== undefined
              ? {
                  world:
                    core.ws.quest.tasks[core.ws.quest.lastStartedTask!].target,
                  track: [],
                }
              : undefined
          }
          className={clsx(
            'mb-32 mt-12 p-6',
            core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
          )}
        />
      </div>
    </div>
  )
}
