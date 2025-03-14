import { useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import { endExecution } from '../../lib/commands/vm'

export function PyodideWorker() {
  const core = useCore()
  useEffect(() => {
    const karolWorker = new Worker('/pyodide/karol-worker.mjs', {
      type: 'module',
    })

    core.worker = {
      init: async () => {
        karolWorker.postMessage({ type: 'init' })

        return new Promise<void>((resolve) => {
          karolWorker.addEventListener('message', function handler(event) {
            if (event.data === 'ready') {
              karolWorker.removeEventListener('message', handler)
              resolve()
            }
          })
        })
      },

      run: async (code: string) => {
        karolWorker.postMessage({ type: 'run', code })
        core.mutateWs(({ ui }) => {
          ui.state = 'running'
          ui.showJavaInfo = false
          ui.isManualAbort = false
          ui.isTestingAborted = false
          ui.isEndOfRun = false
          ui.karolCrashMessage = undefined
        })

        return new Promise<void>((resolve) => {
          karolWorker.addEventListener(
            'message',
            function messageHandler(event) {
              if (event.data === 'done') {
                core.mutateWs(({ ui }) => {
                  ui.state = 'ready'
                })
                endExecution(core)
                resolve()
                karolWorker.removeEventListener('message', messageHandler)
              }
            }
          )
        })
      },
    }

    return () => {
      karolWorker.terminate()
    }
  }, [core])

  return null
}
