import { faLock } from '@fortawesome/free-solid-svg-icons'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { ErrorModal } from './ErrorModal'
import { FaIcon } from './FaIcon'
import { Menu } from './Menu'
import { Output } from './Output'
import { Tasks } from './Tasks'

export function Quest() {
  const core = useCore()

  return (
    <>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement
          className="h-full !overflow-hidden"
          minSize={500}
          onResize={() => {
            if (core.blockyResize) {
              core.blockyResize()
            }
          }}
        >
          <EditArea />
          {core.ws.quest.completed.length > 0 && (
            <div className="absolute inset-0 bg-gray-700/20 z-[100]">
              <div className="bottom-8 left-6 right-6 h-24 absolute bg-white rounded-lg pl-6 pt-3">
                <p>
                  <FaIcon
                    icon={faLock}
                    className="text-xl bg-white rounded-full  inline-block"
                  />{' '}
                  Code eingefroren
                </p>
                <p>
                  Wenn du Code bearbeiten willst wird Fortschritt zurückgesetzt.
                </p>
                <p>
                  <button>Code bearbeiten</button>
                </p>
              </div>
            </div>
          )}
        </ReflexElement>

        <ReflexSplitter
          style={{ width: 4 }}
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400"
        />

        <ReflexElement minSize={400}>
          {core.ws.ui.showOutput ? <Output /> : <Tasks />}
        </ReflexElement>
      </ReflexContainer>
      {core.ws.ui.showMenu && <Menu />}
      {core.ws.ui.showErrorModal && <ErrorModal />}
    </>
  )
}
