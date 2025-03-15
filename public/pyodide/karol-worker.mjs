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
          schritt: () => {
            self.postMessage('action:schritt')
            sleep(200)
          },
          linksDrehen: () => {
            self.postMessage('action:linksDrehen')
            sleep(200)
          },
          rechtsDrehen: () => {
            self.postMessage('action:rechtsDrehen')
            sleep(200)
          },
          hinlegen: () => {
            self.postMessage('action:hinlegen')
            sleep(200)
          },
          aufheben: () => {
            self.postMessage('action:aufheben')
            sleep(200)
          },
          markeSetzen: () => {
            self.postMessage('action:markeSetzen')
            sleep(200)
          },
          markeLöschen: () => {
            self.postMessage('action:markeLöschen')
            sleep(200)
          },
          istWand: () => {
            return checkCondition({ type: 'wall', negated: false })
          },
          nichtIstWand: () => {
            return checkCondition({ type: 'wall', negated: true })
          },
          istMarke: () => {
            return checkCondition({ type: 'mark', negated: false })
          },
          nichtIstMarke: () => {
            return checkCondition({ type: 'mark', negated: true })
          },
          istZiegel: () => {
            return checkCondition({ type: 'brick', negated: false })
          },
          nichtIstZiegel: () => {
            return checkCondition({ type: 'brick', negated: true })
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
