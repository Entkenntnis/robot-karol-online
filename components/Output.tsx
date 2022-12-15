import { useCore } from '../lib/state/core'
import { View } from './View'

export function Output() {
  const core = useCore()
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 flex-grow-0 border-b">
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
      </div>
      <div className="flex-grow h-full flex items-center justify-center">
        <View
          hideKarol={false}
          wireframe={false}
          world={core.ws.world}
          className="mb-32 mt-12"
        />
      </div>
    </div>
  )
}
