import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
} from '@codemirror/view'
import { Extension, EditorState, Compartment } from '@codemirror/state'
import { history, historyKeymap } from '@codemirror/history'
import { foldGutter, foldKeymap } from '@codemirror/fold'
import { indentOnInput, continuedIndent } from '@codemirror/language'
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/gutter'
import { defaultKeymap, defaultTabBinding } from '@codemirror/commands'
import { bracketMatching } from '@codemirror/matchbrackets'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import {
  autocompletion,
  completionKeymap,
  CompletionSource,
  Completion,
} from '@codemirror/autocomplete'
import { commentKeymap } from '@codemirror/comment'
import { rectangularSelection } from '@codemirror/rectangular-selection'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { linter, lintKeymap } from '@codemirror/lint'
import { parser } from '../lib/parser.js'
import {
  foldNodeProp,
  foldInside,
  indentNodeProp,
  LezerLanguage,
  ensureSyntaxTree,
  syntaxTree,
} from '@codemirror/language'
import { styleTags, tags as t } from '@codemirror/highlight'
import { EditorView } from '@codemirror/view'

/// This is an extension value that just pulls together a whole lot of
/// extensions that you might want in a basic editor. It is meant as a
/// convenient helper to quickly set up CodeMirror without installing
/// and importing a lot of packages.
///
/// Specifically, it includes...
///
///  - [the default command bindings](#commands.defaultKeymap)
///  - [line numbers](#gutter.lineNumbers)
///  - [special character highlighting](#view.highlightSpecialChars)
///  - [the undo history](#history.history)
///  - [a fold gutter](#fold.foldGutter)
///  - [custom selection drawing](#view.drawSelection)
///  - [multiple selections](#state.EditorState^allowMultipleSelections)
///  - [reindentation on input](#language.indentOnInput)
///  - [the default highlight style](#highlight.defaultHighlightStyle) (as fallback)
///  - [bracket matching](#matchbrackets.bracketMatching)
///  - [bracket closing](#closebrackets.closeBrackets)
///  - [autocompletion](#autocomplete.autocompletion)
///  - [rectangular selection](#rectangular-selection.rectangularSelection)
///  - [active line highlighting](#view.highlightActiveLine)
///  - [active line gutter highlighting](#gutter.highlightActiveLineGutter)
///  - [selection match highlighting](#search.highlightSelectionMatches)
///  - [search](#search.searchKeymap)
///  - [commenting](#comment.commentKeymap)
///  - [linting](#lint.lintKeymap)
///
/// (You'll probably want to add some language package to your setup
/// too.)
///
/// This package does not allow customization. The idea is that, once
/// you decide you want to configure your editor more precisely, you
/// take this package's source (which is just a bunch of imports and
/// an array literal), copy it into your own code, and adjust it as
/// desired.
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
    ...closeBracketsKeymap,
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
  /*EditorView.domEventHandlers({
    drop(e) {
      console.log(e)
    },
  }),*/
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

    const cmdNames = []

    const c = tree.cursor()
    do {
      if (c.name == 'CmdName') {
        const code = context.state.doc.sliceString(c.from, c.to)
        cmdNames.push(code)
      }
    } while (c.next())

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

    for (const label of cmdNames) {
      options.push({ label })
    }

    if (
      lastEndedNode.name == 'RepeatTimesKey' ||
      (lastEndedNode.name == 'Condition' &&
        lastEndedNode.parent?.name == 'Repeat')
    ) {
      options.forEach((o) => {
        if (o.label == 'endewiederhole') {
          o.boost = 3
        }
      })
    }

    if (lastEndedNode.name == 'CmdName') {
      options.forEach((o) => {
        if (o.label == 'endeAnweisung') {
          o.boost = 3
        }
      })
    }

    if (lastEndedNode.name == 'ThenKey' || lastEndedNode.name == 'ElseKey') {
      console.log('test')
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
