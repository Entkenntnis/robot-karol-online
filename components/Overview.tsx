import {
  faCheck,
  faExternalLink,
  faPencil,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import Link from 'next/link'

import {
  editCodeAndResetProgress,
  setShowImpressum,
  setShowPrivacy,
} from '../lib/commands/mode'
import { startQuest } from '../lib/commands/quest'
import { questDeps } from '../lib/data/dependencies'
import { overviewData } from '../lib/data/overview'
import { questData } from '../lib/data/quests'
import {
  getQuestSessionData,
  isQuestDone,
  isQuestStarted,
} from '../lib/helper/session'
import { useCore } from '../lib/state/core'
import { QuestSessionData } from '../lib/state/types'
import { FaIcon } from './FaIcon'
import { ImpressumModal } from './ImpressumModal'
import { PrivacyModal } from './PrivacyModal'

export function Overview() {
  const core = useCore()

  return (
    <div className="bg-yellow-200 h-full flex flex-col relative">
      <div className="flex justify-center">
        <div
          className={clsx(
            'flex mt-6 items-center rounded-xl',
            'p-4 px-12 bg-yellow-100',
            'border-l-4 border-r-red-500 border-r-4 border-l-blue-600'
          )}
        >
          <img
            src="/robotE.png"
            alt="Bild von Robot Karol"
            className="mr-8"
            height={71}
            width={40}
          />
          <h1 className="text-5xl whitespace-nowrap">Robot Karol Online</h1>
        </div>
      </div>
      <div
        className={clsx(
          'flex-auto flex flex-col overflow-hidden',
          'mx-12 lg:mx-16 xl:mx-24'
        )}
      >
        <div
          className={clsx(
            'mt-6 mb-4 rounded-lg overflow-auto',
            'flex flex-wrap'
          )}
        >
          {overviewData.map(renderQuest)}
        </div>
      </div>
      {isQuestDone(1) &&
        !sessionStorage.getItem('robot_karol_online_hide_save_message') && (
          <div className="text-sm text-right mr-4 mt-1 mb-3 text-gray-600">
            Beim Schließen des Tabs wird dein Fortschritt zurückgesetzt. Eine
            Speicherfunktion ist in Arbeit.{' '}
            <button
              onClick={() => {
                sessionStorage.setItem(
                  'robot_karol_online_hide_save_message',
                  '1'
                )
                editCodeAndResetProgress(core) // <- just a dummy to trigger re-render
              }}
            >
              <FaIcon
                icon={faTimes}
                className="inline-block px-1 bg-white hover:bg-gray-100"
              />
            </button>
          </div>
        )}
      <div className="text-center mb-2">
        <button
          className="hover:underline"
          onClick={() => {
            setShowImpressum(core, true)
          }}
        >
          Impressum
        </button>{' '}
        |{' '}
        <button
          className="hover:underline"
          onClick={() => {
            setShowPrivacy(core, true)
          }}
        >
          Datenschutz
        </button>{' '}
        |{' '}
        {renderExternalLink(
          'Quellcode',
          'https://github.com/Entkenntnis/robot-karol-online'
        )}{' '}
        |{' '}
        <a href="/?editor=1">
          <span className="hover:underline">Aufgaben-Editor</span>
        </a>{' '}
        |{' '}
        {renderExternalLink(
          'Spielwiese',
          window.location.protocol +
            '//' +
            window.location.host +
            '/?id=Z9xO1rVGj'
        )}
      </div>
      {core.ws.ui.showImpressum && <ImpressumModal />}
      {core.ws.ui.showPrivacy && <PrivacyModal />}
    </div>
  )

  function renderExternalLink(title: string, href: string) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        <span className="hover:underline">{title}</span>{' '}
        <FaIcon icon={faExternalLink} className="text-xs" />
      </a>
    )
  }

  function renderQuest(index: number) {
    if (index == -1) {
      return <div className="basis-full h-1" key={index}></div>
    }

    // check for deps, empty deps -> always visible
    if (questDeps[index].length > 0 && !questDeps[index].some(isQuestDone)) {
      return null
    }

    const data = questData[index]
    const sessionData: QuestSessionData | null = getQuestSessionData(index)

    const questDone = isQuestDone(index)

    return (
      <div
        className={clsx(
          'm-4 mr-6 p-3 bg-white rounded-md',
          'cursor-pointer hover:bg-blue-50 w-[290px]',
          !sessionData && 'border-l-2 border-l-blue-500'
        )}
        tabIndex={0}
        key={index}
        onClick={() => {
          startQuest(core, index)
        }}
      >
        <div className="flex justify-between items-baseline">
          <span
            className={clsx('py-1 inline-block', !questDone && 'font-bold')}
          >
            {data.title}
          </span>
        </div>
        <div className="text-gray-700 text-sml mt-2">
          {data.difficulty}
          {questDone && (
            <span className="text-green-600 ml-2">
              {' '}
              <FaIcon icon={faCheck} /> abgeschlossen
            </span>
          )}
          {isQuestStarted(index) && (
            <span className="text-yellow-600 ml-2">
              {' '}
              <FaIcon icon={faPencil} /> in Bearbeitung
            </span>
          )}
        </div>
      </div>
    )
  }
}
