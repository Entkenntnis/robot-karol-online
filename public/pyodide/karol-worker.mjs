// webworker.mjs
import { loadPyodide } from '/pyodide/pyodide.mjs'

let initStarted = false
let pyodide = null

let delay = new Int32Array(1)
let lastStepTs = -1

const decoder = new TextDecoder()

let debug = new Int32Array(129)

const compileScript = (code) => `
def check_syntax(code):
    try:
        compile(code, "<string>", "exec")
        return "ok"
    except SyntaxError as e:
        return f"[{e.lineno}, {e.offset}, {e.end_lineno}, {e.end_offset}, \\"{e.msg}\\"]"

check_syntax(${JSON.stringify(code)})
`

const throwFauxTypeError = (cls, member, expected_args, rest) => {
  if (rest.length > 0)
    throw TypeError(
      `${cls}.${member}() only takes ${expected_args} argument(s) (${
        expected_args + rest.length
      } were given)`
    )
}

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
      self.postMessage('ready')
    }
  }

  if (event.data.type === 'compile' && pyodide) {
    const diagnostics = pyodide.runPython(compileScript(event.data.code))
    self.postMessage({
      type: 'diagnostics',
      diagnostics,
    })
  }

  if (event.data.type === 'run') {
    delay = new Int32Array(event.data.delayBuffer)
    debug = new Int32Array(event.data.debugInterfaceBuffer, 0, 129)
    const debugRef = { current: debug }
    const traceback = pyodide.pyimport('traceback')
    const enableHighlight = { current: true }
    function highlightCurrentLine() {
      if (enableHighlight.current) {
        const stack = traceback.extract_stack()
        const line = stack[stack.length - 1].lineno
        if (debugRef.current[0] == 0) {
          // check if we are in a breakpoint
          for (let i = 1; i < debugRef.current.length; i++) {
            if (debugRef.current[i] == line) {
              debugRef.current[0] = 1
              break
            }
          }
        }
        self.postMessage({
          type: 'highlight',
          line,
        })
      }
    }
    const outputs = []
    const inputs = []
    const Robot = () => {
      return {
        schritt: (n, ...rest) => {
          throwFauxTypeError('Robot', 'schritt', 1, rest)
          const count = isNaN(n) ? 1 : n
          for (let i = 0; i < count; i++) {
            highlightCurrentLine()
            checkDebug()
            self.postMessage({ type: 'action', action: 'schritt' })
            sleepWithDelay()
          }
        },
        linksDrehen: (n, ...rest) => {
          throwFauxTypeError('Robot', 'linksDrehen', 1, rest)
          const count = isNaN(n) ? 1 : n
          for (let i = 0; i < count; i++) {
            highlightCurrentLine()
            checkDebug()
            self.postMessage({ type: 'action', action: 'linksDrehen' })
            sleepWithDelay()
          }
        },
        rechtsDrehen: (n, ...rest) => {
          throwFauxTypeError('Robot', 'rechtsDrehen', 1, rest)
          const count = isNaN(n) ? 1 : n
          for (let i = 0; i < count; i++) {
            highlightCurrentLine()
            checkDebug()
            self.postMessage({ type: 'action', action: 'rechtsDrehen' })
            sleepWithDelay()
          }
        },
        hinlegen: (n, ...rest) => {
          throwFauxTypeError('Robot', 'hinlegen', 1, rest)
          const count = isNaN(n) ? 1 : n
          for (let i = 0; i < count; i++) {
            highlightCurrentLine()
            checkDebug()
            self.postMessage({ type: 'action', action: 'hinlegen' })
            sleepWithDelay()
          }
        },
        aufheben: (n, ...rest) => {
          throwFauxTypeError('Robot', 'aufheben', 1, rest)
          const count = isNaN(n) ? 1 : n
          for (let i = 0; i < count; i++) {
            highlightCurrentLine()
            checkDebug()
            self.postMessage({ type: 'action', action: 'aufheben' })
            sleepWithDelay()
          }
        },
        markeSetzen: (...rest) => {
          throwFauxTypeError('Robot', 'markeSetzen', 0, rest)
          highlightCurrentLine()
          checkDebug()
          self.postMessage({ type: 'action', action: 'markeSetzen' })
          sleepWithDelay()
        },
        markeLöschen: (...rest) => {
          throwFauxTypeError('Robot', 'markeLöschen', 0, rest)
          highlightCurrentLine()
          checkDebug()
          self.postMessage({ type: 'action', action: 'markeLöschen' })
          sleepWithDelay()
        },
        istWand: (...rest) => {
          throwFauxTypeError('Robot', 'istWand', 0, rest)
          if (!direction) direction = null
          return checkCondition({ type: 'wall', negated: false }) // direction is not handled by testCondition, removed
        },
        nichtIstWand: (...rest) => {
          throwFauxTypeError('Robot', 'nichtIstWand', 0, rest)
          if (!direction) direction = null
          return checkCondition({ type: 'wall', negated: true }) // direction is not handled by testCondition, removed
        },
        istMarke: (...rest) => {
          throwFauxTypeError('Robot', 'istMarke', 0, rest)
          return checkCondition({ type: 'mark', negated: false })
        },
        nichtIstMarke: (...rest) => {
          throwFauxTypeError('Robot', 'nichtIstMarke', 0, rest)
          return checkCondition({ type: 'mark', negated: true })
        },
        istZiegel: (count, ...rest) => {
          throwFauxTypeError('Robot', 'istZiegel', 1, rest)
          if (count !== undefined)
            return checkCondition({
              type: 'brick_count',
              negated: false,
              count,
            })
          return checkCondition({ type: 'brick', negated: false, count })
        },
        nichtIstZiegel: (count, ...rest) => {
          throwFauxTypeError('Robot', 'nichtIstZiegel', 1, rest)
          if (count !== undefined)
            return checkCondition({ type: 'brick_count', negated: true, count })
          return checkCondition({ type: 'brick', negated: true, count })
        },
        istNorden: (...rest) => {
          throwFauxTypeError('Robot', 'istNorden', 0, rest)
          return checkCondition({ type: 'north', negated: false })
        },
        nichtIstNorden: (...rest) => {
          throwFauxTypeError('Robot', 'nichtIstNorden', 0, rest)
          return checkCondition({ type: 'north', negated: true })
        },
        istOsten: (...rest) => {
          throwFauxTypeError('Robot', 'istOsten', 0, rest)
          return checkCondition({ type: 'east', negated: false })
        },
        nichtIstOsten: (...rest) => {
          throwFauxTypeError('Robot', 'nichtIstOsten', 0, rest)
          return checkCondition({ type: 'east', negated: true })
        },
        istSüden: (...rest) => {
          throwFauxTypeError('Robot', 'istSüden', 0, rest)
          return checkCondition({ type: 'south', negated: false })
        },
        nichtIstSüden: (...rest) => {
          throwFauxTypeError('Robot', 'nichtIstSüden', 0, rest)
          return checkCondition({ type: 'south', negated: true })
        },
        istWesten: (...rest) => {
          throwFauxTypeError('Robot', 'istWesten', 0, rest)
          return checkCondition({ type: 'west', negated: false })
        },
        nichtIstWesten: (...rest) => {
          throwFauxTypeError('Robot', 'nichtIstWesten', 0, rest)
          return checkCondition({ type: 'west', negated: true })
        },
        beenden: (...rest) => {
          throwFauxTypeError('Robot', 'beenden', 0, rest)
          self.postMessage({ type: 'action', action: 'beenden' })
        },
      }
    }
    const globals = pyodide.toPy({
      Robot,
      __ide_run_client: (args) => {
        enableHighlight.current = true
        const tGlobals = pyodide.toPy({ Robot })
        if (args && args.globals) {
          for (const key of args.globals) {
            tGlobals.set(key, globals.get(key))
          }
        }
        pyodide.runPython(event.data.code, {
          globals: tGlobals,
          filename: 'Programm.py',
        })
        self.postMessage({ type: 'highlight', line: 0 })
        enableHighlight.current = false
        for (const key of tGlobals) {
          if (
            key == 'Robot' ||
            key == '__builtins__' ||
            key.startsWith('__ide_')
          )
            continue
          globals.set(key, tGlobals.get(key))
        }
      },
      __ide_set_progress: (progress) => {
        self.postMessage({
          type: 'progress',
          progress,
        })
      },
      __ide_prompt: (message, confirm) => {
        const confirmBuffer = new SharedArrayBuffer(
          Int32Array.BYTES_PER_ELEMENT
        )
        const sharedArray = new Int32Array(confirmBuffer)
        sharedArray[0] = 42 // no data yet
        self.postMessage({
          type: 'prompt',
          confirmBuffer,
          message,
          confirm: confirm || undefined,
        })
        Atomics.wait(sharedArray, 0, 42)
        sleep(100)
        lastStepTs = performance.now() * 1000
      },
      __ide_submit: (key) => {
        self.postMessage({
          type: 'submit',
          key,
        })
      },
      __ide_get_outputs: () => {
        return pyodide.toPy(outputs)
      },
      __ide_get_inputs: () => {
        return pyodide.toPy(inputs)
      },
      __ide_sleep: (s) => {
        sleep(s * 1000)
      },
      __ide_exit: () => {
        self.postMessage({ type: 'action', action: 'beenden' })
      },
      __ide_set_world: (select, x, y, type, count) => {
        self.postMessage({
          type: 'set-world',
          select,
          x,
          y,
          elementType: type,
          count,
        })
      },
    })
    sleep(150)
    try {
      pyodide.setStdout({
        write: (buf) => {
          const written_string = decoder.decode(buf)
          outputs.push(written_string)
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
          inputs.push(decoder.decode(inputBytes))
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
      lastStepTs = performance.now() * 1000
      if (event.data.questScript) {
        enableHighlight.current = false
        await pyodide.runPythonAsync(event.data.questScript, {
          globals,
          filename: 'QuestScript.py',
        })
        self.postMessage('done')
      } else {
        await pyodide.runPythonAsync(event.data.code, {
          globals,
          filename: 'Programm.py',
        })
        self.postMessage('done')
      }
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message })
      return
    }
  }

  if (event.data.type === 'bench') {
    const id = event.data.id
    const command = event.data.command

    if (command == 'prepare') {
      const version = pyodide.runPython(`import sys; sys.version`)
      self.postMessage({ type: 'bench', id, payload: { version } })
    }
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
  Atomics.wait(b, 0, 0, ms)
}

function checkDebug() {
  while (true) {
    if (debug[0] == 0) {
      break // not debugging
    } else if (debug[0] == 2) {
      // step
      debug[0] = 1
      break
    } else if (debug[0] == 1) {
      Atomics.wait(debug, 0, 1)
    } else {
      // safeguard
      debug[0] = 0
      break
    }
  }
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
