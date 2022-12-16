import {
  faCaretLeft,
  faRotateRight,
  faStop,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { abort, run } from '../lib/commands/vm'

import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'

export function ControlBar() {
  const core = useCore()
  return (
    <div className="flex justify-between items-center">
      <div>
        {core.ws.ui.state != 'running' && (
          <button
            onClick={() => {
              core.mutateWs((ws) => {
                ws.ui.showOutput = false
                ws.ui.state = 'ready'
              })
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
                if (core.ws.ui.lastStartedTask !== undefined) {
                  core.mutateWs((ws) => {
                    ws.world = ws.tasks[core.ws.ui.lastStartedTask!].start
                    ws.ui.messages = []
                  })
                  run(core)
                }
              }}
              className="px-2 py-0.5 rounded bg-yellow-200 ml-3"
            >
              <FaIcon icon={faRotateRight} className="mr-1" />
              Programm neu starten
            </button>
            {core.ws.world !=
              core.ws.tasks[core.ws.ui.lastStartedTask!].start && (
              <button
                onClick={() => {
                  if (core.ws.ui.lastStartedTask !== undefined) {
                    core.mutateWs((ws) => {
                      ws.world = ws.tasks[core.ws.ui.lastStartedTask!].start
                      ws.ui.messages = []
                    })
                    //run(core)
                  }
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
            core.mutateWs((ws) => {
              ws.ui.speedSliderValue = parseFloat(val.target.value)
            })
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
