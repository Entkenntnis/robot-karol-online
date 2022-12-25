import { setDescription, setTitle } from '../lib/commands/editor'
import { useCore } from '../lib/state/core'

export function QuestEditor() {
  const core = useCore()
  return (
    <>
      <p>
        <input
          value={core.ws.quest.title}
          onChange={(e) => {
            setTitle(core, e.target.value)
          }}
          className="font-bold"
        />
      </p>
      <p className="mt-3">
        <textarea
          className="w-full h-[300px]"
          value={core.ws.quest.description}
          onChange={(e) => {
            setDescription(core, e.target.value)
          }}
        />
      </p>
    </>
  )
}
