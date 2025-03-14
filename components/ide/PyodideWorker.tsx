import { useEffect, useRef } from 'react'
import { useCore } from '../../lib/state/core'
import { endExecution } from '../../lib/commands/vm'
import { forward, left, right } from '../../lib/commands/world'

export function PyodideWorker() {
  const core = useCore()
  useEffect(() => {
    console.log('create new worker')
    const karolWorker = new Worker('/pyodide/karol-worker.mjs', {
      type: 'module',
    })

    core.worker = {
      initDone: false,
      init: async () => {
        if (core.worker?.initDone) {
          core.mutateWs(({ ui }) => {
            ui.state = 'ready'
          })
          return
        }

        karolWorker.postMessage({ type: 'init' })

        return new Promise<void>((resolve) => {
          karolWorker.addEventListener('message', function handler(event) {
            if (event.data === 'ready') {
              karolWorker.removeEventListener('message', handler)
              core.mutateWs(({ ui }) => {
                ui.state = 'ready'
              })
              core.worker!.initDone = true
              console.log('pyodide ready')
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
              if (event.data == 'action:schritt') {
                forward(core)
              }
              if (event.data == 'action:linksDrehen') {
                left(core)
              }
              if (event.data == 'action:rechtsDrehen') {
                right(core)
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

  useEffect(() => {
    if (core.worker) {
      if (core.ws.settings.language == 'python' && core.ws.ui.proMode) {
        core.mutateWs(({ ui }) => {
          ui.state = 'loading'
        })
        console.log('Loading pyodide...')
        core.worker.init()
      }
    }
  }, [core, core.worker, core.ws.settings.language, core.ws.ui.proMode])

  return null
}
