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
    const result = await pyodide.runPythonAsync(event.data.code)
    console.log('Python code result:', result)
    self.postMessage('done')
  }
}
