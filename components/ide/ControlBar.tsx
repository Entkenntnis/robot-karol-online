import {
  faCheck,
  faCircleCheck,
  faExclamationTriangle,
  faGenderless,
  faPersonWalking,
  faThumbsUp,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

import { setSpeedSliderValue } from '../../lib/commands/mode'
import { finishQuest } from '../../lib/commands/quest'
import { positiveText, positiveTextEn } from '../../lib/helper/positiveText'
import { sliderToDelay } from '../../lib/helper/speedSlider'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'

export function ControlBar() {
  const core = useCore()

  const text =
    core.ws.settings.lng == 'de' ? positiveText() : positiveTextEn()

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
              'bg-green-200 ml-3 mt-3',
            )}
          >
            <FaIcon icon={faCircleCheck} className="mr-1" />
            ---
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-top">
      <div className="mt-3">
        <p className="ml-7 font-bold">{renderStatus()}</p>
        <div className="ml-2 mb-1">
          <p className="ml-3 mt-2">
            {core.ws.quest.tasks[core.ws.quest.lastStartedTask!].title}
          </p>
        </div>
      </div>

      <div className="max-w-[230px] h-[58px] mr-3 relative">
        <span className="text-transparent h-1 inline-block overflow-hidden select-none">
          das ist ein platzhalter text der nur dazu da ist die Breite
          auszufüllen
        </span>
        <input
          id="ide-speed-slider"
          type="range"
          value={core.ws.ui.speedSliderValue}
          onChange={(val) => {
            setSpeedSliderValue(core, parseFloat(val.target.value))
          }}
          min="0"
          max="20"
          step="1"
          className="w-full h-3 cursor-pointer"
        />
        <p className="text-xs text-center mt-2">
          {(
            Math.round(
              (1000 / sliderToDelay(core.ws.ui.speedSliderValue)) * 10,
            ) / 10
          )
            .toFixed(1)
            .replace('.', ',') +
            ' ' +
            core.ttung('Schritte pro Sekunde')}
        </p>
      </div>
    </div>
  )

  function renderStatus() {
    const state = core.ws.ui.state
    if (core.ws.ui.karolCrashMessage) {
      return (
        <span className="text-red-600">
          {' '}
          <FaIcon icon={faExclamationTriangle} className="mr-1" />{' '}
          {core.ws.ui.karolCrashMessage === core.ttung('Aua! Karol ist gegen eine Wand gelaufen.') ||
          core.ws.ui.karolCrashMessage === core.ttung('Hilfe, Karol ist in einer Endlosschleife gefangen!') ? (
            core.ws.ui.karolCrashMessage
          ) : (
            <>
              {core.ttung('Fehler')}: {core.ws.ui.karolCrashMessage}
            </>
          )}
        </span>
      )
    }
    if (state == 'error') {
      return (
        <span>
          <FaIcon icon={faExclamationTriangle} className="mr-1" />{' '}
          {core.ttung('Programm unvollständig')}
        </span>
      )
    }
    /*if (state == 'loading' && !core.ws.ui.isEndOfRun) {
      return <span className="text-gray-400">{core.ttung('Programm wird eingelesen ...')}</span>
    }*/
    if (state == 'running') {
      return (
        <span>
          <FaIcon icon={faPersonWalking} className="mr-1" />{' '}
          {core.ttung('Programm wird ausgeführt')}
        </span>
      )
    } else {
      if (core.ws.ui.isEndOfRun) {
        if (
          core.ws.quest.lastStartedTask !== undefined &&
          core.ws.quest.tasks[core.ws.quest.lastStartedTask].target == null &&
          !(core.ws.quest.tasks.length == 1 && core.ws.editor.questScript)
        ) {
          return (
            <span>
              <FaIcon icon={faGenderless} className="mr-1" />{' '}
              {core.ttung('Ausführung beendet')}
              {core.ws.ui.isManualAbort ? ` (${core.ttung('abgebrochen')})` : ''}
            </span>
          )
        }
        if (core.ws.ui.isManualAbort) {
          return (
            <span>
              <FaIcon icon={faGenderless} className="mr-1" />
              {core.ttung('abgebrochen')}
            </span>
          )
        }
        return (
          <span
            className={clsx(
              core.ws.quest.progress ? 'text-green-600' : 'text-red-600',
            )}
          >
            <FaIcon
              icon={core.ws.quest.progress ? faCheck : faTimes}
              className="mr-1"
            />{' '}
            {core.ttung('Auftrag')}{' '}
            {core.ws.quest.progress ? '' : core.ttung('nicht')}{' '}
            {core.ttung('erfüllt')}
            {core.ws.ui.notCompletedReason}{' '}
            {core.ws.ui.isManualAbort ? ` (${core.ttung('abgebrochen')})` : ''}
          </span>
        )
      }
      return (
        <span>
          <FaIcon icon={faThumbsUp} className="mr-2" /> {core.ttung('bereit')}
        </span>
      )
    }
  }
}
