import { setShowStructogram } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'

export function Structogram() {
  const core = useCore()

  return (
    <div className="h-full bg-pink-200">
      <p className="text-right">
        <button
          className="underline my-4 mr-4"
          onClick={() => {
            setShowStructogram(core, false)
          }}
        >
          Ansicht schließen
        </button>
      </p>
      {core.ws.ui.state !== 'ready' ? (
        <p>Struktogramm kann im Moment nicht angezeigt werden.</p>
      ) : (
        renderStructogram()
      )}
    </div>
  )

  function renderStructogram() {
    const code = core.ws.code
    return <>ok</>
  }
}
