import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexElement, ReflexSplitter, ReflexContainer } from 'react-reflex'

import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { FaIcon } from './FaIcon'
import { FileInput } from './FileInput'
import { Ping } from './Ping'
import { Player } from './Player'

export function Workspace() {
  const core = useCore()

  return (
    <>
      <FileInput />
      <div className="absolute right-1 top-1 z-10">
        <a
          href="https://github.com/Entkenntnis/robot-karol-web#readme"
          target="_blank"
          className="mr-3 text-lg text-blue-500 hover:text-blue-600"
          rel="noreferrer"
        >
          <FaIcon icon={faCircleInfo} style={{ verticalAlign: '-4px' }} />
        </a>
      </div>

      <ReflexContainer
        orientation="vertical"
        windowResizeAware
        className="h-full"
      >
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
          <Player />
        </ReflexElement>
      </ReflexContainer>
    </>
  )
}
