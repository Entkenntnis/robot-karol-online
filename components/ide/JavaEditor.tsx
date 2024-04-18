import { MutableRefObject, useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import {
  Command,
  EditorView,
  drawSelection,
  gutter,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'

import {
  Theme,
  autoFormat,
  editable,
  germanPhrases,
} from '../../lib/codemirror/basicSetup'
import { Core, useCore } from '../../lib/state/core'
import {
  defaultHighlightStyle,
  ensureSyntaxTree,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import {
  defaultKeymap,
  deleteCharBackward,
  history,
  historyKeymap,
  indentWithTab,
  insertNewlineAndIndent,
} from '@codemirror/commands'
import { lintKeymap, linter } from '@codemirror/lint'
import { searchKeymap } from '@codemirror/search'
import { compileJava } from '../../lib/language/java/compileJava'
import { patch } from '../../lib/commands/vm'
import { setLoading } from '../../lib/commands/editing'
import { javaLanguage } from '../../lib/codemirror/javaParser/javaLanguage'
import {
  CompletionSource,
  autocompletion,
  completionKeymap,
} from '@codemirror/autocomplete'

interface EditorProps {
  innerRef: MutableRefObject<EditorView | undefined>
}

export const JavaEditor = ({ innerRef }: EditorProps) => {
  const editorDiv = useRef(null)
  const core = useCore()

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const view: EditorView = new EditorView({
        state: EditorState.create({
          doc: core.ws.javaCode,
          extensions: [
            gutter({ class: 'w-8 my-gutter relative' }),
            lineNumbers(),
            highlightActiveLineGutter(),
            history(),
            drawSelection(),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle),
            highlightActiveLine(),
            keymap.of([
              ...defaultKeymap,
              ...historyKeymap,
              ...lintKeymap,
              ...completionKeymap,
              ...searchKeymap,
              { key: 'Tab', run: myTabExtension },
              indentWithTab,
              {
                key: 'Ctrl-s',
                run: autoFormat,
              },
            ]),
            autocompletion({ override: [myAutocomplete] }),
            EditorState.tabSize.of(2),
            EditorState.phrases.of(germanPhrases),
            editable.of(EditorView.editable.of(true)),
            javaLanguage,
            linter(
              () => {
                return lint(core, view)
              },
              { delay: 0 }
            ),
            Theme,
            EditorView.lineWrapping,
            EditorView.updateListener.of((e) => {
              if (e.transactions.length > 0) {
                const t = e.transactions[0]
                if (t.docChanged) {
                  if (core.ws.ui.state == 'ready') {
                    setLoading(core)
                  }
                }
              }
            }),
          ],
        }),
        parent: currentEditor,
      })

      innerRef.current = view

      return () => view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorDiv])

  return <div ref={editorDiv} className="h-full" />
}
export function lint(core: Core, view: EditorView) {
  if (core.ws.ui.state == 'running' || !view) {
    return [] // auto formatting, ignore
  }
  // good place to sync code with state
  const code = view.state.doc.sliceString(0)
  // console.log(code)
  core.mutateWs((state) => {
    state.javaCode = code
    // console.log(state.javaCode)
  })

  const tree = ensureSyntaxTree(view.state, 1000000, 1000)!
  const { warnings, output, rkCode, proMode } = compileJava(
    tree,
    view.state.doc
  )
  warnings.sort((a, b) => a.from - b.from)

  if (warnings.length == 0) {
    patch(core, output)
    if (proMode) {
      core.mutateWs((ws) => {
        ws.ui.proMode = true
      })
    } else if (rkCode) {
      core.mutateWs((ws) => {
        ws.code = rkCode
        ws.ui.proMode = false
      })
    } else {
      console.log('something wrong')
    }
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
const myTabExtension: Command = (target: EditorView) => {
  if (target.state.selection.ranges.length == 1) {
    if (target.state.selection.main.empty) {
      const pos = target.state.selection.main.from
      const line = target.state.doc.lineAt(pos)
      if (line.length == 0) {
        // I am at the beginning of an empty line and pressing tab
        if (line.number > 1) {
          const preLine = target.state.doc
            .line(line.number - 1)
            .text.toLowerCase()
          if (preLine.includes('{')) {
            deleteCharBackward(target)
            insertNewlineAndIndent(target)
            return true
          }
        }
      }
    }
  }
  return false
}

const commands = [
  { label: 'schritt', boost: 10 },
  { label: 'linksDrehen', boost: 8 },
  { label: 'rechtsDrehen', boost: 8 },
  { label: 'aufheben', boost: 6 },
  { label: 'hinlegen', boost: 6 },
  { label: 'markeSetzen', boost: 5 },
  { label: 'markeLöschen', boost: 4 },
  { label: 'beenden', boost: 2 },
]

const conditions = [
  { label: 'istWand' },
  { label: 'nichtIstWand' },
  { label: 'istZiegel' },
  { label: 'nichtIstZiegel' },
  { label: 'istMarke' },
  { label: 'nichtIstMarke' },
  { label: 'istNorden', boost: -2 },
  { label: 'nichtIstNorden', boost: -2 },
  { label: 'istOsten', boost: -2 },
  { label: 'nichtIstOsten', boost: -2 },
  { label: 'istSüden', boost: -2 },
  { label: 'nichtIstSüden', boost: -2 },
  { label: 'istWesten', boost: -2 },
  { label: 'nichtIstWesten', boost: -2 },
]

const myAutocomplete: CompletionSource = (context) => {
  const token = context.matchBefore(/\.[a-zA-Z_0-9äöüÄÜÖß]*$/)
  const doc = context.state.doc
  const line = doc.lineAt(context.pos)
  let preLine = line.text.substring(0, context.pos - line.from)

  const breaker = [';', '{', '}']
  let offset = 0
  for (const b of breaker) {
    const i = preLine.lastIndexOf(b)
    if (i >= offset) {
      offset = i
    }
  }
  preLine = preLine.substring(offset)

  if (!token) return null
  return {
    from: token.from + 1,
    options:
      preLine.includes('while') || preLine.includes('if')
        ? conditions
        : commands,
  }
}
