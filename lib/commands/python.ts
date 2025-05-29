import { setDiagnostics } from '@codemirror/lint'
import { setExecutionMarker } from '../codemirror/basicSetup'
import { sliderToDelay } from '../helper/speedSlider'
import { Core } from '../state/core'
import { submitAnalyzeEvent } from './analyze'
import { addConsoleMessage } from './messages'
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
import { getTransport, PolySynth, start, Synth } from 'tone'

export function setupWorker(core: Core) {
  if (core.worker) {
    return
  }

  // console.log('Starte Setup der Worker ...')

  // scaffolding
  core.worker = {
    init: async () => {},
    run: async (code: string) => {},
    reset: () => {},
    input: (code: string) => {},
    lint: (code: string) => {},
    pause: () => {},
    resume: () => {},
    step: () => {},
    addBreakpoint: (line: number) => {},
    removeBreakpoint: (line: number) => {},
    prepareBench: () => new Promise(() => {}),
    messageBench: () => new Promise(() => {}),
    mainWorker: null,
    backupWorker: null,
    mainWorkerReady: false,
    backupWorkerReady: false,
    sharedArrayDelay: new Int32Array(1),
    debugInterface: new Int32Array(129),
    isFresh: true,
    benchMessageIdCounter: 1,
    benchMessageResolvers: new Map(),
  }

  let mainWorkerInitPromiseResolve: (() => void) | null = null

  function messageHandlerMain(event: MessageEvent) {
    if (!core.worker || !core.worker.mainWorker) return

    if (event.data == 'ready') {
      core.worker.mainWorkerReady = true
      // only continue if we are still in python mode
      if (
        core.ws.settings.language == 'python-pro' &&
        core.ws.settings.mode == 'code'
      ) {
        core.mutateWs(({ ui }) => {
          ui.state = 'ready'
        })
        if (mainWorkerInitPromiseResolve) {
          mainWorkerInitPromiseResolve()
          mainWorkerInitPromiseResolve = null
        }
        core.worker.init()
      }
    }

    if (event.data === 'done') {
      core.mutateWs(({ ui }) => {
        ui.state = 'ready'
        ui.keybindings = []
      })
      endExecution(core)
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'action'
    ) {
      const action = event.data.action
      let result = true
      if (action === 'schritt') {
        result = forward(core)
      } else if (action === 'linksDrehen') {
        left(core)
      } else if (action === 'rechtsDrehen') {
        right(core)
      } else if (action === 'hinlegen') {
        result = brick(core)
      } else if (action === 'aufheben') {
        result = unbrick(core)
      } else if (action === 'markeSetzen') {
        result = setMark(core)
      } else if (action === 'markeLöschen') {
        result = resetMark(core)
      } else if (action == 'beenden') {
        endExecution(core)
        core.worker.reset()
        core.mutateWs(({ ui }) => {
          ui.isManualAbort = false
          ui.isBench = false
        })
      }

      if (event.data.sharedBuffer) {
        const sharedArray = new Int32Array(event.data.sharedBuffer)
        sharedArray[0] = result ? 1 : 0
        Atomics.notify(sharedArray, 0)
      }
    }
    if (event.data.type && event.data.type == 'stdout') {
      addConsoleMessage(core, event.data.text)
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
    if (event.data.type && event.data.type == 'check-key') {
      // console.log('main thread check:istWand')
      const { sharedBuffer, key } = event.data
      const sharedArray = new Int32Array(sharedBuffer)
      const binding = core.ws.ui.keybindings.find((el) => el.key === key)
      sharedArray[0] = binding && binding.pressed ? 1 : 0

      // console.log('main thread check:istWand', sharedArray[0])

      Atomics.notify(sharedArray, 0)
      // console.log('main thread notify done')
    }
    if (event.data.type && event.data.type == 'error') {
      core.mutateWs(({ quest }) => {
        quest.progress = false
      })
      endExecution(core)
      if (
        core.ws.ui.isBench &&
        event.data.error.includes('Action') &&
        event.data.error.includes('failed')
      ) {
        return
      }
      if (core.ws.ui.isBench) {
        core.mutateWs(({ bench }) => {
          bench.locked = false
        })
      }
      core.mutateWs(({ ui }) => {
        ui.state = 'ready'
        ui.errorMessages = [filterTraceback(event.data.error)]
      })
      const match = event.data.error.match(
        /File "Programm\.py", line (\d+), in <module>/
      )
      if (match) {
        const line = parseInt(match[1])
        setExecutionMarker(core, line, 'error')
      }
    }

    if (event.data.type && event.data.type == 'stdin') {
      const { buffer } = event.data
      const syncArray = new Int32Array(buffer, 0, 2)
      const dataArray = new Uint8Array(buffer, 8)

      core.mutateWs(({ ui }) => {
        const lastMessage = ui.messages.pop()
        ui.inputPrompt = lastMessage?.text ?? 'Eingabe:'
      })

      core.worker.input = (input: string) => {
        const encoded = new TextEncoder().encode(input)
        if (encoded.length > dataArray.length) {
          alert('Input too long')
          return
        }
        dataArray.set(encoded)
        syncArray[1] = encoded.length
        syncArray[0] = 1

        Atomics.notify(syncArray, 0)

        //addConsoleMessage(core, '> ' + core.ws.ui.inputPrompt + ' ' + input)
        core.mutateWs(({ ui }) => {
          ui.inputPrompt = undefined
        })
      }
    }
    if (event.data.type && event.data.type == 'register_key') {
      const { key, title } = event.data
      core.mutateWs(({ ui }) => {
        ui.keybindings.push({ key, title: title ?? '', pressed: false })
      })
    }
    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'progress'
    ) {
      core.mutateWs((ws) => {
        ws.quest.progress = !!event.data.progress
      })
    }
    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'prompt'
    ) {
      core.mutateWs((ws) => {
        ws.ui.questPrompt = event.data.message
        ws.ui.questPromptConfirm = event.data.confirm
      })
      const sharedArray = new Int32Array(event.data.confirmBuffer)
      core.worker.questPromptConfirm = sharedArray
    }
    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'submit'
    ) {
      submitAnalyzeEvent(core, event.data.key)
    }
    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'highlight'
    ) {
      try {
        if (core.worker) {
          core.mutateWs(({ vm }) => {
            vm.isDebugging = core.worker!.debugInterface[0] > 0
          })
        }
        setExecutionMarker(
          core,
          event.data.line,
          core.ws.vm.isDebugging ? 'debugging' : 'normal'
        )
      } catch (e) {}
    }
    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'diagnostics' &&
      core.ws.settings.language == 'python-pro' &&
      core.ws.settings.mode == 'code'
    ) {
      const diagnostics = event.data.diagnostics
      if (core.view?.current) {
        if (diagnostics === 'ok') {
          core.view.current.dispatch(
            setDiagnostics(core.view.current.state, [])
          )

          core.mutateWs((ws) => {
            ws.ui.state = 'ready'
            ws.ui.errorMessages = []
          })
        } else {
          const [lineno, offset, end_lineno, end_offset, msg] =
            JSON.parse(diagnostics)
          const from =
            core.view.current.state.doc.line(lineno).from +
            Math.max(offset - 1, 0)
          const to = Math.max(
            from + 1,
            core.view.current.state.doc.line(end_lineno).from + end_offset
          )
          core.view.current.dispatch(
            setDiagnostics(core.view.current.state, [
              {
                from: Math.max(0, from),
                to: Math.min(to, core.view.current.state.doc.length),
                severity: 'error',
                message: msg,
              },
            ])
          )
          core.mutateWs(({ ui }) => {
            ui.state = 'error'
            ui.errorMessages = [`Line ${lineno}: ${msg}`]
            //ui.preview = undefined
          })
        }
      }
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'set-world'
    ) {
      const {
        select,
        x: x_raw,
        y: y_raw,
        elementType: type,
        count: count_raw,
      } = event.data
      const x = parseInt(x_raw)
      const y = parseInt(y_raw)
      const count = parseInt(count_raw)

      if (['brick', 'mark', 'block'].includes(type)) {
        core.mutateWs((ws) => {
          if (select.includes('A')) {
            // @ts-ignore
            ws.world[type + 's'][y][x] = type == 'brick' ? count : count > 0
          }
          if (select.includes('S')) {
            // @ts-ignore
            ws.quest.tasks[ws.quest.lastStartedTask!].start[type + 's'][y][x] =
              type == 'brick' ? count : count > 0
          }
          if (select.includes('T')) {
            if (!ws.quest.tasks[ws.quest.lastStartedTask!].target) {
              ws.quest.tasks[ws.quest.lastStartedTask!].target =
                ws.quest.tasks[ws.quest.lastStartedTask!].start
            }
            // @ts-ignore
            ws.quest.tasks[ws.quest.lastStartedTask!].target[type + 's'][y][x] =
              type == 'brick' ? count : count > 0
          }
        })
      }
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'bench'
    ) {
      const { payload, id } = event.data
      if (core.worker.benchMessageResolvers.has(id)) {
        const resolve = core.worker.benchMessageResolvers.get(id)
        core.worker.benchMessageResolvers.delete(id)
        if (resolve) {
          resolve(payload)
        }
      }
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'spawn-robot'
    ) {
      core.mutateWs(({ world }) => {
        world.karol.push({
          x: 0,
          y: 0,
          dir: 'south',
        })
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'set-canvas'
    ) {
      // very low level implementation
      core.mutateWs((ws) => {
        const data = JSON.parse(event.data.canvas)
        ws.canvas.objects = data
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'set-active-robot'
    ) {
      core.mutateWs((ws) => {
        ws.__activeRobot = event.data.id
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'hide-robot'
    ) {
      core.mutateWs((ws) => {
        ws.world.karol[event.data.id].x = -1
        ws.world.karol[event.data.id].y = -1
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type === 'enable-manual-control'
    ) {
      core.mutateWs((ws) => {
        ws.canvas.manualControl = true
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'get-karol-position'
    ) {
      const { buffer } = event.data
      const syncArray = new Int32Array(buffer, 0, 1)
      const dataArray = new Uint32Array(buffer, 4)
      const karol = core.ws.world.karol[core.ws.__activeRobot]
      const x = karol.x
      const y = karol.y
      dataArray[0] = x
      dataArray[1] = y
      syncArray[0] = 1
      Atomics.notify(syncArray, 0)
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'get-karol-heading'
    ) {
      const { buffer } = event.data
      const syncArray = new Int32Array(buffer, 0, 1)
      const dataArray = new Uint32Array(buffer, 4)
      const dir = core.ws.world.karol[core.ws.__activeRobot].dir
      dataArray[0] = ['north', 'east', 'south', 'west'].indexOf(dir)
      syncArray[0] = 1
      Atomics.notify(syncArray, 0)
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'set-karol-position'
    ) {
      const { x, y } = event.data
      core.mutateWs((ws) => {
        ws.world.karol[ws.__activeRobot].x = x
        ws.world.karol[ws.__activeRobot].y = y
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'set-karol-heading'
    ) {
      const { heading } = event.data
      core.mutateWs((ws) => {
        ws.world.karol[ws.__activeRobot].dir = heading
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'get-progress'
    ) {
      const { buffer } = event.data
      const syncArray = new Int32Array(buffer, 0, 1)
      const dataArray = new Int32Array(buffer, 4)
      dataArray[0] = core.ws.quest.progress ? 1 : 0
      syncArray[0] = 1
      Atomics.notify(syncArray, 0)
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'create-new-synth'
    ) {
      const { buffer } = event.data
      const syncArray = new Int32Array(buffer, 0, 1)
      const dataArray = new Int32Array(buffer, 4)
      const synthId = core.ws.canvas.synthIdCounter
      core.mutateWs((ws) => {
        ws.canvas.synthIdCounter++
      })
      const newSynth = new PolySynth(Synth).toDestination()
      start().then(() => {
        core.synths.set(synthId, newSynth)
        dataArray[0] = synthId
        syncArray[0] = 1
        Atomics.notify(syncArray, 0)
      })
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'play-synth'
    ) {
      const { id, frequency, duration } = event.data
      const synth = core.synths.get(parseInt(id))
      if (synth) {
        synth.triggerAttackRelease(JSON.parse(frequency), duration)
      }
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'set-bpm'
    ) {
      const { bpm } = event.data
      getTransport().bpm.value = parseInt(bpm)
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'convert-time-to-seconds'
    ) {
      const { buffer } = event.data
      const syncArray = new Int32Array(buffer, 0, 1)
      const dataArray = new Float32Array(buffer, 4)
      const { time } = event.data
      dataArray[0] = getTransport().toSeconds(time)
      syncArray[0] = 1
      Atomics.notify(syncArray, 0)
    }

    if (
      event.data &&
      typeof event.data === 'object' &&
      event.data.type == 'clear-output'
    ) {
      core.mutateWs(({ ui }) => {
        ui.messages = []
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
      // console.log('Starte Haupt-Worker ...')

      return new Promise<void>((resolve) => {
        mainWorkerInitPromiseResolve = resolve
      })
    } else if (!core.worker.backupWorkerReady) {
      core.worker.backupWorker.postMessage('init')
      // console.log('Starte Backup-Worker ...')
    }

    core.mutateWs(({ ui }) => {
      ui.state = 'ready'
    })

    if (core.view?.current) {
      core.worker.lint(core.view.current.state.doc.toString())
    }
  }

  core.worker.run = async (code: string) => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.backupWorker)
      return

    if (!core.worker.mainWorkerReady) {
      await core.worker.init()
    }

    core.worker.isFresh = false

    const delayBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
    core.worker.sharedArrayDelay = new Int32Array(delayBuffer)

    Atomics.store(
      core.worker.sharedArrayDelay,
      0,
      Math.round(sliderToDelay(core.ws.ui.speedSliderValue) * 1000)
    )

    const debugInterfaceBuffer = new SharedArrayBuffer(
      Int32Array.BYTES_PER_ELEMENT * 129
    )
    core.worker.debugInterface = new Int32Array(debugInterfaceBuffer)

    core.worker.debugInterface[0] = 0

    for (let i = 0; i < core.ws.ui.breakpoints.length; i++) {
      if (i > 128) break
      core.worker.debugInterface[i + 1] = core.ws.ui.breakpoints[i]
    }

    core.mutateWs((ws) => {
      ws.__activeRobot = 0
    })
    core.mutateWs(({ ui, vm, canvas }) => {
      ui.state = 'running'
      ui.showJavaInfo = false
      ui.isManualAbort = false
      ui.isTestingAborted = false
      ui.isEndOfRun = false
      ui.karolCrashMessage = undefined
      vm.isDebugging = false
      ui.messages = []
      ui.inputPrompt = undefined
      ui.errorMessages = []
      ui.keybindings = []
      canvas.manualControl = false
      canvas.objects = []
    })

    core.worker.mainWorker.postMessage({
      type: 'run',
      code,
      questScript: core.ws.editor.questScript, // todo: currently only working within the editor
      delayBuffer,
      debugInterfaceBuffer,
    })
  }

  core.worker.reset = () => {
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
    if (core.ws.ui.karolCrashMessage) {
      //setExecutionMarker(core, 0)
    } else {
      setExecutionMarker(core, 0)
    }
    core.mutateWs(({ ui, vm, canvas }) => {
      ui.isManualAbort = true
      ui.isEndOfRun = true
      ui.inputPrompt = undefined
      ui.keybindings = []
      ui.questPrompt = undefined
      vm.isDebugging = false
      canvas.manualControl = false
    })
    core.worker.isFresh = true
  }

  core.worker.lint = (code: string) => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.mainWorkerReady)
      return

    core.worker.mainWorker.postMessage({
      type: 'compile',
      code,
    })
  }

  core.worker.pause = () => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.mainWorkerReady)
      return

    core.worker.debugInterface[0] = 1
    Atomics.notify(core.worker.debugInterface, 0)
  }

  core.worker.resume = () => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.mainWorkerReady)
      return

    core.worker.debugInterface[0] = 0
    Atomics.notify(core.worker.debugInterface, 0)
  }

  core.worker.step = () => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.mainWorkerReady)
      return

    core.worker.debugInterface[0] = 2
    Atomics.notify(core.worker.debugInterface, 0)
  }

  core.worker.addBreakpoint = (line: number) => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.mainWorkerReady)
      return

    let i = 1
    while (core.worker.debugInterface[i] > 0) {
      if (core.worker.debugInterface[i] == line) {
        return
      }
      i++
      if (i > 128) {
        return
      }
    }
    core.worker.debugInterface[i] = line
  }

  core.worker.removeBreakpoint = (line: number) => {
    if (!core.worker || !core.worker.mainWorker || !core.worker.mainWorkerReady)
      return

    let i = 1
    while (core.worker.debugInterface[i] > 0) {
      if (core.worker.debugInterface[i] == line) {
        core.worker.debugInterface[i] = 0
        // move all following breakpoints one step back
        let j = i + 1
        while (core.worker.debugInterface[j] > 0) {
          core.worker.debugInterface[j - 1] = core.worker.debugInterface[j]
          core.worker.debugInterface[j] = 0
          j++
        }
        return
      }
      i++
      if (i > 128) {
        return
      }
    }
  }

  core.worker.prepareBench = async () => {
    if (
      !core.worker ||
      !core.worker.mainWorker ||
      !core.worker.backupWorker ||
      !core.worker.mainWorkerReady
    )
      throw new Error('Worker not ready')

    core.worker.isFresh = false

    const id = core.worker.benchMessageIdCounter++

    const delayBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
    core.worker.sharedArrayDelay = new Int32Array(delayBuffer)

    Atomics.store(
      core.worker.sharedArrayDelay,
      0,
      Math.round(sliderToDelay(core.ws.ui.speedSliderValue) * 1000)
    )

    core.worker.mainWorker.postMessage({
      type: 'bench',
      command: 'prepare',
      id,
      delayBuffer: core.worker.sharedArrayDelay,
    })

    return new Promise((resolve) => {
      core.worker!.benchMessageResolvers.set(id, resolve)
    })
  }

  core.worker.messageBench = async (payload: object) => {
    if (
      !core.worker ||
      !core.worker.mainWorker ||
      !core.worker.backupWorker ||
      !core.worker.mainWorkerReady
    )
      throw new Error('Worker not ready')

    const id = core.worker.benchMessageIdCounter++

    core.worker.mainWorker.postMessage({
      type: 'bench',
      command: 'message',
      payload,
      id,
    })

    return new Promise((resolve) => {
      core.worker!.benchMessageResolvers.set(id, resolve)
    })
  }
}

export async function runPythonCode(core: Core) {
  await core.worker?.run(core.ws.pythonCode)
}

function filterTraceback(traceback: string): string {
  // Split the traceback into individual lines.
  const lines = traceback.split('\n')

  // Define patterns that indicate uninteresting (internal) lines.
  // You can add more regex patterns here as needed.
  const uninterestingPatterns = [
    /\/lib\/python[^"]*/, // Lines from system libraries
    /_pyodide/, // Pyodide internals
    /pyodide/, // Pyodide internals
    /QuestScript\.py/, // QuestScript file
  ]

  const result: string[] = []
  // A flag to indicate that the previous frame was uninteresting,
  // so we skip its following indented (code snippet) lines.
  let skipBlock = false

  for (const line of lines) {
    // If the line is a traceback frame line (typically starts with "  File")
    if (/^\s*File /.test(line)) {
      // Check if the line matches any uninteresting pattern.
      let isInteresting = true
      for (const pattern of uninterestingPatterns) {
        if (pattern.test(line)) {
          isInteresting = false
          break
        }
      }
      if (isInteresting) {
        result.push(line)
        skipBlock = false // This frame is interesting, so include subsequent indented lines.
      } else {
        skipBlock = true // Skip this frame and its following indented code.
      }
    } else if (/^\s/.test(line)) {
      // This line is indented (likely part of a traceback frame)
      // Only include it if we are not in a skip block.
      if (!skipBlock) {
        result.push(line)
      }
    } else {
      // Non-indented lines (like the header or final error message) are always kept.
      result.push(line)
      skipBlock = false
    }
  }

  return result.join('\n')
}
