import { useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import { setupWorker } from '../../lib/commands/python'

export function PyodideWorker() {
  const core = useCore()

  useEffect(() => {
    if (!core.worker) {
      setupWorker(core)
    }
  }, [core])

  useEffect(() => {
    if (core.worker) {
      if (core.ws.settings.language == 'python' && core.ws.ui.proMode) {
        core.mutateWs(({ ui }) => {
          ui.state = 'loading'
        })
        core.worker.init()
      }
    }
  }, [core, core.worker, core.ws.settings.language, core.ws.ui.proMode])

  return null
}
