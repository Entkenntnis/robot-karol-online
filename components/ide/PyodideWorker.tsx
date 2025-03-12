import { useEffect } from 'react'
import { useCore } from '../../lib/state/core'

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
          karolWorker.onmessage = (event) => {
            if (event.data === 'ready') {
              resolve()
            }
          }
        })
      },
    }

    return () => {
      karolWorker.terminate()
    }
  }, [core])

  return null
}
