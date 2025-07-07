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
      <div className="flex justify-between items-center px-8 pt-10">
        <div className="flex-shrink-0">
          <img src="/program-icon.png" className="w-20 mt-4 select-none" />
        </div>
        <div className="flex-grow w-full mx-6 flex-shrink">
          {core.ws.vm.chatVisualText && (
            <div
              className={clsx(
                'flex my-1 mx-2',
                core.ws.vm.chatVisualRole == 'in' && 'justify-end'
              )}
            >
              <div
                className={clsx(
                  // Base styles for all bubbles
                  'relative rounded-xl px-4 py-2 text-xl shadow-md',

                  // Styles for "in" bubble (user input, on the right)
                  core.ws.vm.chatVisualRole == 'in' && [
                    'bg-orange-200 rounded-br-none',
                    // The tail using the ::after pseudo-element
                    "after:content-[''] after:absolute after:bottom-0 after:right-[-8px]",
                    'after:w-0 after:h-0 after:border-solid after:border-[8px]',
                    'after:border-transparent after:border-b-orange-200',
                  ],

                  // Styles for "out" bubble (program output, on the left)
                  core.ws.vm.chatVisualRole == 'out' && [
                    'bg-cyan-200 rounded-bl-none',
                    // The tail using the ::after pseudo-element
                    "after:content-[''] after:absolute after:bottom-0 after:left-[-8px]",
                    'after:w-0 after:h-0 after:border-solid after:border-[8px]',
                    'after:border-transparent after:border-b-cyan-200',
                  ],

                  // Styles for "spill" bubble (also on the left)
                  core.ws.vm.chatVisualRole == 'spill' && [
                    'bg-gray-200 rounded-bl-none',
                    // The tail using the ::after pseudo-element
                    "after:content-[''] after:absolute after:bottom-0 after:left-[-8px]",
                    'after:w-0 after:h-0 after:border-solid after:border-[8px]',
                    'after:border-transparent after:border-b-gray-200',
                  ]
                )}
              >
                {core.ws.vm.chatVisualText}
              </div>
            </div>
          )}
          {core.ws.vm.chatvisualWarning && (
            <div className="flex mt-8 items-center bg-yellow-50 text-yellow-900 p-3 rounded-lg border border-yellow-200">
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
              {core.ws.vm.chatvisualWarning == 'no-input-here' && (
                <div>
                  Keine Eingabe verfügbar, erwarte{' '}
                  <span className="text-cyan-500">weitere Ausgaben.</span>
                </div>
              )}
              {core.ws.vm.chatvisualWarning == 'no-input-here-at-end' && (
                <div>Keine Eingabe verfügbar.</div>
              )}
              {core.ws.vm.chatvisualWarning == 'no-output-here-at-end' && (
                <div>
                  Du hast etwas ausgegeben, aber keine weitere Ausgabe erwartet.
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
          className="flex-shrink-0 h-fit"
        />
      </div>
      <div className="h-6" />
    </div>
  )
}
