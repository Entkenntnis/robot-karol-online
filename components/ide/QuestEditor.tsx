import clsx from 'clsx'
import {
  setDescription,
  setQuestPreview,
  setTitle,
} from '../../lib/commands/editor'
import { processMarkdown } from '../../lib/helper/processMiniMarkdown'
import { useCore } from '../../lib/state/core'
import { navigate } from '../../lib/commands/router'
import { deleteEditorSnapshot } from '../../lib/storage/storage'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'

export function QuestEditor() {
  const core = useCore()
  return (
    <>
      <div className="absolute right-3 top-4 text-gray-600 hover:text-black">
        <button
          onClick={() => {
            const res = confirm(core.strings.editor.leaveWarning)
            if (res) {
              deleteEditorSnapshot()
              navigate(core, '')
            }
          }}
        >
          {core.strings.editor.leave}
        </button>
      </div>
      <div className="mb-4 -mt-2">
        <button
          className={clsx(
            'px-2 py-1 hover:bg-yellow-200 rounded-tl rounded-tr',
            !core.ws.editor.showQuestPreview && 'border-b-yellow-500 border-b-2'
          )}
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_editor_disablePreview')
            setQuestPreview(core, false)
            core.mutateWs((ws) => {
              ws.pythonCode = ws.editor.originalCode ?? ws.pythonCode
              ws.ui.needsTextRefresh = true
            })
          }}
        >
          {core.strings.editor.edit}
        </button>
        <button
          className={clsx(
            'px-2 py-1 hover:bg-yellow-200 rounded-tl rounded-tr',
            core.ws.editor.showQuestPreview && 'border-b-yellow-500 border-b-2',
            'ml-3'
          )}
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_editor_enablePreview')
            setQuestPreview(core, true)
            core.mutateWs((ws) => {
              ws.editor.originalCode = ws.pythonCode
            })
          }}
        >
          {core.strings.editor.preview}
        </button>
      </div>
      {core.ws.editor.showQuestPreview ? (
        <>
          <h1 className="mb-3 text-xl font-bold">{core.ws.quest.title}</h1>
          <div>{processMarkdown(core.ws.quest.description)}</div>
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
