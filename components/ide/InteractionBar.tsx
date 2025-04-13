import {
  faBars,
  faPause,
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
import { useState } from 'react'
import { sliderToDelay } from '../../lib/helper/speedSlider'

export function InteractionBar() {
  const core = useCore()
  const mainButtonState = core.ws.ui.state == 'running' ? 'stop' : 'start'

  const dontChangeLanguage =
    (core.ws.ui.state !== 'ready' &&
      !(
        core.ws.settings.language == 'python-pro' &&
        core.worker &&
        !core.worker.mainWorkerReady
      )) ||
    !!core.ws.ui.lockLanguage ||
    !core.ws.ui.pythonProCanSwitch ||
    core.ws.ui.proMode ||
    core.ws.ui.editQuestScript

  const debuggable =
    core.ws.ui.state == 'running' && core.ws.settings.language != 'python-pro'
  return (
    <div
      className={clsx(
        'flex justify-between pt-1 pb-0.5 pl-2 pr-1 border-b',
        core.ws.settings.mode == 'blocks' && 'border-r',
        core.ws.ui.lockLanguage ? 'items-center h-12' : 'items-baseline'
      )}
    >
      <button
        className="whitespace-nowrap px-2 py-0.5 border border-gray-300 text-gray-600 bg-white rounded transition duration-150 ease-in-out hover:bg-gray-100"
        onClick={() => {
          submitAnalyzeEvent(core, 'ev_click_ide_menu')
          core.mutateWs(({ ui }) => {
            ui.showFlyoutMenu = true
          })
        }}
      >
        <FaIcon icon={faBars} className="mr-2" /> {core.strings.ide.menu}
      </button>
      {core.ws.ui.lockLanguage ? (
        <div className="whitespace-nowrap font-semibold text-gray-600 select-none border-[#770088] px-2 py-0.5 border rounded-lg">
          {core.ws.ui.lockLanguage == 'karol'
            ? 'Karol Code'
            : core.ws.ui.lockLanguage == 'python'
            ? 'Karol Python'
            : core.ws.ui.lockLanguage == 'java'
            ? 'Karol Java'
            : core.ws.ui.lockLanguage == 'python-pro'
            ? 'Python'
            : ''}
        </div>
      ) : (
        <div className="pt-1 whitespace-nowrap">
          <button
            className={clsx(
              'font-semibold mr-1 select-none disabled:cursor-default',
              core.ws.settings.mode == 'code' && 'text-gray-600'
            )}
            disabled={dontChangeLanguage}
            onClick={() => {
              if (!dontChangeLanguage) {
                submitAnalyzeEvent(core, 'ev_click_ide_blocks')
                setMode(core, 'blocks')
              }
            }}
          >
            {core.strings.ide.blocks}
          </button>
          <label
            htmlFor="toggleSwitch"
            className={clsx(
              'relative inline-block w-12 mx-2 align-middle transition-opacity',
              dontChangeLanguage
                ? 'opacity-30 cursor-not-allowed'
                : 'cursor-pointer'
            )}
          >
            <input
              type="checkbox"
              id="toggleSwitch"
              onChange={() => {
                if (core.ws.settings.mode == 'blocks') {
                  submitAnalyzeEvent(core, 'ev_click_ide_code')
                  setMode(core, 'code')
                  setLanguage(core, core.ws.settings.language)
                } else {
                  submitAnalyzeEvent(core, 'ev_click_ide_blocks')
                  setMode(core, 'blocks')
                }
              }}
              checked={core.ws.settings.mode == 'code'}
              className={clsx(
                'peer appearance-none w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none enabled:cursor-pointer disabled:cursor-not-allowed',
                core.ws.settings.mode == 'blocks'
                  ? 'bg-[#5ba55b]'
                  : 'bg-[#770088]'
              )}
              disabled={dontChangeLanguage}
            />
            <span className="absolute left-1 top-1 w-5 h-5 bg-white shadow-white rounded-full transition duration-300 peer-checked:translate-x-5"></span>
          </label>
          <DropdownComponent dontChangeLanguage={dontChangeLanguage} />
        </div>
      )}
      <div className="w-[111px]"></div>
      <div className="flex gap-1 w-[111px] z-[100] absolute right-1 top-0.5">
        {core.ws.vm.isDebugging && (
          <button
            className="absolute -bottom-[38px] right-0 px-3 py-1 bg-purple-300 hover:bg-purple-400 transition-colors rounded active:bg-purple-500 "
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_ide_singleStep')
              core.mutateWs((ws) => {
                ws.vm.debuggerRequestNextStep = true
              })
            }}
          >
            {core.strings.ide.step}
          </button>
        )}
        {debuggable && (
          <button
            className={clsx(
              'py-0.5 bg-purple-100 hover:bg-purple-200 rounded absolute -left-[52px] top-0 w-12 h-10'
            )}
            onClick={() => {
              if (!core.ws.vm.isDebugging) {
                submitAnalyzeEvent(core, 'ev_click_ide_debugger')
                core.mutateWs((ws) => {
                  ws.vm.isDebugging = true
                  ws.vm.debuggerRequestNextStep = true
                })
              } else {
                core.mutateWs((ws) => {
                  ws.vm.isDebugging = false
                  ws.vm.startTime =
                    Date.now() -
                    (ws.vm.steps + 1) * sliderToDelay(ws.ui.speedSliderValue)
                })
              }
            }}
          >
            <FaIcon icon={core.ws.vm.isDebugging ? faPlay : faPause} />
          </button>
        )}
        <button
          className={clsx(
            'rounded pt-1 pb-2 transition whitespace-nowrap enabled:active:scale-[0.98] text-center flex-grow',
            core.ws.ui.state == 'error' || core.ws.ui.state == 'loading'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : clsx(
                  mainButtonState == 'start' &&
                    'bg-green-300 hover:bg-green-400',
                  mainButtonState == 'stop' &&
                    'bg-yellow-500 hover:bg-yellow-600'
                )
          )}
          onClick={() => {
            if (core.ws.ui.state == 'running' && !core.ws.vm.isDebugging) {
              submitAnalyzeEvent(core, 'ev_click_ide_stop')
            } else if (
              core.ws.ui.state == 'running' &&
              core.ws.vm.isDebugging
            ) {
              submitAnalyzeEvent(core, 'ev_click_ide_continue')
            }
            startButtonClicked(core)
          }}
          disabled={
            core.ws.ui.state == 'error' || core.ws.ui.state == 'loading'
          }
        >
          <FaIcon
            icon={
              mainButtonState == 'stop' || core.ws.vm.isDebugging
                ? faStop
                : core.ws.ui.state == 'loading' &&
                  core.ws.settings.language == 'python-pro' &&
                  !core.worker?.mainWorkerReady
                ? faSpinner
                : faPlay
            }
            className={clsx(
              !debuggable && 'mr-2',
              core.ws.ui.state == 'loading' &&
                core.ws.settings.language == 'python-pro' &&
                !core.worker?.mainWorkerReady &&
                'animate-spin-slow'
            )}
          />
          <span className="text-xl">
            {debuggable ? '' : core.strings.ide[mainButtonState]}
          </span>
        </button>
      </div>
    </div>
  )
}

interface Props {
  dontChangeLanguage: boolean
}

function DropdownComponent({ dontChangeLanguage }: Props) {
  const core = useCore()

  const [isOpen, setIsOpen] = useState(false)

  const options = [
    {
      value: 'robot karol',
      label: 'Karol Code',
      title: 'Die Original-Sprache von Robot Karol',
    },
    ...(core.ws.settings.lng == 'de'
      ? [
          {
            value: 'java',
            label: 'Karol Java',
            title: 'Reduzierte Version Java für Karol',
          },
          {
            value: 'python',
            label: 'Karol Python',
            title: 'Reduzierte Version von Python für Karol',
          },
          {
            value: 'python-pro',
            label: 'Python',
            title: 'Nutze den vollen Funktionsumfang von Python 3.12',
          },
        ]
      : []),
  ]

  const selectedOption =
    options.find((opt) => opt.value === core.ws.settings.language) || options[0]

  return (
    <div className="relative ml-1 inline-block w-[136px]">
      <div className="flex justify-between">
        <div
          className={clsx(
            'flex-grow font-semibold border rounded-l-lg pl-2 py-0.5 transition-all border-r-0 select-none whitespace-nowrap',
            core.ws.settings.mode == 'code'
              ? 'border-[#770088]'
              : 'border-gray-300 text-gray-600',
            dontChangeLanguage ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
          onClick={() => {
            if (dontChangeLanguage) return
            if (core.ws.settings.mode != 'code') {
              setMode(core, 'code')
            }
          }}
          title={selectedOption.title}
        >
          {selectedOption.label}
        </div>
        <button
          type="button"
          className={clsx(
            'flex items-center justify-between rounded-r-lg px-1.5 py-0.5 transition-all',
            'font-semibold focus:outline-none disabled:cursor-not-allowed',
            'border',
            core.ws.settings.mode == 'code'
              ? 'border-[#770088] bg-[#770088]/20'
              : 'border-gray-300 text-gray-400 bg-[#770088]/10',
            dontChangeLanguage
              ? 'cursor-not-allowed opacity-75'
              : 'cursor-pointer'
          )}
          onKeyDown={(e) => {
            // react on esc key
            if (e.key === 'Escape') {
              e.preventDefault()
              setIsOpen(false)
            }
          }}
          onClick={() => {
            !dontChangeLanguage && setIsOpen(!isOpen)
          }}
          onBlur={() => {
            setIsOpen(false)
          }}
          disabled={dontChangeLanguage}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          id="select-language"
        >
          <svg
            className={clsx(
              'h-4 w-4 transition-transform',
              isOpen ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
          role="listbox"
        >
          {options.map((option) => (
            <button
              title={option.title}
              key={option.value}
              type="button"
              id={`select-language-${option.value.replace(/\s+/g, '-')}`}
              className={clsx(
                'w-full px-2 py-1 text-left block',
                'transition-colors cursor-pointer font-semibold',
                option.value === core.ws.settings.language
                  ? 'bg-[#770088]/20'
                  : 'hover:bg-[#770088]/5'
              )}
              onPointerDown={(e) => {
                // prevent on blur action to close the dropdown before click handler is called
                e.preventDefault()
              }}
              onClick={() => {
                submitAnalyzeEvent(
                  core,
                  'ev_click_ide_language-' + option.value
                )
                if (core.ws.settings.mode == 'blocks') {
                  setMode(core, 'code')
                }
                setLanguage(core, option.value as Settings['language'])
                setIsOpen(false)
              }}
              role="option"
              aria-selected={option.value === core.ws.settings.language}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
