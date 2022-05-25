import clsx from 'clsx'
import { ReflexElement, ReflexSplitter, ReflexContainer } from 'react-reflex'

import { openMenu } from '../lib/commands/menu'
import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { FileInput } from './FileInput'
import { Ping } from './Ping'
import { Player } from './Player'

export function Workspace() {
  const core = useCore()

  return (
    <>
      {core.ws.type == 'puzzle' && core.ws.preMode && (
        <div className="absolute inset-0 bg-gray-400/60 z-20"></div>
      )}
      <FileInput />
      {core.ws.type == 'free' && (
        <button
          className={clsx(
            'absolute right-1 top-1 rounded z-10',
            'px-2 py-0.5 bg-blue-300 hover:bg-blue-400'
          )}
          onClick={() => {
            openMenu(core)
          }}
        >
          Menü
          {core.state.inviteMenu && <Ping />}
        </button>
      )}
      {core.ws.type == 'puzzle' && !core.ws.preMode && core.ws.progress < 100 && (
        <button
          className={clsx(
            'absolute right-1 top-1 rounded z-10',
            'px-2 py-0.5 bg-blue-300 hover:bg-blue-400'
          )}
          onClick={() => {
            openMenu(core)
          }}
        >
          Schließen
        </button>
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
    </>
  )
}
