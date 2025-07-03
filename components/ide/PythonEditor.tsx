import { RefObject, useEffect, useRef } from 'react'
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
  buildGutterWithBreakpoints,
  defaultHighlightStyle,
  editable,
  germanPhrases,
} from '../../lib/codemirror/basicSetup'
import { Core, useCore } from '../../lib/state/core'
import {
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
import { cursorToAstNode } from '../../lib/language/helper/astNode'
import { saveCodeToLocalStorage } from '../../lib/commands/save'

interface EditorProps {
  innerRef: RefObject<EditorView | undefined>
}

export const PythonEditor = ({ innerRef }: EditorProps) => {
  const editorDiv = useRef(null)
  const core = useCore()

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const view: EditorView = new EditorView({
        state: EditorState.create({
          doc: core.ws.ui.editQuestScript
            ? core.ws.editor.questScript
            : core.ws.pythonCode,
          extensions: [
            buildGutterWithBreakpoints(core),
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
                run: () => true, // disable autoformatter (not working reliably)
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
                  if (
                    core.ws.ui.state == 'ready' /*&&
                    core.ws.settings.language != 'python-pro'*/
                  ) {
                    setLoading(core)
                  }
                }
              }
            }),
          ],
        }),
        parent: currentEditor,
        scrollTo: EditorView.scrollIntoView(0),
      })

      innerRef.current = view

      return () => view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorDiv])

  return <div ref={editorDiv} className="h-full" />
}
export function lint(core: Core, view: EditorView) {
  // good place to sync code with state
  const code = view.state.doc.sliceString(0)
  // console.log(code)
  core.mutateWs((state) => {
    if (core.ws.ui.editQuestScript) {
      state.editor.questScript = code
    } else {
      state.pythonCode = code
    }
  })

  if (!view) {
    return []
  }
  saveCodeToLocalStorage(core)
  resetUIAfterChange(core)

  const tree = ensureSyntaxTree(view.state, 1000000, 1000)!
  const { warnings, output, rkCode } = compilePython(tree, view.state.doc)

  if (core.ws.settings.language == 'python-pro') {
    /*if (core.worker?.mainWorkerReady) {
      core.mutateWs(({ ui }) => {
        ui.state = 'ready'
      })
    }*/
    core.mutateWs((ws) => {
      ws.ui.pythonProCanSwitch = warnings.length == 0
      if (rkCode !== undefined) {
        ws.code = rkCode
      }
    })
    if (core.worker?.mainWorkerReady) {
      core.worker.lint(code)
    }
    return []
  }

  warnings.sort((a, b) => a.from - b.from)

  if (warnings.length == 0) {
    patch(core, output)
    if (rkCode !== undefined) {
      core.mutateWs((ws) => {
        ws.code = rkCode
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
  const text = context.state.doc.toString()
  // Find all robot instances, not just the first one
  const robotRegex = /([a-zA-Z0-9]+)\s*=\s*Robot\(\)/g
  let match
  const robotNames = []

  while ((match = robotRegex.exec(text)) !== null) {
    robotNames.push(match[1])
  }

  if (robotNames.length === 0) return null

  // Check if we're typing after any of the robot names with a period
  let matchedToken = null
  let matchedRobot = null

  for (const robotName of robotNames) {
    const token = context.matchBefore(
      new RegExp(robotName + '\\.[a-zA-Z_0-9äöüÄÜÖß]*$')
    )
    if (token) {
      matchedToken = token
      matchedRobot = robotName
      break
    }
  }

  if (!matchedToken || !matchedRobot) return null

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

  const conditionMode = preLine.includes('while') || preLine.includes('if')

  const options = (conditionMode ? conditions : commands).slice()

  return {
    from: matchedToken.from + matchedRobot.length + 1,
    options,
  }
}

const colorMark = Decoration.mark({ class: 'text-[#9a4603]' })

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
      const tree = ensureSyntaxTree(view.state, 50000) ?? syntaxTree(view.state)
      tree.iterate({
        enter: (node) => {
          if (node.name == 'FunctionDefinition') {
            const ast = cursorToAstNode(node.node.cursor(), view.state.doc)
            if (ast.children[1].name == 'VariableName') {
              availableCommands.push(ast.children[1].text())
            }
          }
        },
      })
      tree.iterate({
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
            /*if (ast.children[0].name == 'MemberExpression') {
              const m = ast.children[0]
              if (m.children[2].name == 'PropertyName') {
                const varName = m.children[2].text()
                if (availableCommands.includes(varName)) {
                  ranges.push(
                    colorMark.range(m.children[2].from, m.children[2].to)
                  )
                }
              }
            }*/
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
