import { useState } from 'react'
import { backend } from '../backend'
import { deserializeQuest } from '../lib/commands/json'
import { setShowRemix } from '../lib/commands/mode'
import { questList } from '../lib/data/overview'
import { questData } from '../lib/data/quests'
import { useCore } from '../lib/state/core'
import { QuestSerialFormat } from '../lib/state/types'

export function RemixModal() {
  const [selected, setSelected] = useState(-1)
  const [code, setCode] = useState('')

  const core = useCore()
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setShowRemix(core, false)
      }}
    >
      <div
        className="min-h-[310px] w-[500px] bg-white z-[200] rounded-xl relative flex justify-between flex-col px-3"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div />
        <div>
          <p>Aus freigegebener Aufgabe, gib den vierstelligen Code ein:</p>
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
              disabled={code.length != 4}
              onClick={() => {
                async function handler() {
                  try {
                    const res = await fetch(
                      `${backend.questEndpoint}/${code.toUpperCase()}`
                    )
                    const text = await res.text()
                    const obj = JSON.parse(text ?? '{}') as QuestSerialFormat
                    if (obj.version !== 'v1') {
                      throw 'bad format'
                    }
                    deserializeQuest(core, obj)
                  } catch (e) {
                    alert(e)
                  }
                  setShowRemix(core, false)
                }

                void handler()
              }}
            >
              Laden
            </button>
          </p>
        </div>
        <hr />
        <div>
          <p className="mt-2">Aus einer vorhandenen Aufgabe:</p>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(parseInt(e.target.value))
            }}
          >
            <option value={-1}>--- bitte auswählen ---</option>
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
                })
              }
              setShowRemix(core, false)
            }}
          >
            Laden
          </button>
        </div>
        <hr />
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              setShowRemix(core, false)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
