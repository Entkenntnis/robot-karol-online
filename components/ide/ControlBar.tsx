import {
  faCheck,
  faCircleCheck,
  faExclamationTriangle,
  faGenderless,
  faPersonWalking,
  faPlay,
  faRotateRight,
  faStop,
  faThumbsUp,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useMemo } from 'react'
import { showModal } from '../../lib/commands/modal'

import { setSpeedSliderValue } from '../../lib/commands/mode'
import {
  closeOutput,
  finishQuest,
  restartProgram,
  startTesting,
} from '../../lib/commands/quest'
import { abort } from '../../lib/commands/vm'
import { positiveText } from '../../lib/helper/positiveText'
import { sliderToDelay } from '../../lib/helper/speedSlider'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'

export function ControlBar() {
  const core = useCore()

  const text = useMemo(positiveText, [])

  if (core.ws.ui.controlBarShowFinishQuest) {
    return (
      <div className="flex items-center justify-center p-2 invisible">
        <p className="text-center">
          {text}
          <br />
          <button
            onClick={() => {
              finishQuest(core)
            }}
            className={clsx(
              'px-2 py-0.5 rounded hover:bg-green-300',
              'bg-green-200 ml-3 mt-3'
            )}
          >
            <FaIcon icon={faCircleCheck} className="mr-1" />
            Aufgabe abschließen
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="ml-7 font-bold">{renderStatus()}</p>
        <p className="ml-2 mb-1">
          {core.ws.ui.isEndOfRun &&
          !core.ws.ui.isManualAbort &&
          !core.ws.ui.karolCrashMessage &&
          !core.ws.ui.isTesting &&
          core.ws.quest.progress ? (
            <>
              {/*<button
                onClick={() => {
                  closeOutput(core)
                }}
                className={clsx(
                  'px-2 py-0.5 rounded hover:underline text-blue-500 hover:text-blue-600 ml-3 mt-2'
                  /*core.ws.ui.isTesting && 'invisible'
                )}
              >
                zurück
                </button>*/}
              {core.ws.page !== 'editor' && (
                <button
                  onClick={() => {
                    closeOutput(core)
                    startTesting(core)
                  }}
                  className="px-2 py-0.5 rounded hover:underline text-blue-500 hover:text-blue-600 ml-3 mt-2 "
                >
                  weiter (alle Aufträge testen)
                </button>
              )}
            </>
          ) : (
            core.ws.ui.state != 'running' && (
              <>
                <span className="ml-3 mt-2">
                  {core.ws.quest.tasks[core.ws.quest.lastStartedTask!].title}
                </span>
                <button
                  onClick={() => {
                    closeOutput(core)
                  }}
                  className={clsx(
                    'px-2 py-0.5 rounded hover:underline text-blue-500 hover:text-blue-600 ml-3 mt-2 invisible'
                    /*core.ws.ui.isTesting && 'invisible'*/
                  )}
                >
                  {core.strings.ide.back}
                </button>
              </>
            )
          )}
          {core.ws.ui.state == 'ready' &&
            (!core.ws.quest.progress ||
              core.ws.ui.isManualAbort ||
              core.ws.ui.karolCrashMessage) &&
            !core.ws.ui.isTesting && (
              <>
                <button
                  onClick={() => {
                    restartProgram(core)
                  }}
                  className="px-2 py-0.5 rounded bg-green-300 ml-3 mt-2 hover:bg-green-400 invisible"
                >
                  <FaIcon
                    icon={core.ws.ui.isEndOfRun ? faRotateRight : faPlay}
                    className="mr-1"
                  />
                  Ausführen
                </button>
              </>
            )}
          {core.ws.ui.state == 'running' && (
            <button
              onClick={() => {
                abort(core)
              }}
              className="px-2 py-0.5 rounded bg-amber-400 ml-3 mt-2 invisible"
            >
              <FaIcon icon={faStop} className="mr-1" />
              Abbrechen
            </button>
          )}
        </p>
      </div>

      <div className="max-w-[230px] mr-3 my-3">
        {(
          Math.round((1000 / sliderToDelay(core.ws.ui.speedSliderValue)) * 10) /
          10
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
          max="20"
          step="1"
          className="w-full h-3 cursor-pointer mt-4"
        />
      </div>
    </div>
  )

  function renderStatus() {
    const state = core.ws.ui.state
    if (state == 'error') {
      return (
        <>
          <FaIcon icon={faExclamationTriangle} className="mr-1" /> Programm
          unvollständig
        </>
      )
    }
    if (state == 'loading' && !core.ws.ui.isEndOfRun) {
      return <span className="text-gray-400">Programm wird eingelesen ...</span>
    }
    if (state == 'running') {
      return (
        <>
          <FaIcon icon={faPersonWalking} className="mr-1" /> Programm wird
          ausgeführt
        </>
      )
    } else {
      if (core.ws.ui.karolCrashMessage) {
        return (
          <span className="text-red-600">
            {' '}
            <FaIcon
              icon={faExclamationTriangle}
              className="mr-1"
            /> Fehler: {core.ws.ui.karolCrashMessage}
          </span>
        )
      }
      if (core.ws.ui.isEndOfRun) {
        if (core.ws.page == 'imported') {
          return (
            <>
              <FaIcon icon={faGenderless} className="mr-1" /> Ausführung beendet
              {core.ws.ui.isManualAbort ? ' (abgebrochen)' : ''}
            </>
          )
        }
        if (core.ws.ui.isManualAbort) {
          return (
            <>
              <FaIcon icon={faGenderless} className="mr-1" />
              abgebrochen
            </>
          )
        }
        return (
          <span
            className={clsx(
              core.ws.quest.progress ? 'text-green-600' : 'text-red-600'
            )}
          >
            <FaIcon
              icon={core.ws.quest.progress ? faCheck : faTimes}
              className="mr-1"
            />{' '}
            {core.strings.ide.assignments}{' '}
            {core.ws.quest.progress ? '' : core.strings.ide.not}{' '}
            {core.strings.ide.completed}{' '}
            {core.ws.ui.isManualAbort ? ' (abgebrochen)' : ''}
          </span>
        )
      }
      return (
        <>
          <FaIcon icon={faThumbsUp} className="mr-2" /> bereit{' '}
        </>
      )
    }
  }
}
