// webworker.mjs
import { loadPyodide } from '/pyodide/pyodide.mjs'

let pyodide = null

self.onmessage = async (event) => {
  console.log('Worker received message:', event.data, event.type)
  if (event.data.type === 'init') {
    if (!pyodide) {
      pyodide = await loadPyodide()
      console.log('Pyodide loaded')
      console.log(pyodide)
      self.postMessage('ready')
    }
  }

  if (event.data.type === 'run') {
    console.log('Running Python code:', event.data.code)
    const globals = pyodide.toPy({
      Robot: () => {
        return {
          schritt: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'schritt' })
              sleep(200)
            }
          },
          linksDrehen: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'linksDrehen' })
              sleep(200)
            }
          },
          rechtsDrehen: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'rechtsDrehen' })
              sleep(200)
            }
          },
          hinlegen: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'hinlegen' })
              sleep(200)
            }
          },
          aufheben: (n = 1) => {
            const count = isNaN(n) ? 1 : n
            for (let i = 0; i < count; i++) {
              self.postMessage({ type: 'action', action: 'aufheben' })
              sleep(200)
            }
          },
          markeSetzen: (n = 1) => {
            self.postMessage({ type: 'action', action: 'markeSetzen' })
            sleep(200)
          },
          markeLöschen: (n = 1) => {
            self.postMessage({ type: 'action', action: 'markeLöschen' })
            sleep(200)
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
        }
      },
    })
    sleep(150)
    try {
      const result = await pyodide.runPythonAsync(event.data.code, { globals })
      console.log('Python code result:', result)
    } catch (error) {
      console.log('error!!!', error)
      self.postMessage({ type: 'error', error: error.message })
      return
    }
    self.postMessage('done')
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
  self.postMessage({
    type: 'check',
    sharedBuffer,
    condition: JSON.stringify(cond),
  })
  Atomics.wait(sharedArray, 0, 0)
  return sharedArray[0] === 1
}
