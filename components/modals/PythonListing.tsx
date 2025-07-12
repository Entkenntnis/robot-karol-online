import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { questListByCategory } from '../../lib/data/overview'
import { questData } from '../../lib/data/quests'
import { navigate } from '../../lib/commands/router'
import {
  setLearningPathScroll,
  setQuestReturnToMode,
} from '../../lib/storage/storage'

export function PythonListing() {
  const core = useCore()
  // load all python examples from questList
  const pythonCategories = questListByCategory
    .filter((category) => category.title.includes('.'))
    .map((category) => {
      return {
        ...category,
        quests: category.quests.map((questId) => {
          const quest = questData[questId]
          return {
            id: questId,
            title: quest.title,
          }
        }),
      }
    })
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]"
      onClick={() => closeModal(core)}
    >
      <div
        className="max-h-[90%] w-[630px] bg-white z-[400] rounded-xl overflow-auto relative"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => {
            closeModal(core)
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div className="p-6">
          <h1 className="font-bold text-2xl mt-4 mb-6 text-center">
            Übersicht Python-Lernpfad
          </h1>
          {/* AI-generated listing */}
          <div className="space-y-6">
            {pythonCategories.map((category) => (
              <div key={category.title} className="p-4 border rounded-lg">
                <h2 className="font-bold text-lg mb-3 text-gray-800">
                  {category.title}
                </h2>
                {category.quests.length > 0 ? (
                  <ul className="space-y-2">
                    {category.quests.map((quest) => (
                      <li
                        key={quest.id}
                        className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          setQuestReturnToMode('path')
                          const scroll =
                            document.getElementById('scroll-container')
                              ?.scrollTop ?? -1
                          setLearningPathScroll(scroll)
                          navigate(core, `#QUEST-${quest.id}`)
                        }}
                      >
                        {quest.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">
                    In diesem Kapitel gibt es keine Aufgaben.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-center mb-5 px-4 mt-8"></p>
      </div>
    </div>
  )
}
