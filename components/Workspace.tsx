import { ReflexElement, ReflexSplitter, ReflexContainer } from 'react-reflex'
import 'react-reflex/styles.css'

import { useCore } from '../lib/core'
import { EditArea } from './EditArea'
import { Player } from './Player'

export function Workspace() {
  const core = useCore()

  if (
    core.state.workspaces[core.state.currentWorkspace].title == 'Freier Modus'
  ) {
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

  return (
    <div className="m-4">
      Du bist im Workspace{' '}
      {core.state.workspaces[core.state.currentWorkspace].title}
    </div>
  )
}
