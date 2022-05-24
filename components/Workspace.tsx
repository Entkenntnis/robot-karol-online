import { ReflexElement, ReflexSplitter, ReflexContainer } from 'react-reflex'
import 'react-reflex/styles.css'
import { useCore } from '../lib/state/core'

import { EditArea } from './EditArea'
import { Player } from './Player'

export function Workspace() {
  const core = useCore()

  return (
    <div className="overflow-hidden flex-grow">
      {core.ws.type == 'puzzle' && core.ws.preMode && (
        <div className="absolute inset-0 bg-gray-400/60 z-20"></div>
      )}
      <ReflexContainer
        orientation="vertical"
        windowResizeAware
        className="h-full"
      >
        <ReflexElement className="h-full" minSize={330}>
          <EditArea />
        </ReflexElement>

        <ReflexSplitter style={{ width: 3 }} />

        <ReflexElement minSize={400}>
          <Player />
        </ReflexElement>
      </ReflexContainer>
    </div>
  )
}
