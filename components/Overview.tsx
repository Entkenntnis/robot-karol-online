import { faBars, faPlay } from '@fortawesome/free-solid-svg-icons'

import { dummyOpenQuest, setMode, showMenu } from '../lib/commands/mode'
import { startQuest } from '../lib/commands/quest'
import { overviewData } from '../lib/data/overview'
import { questData } from '../lib/data/quests'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'
import { Options } from './Options'

export function Overview() {
  const core = useCore()

  return (
    <div className="bg-yellow-200 h-full flex flex-col relative">
      <div className="flex justify-center">
        <div className="flex mt-6 items-center rounded-xl bg-yellow-100 p-4 px-12 border-l-4 border-r-red-500 border-r-4 border-l-blue-600">
          <img src="/robotE.png" alt="Bild von Karol" className="mr-8" />
          <h1 className="text-5xl whitespace-nowrap">Robot Karol Quest</h1>
        </div>
      </div>
      <div className="flex-auto flex flex-col mx-auto overflow-hidden">
        <div className="mt-6 mb-4 rounded-lg overflow-auto flex flex-wrap">
          {overviewData.map(renderQuest)}
        </div>
      </div>
      <div className="text-center bg-white mb-4">
        Erstelle eine eigene Quest mit dem Quest-Editor | Programmiere nach Lust
        und Laune in einer Freie Welt
      </div>
      <div className="text-center mb-2">Impressum | Datenschutz | Github</div>
    </div>
  )

  function renderQuest(index: number) {
    const data = questData[index]
    return (
      <div
        className="m-4 mr-6 p-3 bg-white rounded-md cursor-pointer hover:bg-yellow-100 w-[280px]"
        key={index}
        onClick={() => {
          startQuest(core, index)
        }}
      >
        <div className="flex justify-between items-baseline">
          <span className="font-bold py-1 inline-block">{data.title}</span>
        </div>
        <div className="text-gray-700 text-sml mt-2">{data.difficulty}</div>
      </div>
    )
  }
}
