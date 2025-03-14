import { useEffect, useRef } from 'react'
import { useCore } from '../../lib/state/core'
import { endExecution } from '../../lib/commands/vm'
import { forward, left, right } from '../../lib/commands/world'

export function PyodideWorker() {
  const core = useCore()
  const karolWorkerRef = useRef<Worker | null>(null)

  useEffect(() => {
    console.log('create new worker')
    karolWorkerRef.current = new Worker('/pyodide/karol-worker.mjs', {
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

        karolWorkerRef.current?.postMessage({ type: 'init' })

        return new Promise<void>((resolve) => {
          const handler = (event: MessageEvent) => {
            if (event.data === 'ready') {
              karolWorkerRef.current?.removeEventListener('message', handler)
              core.mutateWs(({ ui }) => {
                ui.state = 'ready'
              })
              core.worker!.initDone = true
              console.log('pyodide ready')
              resolve()
            }
          }

          karolWorkerRef.current?.addEventListener('message', handler)
        })
      },

      run: async (code: string) => {
        karolWorkerRef.current?.postMessage({ type: 'run', code })
        core.mutateWs(({ ui, vm }) => {
          ui.state = 'running'
          ui.showJavaInfo = false
          ui.isManualAbort = false
          ui.isTestingAborted = false
          ui.isEndOfRun = false
          ui.karolCrashMessage = undefined
          vm.isDebugging = false
        })

        return new Promise<void>((resolve) => {
          const messageHandler = (event: MessageEvent) => {
            if (event.data === 'done') {
              core.mutateWs(({ ui }) => {
                ui.state = 'ready'
              })
              endExecution(core)
              resolve()
              karolWorkerRef.current?.removeEventListener(
                'message',
                messageHandler
              )
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

          karolWorkerRef.current?.addEventListener('message', messageHandler)
        })
      },

      reset: () => {
        karolWorkerRef.current?.terminate()
        core.mutateWs(({ ui }) => {
          ui.state = 'loading'
          ui.isManualAbort = true
          ui.isEndOfRun = true
        })
        karolWorkerRef.current = new Worker('/pyodide/karol-worker.mjs', {
          type: 'module',
        })
        core.worker!.initDone = false
        core.worker?.init()
      },
    }

    return () => {
      karolWorkerRef.current?.terminate()
      karolWorkerRef.current = null
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
