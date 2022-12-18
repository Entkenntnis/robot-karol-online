import {
  faCaretLeft,
  faCircleCheck,
  faRotateRight,
  faStop,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'

import { setSpeedSliderValue } from '../lib/commands/mode'
import {
  closeOutput,
  finishTask,
  resetOutput,
  restartProgram,
} from '../lib/commands/quest'
import { abort, run } from '../lib/commands/vm'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'

export function ControlBar() {
  const core = useCore()
  if (
    core.ws.quest.progress == 100 &&
    core.ws.ui.state != 'running' &&
    core.ws.ui.messages.some((m) => m.text.includes('Ausführung beendet'))
  ) {
    return (
      <div className="flex items-center justify-center p-2">
        <p className="text-center">
          Gut gemacht! Du hast den Auftrag erfolgreich erfüllt.
          <br />
          <button
            onClick={() => {
              finishTask(core)
            }}
            className="px-2 py-0.5 rounded bg-green-200 ml-3 mt-3 mb-2"
          >
            <FaIcon icon={faCircleCheck} className="mr-1" />
            Abschließen
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        {core.ws.ui.state != 'running' && (
          <button
            onClick={() => {
              closeOutput(core)
            }}
            className="px-2 py-0.5 rounded bg-gray-200 ml-3"
          >
            <FaIcon icon={faCaretLeft} className="mr-1" />
            Übersicht
          </button>
        )}
        {core.ws.ui.state != 'running' && (
          <>
            <button
              onClick={() => {
                restartProgram(core)
              }}
              className="px-2 py-0.5 rounded bg-yellow-200 ml-3"
            >
              <FaIcon icon={faRotateRight} className="mr-1" />
              Programm neu starten
            </button>
            {core.ws.world !=
              core.ws.quest.tasks[core.ws.quest.lastStartedTask!].start && (
              <button
                onClick={() => {
                  resetOutput(core)
                }}
                className="px-2 py-0.5 rounded bg-gray-200 ml-3"
              >
                <FaIcon icon={faTrashCan} className="mr-1" />
                zurücksetzen
              </button>
            )}
          </>
        )}
        {core.ws.ui.state == 'running' && (
          <button
            onClick={() => {
              abort(core)
            }}
            className="px-2 py-0.5 rounded bg-red-200 ml-3"
          >
            <FaIcon icon={faStop} className="mr-1" />
            Beenden
          </button>
        )}
      </div>

      <div className="w-64 mr-3 my-1">
        Geschwindigkeit:{' '}
        {(
          Math.round(
            (Math.exp(core.ws.ui.speedSliderValue) / Math.exp(5.5)) * 60 * 10
          ) / 10
        )
          .toFixed(1)
          .replace('.', ',')}{' '}
        Schritte/s
        <input
          type="range"
          value={core.ws.ui.speedSliderValue}
          onChange={(val) => {
            setSpeedSliderValue(core, parseFloat(val.target.value))
          }}
          min="0"
          max="5.5"
          step="0.1"
          className="w-full h-3 cursor-pointer"
        />
      </div>
    </div>
  )
}
