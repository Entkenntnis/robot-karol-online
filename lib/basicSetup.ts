import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
} from '@codemirror/view'
import { Extension, EditorState } from '@codemirror/state'
import { history, historyKeymap } from '@codemirror/history'
import { foldGutter, foldKeymap } from '@codemirror/fold'
import { indentOnInput, continuedIndent } from '@codemirror/language'
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/gutter'
import { defaultKeymap, defaultTabBinding } from '@codemirror/commands'
import { bracketMatching } from '@codemirror/matchbrackets'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { commentKeymap } from '@codemirror/comment'
import { rectangularSelection } from '@codemirror/rectangular-selection'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { lintKeymap } from '@codemirror/lint'
import { parser } from '../lib/parser.js'
import {
  foldNodeProp,
  foldInside,
  indentNodeProp,
  LezerLanguage,
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
    }),
    indentNodeProp.add({
      Repeat: continuedIndent({ except: /^\s*ende/ }),
      IfThen: continuedIndent({ except: /^\s*(ende|sonst)/ }),
      Cmd: continuedIndent({ except: /^\s*ende/ }),
      Cond: continuedIndent({ except: /^\s*ende/ }),
    }),
  ],
})

const exampleLanguage = LezerLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    indentOnInput: /^\s*(ende|sonst)/,
  },
})

export const basicSetup: Extension = [
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
    defaultTabBinding,
  ]),
  EditorState.tabSize.of(2),
  exampleLanguage,
]
