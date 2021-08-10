import {
  keymap,
  drawSelection,
  highlightActiveLine,
  EditorView,
} from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import {
  indentOnInput,
  continuedIndent,
  indentNodeProp,
  LezerLanguage,
  syntaxTree,
} from '@codemirror/language'
import { defaultKeymap, defaultTabBinding } from '@codemirror/commands'
import { history, historyKeymap } from '@codemirror/history'
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/gutter'
import {
  autocompletion,
  completionKeymap,
  CompletionSource,
} from '@codemirror/autocomplete'
import {
  defaultHighlightStyle,
  styleTags,
  tags as t,
} from '@codemirror/highlight'
import { linter, lintKeymap } from '@codemirror/lint'

import { parser } from './parser/parser.js'

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Command: t.atom,
      RepeatStart: t.keyword,
      RepeatEnd: t.keyword,
      RepeatAlwaysKey: t.keyword,
      RepeatWhileKey: t.keyword,
      RepeatTimesKey: t.keyword,
      IfKey: t.keyword,
      ThenKey: t.keyword,
      IfEndKey: t.keyword,
      ElseKey: t.keyword,
      CmdStart: t.keyword,
      CmdEnd: t.keyword,
      CmdName: t.emphasis,
      Times: t.strong,
      Comment: t.comment,
      Condition: t.className,
      Not: t.strong,
      SpecialCommand: t.strong,
      CondStart: t.keyword,
      CondEnd: t.keyword,
      CondName: t.emphasis,
      TF: t.typeName,
      Return: t.unit,
    }),
    indentNodeProp.add({
      Repeat: continuedIndent({ except: /^\s*en/ }),
      IfThen: continuedIndent({ except: /^\s*(en|so)/ }),
      Cmd: continuedIndent({ except: /^\s*en/ }),
      Cond: continuedIndent({ except: /^\s*en/ }),
    }),
  ],
})

const exampleLanguage = LezerLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    indentOnInput: /^\s*(en|so)/,
    autocomplete: buildMyAutocomplete(),
  },
})

const Theme = EditorView.theme({
  '&': {
    outline: 'none !important',
  },
  '.cm-content': {
    minHeight: '300px',
  },
  '.cm-gutters': {
    minHeight: '300px',
    minWidth: '30px',
    display: 'flex',
    justifyContent: 'end',
  },
  '.cm-scroller': {
    overflowX: 'initial !important',
    fontFamily: 'Hack, monospace',
  },
  '.cm-completionLabel': {
    fontFamily: 'Hack, monospace',
  },
})

export const editable = new Compartment()

export const basicSetup = (l: any) => [
  lineNumbers(),
  highlightActiveLineGutter(),
  history(),
  drawSelection(),
  indentOnInput(),
  defaultHighlightStyle.fallback,
  highlightActiveLine(),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
    ...lintKeymap,
    ...completionKeymap,
    defaultTabBinding,
  ]),
  autocompletion(),
  EditorState.tabSize.of(2),
  editable.of(EditorView.editable.of(true)),
  exampleLanguage,
  linter(l),
  Theme,
]

const generalOptions = [
  { label: 'Schritt' },
  { label: 'LinksDrehen' },
  { label: 'RechtsDrehen' },
  { label: 'Hinlegen' },
  { label: 'Aufheben' },
  { label: 'MarkeSetzen', boost: 2 },
  { label: 'MarkeLöschen' },
  { label: 'wiederhole' },
  { label: 'endewiederhole' },
  { label: 'wenn' },
  { label: 'endewenn' },
  { label: 'sonst' },
  { label: 'Anweisung' },
  { label: 'endeAnweisung' },
  { label: 'Unterbrechen' },
  { label: 'Beenden' },
]

const conditions = [
  { label: 'IstWand' },
  { label: 'NichtIstWand' },
  { label: 'IstZiegel' },
  { label: 'NichtIstZiegel' },
  { label: 'IstMarke' },
  { label: 'NichtIstMarke' },
]

const span = /[a-zA-Z_0-9äöüÄÜÖß]*$/

function buildMyAutocomplete(): CompletionSource {
  return (context) => {
    const token = context.matchBefore(/[a-zA-Z_0-9äöüÄÜÖß]+$/)
    const tree = syntaxTree(context.state)

    const around = tree.resolve(context.pos)
    const endingHere = around.resolve(context.pos, -1)

    let pos = context.pos - (token?.text.length ?? 0)
    while (
      pos > 0 &&
      [' ', '\n'].includes(context.state.doc.sliceString(pos - 1, pos))
    ) {
      pos--
    }

    const lastEndedNode = tree.resolve(pos, -1)

    // debug
    /*const cursor = tree.cursor()
    console.log('-- tree start --')
    do {
      console.log(`Node ${cursor.name} from ${cursor.from} to ${cursor.to}`)
    } while (cursor.next())
    console.log('-- tree end --')

    console.log('around', around.name)
    console.log('endingHere', endingHere.name)
    console.log('pos', context.pos)

    console.log('ending of previous', pos)
    console.log('last ended node', lastEndedNode.name)

    console.log('-- debug end --')*/
    // debug

    if (around.name == 'Comment') return null // no completion within comments

    if (around.name == 'CmdName' || endingHere.name == 'CmdName') return null // no completion in function name

    let options = generalOptions.map((o) => ({ ...o }))

    const pendings: ('repeat' | 'if' | 'cmd')[] = []

    const c = tree.cursor()
    do {
      if (c.name == 'CmdName') {
        const code = context.state.doc.sliceString(c.from, c.to)
        options.push({ label: code })
      }
      if (c.name == 'RepeatStart' && c.to <= pos) {
        pendings.push('repeat')
      }
      if (c.name == 'RepeatEnd' && c.to <= pos) {
        if (pendings[pendings.length - 1] == 'repeat') {
          pendings.pop()
        }
      }
      if (c.name == 'IfKey' && c.to <= pos) {
        pendings.push('if')
      }
      if (c.name == 'IfEndKey' && c.to <= pos) {
        if (pendings[pendings.length - 1] == 'if') {
          pendings.pop()
        }
      }
      if (c.name == 'CmdStart' && c.to <= pos) {
        pendings.push('cmd')
      }
      if (c.name == 'CmdEnd' && c.to <= pos) {
        if (pendings[pendings.length - 1] == 'cmd') {
          pendings.pop()
        }
      }
    } while (c.next())

    const last = pendings.pop()

    if (last == 'repeat') {
      options.forEach((o) => {
        if (o.label == 'endewiederhole') {
          o.boost = 3
        }
      })
    }

    if (last == 'cmd') {
      options.forEach((o) => {
        if (o.label == 'endeAnweisung') {
          o.boost = 3
        }
      })
    }

    if (last == 'if') {
      options.forEach((o) => {
        if (o.label == 'endewenn') {
          o.boost = 3
        }
      })
    }

    if (lastEndedNode.name == 'RepeatStart') {
      options = [{ label: 'solange' }]
    } else if (
      lastEndedNode.name == 'IfKey' ||
      lastEndedNode.name == 'RepeatWhileKey'
    ) {
      options = conditions
    } else if (lastEndedNode.name == 'Times') {
      options = [{ label: 'mal' }]
    } else if (
      lastEndedNode.name == 'Condition' &&
      lastEndedNode.parent?.name == 'IfThen'
    ) {
      options = [{ label: 'dann' }]
    }

    return token || context.explicit
      ? {
          from: token ? token.from : context.pos,
          options,
          span,
        }
      : null
  }
}
