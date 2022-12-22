import { faLock } from '@fortawesome/free-solid-svg-icons'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import { editCodeAndResetProgress } from '../lib/commands/mode'

import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { ErrorModal } from './ErrorModal'
import { FaIcon } from './FaIcon'
import { OptionsModal } from './OptionsModal'
import { Output } from './Output'
import { Structogram } from './Structogram'
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
          {core.ws.ui.freezeCode && (
            <div className="absolute inset-0 bg-gray-700/20 z-[100]">
              {!(
                core.ws.ui.isEndOfRun &&
                core.ws.quest.progress == 100 &&
                core.ws.ui.showOutput &&
                core.ws.quest.completed.length == 0
              ) && (
                <div className="bottom-6 left-6 right-6 h-28 absolute  rounded-lg pl-4 pt-3 flex justify-around flex-col bg-gray-200">
                  <p className="ml-2">
                    Dein Programm hat einen Auftrag erfüllt. Wenn du das
                    Programm bearbeitest, wird dein Fortschritt zurückgesetzt:
                  </p>
                  <p className="mb-3">
                    <button
                      className="px-2 py-0.5 bg-gray-300 rounded"
                      onClick={() => {
                        editCodeAndResetProgress(core)
                      }}
                    >
                      Programm bearbeiten
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}
        </ReflexElement>

        <ReflexSplitter
          style={{ width: 4 }}
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400"
        />

        <ReflexElement minSize={400}>
          {core.ws.ui.showOutput ? (
            <Output />
          ) : core.ws.ui.showStructogram ? (
            <Structogram />
          ) : (
            <Tasks />
          )}
        </ReflexElement>
      </ReflexContainer>
      {core.ws.ui.showMenu && <OptionsModal />}
      {core.ws.ui.showErrorModal && <ErrorModal />}
    </>
  )
}
