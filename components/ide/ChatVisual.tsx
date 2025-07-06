import clsx from 'clsx'
import { karolDefaultImage } from '../../lib/data/images'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { setExecutionMarker } from '../../lib/codemirror/basicSetup'
import { faTimes, faWarning } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '../helper/FaIcon'

export function ChatVisual() {
  const core = useCore()

  // check state
  // if there is no warning, just display last chat message
  // if there is warning, find out which kind of error there is and display this

  // HMMM, but actually, the runner should give me the information, because the message is not always the last one,
  // but could be a part of it, ... so yeah, move logic to the runner

  return (
    <div
      className="bg-slate-100 top-0 sticky z-[100] border-b-2 border-gray-300"
      style={{ backgroundImage: 'url("/bright-squares.png")' }}
    >
      {core.ws.ui.state != 'running' && (
        <div className="absolute right-4 top-2">
          <button
            className="rounded-full flex w-6 h-6 items-center justify-center bg-gray-100 hover:bg-gray-300"
            onClick={() => {
              core.mutateWs(({ vm, ui }) => {
                vm.chatCursor = undefined
                ui.errorMessages = []
              })
              setExecutionMarker(core, -1)
            }}
          >
            <FaIcon icon={faTimes} className="text-gray-500" />
          </button>
        </div>
      )}
      <div className="flex justify-between items-top px-8 pt-10">
        <div className="flex-shrink-0">
          <img src="/program-icon.png" className="w-20 mt-4 select-none" />
        </div>
        <div className="flex-grow-1 w-full mx-6">
          {core.ws.vm.chatVisualText && (
            <div
              className={clsx(
                'flex my-1 mx-2',
                core.ws.vm.chatVisualRole == 'in' && 'justify-end'
              )}
            >
              <div
                className={clsx(
                  'rounded-lg px-3 py-0.5 text-xl',
                  core.ws.vm.chatVisualRole == 'in'
                    ? 'bg-orange-100 rounded-br-none'
                    : core.ws.vm.chatVisualRole == 'spill'
                    ? 'bg-gray-100 rounded-bl-none'
                    : 'bg-cyan-100 rounded-bl-none'
                )}
              >
                {core.ws.vm.chatVisualText}
              </div>
            </div>
          )}
          {core.ws.vm.chatvisualWarning && (
            <div className="flex mt-8 items-center">
              <div>
                <FaIcon
                  icon={faWarning}
                  className="text-yellow-500 text-3xl mr-3"
                />
              </div>
              {core.ws.vm.chatvisualWarning == 'output-mismatch' && (
                <div>
                  <span className="text-gray-500">Deine Ausgabe</span> stimmt
                  nicht mit der{' '}
                  <span className="text-cyan-500">erwarteten Ausgabe</span>{' '}
                  überein.
                </div>
              )}
              {core.ws.vm.chatvisualWarning == 'missing-input' && (
                <div>
                  Bitte frage{' '}
                  <span className="text-orange-500">die nächste Eingabe</span>{' '}
                  mit <code className="not-italic font-bold mx-1">input()</code>{' '}
                  ab.
                </div>
              )}
              {core.ws.vm.chatvisualWarning == 'missing-output' && (
                <div>
                  Dein Programm ist frühzeitig beendet, erwarte{' '}
                  <span className="text-cyan-500">weitere Ausgaben.</span>
                </div>
              )}
            </div>
          )}
        </div>
        <View
          robotImageDataUrl={core.ws.robotImageDataUrl || karolDefaultImage}
          world={{
            dimX: 1,
            dimY: 1,
            karol: [
              {
                x: 0,
                y: 0,
                dir: core.ws.vm.chatVisualRole == 'in' ? 'west' : 'south',
              },
            ],
            blocks: [[false]],
            marks: [[false]],
            bricks: [[0]],
            height: 1,
          }}
          hideWorld
        />
      </div>
      <div className="h-6" />
    </div>
  )
}
