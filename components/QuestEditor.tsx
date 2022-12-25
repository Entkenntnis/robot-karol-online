import clsx from 'clsx'
import {
  setDescription,
  setQuestPreview,
  setTitle,
} from '../lib/commands/editor'
import { processMiniMarkdown } from '../lib/helper/processMiniMarkdown'
import { useCore } from '../lib/state/core'

export function QuestEditor() {
  const core = useCore()
  return (
    <>
      <div className="mb-4 -mt-2">
        <button
          className={clsx(
            'px-2 py-1 hover:bg-yellow-200 rounded-tl rounded-tr',
            !core.ws.editor.questPreview && 'border-b-yellow-500 border-b-2'
          )}
          onClick={() => {
            setQuestPreview(core, false)
          }}
        >
          Bearbeiten
        </button>
        <button
          className={clsx(
            'px-2 py-1 hover:bg-yellow-200 rounded-tl rounded-tr',
            core.ws.editor.questPreview && 'border-b-yellow-500 border-b-2',
            'ml-3'
          )}
          onClick={() => {
            setQuestPreview(core, true)
          }}
        >
          Vorschau
        </button>
      </div>
      {core.ws.editor.questPreview ? (
        <>
          <h1 className="mb-3 text-xl font-bold">{core.ws.quest.title}</h1>
          <div>{processMiniMarkdown(core.ws.quest.description)}</div>
        </>
      ) : (
        <>
          <p>
            <input
              value={core.ws.quest.title}
              onChange={(e) => {
                setTitle(core, e.target.value)
              }}
              className="font-bold text-xl"
            />
          </p>
          <p className="mt-3">
            <textarea
              className="w-full h-[150px]"
              value={core.ws.quest.description}
              onChange={(e) => {
                setDescription(core, e.target.value)
              }}
            />
          </p>
        </>
      )}
    </>
  )
}
