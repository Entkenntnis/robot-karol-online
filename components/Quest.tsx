import {
  faCode,
  faPencil,
  faPuzzlePiece,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { editCodeAndResetProgress, setMode } from '../lib/commands/mode'
import { closeOutput } from '../lib/commands/quest'
import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { ErrorModal } from './ErrorModal'
import { FaIcon } from './FaIcon'
import { LightboxModal } from './LightboxModal'
import { NameModal } from './NameModal'
import { OptionsModal } from './OptionsModal'
import { Output } from './Output'
import { Playground } from './Playground'
import { RemixModal } from './RemixModal'
import { ResizeWorldModal } from './ResizeWorldModal'
import { ShareModal } from './ShareModal'
import { Structogram } from './Structogram'
import { Tasks } from './Tasks'
import { WorldEditor } from './WorldEditor'

export function Quest() {
  const core = useCore()

  return (
    <>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement
          className="h-full !overflow-hidden relative"
          minSize={0}
          onResize={() => {
            if (core.blockyResize) {
              core.blockyResize()
            }
          }}
        >
          <div className="h-full flex flex-col">
            <div className="flex-none h-8 bg-gray-50 flex justify-center items-start">
              <button
                className={clsx(
                  'ml-4 mr-4 border-t-4 px-3  pb-1',
                  core.ws.settings.mode == 'blocks'
                    ? 'border-t-blue-500'
                    : 'border-t-transparent',
                  core.ws.settings.mode == 'code' &&
                    (core.ws.ui.state === 'error' ||
                      core.ws.ui.toBlockWarning) &&
                    'text-gray-400',
                  core.ws.settings.mode == 'code' &&
                    core.ws.ui.state == 'ready' &&
                    !core.ws.ui.toBlockWarning
                    ? 'hover:border-t-gray-300 hover:bg-gray-200'
                    : 'cursor-default'
                )}
                onClick={() => {
                  setMode(core, 'blocks')
                }}
              >
                <FaIcon icon={faPuzzlePiece} className="mr-3" />
                Blöcke
              </button>
              <button
                className={clsx(
                  'border-t-4 px-3 pb-1',
                  core.ws.settings.mode == 'code'
                    ? 'border-t-blue-500'
                    : 'border-t-transparent',
                  core.ws.settings.mode == 'blocks' &&
                    core.ws.ui.state !== 'ready' &&
                    'text-gray-400 cursor-default',
                  core.ws.settings.mode == 'blocks' &&
                    core.ws.ui.state == 'ready'
                    ? 'hover:bg-gray-200 hover:border-t-gray-300'
                    : 'cursor-default'
                )}
                onClick={() => {
                  setMode(core, 'code')
                }}
              >
                <FaIcon icon={faCode} className="mr-3" />
                Code
              </button>
              {false &&
                window.location.hostname == 'localhost' &&
                !core.ws.ui.isEditor && (
                  <a
                    href={`/?editor=1&quest=${core.ws.quest.id}`}
                    className="underline text-gray-300 hover:text-gray-400 ml-8 mt-1"
                  >
                    Aufgabe überarbeiten
                  </a>
                )}
            </div>
            <EditArea />
          </div>
          {(core.ws.ui.isTesting || core.ws.ui.isAlreadyCompleted) && (
            <div
              className="absolute inset-0 bg-gray-700/20 z-[100]"
              onClick={() => {
                if (
                  core.ws.ui.showOutput &&
                  core.ws.ui.isEndOfRun &&
                  !core.ws.ui.controlBarShowFinishQuest
                ) {
                  closeOutput(core)
                }
                if (core.ws.ui.showOutput && core.ws.ui.state == 'error') {
                  closeOutput(core)
                }
              }}
            >
              <div
                className={clsx(
                  'bottom-6 left-6 right-6 absolute',
                  'rounded-lg pl-4 bg-gray-200',
                  core.ws.ui.isAlreadyCompleted
                    ? 'h-28 pt-3 flex justify-around flex-col'
                    : 'h-10 pt-2'
                )}
              >
                <p className="ml-2">
                  {core.ws.ui.isAlreadyCompleted
                    ? 'Dein Programm wurde erfolgreich überprüft.'
                    : 'Dein Programm wird gerade überprüft und kann nicht bearbeitet werden.'}
                </p>
                {core.ws.ui.isAlreadyCompleted && (
                  <p className="mb-3">
                    <button
                      className="px-2 py-0.5 bg-blue-300 hover:bg-blue-400 rounded"
                      onClick={() => {
                        editCodeAndResetProgress(core)
                      }}
                    >
                      <FaIcon icon={faPencil} className="mr-2" /> Programm
                      bearbeiten
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </ReflexElement>

        <ReflexSplitter
          style={{ width: 6 }}
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400"
        />

        <ReflexElement minSize={0}>
          {core.ws.ui.showOutput ? (
            <Output />
          ) : core.ws.ui.showStructogram ? (
            <Structogram />
          ) : core.ws.editor.editWorld !== null ? (
            <WorldEditor />
          ) : core.ws.ui.isPlayground ? (
            <Playground />
          ) : (
            <Tasks />
          )}
        </ReflexElement>
      </ReflexContainer>
      {core.ws.ui.showMenu && <OptionsModal />}
      {core.ws.ui.showErrorModal && <ErrorModal />}
      {core.ws.editor.showResizeWorld && <ResizeWorldModal />}
      {core.ws.editor.showShareModal && <ShareModal />}
      {core.ws.ui.showNameModal && <NameModal />}
      {core.ws.ui.imageLightbox && <LightboxModal />}
      {core.ws.ui.showRemixModal && <RemixModal />}
    </>
  )
}
