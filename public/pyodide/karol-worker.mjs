// webworker.mjs
import { loadPyodide } from '/pyodide/pyodide.mjs'

let initStarted = false
let pyodide = null

let delay = new Int32Array(1)
let lastStepTs = -1

const decoder = new TextDecoder()

let debug = new Int32Array(129)

let outputs = []
let inputs = []

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

let benchGlobals = null

export function buildRobot(highlightCurrentLine = () => {}) {
  return () => {
    return {
      schritt: (n, ...rest) => {
        throwFauxTypeError('Robot', 'schritt', 1, rest)
        const count = isNaN(n) ? 1 : n
        for (let i = 0; i < count; i++) {
          highlightCurrentLine()
          checkDebug()
          runAction('schritt')
          sleepWithDelay()
        }
      },
      linksDrehen: (n, ...rest) => {
        throwFauxTypeError('Robot', 'linksDrehen', 1, rest)
        const count = isNaN(n) ? 1 : n
        for (let i = 0; i < count; i++) {
          highlightCurrentLine()
          checkDebug()
          runAction('linksDrehen')
          sleepWithDelay()
        }
      },
      rechtsDrehen: (n, ...rest) => {
        throwFauxTypeError('Robot', 'rechtsDrehen', 1, rest)
        const count = isNaN(n) ? 1 : n
        for (let i = 0; i < count; i++) {
          highlightCurrentLine()
          checkDebug()
          runAction('rechtsDrehen')
          sleepWithDelay()
        }
      },
      hinlegen: (n, ...rest) => {
        throwFauxTypeError('Robot', 'hinlegen', 1, rest)
        const count = isNaN(n) ? 1 : n
        for (let i = 0; i < count; i++) {
          highlightCurrentLine()
          checkDebug()
          runAction('hinlegen')
          sleepWithDelay()
        }
      },
      aufheben: (n, ...rest) => {
        throwFauxTypeError('Robot', 'aufheben', 1, rest)
        const count = isNaN(n) ? 1 : n
        for (let i = 0; i < count; i++) {
          highlightCurrentLine()
          checkDebug()
          runAction('aufheben')
          sleepWithDelay()
        }
      },
      markeSetzen: (...rest) => {
        throwFauxTypeError('Robot', 'markeSetzen', 0, rest)
        highlightCurrentLine()
        checkDebug()
        runAction('markeSetzen')
        sleepWithDelay()
      },
      markeLöschen: (...rest) => {
        throwFauxTypeError('Robot', 'markeLöschen', 0, rest)
        highlightCurrentLine()
        checkDebug()
        runAction('markeLöschen')
        sleepWithDelay()
      },
      istWand: (...rest) => {
        throwFauxTypeError('Robot', 'istWand', 0, rest)
        //if (!direction) direction = null
        return checkCondition({ type: 'wall', negated: false }) // direction is not handled by testCondition, removed
      },
      nichtIstWand: (...rest) => {
        throwFauxTypeError('Robot', 'nichtIstWand', 0, rest)
        //if (!direction) direction = null
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
    const globals = pyodide.toPy({
      Robot: buildRobot(highlightCurrentLine),
      __ide_run_client: (args) => {
        enableHighlight.current = true
        const tGlobals = pyodide.toPy({
          Robot: buildRobot(highlightCurrentLine),
        })
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
      lastStepTs = performance.now() * 1000
      if (event.data.questScript) {
        enableHighlight.current = false
        inputs = []
        outputs = []
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
      benchGlobals = pyodide.toPy({
        _internal_Robot: buildRobot(),
      })
      delay = new Int32Array(event.data.delayBuffer)
      debug[0] = 0
      pyodide.runPython(
        `
class Robot:
  """Die Klasse Robot funktioniert wie eine Fernbedienung. Du kannst damit Karol steuern. Wenn du mehrere Objekte der Klasse Robot erzeugst, steuern sie alle den gleichen Roboter."""
  def schritt(self, n=1):
    self._internal_Robot.schritt(n)
    
  def hinlegen(self, n=1):
    self._internal_Robot.hinlegen(n)

  def aufheben(self, n=1):
    self._internal_Robot.aufheben(n)

  def markseSetzen(self):
    self._internal_Robot.markeSetzen()

  def markeLöschen(self):
    self._internal_Robot.markeLöschen()

  def linksDrehen(self, n=1):
    self._internal_Robot.linksDrehen(n)

  def rechtsDrehen(self, n=1):
    self._internal_Robot.rechtsDrehen(n)

  def beenden(self):
    self._internal_Robot.beenden()

  def istWand(self):
    return self._internal_Robot.istWand()

  def nichtIstWand(self):
    return self._internal_Robot.nichtIstWand()

  def istMarke(self):
    return self._internal_Robot.istMarke()

  def nichtIstMarke(self):
    return self._internal_Robot.nichtIstMarke()

  def istZiegel(self, anzahl=None):
    return self._internal_Robot.istZiegel(anzahl)

  def nichtIstZiegel(self, anzahl=None):
    return self._internal_Robot.nichtIstZiegel(anzahl)

  def istNorden(self):
    return self._internal_Robot.istNorden()

  def nichtIstNorden(self):
    return self._internal_Robot.nichtIstNorden()

  def istOsten(self):
    return self._internal_Robot.istOsten()

  def nichtIstOsten(self):
    return self._internal_Robot.nichtIstOsten()

  def istSüden(self):
    return self._internal_Robot.istSüden()

  def nichtIstSüden(self):
    return self._internal_Robot.nichtIstSüden()

  def istWesten(self):
    return self._internal_Robot.istWesten()

  def nichtIstWesten(self):
    return self._internal_Robot.nichtIstWesten()

  def __init__(self):
    self._internal_Robot = _internal_Robot()
`,
        { globals: benchGlobals }
      )
      const version = pyodide.runPython(`import sys; sys.version;\n`)
      self.postMessage({ type: 'bench', id, payload: { version } })
    }
    if (command == 'message') {
      const { request } = event.data.payload
      if (request == 'execute') {
        const { code } = event.data.payload
        try {
          lastStepTs = performance.now() * 1000
          const payload = pyodide.runPython(code, {
            globals: benchGlobals,
            filename: 'Bench.py',
          })
          self.postMessage({
            type: 'bench',
            id,
            payload: { result: payload },
          })
        } catch (error) {
          self.postMessage({ type: 'error', error: error.message })
          return
        }
      }
      if (request == 'class-info') {
        const payload = pyodide.runPython(
          `
import inspect
import json

def get_class_info():
    processed_classes = set()
    class_info = {}

    for obj in globals().values():
        if isinstance(obj, type):
            class_name = obj.__name__

            # Process constructor (__init__)
            init_method = obj.__init__
            parameters = []
            if '__init__' in vars(obj):
                try:
                    sig = inspect.signature(init_method)
                except (ValueError, TypeError):
                    pass
                else:
                    params = list(sig.parameters.values())
                    if params:
                        params = params[1:]  # Skip the first parameter (self)
                    for param in params:
                        param_info = {'name': param.name}
                        if param.default is not inspect.Parameter.empty:
                            param_info['default'] = param.default
                        parameters.append(param_info)

            constructor_info = {
                'name': '__init__',
                'parameters': parameters
            }

            # Process methods (excluding __init__)
            methods = {}
            for attr_name, attr_value in obj.__dict__.items():
                if attr_name == '__init__':
                    continue

                func = None
                if isinstance(attr_value, staticmethod):
                    func = attr_value.__func__
                elif isinstance(attr_value, classmethod):
                    func = attr_value.__func__
                elif inspect.isfunction(attr_value):
                    func = attr_value
                else:
                    continue

                try:
                    sig = inspect.signature(func)
                except (ValueError, TypeError):
                    func_params = []
                else:
                    func_params = []
                    for param in sig.parameters.values():
                        if param.name == 'self':
                            continue
                        param_info = {'name': param.name}
                        if param.default is not inspect.Parameter.empty:
                            param_info['default'] = param.default
                        func_params.append(param_info)

                method_info = {
                    'name': func.__name__,
                    'doc': func.__doc__,
                    'parameters': func_params
                }
                methods[attr_name] = method_info

            class_info[class_name] = {
                'name': class_name,
                'doc': obj.__doc__,
                'constructor': constructor_info,
                'methods': methods
            }

    return class_info

json.dumps(get_class_info())

`,
          { globals: benchGlobals }
        )
        self.postMessage({
          type: 'bench',
          id,
          payload: { classInfo: payload },
        })
      }
      if (request == 'object-info') {
        console.log('get class info')
        const payload = pyodide.runPython(
          `
import types
import json

def find_objects():
    excluded_types = (types.ModuleType, type, types.FunctionType,
                      types.BuiltinFunctionType, types.MethodType)
    results = []
    for name, obj in globals().items():
        if isinstance(obj, excluded_types):
            continue
        class_name = obj.__class__.__name__
        results.append((name, class_name))
    return json.dumps(results)
find_objects()
`,
          { globals: benchGlobals }
        )
        self.postMessage({
          type: 'bench',
          id,
          payload: { classInfo: payload },
        })
      }
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

function runAction(action) {
  const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
  const sharedArray = new Int32Array(sharedBuffer)
  Atomics.store(sharedArray, 0, 42) // no data yet
  self.postMessage({
    type: 'action',
    action,
    sharedBuffer,
  })
  Atomics.wait(sharedArray, 0, 42)
  if (sharedArray[0] == 0) {
    throw new Error(`Action ${action} failed`)
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
