import { useEffect } from 'react'
import { ReflexElement, ReflexSplitter, ReflexContainer } from 'react-reflex'
import 'react-reflex/styles.css'
import { initWorld } from '../lib/commands/world'
import { useCore } from '../lib/state/core'

import { EditArea } from './EditArea'
import { Player } from './Player'

export function Workspace() {
  const core = useCore()

  useEffect(() => {
    if (core.ws.type == 'level' && !core.ws.worldInit) {
      initWorld(core)
    }
  }, [core])

  return (
    <div className="overflow-hidden flex-grow">
      {/* @ts-ignore https://github.com/leefsmp/Re-Flex/issues/158 */}
      <ReflexContainer
        orientation="vertical"
        windowResizeAware
        className="h-full"
      >
        {/* @ts-ignore https://github.com/leefsmp/Re-Flex/issues/158 */}
        <ReflexElement className="h-full" minSize={400}>
          <EditArea />
        </ReflexElement>

        <ReflexSplitter style={{ width: 3 }} />

        {/* @ts-ignore https://github.com/leefsmp/Re-Flex/issues/158 */}
        <ReflexElement minSize={400}>
          <Player />
        </ReflexElement>
      </ReflexContainer>
    </div>
  )
}
