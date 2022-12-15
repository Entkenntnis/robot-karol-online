import { useCore } from '../lib/state/core'

export function ControlBar() {
  const core = useCore()
  return (
    <>
      <button
        onClick={() => {
          core.mutateWs((ws) => {
            // ??
          })
        }}
      >
        Programm nochmal starten
      </button>
      <button
        onClick={() => {
          core.mutateWs((ws) => {
            ws.ui.showOutput = false
          })
        }}
      >
        Ausgabe schließen
      </button>
    </>
  )
}
