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
      {core.ws.type == 'puzzle' &&
        !core.ws.preMode &&
        core.ws.progress < 100 &&
        core.ws.ui.state !== 'running' && (
          <div className="absolute right-1 top-1  z-10">
            {core.ws.code.trim() !== core.puzzle.code.trim() &&
              core.ws.progress > 0 && (
                <button
                  className="px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 rounded mr-2"
                  onClick={() => {
                    openMenu(core)
                    core.setWsToStorage(
                      core.puzzle.id,
                      core.ws.world,
                      core.ws.code
                    )
                  }}
                >
                  Speichern &amp; schließen
                </button>
              )}
            <button
              className={clsx(
                'rounded',
                'px-2 py-0.5 bg-blue-300 hover:bg-blue-400'
              )}
              onClick={() => {
                if (
                  core.ws.type == 'puzzle' &&
                  core.ws.code.trim() !== core.puzzle.code.trim() &&
                  core.ws.progress > 0
                ) {
                  const val = confirm(
                    'Ungespeicherte Änderungen gehen verloren. Fortfahren?'
                  )
                  if (val) {
                    core.deleteWsFromStorage(core.puzzle.id)
                  } else {
                    return
                  }
                }
                openMenu(core)
              }}
            >
              Schließen
            </button>
          </div>
        )}
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
