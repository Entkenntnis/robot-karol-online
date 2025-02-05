import {
  faCheck,
  faCircleCheck,
  faExclamationTriangle,
  faGenderless,
  faPause,
  faPersonWalking,
  faThumbsUp,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useMemo } from 'react'

import { setSpeedSliderValue } from '../../lib/commands/mode'
import { finishQuest, startTesting } from '../../lib/commands/quest'
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
          {core.ws.ui.state != 'running' && (
            <p className="ml-3 mt-2">
              {core.ws.quest.tasks[core.ws.quest.lastStartedTask!].title}
            </p>
          )}
        </div>
      </div>

      {core.ws.vm.isDebugging && core.ws.ui.state == 'running' ? (
        <div className="max-w-[230px] h-[58px] mr-3 my-3 bg-purple-200 p-2">
          <button
            className="h-full p-2 bg-purple-300 hover:bg-purple-400 transition-colors mr-3 align-top rounded active:bg-purple-500"
            onClick={() => {
              core.mutateWs((ws) => {
                ws.vm.debuggerRequestNextStep = true
              })
            }}
          >
            {core.strings.ide.step}
          </button>
          <button
            className="h-full p-2 bg-white hover:bg-gray-100 rounded"
            onClick={() => {
              abort(core)
            }}
          >
            {core.strings.ide.stop}
          </button>
        </div>
      ) : (
        <div className="max-w-[230px] h-[58px] mr-3 my-3 relative">
          <button
            className={clsx(
              'px-2 py-0.5 bg-purple-100 hover:bg-purple-200 rounded absolute -top-1.5 right-0',
              core.ws.ui.state !== 'running' && 'invisible'
            )}
            onClick={() => {
              core.mutateWs((ws) => {
                ws.vm.isDebugging = true
                ws.vm.debuggerRequestNextStep = true
              })
            }}
          >
            <FaIcon icon={faPause} /> Debugger
          </button>
          <span className="text-transparent h-1 inline-block overflow-hidden select-none">
            das ist ein platzhalter text der nur dazu da ist die Breite
            auszufüllen
          </span>
          <input
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
          <p className="text-xs text-center">
            {(
              Math.round(
                (1000 / sliderToDelay(core.ws.ui.speedSliderValue)) * 10
              ) / 10
            )
              .toFixed(1)
              .replace('.', ',') +
              ' ' +
              core.strings.ide.steps}
          </p>
        </div>
      )}
    </div>
  )

  function renderStatus() {
    const state = core.ws.ui.state
    if (core.ws.ui.karolCrashMessage) {
      return (
        <span className="text-red-600">
          {' '}
          <FaIcon icon={faExclamationTriangle} className="mr-1" />{' '}
          {core.strings.ide.error}: {core.ws.ui.karolCrashMessage}
        </span>
      )
    }
    if (state == 'error') {
      return (
        <span>
          <FaIcon icon={faExclamationTriangle} className="mr-1" />{' '}
          {core.strings.ide.programError}
        </span>
      )
    }
    /*if (state == 'loading' && !core.ws.ui.isEndOfRun) {
      return <span className="text-gray-400">{core.strings.ide.loading}</span>
    }*/
    if (state == 'running') {
      return (
        <span>
          <FaIcon icon={faPersonWalking} className="mr-1" />{' '}
          {core.strings.ide.running}
        </span>
      )
    } else {
      if (core.ws.ui.isEndOfRun) {
        if (core.ws.page == 'imported') {
          return (
            <span>
              <FaIcon icon={faGenderless} className="mr-1" />{' '}
              {core.strings.ide.endOfRun}
              {core.ws.ui.isManualAbort ? ` (${core.strings.ide.aborted})` : ''}
            </span>
          )
        }
        if (core.ws.ui.isManualAbort) {
          return (
            <span>
              <FaIcon icon={faGenderless} className="mr-1" />
              {core.strings.ide.aborted}
            </span>
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
            {core.strings.ide.assignment}{' '}
            {core.ws.quest.progress ? '' : core.strings.ide.not}{' '}
            {core.strings.ide.completed}{' '}
            {core.ws.ui.isManualAbort ? ' (abgebrochen)' : ''}
          </span>
        )
      }
      return (
        <span>
          <FaIcon icon={faThumbsUp} className="mr-2" /> {core.strings.ide.ready}
        </span>
      )
    }
  }
}
