import { MutableRefObject, useEffect, useRef } from 'react'
import { EditorState, Range } from '@codemirror/state'
import {
  Command,
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
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
  indentUnit,
  syntaxHighlighting,
  syntaxTree,
} from '@codemirror/language'
import {
  defaultKeymap,
  deleteCharBackward,
  history,
  historyKeymap,
  indentWithTab,
  insertNewlineAndIndent,
  toggleComment,
} from '@codemirror/commands'
import { lintKeymap, linter } from '@codemirror/lint'
import { searchKeymap } from '@codemirror/search'
import { patch } from '../../lib/commands/vm'
import { resetUIAfterChange, setLoading } from '../../lib/commands/editing'
import {
  CompletionSource,
  autocompletion,
  completionKeymap,
} from '@codemirror/autocomplete'
import { pythonLanguage } from '../../lib/codemirror/pythonParser/pythonLanguage'
import { compilePython } from '../../lib/language/python/compilePython'
import {
  cursorToAstNode,
  prettyPrintAstNode,
} from '../../lib/language/helper/astNode'

interface EditorProps {
  innerRef: MutableRefObject<EditorView | undefined>
}

export const PythonEditor = ({ innerRef }: EditorProps) => {
  const editorDiv = useRef(null)
  const core = useCore()

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const view: EditorView = new EditorView({
        state: EditorState.create({
          doc: core.ws.pythonCode,
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
              { key: 'Tab', run: myTabExtension(core) },
              indentWithTab,
              {
                key: 'Ctrl-s',
                run: autoFormat,
              },
              { key: 'Ctrl-#', run: toggleComment },
            ]),
            autocompletion({ override: [myAutocomplete] }),
            indentUnit.of('    '),
            EditorState.phrases.of(germanPhrases),
            editable.of(EditorView.editable.of(true)),
            pythonLanguage,
            linter(
              () => {
                return lint(core, view)
              },
              { delay: 0 }
            ),
            Theme,
            myHighlightPlugin,
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
    state.pythonCode = code
  })

  resetUIAfterChange(core)

  const tree = ensureSyntaxTree(view.state, 1000000, 1000)!
  const { warnings, output, rkCode } = compilePython(tree, view.state.doc)
  warnings.sort((a, b) => a.from - b.from)

  if (warnings.length == 0) {
    patch(core, output)
    if (rkCode !== undefined) {
      core.mutateWs((ws) => {
        ws.code = rkCode
        ws.ui.toBlockWarning = false
      })
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

function myTabExtension(core: Core): Command {
  return (target: EditorView) => {
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
            if (preLine.includes(':')) {
              deleteCharBackward(target)
              insertNewlineAndIndent(target)
              if (target.state.selection.main.from == pos) {
                // auto-indent is not properly detecting position
                // In this case, fallback to default tab behaviour
                return false
              }
              return true
            }
          }
        }
      }
    }
    return false
  }
}

const commands = [
  { label: 'schritt()', boost: 10 },
  { label: 'linksDrehen()', boost: 8 },
  { label: 'rechtsDrehen()', boost: 8 },
  { label: 'aufheben()', boost: 6 },
  { label: 'hinlegen()', boost: 6 },
  { label: 'markeSetzen()', boost: 5 },
  { label: 'markeLöschen()', boost: 4 },
  { label: 'beenden()', boost: 2 },
]

const conditions = [
  { label: 'istWand()' },
  { label: 'nichtIstWand()' },
  { label: 'istZiegel()' },
  { label: 'nichtIstZiegel()' },
  { label: 'istMarke()' },
  { label: 'nichtIstMarke()' },
  { label: 'istNorden()', boost: -2 },
  { label: 'nichtIstNorden()', boost: -2 },
  { label: 'istOsten()', boost: -2 },
  { label: 'nichtIstOsten()', boost: -2 },
  { label: 'istSüden()', boost: -2 },
  { label: 'nichtIstSüden()', boost: -2 },
  { label: 'istWesten()', boost: -2 },
  { label: 'nichtIstWesten()', boost: -2 },
]

const myAutocomplete: CompletionSource = (context) => {
  const token = context.matchBefore(/\.[a-zA-Z_0-9äöüÄÜÖß]*$/)
  if (!token) return null

  const doc = context.state.doc
  const line = doc.lineAt(context.pos)
  let preLine = line.text.substring(0, context.pos - line.from)

  const breaker = [';', ':']
  let offset = 0
  for (const b of breaker) {
    const i = preLine.lastIndexOf(b)
    if (i >= offset) {
      offset = i
    }
  }
  preLine = preLine.substring(offset)

  return {
    from: token.from + 1,
    options:
      preLine.includes('while') || preLine.includes('if')
        ? conditions
        : commands,
  }
}

const colorMark = Decoration.mark({ class: 'text-[#0294e3]' })

const myHighlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = Decoration.none
      this.work(view)
    }

    work(view: EditorView) {
      const ranges: Range<Decoration>[] = []
      const availableCommands: string[] = []
      syntaxTree(view.state).iterate({
        enter: (node) => {
          if (node.name == 'FunctionDefinition') {
            const ast = cursorToAstNode(node.node.cursor(), view.state.doc)
            if (ast.children[1].name == 'VariableName') {
              availableCommands.push(ast.children[1].text())
            }
          }
        },
      })
      syntaxTree(view.state).iterate({
        enter: (node) => {
          if (node.name == 'CallExpression') {
            const ast = cursorToAstNode(node.node.cursor(), view.state.doc)
            if (ast.children[0].name == 'VariableName') {
              const varName = ast.children[0].text()
              if (availableCommands.includes(varName)) {
                ranges.push(
                  colorMark.range(ast.children[0].from, ast.children[0].to)
                )
              }
            }
          }
        },
      })
      this.decorations = Decoration.set(ranges)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.work(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)
