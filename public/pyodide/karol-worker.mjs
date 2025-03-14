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
    }
    self.postMessage('ready')
  }

  if (event.data.type === 'run') {
    console.log('Running Python code:', event.data.code)
    const globals = pyodide.toPy({
      Robot: () => {
        return {
          schritt: () => {
            self.postMessage('action:schritt')
            sleep(1000)
          },
          linksDrehen: () => {
            self.postMessage('action:linksDrehen')
            sleep(1000)
          },
          rechtsDrehen: () => {
            self.postMessage('action:rechtsDrehen')
            sleep(1000)
          },
        }
      },
    })
    const result = await pyodide.runPythonAsync(event.data.code, { globals })
    console.log('Python code result:', result)
    self.postMessage('done')
  }
}

function sleep(ms) {
  const x = new WebAssembly.Memory({ shared: true, initial: 1, maximum: 1 })
  const b = new Int32Array(x.buffer)
  console.log('before sleep')
  Atomics.wait(b, 0, 0, ms)
  console.log('After sleep')
}
