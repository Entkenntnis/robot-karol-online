// webworker.mjs
import { loadPyodide } from '/pyodide/pyodide.mjs'

let pyodide = null

self.onmessage = async (event) => {
  console.log('Worker received message:', event.data, event.type)
  if (event.data.type === 'init') {
    pyodide = await loadPyodide()
    console.log('Pyodide loaded')
    console.log(pyodide)
    self.postMessage('ready')
  }
}
