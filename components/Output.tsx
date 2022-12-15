import clsx from 'clsx'

import { useCore } from '../lib/state/core'
import { ControlBar } from './ControlBar'
import { View } from './View'

export function Output() {
  const core = useCore()
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 flex-grow-0 flex-shrink-0 border-b">
        <ControlBar />
      </div>
      <div
        className={clsx(
          'flex-grow flex-shrink h-full flex items-center',
          'justify-center overflow-auto'
        )}
      >
        <View world={core.ws.world} className="mb-32 mt-12" />
      </div>
    </div>
  )
}
