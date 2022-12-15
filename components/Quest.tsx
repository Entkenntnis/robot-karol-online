import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { Output } from './Output'
import { Tasks } from './Tasks'

export function Quest() {
  const core = useCore()

  return (
    <ReflexContainer orientation="vertical" windowResizeAware>
      <ReflexElement
        className="h-full"
        minSize={500}
        onResize={() => {
          if (core.blockyResize) {
            core.blockyResize()
          }
        }}
      >
        <EditArea />
      </ReflexElement>

      <ReflexSplitter style={{ width: 3 }} />

      <ReflexElement minSize={400}>
        {core.ws.ui.showOutput ? <Output /> : <Tasks />}
      </ReflexElement>
    </ReflexContainer>
  )
}
