import {
  faCheck,
  faExternalLink,
  faPencil,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useEffect } from 'react'

import { setShowImpressum, setShowPrivacy } from '../lib/commands/mode'
import { restoreQuestFromSessionData, startQuest } from '../lib/commands/quest'
import { overviewData } from '../lib/data/overview'
import { questData } from '../lib/data/quests'
import { submit_event } from '../lib/helper/submit'
import { useCore } from '../lib/state/core'
import { QuestSessionData } from '../lib/state/types'
import { FaIcon } from './FaIcon'
import { ImpressumModal } from './ImpressumModal'
import { PrivacyModal } from './PrivacyModal'

export function Overview() {
  const core = useCore()

  useEffect(() => {
    submit_event('show_overview', core)
  }, [core])

  return (
    <div className="bg-yellow-200 h-full flex flex-col relative">
      <div className="flex justify-center">
        <div className="flex mt-6 items-center rounded-xl bg-yellow-100 p-4 px-12 border-l-4 border-r-red-500 border-r-4 border-l-blue-600">
          <img
            src="/robotE.png"
            alt="Bild von Karol"
            className="mr-8"
            height={71}
            width={40}
          />
          <h1 className="text-5xl whitespace-nowrap">Robot Karol Online</h1>
        </div>
      </div>
      <div className="flex-auto flex flex-col overflow-hidden mx-12 lg:mx-16 xl:mx-24">
        <div className="mt-6 mb-4 rounded-lg overflow-auto flex flex-wrap">
          {overviewData.map(renderQuest)}
        </div>
      </div>
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
        <a
          href="https://github.com/Entkenntnis/robot-karol-online"
          className="hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Quellcode <FaIcon icon={faExternalLink} className="text-xs" />
        </a>{' '}
        |{' '}
        <a
          href={
            window.location.protocol +
            '//' +
            window.location.host +
            '/?id=Z9xO1rVGj'
          }
          target="_blank"
          className="hover:underline"
          rel="noreferrer"
        >
          Spielwiese <FaIcon icon={faExternalLink} className="text-xs" />
        </a>{' '}
      </div>
      {core.ws.ui.showImpressum && <ImpressumModal />}
      {core.ws.ui.showPrivacy && <PrivacyModal />}
    </div>
  )

  function renderQuest(index: number) {
    if (index == -1) {
      return <div className="basis-full h-1" key={index}></div>
    }

    const data = questData[index]
    const rawSessionData = sessionStorage.getItem(`karol_quest_beta_${index}`)
    const sessionData: QuestSessionData | null = rawSessionData
      ? JSON.parse(rawSessionData)
      : null

    const taskDone =
      sessionData && sessionData.completed.length == data.tasks.length

    return (
      <div
        className="m-4 mr-6 p-3 bg-white rounded-md cursor-pointer hover:bg-blue-100 w-[280px]"
        key={index}
        onClick={() => {
          startQuest(core, index)
          submit_event(`start_quest_${index}`, core)
          if (sessionData) restoreQuestFromSessionData(core, sessionData)
        }}
      >
        <div className="flex justify-between items-baseline">
          <span className={clsx('py-1 inline-block', !taskDone && 'font-bold')}>
            {data.title}
          </span>
        </div>
        <div className="text-gray-700 text-sml mt-2">
          {data.difficulty}
          {taskDone && (
            <span className="text-green-600 ml-2">
              {' '}
              <FaIcon icon={faCheck} /> abgeschlossen
            </span>
          )}
          {sessionData &&
            sessionData.completed.length < data.tasks.length &&
            (sessionData.completed.length > 0 || sessionData.code) && (
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
