// webworker.mjs
import { loadPyodide } from '/pyodide/pyodide.mjs'

let initStarted = false
let pyodide = null

let delay = new Int32Array(1)
let lastStepTs = -1

let decoder = new TextDecoder()

self.onmessage = async (event) => {
  if (event.data == 'init') {
    if (pyodide) {
      self.postMessage('ready')
      return
    }
    if (!initStarted) {
      initStarted = true
      pyodide = await loadPyodide()
      pyodide.runPython(`import sys; sys.version`)
      // console.log('Pyodide warmup abgeschlossen')
      self.postMessage('ready')
    }
  }

  if (event.data.type === 'run') {
    delay = new Int32Array(event.data.delayBuffer)
    lastStepTs = performance.now() * 1000
    // console.log('Running Python code:', event.data.code)
    const globals = pyodide.toPy({
      Robot: () => {
        return {
          schritt: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'schritt' })
              sleepWithDelay()
            }
          },
          linksDrehen: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'linksDrehen' })
              sleepWithDelay()
            }
          },
          rechtsDrehen: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'rechtsDrehen' })
              sleepWithDelay()
            }
          },
          hinlegen: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'hinlegen' })
              sleepWithDelay()
            }
          },
          aufheben: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'aufheben' })
              sleepWithDelay()
            }
          },
          markeSetzen: (n = 1) => {
            self.postMessage({ type: 'action', action: 'markeSetzen' })
            sleepWithDelay()
          },
          markeLöschen: (n = 1) => {
            self.postMessage({ type: 'action', action: 'markeLöschen' })
            sleepWithDelay()
          },
          istWand: (direction = null) => {
            return checkCondition({ type: 'wall', negated: false, direction })
          },
          nichtIstWand: (direction = null) => {
            return checkCondition({ type: 'wall', negated: true, direction })
          },
          istMarke: () => {
            return checkCondition({ type: 'mark', negated: false })
          },
          nichtIstMarke: () => {
            return checkCondition({ type: 'mark', negated: true })
          },
          istZiegel: (count = undefined) => {
            return checkCondition({ type: 'brick', negated: false, count })
          },
          nichtIstZiegel: (count = undefined) => {
            return checkCondition({ type: 'brick', negated: true, count })
          },
          istNorden: () => {
            return checkCondition({ type: 'north', negated: false })
          },
          nichtIstNorden: () => {
            return checkCondition({ type: 'north', negated: true })
          },
          istOsten: () => {
            return checkCondition({ type: 'east', negated: false })
          },
          nichtIstOsten: () => {
            return checkCondition({ type: 'east', negated: true })
          },
          istSüden: () => {
            return checkCondition({ type: 'south', negated: false })
          },
          nichtIstSüden: () => {
            return checkCondition({ type: 'south', negated: true })
          },
          istWesten: () => {
            return checkCondition({ type: 'west', negated: false })
          },
          nichtIstWesten: () => {
            return checkCondition({ type: 'west', negated: true })
          },
          beenden: () => {
            self.postMessage({ type: 'action', action: 'beenden' })
          },
        }
      },
      __ide_setOnDone: (fn) => {
        setTimeout(() => {
          fn()
        }, 3000)
      },
    })
    sleep(150)
    try {
      pyodide.setStdout({
        write: (buf) => {
          const written_string = decoder.decode(buf)
          self.postMessage({ type: 'stdout', text: written_string })
          return buf.length
        },
      })
      pyodide.setStdin({
        stdin() {
          const buffer = new SharedArrayBuffer(1024)
          const syncArray = new Int32Array(buffer, 0, 2)
          const dataArray = new Uint8Array(buffer, 8)

          self.postMessage({
            type: 'stdin',
            buffer,
          })

          Atomics.wait(syncArray, 0, 0)

          const length = Atomics.load(syncArray, 1)
          // Read the input bytes.
          const inputBytes = dataArray.slice(0, length)
          lastStepTs = performance.now() * 1000
          return inputBytes
        },
      })
      pyodide.registerJsModule('RobotKarolOnline', {
        tasteRegistrieren: (key, title) => {
          postMessage({
            type: 'register_key',
            key,
            title,
          })
        },
        tasteGedrückt: (key) => {
          const sharedBuffer = new SharedArrayBuffer(
            Int32Array.BYTES_PER_ELEMENT
          )
          const sharedArray = new Int32Array(sharedBuffer)
          Atomics.store(sharedArray, 0, 42) // no data yet
          self.postMessage({
            type: 'check-key',
            sharedBuffer,
            key,
          })
          Atomics.wait(sharedArray, 0, 42)
          lastStepTs = performance.now() * 1000
          return sharedArray[0] === 1
        },
      })
      pyodide.setDebug(true) // maybe helpful?
      if (event.data.questScript) {
        await pyodide.runPythonAsync(event.data.questScript, {
          globals,
          filename: 'QuestScript.py',
        })
      }
      const result = await pyodide.runPythonAsync(event.data.code, {
        globals,
        filename: 'Programm.py',
      })
      console.log('Python code result:', result)
    } catch (error) {
      console.log('error!!!', error)
      self.postMessage({ type: 'error', error: error.message })
      return
    }
    self.postMessage('done')
  }
}

function sleepWithDelay() {
  const nextStepTs = lastStepTs + Atomics.load(delay, 0)
  const now = performance.now() * 1000

  if (now >= nextStepTs) {
    lastStepTs = Math.max(nextStepTs, now - 1000 * 1000)
    return
  } else {
    const waitTime = nextStepTs - now
    sleep(Math.min(waitTime / 1000, 100))
    sleepWithDelay()
  }
}

function sleep(ms) {
  const x = new WebAssembly.Memory({ shared: true, initial: 1, maximum: 1 })
  const b = new Int32Array(x.buffer)
  // console.log('before sleep')
  Atomics.wait(b, 0, 0, ms)
  // console.log('After sleep')
}

function checkCondition(cond) {
  const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
  const sharedArray = new Int32Array(sharedBuffer)
  Atomics.store(sharedArray, 0, 42) // no data yet
  self.postMessage({
    type: 'check',
    sharedBuffer,
    condition: JSON.stringify(cond),
  })
  Atomics.wait(sharedArray, 0, 42)
  return sharedArray[0] === 1
}
