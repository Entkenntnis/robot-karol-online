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

      <div className="h-8 flex-shrink-0 flex-grow-0 border-t flex select-none">
        <div className="flex justify-center relative items-center flex-grow">
          <p className="z-10">Fortschritt: {core.ws.quest.progress}%</p>
          <div className="absolute inset-0 border-r">
            <div
              className="h-full bg-green-200"
              style={{ width: `${core.ws.quest.progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex-grow-0 flex-shrink-0 mx-2 flex items-center justify-center">
          <label>
            <input
              type="checkbox"
              className="mr-1"
              checked={core.ws.ui.showPreviewOfTarget}
              onChange={(e) => {
                setShowTarget(core, e.target.checked)
              }}
            />{' '}
            Ziel einblenden
          </label>
        </div>
      </div>
    </div>
  )
}
