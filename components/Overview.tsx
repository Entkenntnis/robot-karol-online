import {
  faCheck,
  faExternalLink,
  faPencil,
  faPenToSquare,
  faSeedling,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import Link from 'next/link'

import {
  editCodeAndResetProgress,
  forceRerender,
  setShowImpressum,
  setShowPrivacy,
} from '../lib/commands/mode'
import { startQuest } from '../lib/commands/quest'
import { questDeps } from '../lib/data/dependencies'
import { categories } from '../lib/data/overview'
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
    <div className="bg-yellow-200 flex flex-col relative min-h-full">
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
      <div className="flex justify-center mt-8">
        <a
          className="px-2 py-0.5 bg-green-400 hover:bg-green-500 rounded"
          href={
            window.location.protocol +
            '//' +
            window.location.host +
            '/?id=Z9xO1rVGj'
          }
        >
          <FaIcon icon={faSeedling} className="mr-1" />
          Spielwiese
        </a>{' '}
        <a
          href="/#editor"
          className="px-2 py-0.5 bg-blue-300 hover:bg-blue-400 rounded ml-8"
        >
          <FaIcon icon={faPenToSquare} className="mr-1" />
          Aufgaben-Editor
        </a>
      </div>
      <div className="mx-12 lg:mx-16 xl:mx-24 flex-auto overflow-hidden">
        {categories.map(
          (cat, i) =>
            cat.quests.some(isQuestVisible) && (
              <div key={i} className="my-8 mt-24">
                <h2 className="ml-7 -mb-4 text-xl text-gray-700">{cat.name}</h2>
                <div
                  className={clsx(
                    'mt-6 mb-4 rounded-lg overflow-auto',
                    'flex flex-wrap'
                  )}
                >
                  {cat.quests.map(renderQuest)}
                </div>
              </div>
            )
        )}
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
                forceRerender(core)
              }}
            >
              <FaIcon
                icon={faTimes}
                className="inline-block px-1 bg-white hover:bg-gray-100"
              />
            </button>
          </div>
        )}
      <div className="text-center mb-2 mt-10">
        Version: Januar 2023 |{' '}
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
          'Infos',
          'https://github.com/Entkenntnis/robot-karol-online#readme'
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

  function isQuestVisible(id: number) {
    return (
      core.ws.ui.isDemo ||
      questDeps[id].length == 0 ||
      questDeps[id].some(isQuestDone)
    )
  }

  function renderQuest(index: number, i: number) {
    if (index == -1) {
      return <div className="basis-full h-8" key={`spacer_${i}`}></div>
    }

    // check for deps, empty deps -> always visible
    if (!isQuestVisible(index)) {
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
          &nbsp;
          {questDone && (
            <span className="text-green-600">
              {' '}
              <FaIcon icon={faCheck} /> abgeschlossen
            </span>
          )}
          {isQuestStarted(index) && (
            <span className="text-yellow-600">
              {' '}
              <FaIcon icon={faPencil} /> in Bearbeitung
            </span>
          )}
        </div>
      </div>
    )
  }
}
