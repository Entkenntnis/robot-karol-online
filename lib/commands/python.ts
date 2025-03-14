import { Core } from '../state/core'
import { testCondition } from './vm'
import {
  forward,
  left,
  right,
  brick,
  unbrick,
  setMark,
  resetMark,
} from './world'

let pyodide: any = null

export async function runPythonCode(core: Core) {
  await core.worker?.init()
  await core.worker?.run(core.ws.pythonCode)
  /*if (!pyodide) {
    // @ts-ignore we are loading pyodide in the app
    pyodide = await window.loadPyodide()
  }
  const code = core.ws.pythonCode
  const locals = pyodide.toPy({
    Robot: () => {
      return {
        schritt: () => {
          forward(core)
        },
        linksDrehen: () => {
          left(core)
        },
        rechtsDrehen: () => {
          right(core)
        },
        hinlegen: () => {
          brick(core)
        },
        aufheben: () => {
          unbrick(core)
        },
        markeSetzen: () => {
          setMark(core)
        },
        markeLöschen: () => {
          resetMark(core)
        },
        istWand: () => {
          return testCondition(core, { type: 'wall', negated: false })
        },
        istZiegel: () => {
          return testCondition(core, { type: 'brick', negated: false })
        },
        istMarke: () => {
          return testCondition(core, { type: 'mark', negated: false })
        },
      }
    },
  })
  const result = pyodide.runPython(code, { locals })
  alert(result)*/
}
