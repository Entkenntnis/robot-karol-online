import { ensureSyntaxTree } from '@codemirror/language'
import { EditorView } from '@codemirror/view'

import { compile } from '../language/compiler'
import { Core } from '../state/core'
import { patch } from './vm'

export function lint(core: Core, view: EditorView) {
  if (core.ws.ui.state == 'running' || !view) {
    return [] // auto formatting, ignore
  }
  // good place to sync code with state
  const code = view.state.doc.sliceString(0)
  core.mutateWs((state) => {
    state.code = code
  })

  const tree = ensureSyntaxTree(view.state, 1000000, 1000)!
  const { warnings, output } = compile(tree, view.state.doc)
  warnings.sort((a, b) => a.from - b.from)

  if (warnings.length == 0) {
    let toWarn = false

    const cursor = tree.cursor()
    do {
      if (
        cursor.type.name == 'Comment' ||
        cursor.type.name == 'BlockComment' ||
        /*cursor.type.name == 'Cmd' ||*/
        cursor.type.name == 'Return' /*||
        cursor.type.name == 'CustomRef'*/
      ) {
        toWarn = true
      }
    } while (cursor.next())
    core.mutateWs((ws) => {
      ws.ui.toBlockWarning = toWarn
    })
    patch(core, output)
  } else {
    core.mutateWs(({ vm, ui }) => {
      vm.bytecode = undefined
      vm.pc = 0
      ui.state = 'error'
      ui.errorMessages = warnings
        .map(
          (w) => `Zeile ${view.state.doc.lineAt(w.from).number}: ${w.message}`
        )
        .filter(function (item, i, arr) {
          return arr.indexOf(item) == i
        })
      //ui.preview = undefined
    })
  }
  return warnings
}

export function setLoading(core: Core) {
  if (core.ws.ui.state == 'running') {
    return // auto formatting, ignore
  }
  core.mutateWs(({ ui }) => {
    ui.state = 'loading'
  })
}
