import { Shared } from '../../components/pages/Shared'
import { sliderToDelay } from '../helper/speedSlider'
import { Core } from '../state/core'
import { addMessage } from './messages'
import { endExecution, testCondition } from './vm'
import {
  forward,
  left,
  right,
  brick,
  unbrick,
  setMark,
  resetMark,
} from './world'

export function setupWorker(core: Core) {
  if (core.worker) {
    return
  }

  console.log('Starte Setup der Worker ...')

  // scaffolding
  core.worker = {
    init: async () => {},
    run: async (code: string) => {},
    reset: () => {},
    mainWorker: null,
    backupWorker: null,
    mainWorkerReady: false,
    backupWorkerReady: false,
    sharedArrayDelay: new Int32Array(1),
  }

  let mainWorkerInitPromiseResolve: (() => void) | null = null

  function messageHandlerMain(event: MessageEvent) {
    if (!core.worker || !core.worker.mainWorker) return

    if (event.data == 'ready') {
      core.worker.mainWorkerReady = true
      core.mutateWs(({ ui }) => {
        ui.state = 'ready'
      })
      if (mainWorkerInitPromiseResolve) {
        mainWorkerInitPromiseResolve()
        mainWorkerInitPromiseResolve = null
      }
      core.worker.init()
    }

    if (event.data === 'done') {
      core.mutateWs(({ ui }) => {
        ui.state = 'ready'
      })
      endExecution(core)
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'action'
    ) {
      const action = event.data.action
      if (action === 'schritt') {
        forward(core)
      } else if (action === 'linksDrehen') {
        left(core)
      } else if (action === 'rechtsDrehen') {
        right(core)
      } else if (action === 'hinlegen') {
        brick(core)
      } else if (action === 'aufheben') {
        unbrick(core)
      } else if (action === 'markeSetzen') {
        setMark(core)
      } else if (action === 'markeLöschen') {
        resetMark(core)
      }
    }
    if (event.data.type && event.data.type == 'stdout') {
      addMessage(core, event.data.text)
    }
    if (event.data.type && event.data.type == 'check') {
      // console.log('main thread check:istWand')
      const { sharedBuffer, condition } = event.data
      const sharedArray = new Int32Array(sharedBuffer)
      sharedArray[0] = testCondition(core, JSON.parse(condition)) ? 1 : 0

      // console.log('main thread check:istWand', sharedArray[0])

      Atomics.notify(sharedArray, 0)
      // console.log('main thread notify done')
    }
    if (event.data.type && event.data.type == 'error') {
      console.log(event.data, event.data.message)
      endExecution(core)
      core.mutateWs(({ ui }) => {
        ui.state = 'error'
        ui.errorMessages = [event.data.error]
      })
    }
  }

  function messageHandlerBackup(event: MessageEvent) {
    if (!core.worker || !core.worker.backupWorker) return

    if (event.data == 'ready') {
      core.worker.backupWorkerReady = true
    }
  }

  core.worker.mainWorker = new Worker('/pyodide/karol-worker.mjs', {
    type: 'module',
  })

  core.worker.mainWorker.addEventListener('message', messageHandlerMain)

  core.worker.backupWorker = new Worker('/pyodide/karol-worker.mjs', {
    type: 'module',
  })

  core.worker.backupWorker.addEventListener('message', messageHandlerBackup)

  core.worker.init = async () => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.backupWorker)
      return

    if (!core.worker.mainWorkerReady) {
      core.worker.mainWorker.postMessage('init')
      console.log('Starte Haupt-Worker ...')

      return new Promise<void>((resolve) => {
        mainWorkerInitPromiseResolve = resolve
      })
    } else if (!core.worker.backupWorkerReady) {
      core.worker.backupWorker.postMessage('init')
      console.log('Starte Backup-Worker ...')
    }
  }

  core.worker.run = async (code: string) => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.backupWorker)
      return

    if (!core.worker.mainWorkerReady) {
      await core.worker.init()
    }

    const delayBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
    core.worker.sharedArrayDelay = new Int32Array(delayBuffer)

    core.worker.sharedArrayDelay[0] = sliderToDelay(core.ws.ui.speedSliderValue)

    core.worker.mainWorker.postMessage({
      type: 'run',
      code,
      delayBuffer,
    })
    core.mutateWs(({ ui, vm }) => {
      ui.state = 'running'
      ui.showJavaInfo = false
      ui.isManualAbort = false
      ui.isTestingAborted = false
      ui.isEndOfRun = false
      ui.karolCrashMessage = undefined
      vm.isDebugging = false
    })
  }

  core.worker.reset = async () => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.backupWorker)
      return

    core.worker.mainWorker.terminate()
    core.worker.mainWorker = core.worker.backupWorker

    core.worker.backupWorker = new Worker('/pyodide/karol-worker.mjs', {
      type: 'module',
    })

    core.worker.mainWorkerReady = core.worker.backupWorkerReady
    core.worker.backupWorkerReady = false

    core.worker.mainWorker.onmessage = messageHandlerMain
    core.worker.backupWorker.onmessage = messageHandlerBackup

    core.worker.init()

    if (!core.worker.mainWorkerReady) {
      core.mutateWs(({ ui }) => {
        ui.state = 'loading'
      })
    } else {
      core.mutateWs(({ ui }) => {
        ui.state = 'ready'
      })
    }
    core.mutateWs(({ ui }) => {
      ui.isManualAbort = true
      ui.isEndOfRun = true
    })
  }
}

export async function runPythonCode(core: Core) {
  await core.worker?.run(core.ws.pythonCode)
}
