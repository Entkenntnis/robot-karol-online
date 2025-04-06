import { useState } from 'react'
import { backend } from '../../backend'
import { deserializeQuest } from '../../lib/commands/json'
import { closeModal } from '../../lib/commands/modal'
import { questList } from '../../lib/data/overview'
import { questData as QuestDataDe } from '../../lib/data/quests'
import { useCore } from '../../lib/state/core'
import { QuestSerialFormat } from '../../lib/state/types'
import { questDataEn } from '../../lib/data/questsEn'

export function RemixModal() {
  const [selected, setSelected] = useState(-1)
  const [code, setCode] = useState('')

  const core = useCore()
  const questData = core.ws.settings.lng == 'de' ? QuestDataDe : questDataEn
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="min-h-[330px] w-[500px] bg-white z-[200] rounded-xl relative flex justify-between flex-col px-3"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div />
        <div>
          <p>{core.strings.editor.fromCode}:</p>
          <form
            onSubmit={(e) => {
              async function handler() {
                if (code.length == 4) {
                  try {
                    const res = await fetch(
                      `${backend.questEndpoint}/${code.toUpperCase()}`
                    )
                    const text = await res.text()
                    const obj = JSON.parse(text ?? '{}') as QuestSerialFormat
                    if (obj.version !== 'v1') {
                      throw 'bad format'
                    }
                    deserializeQuest(core, obj, false)
                  } catch (e) {
                    alert(e)
                  }
                  closeModal(core)
                }
              }

              void handler()
              e.preventDefault()
            }}
          >
            <p className="mt-2">
              https://karol.arrrg.de/#
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                }}
                className="border w-20 ml-2 uppercase text-lg"
                maxLength={4}
              />
              <button
                className="px-1 py-0.5 rounded bg-green-300 hover:bg-green-400 ml-3 disabled:bg-gray-300"
                type="submit"
                disabled={code.length != 4}
              >
                {core.strings.editor.load}
              </button>
            </p>
          </form>
        </div>
        <hr />
        <div>
          <p className="mt-2">{core.strings.editor.fromQuest}:</p>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(parseInt(e.target.value))
            }}
          >
            <option value={-1}>{core.strings.editor.pleaseChoose}</option>
            {questList.map((id) => (
              <option key={id} value={id}>
                {questData[id].title} (id {id})
              </option>
            ))}
          </select>
          <button
            className="px-1 py-0.5 rounded bg-green-300 hover:bg-green-400 ml-3 disabled:bg-gray-300"
            disabled={selected == -1}
            onClick={() => {
              const obj = questData[selected]
              if (obj) {
                core.mutateWs((ws) => {
                  ws.quest.title = obj.title
                  ws.quest.description = obj.description
                  ws.quest.tasks = obj.tasks
                  if (obj.script) {
                    ws.settings.language = 'python-pro'
                    ws.settings.mode = 'code'
                    ws.ui.needsTextRefresh = true
                    ws.pythonCode = obj.script.program
                    ws.editor.questScript = obj.script.questScript
                    ws.ui.editQuestScript = false
                    ws.ui.lockLanguage = 'python-pro'
                  }
                })
              }
              closeModal(core)
            }}
          >
            {core.strings.editor.load}
          </button>
        </div>
        <hr />
        <p>Aus Datei laden</p>
        <p>
          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                try {
                  const text = await file.text()
                  const obj = JSON.parse(text) as QuestSerialFormat
                  if (obj.version !== 'v1') {
                    throw 'bad format'
                  }
                  deserializeQuest(core, obj, false)
                  closeModal(core)
                } catch (error) {
                  alert(error)
                }
              }
            }}
          />
        </p>
        <hr />
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              closeModal(core)
            }}
          >
            {core.strings.editor.close}
          </button>
        </p>
      </div>
    </div>
  )
}
