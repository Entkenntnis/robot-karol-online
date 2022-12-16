import clsx from 'clsx'
import { isUint16Array } from 'util/types'

import { useCore } from '../lib/state/core'
import { ControlBar } from './ControlBar'
import { View } from './View'

export function Output() {
  const core = useCore()
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow-0 flex-shrink-0 border-b">
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
            core.ws.ui.lastStartedTask !== undefined
              ? {
                  world: core.ws.tasks[core.ws.ui.lastStartedTask!].target,
                  track: [],
                }
              : undefined
          }
          className="mb-32 mt-12"
        />
        <div className="absolute bottom-2 left-2 bg-gray-50">
          {core.ws.ui.messages.map((m) => (
            <div key={`${m.ts}`}>
              {m.text}
              {m.count > 1 && <span> (x{m.count})</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="h-8 flex-shrink-0 flex-grow-0 border-t flex select-none">
        <div className="flex justify-center relative items-center flex-grow">
          <p className="z-10">Fortschritt: {core.ws.ui.progress}%</p>
          <div className="absolute inset-0 border-r">
            <div
              className="h-full bg-green-200"
              style={{ width: `${core.ws.ui.progress}%` }}
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
                core.mutateWs(({ ui }) => {
                  ui.showPreviewOfTarget = e.target.checked
                })
              }}
            />{' '}
            Ziel einblenden
          </label>
        </div>
      </div>
    </div>
  )
}
