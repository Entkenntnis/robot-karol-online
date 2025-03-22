import {
  faBars,
  faPlay,
  faSpinner,
  faStop,
} from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '../helper/FaIcon'
import { useCore } from '../../lib/state/core'
import clsx from 'clsx'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { startButtonClicked } from '../../lib/commands/start'
import { setMode } from '../../lib/commands/mode'
import { setLanguage } from '../../lib/commands/language'
import { Settings } from '../../lib/state/types'

export function InteractionBar() {
  const core = useCore()
  const mainButtonState =
    core.ws.ui.state == 'running'
      ? core.ws.vm.isDebugging
        ? 'continue'
        : 'stop'
      : 'start'

  const dontChangeLanguage =
    (core.ws.ui.state !== 'ready' &&
      !(
        core.ws.settings.language == 'python-pro' &&
        core.worker &&
        !core.worker.mainWorkerReady
      )) ||
    !!core.ws.ui.lockLanguage ||
    !core.ws.ui.pythonProCanSwitch
  return (
    <div
      className={clsx(
        'flex justify-between items-baseline pt-1 pb-0.5 px-2 border-b',
        core.ws.settings.mode == 'blocks' && 'border-r'
      )}
    >
      <button className="px-2 py-0.5 border border-gray-300 text-gray-600 bg-white rounded transition duration-150 ease-in-out hover:bg-gray-100">
        <FaIcon icon={faBars} className="mr-2" /> Menü
      </button>
      <div className="pt-1">
        <span
          className={clsx(
            'font-semibold mr-1',
            core.ws.settings.mode == 'code' && 'text-gray-400'
          )}
        >
          {core.strings.ide.blocks}
        </span>
        <label
          htmlFor="toggleSwitch"
          className="relative inline-block w-14 mx-2 cursor-pointer align-middle"
        >
          <input
            type="checkbox"
            id="toggleSwitch"
            onChange={() => {
              if (core.ws.settings.mode == 'blocks') {
                submitAnalyzeEvent(core, 'ev_click_ide_code')
                setMode(core, 'code')
              } else {
                submitAnalyzeEvent(core, 'ev_click_ide_blocks')
                setMode(core, 'blocks')
              }
            }}
            checked={core.ws.settings.mode == 'code'}
            className={clsx(
              'peer appearance-none w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer',
              core.ws.settings.mode == 'blocks'
                ? 'bg-[#5ba55b]'
                : 'bg-[#770088]'
            )}
          />
          <span className="absolute left-1 top-1 w-6 h-6 bg-white shadow-white rounded-full transition duration-300 peer-checked:translate-x-6"></span>
        </label>
        <select
          className={clsx(
            'rounded-lg px-2 py-0.5 transition focus:outline-none font-semibold ml-1',
            core.ws.settings.mode == 'code'
              ? 'border-[#770088] border'
              : 'bg-white text-gray-400 border'
          )}
          value={core.ws.settings.language}
          onChange={(e) => {
            submitAnalyzeEvent(core, 'ev_click_ide_language-' + e.target.value)
            setLanguage(core, e.target.value as Settings['language'])
          }}
          disabled={dontChangeLanguage}
        >
          <option value="robot karol">Karol Code</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="python-pro">Python Pro</option>
        </select>
      </div>
      <button
        className={clsx(
          'rounded px-6 pt-1 pb-2 transition whitespace-nowrap enabled:active:scale-[0.98]',
          core.ws.ui.state == 'error' || core.ws.ui.state == 'loading'
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : clsx(
                mainButtonState == 'start' && 'bg-green-300 hover:bg-green-400',
                mainButtonState == 'stop' &&
                  'bg-yellow-500 hover:bg-yellow-600',
                mainButtonState == 'continue' &&
                  'bg-purple-100 hover:bg-purple-200'
              )
        )}
        onClick={() => {
          if (core.ws.ui.state == 'running' && !core.ws.vm.isDebugging) {
            submitAnalyzeEvent(core, 'ev_click_ide_stop')
          } else if (core.ws.ui.state == 'running' && core.ws.vm.isDebugging) {
            submitAnalyzeEvent(core, 'ev_click_ide_continue')
          }
          startButtonClicked(core)
        }}
        disabled={core.ws.ui.state == 'error' || core.ws.ui.state == 'loading'}
      >
        <FaIcon
          icon={
            mainButtonState == 'stop'
              ? faStop
              : core.ws.ui.state == 'loading' &&
                core.ws.settings.language == 'python-pro'
              ? faSpinner
              : faPlay
          }
          className={clsx(
            'mr-2',
            core.ws.ui.state == 'loading' &&
              core.ws.settings.language == 'python-pro' &&
              'animate-spin-slow'
          )}
        />
        <span className="text-xl">{core.strings.ide[mainButtonState]}</span>
      </button>
    </div>
  )
}
