import {
  keymap,
  drawSelection,
  highlightActiveLine,
  EditorView,
  Command,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  lineNumbers,
  highlightActiveLineGutter,
  gutter,
  GutterMarker,
} from '@codemirror/view'
import { EditorState, Compartment, Range } from '@codemirror/state'
import {
  indentOnInput,
  continuedIndent,
  indentNodeProp,
  LRLanguage,
  syntaxTree,
  syntaxHighlighting,
  HighlightStyle,
} from '@codemirror/language'
import {
  defaultKeymap,
  deleteCharBackward,
  history,
  historyKeymap,
  indentSelection,
  indentWithTab,
  insertNewlineAndIndent,
  selectAll,
} from '@codemirror/commands'
import {
  autocompletion,
  completionKeymap,
  CompletionSource,
} from '@codemirror/autocomplete'
import { linter, lintKeymap } from '@codemirror/lint'
import { styleTags, tags as t } from '@lezer/highlight'

import { searchKeymap } from '@codemirror/search'
import { getParserWithLng } from './parser/get-parser-with-lng'
import { deKeywords, enKeywords } from '../language/robot karol/compiler'
import { Core } from '../state/core'

function parserWithMetadata(lng: 'de' | 'en') {
  return getParserWithLng(lng).configure({
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
        CmdName: t.macroName,
        Times: t.strong,
        Comment: t.meta,
        LineComment: t.meta,
        PythonComment: t.meta,
        BlockComment: t.meta,
        Condition: t.className,
        Not: t.strong,
        SpecialCommand: t.strong,
        CondStart: t.keyword,
        CondEnd: t.keyword,
        CondName: t.emphasis,
        TF: t.typeName,
        CustomRef: t.variableName,
        KarolPrefix: t.labelName,
        Parameter: t.strong,
        ConditionWithoutParam: t.className,
        ConditionMaybeWithParam: t.className,
        CommandWithParameter: t.atom,
        CommandPure: t.atom,
      }),
      indentNodeProp.add({
        Repeat: continuedIndent({
          except:
            lng == 'de'
              ? /^\s*(ende|\*)wiederhole(\s|$)/i
              : /^\s*(end_|\*)repeat(\s|$)/i,
        }),
        IfThen: continuedIndent({
          except:
            lng == 'de'
              ? /^\s*(((ende|\*)wenn)|sonst)(\s|$)/i
              : /^\s*(((end_|\*)if)|else)(\s|$)/i,
        }),
        Cmd: continuedIndent({
          except:
            lng == 'de'
              ? /^\s*(ende|\*)anweisung(\s|$)/i
              : /^\s*(end_|\*)command(\s|$)/i,
        }),
      }),
    ],
  })
}

function exampleLanguage(lng: 'de' | 'en') {
  return LRLanguage.define({
    parser: parserWithMetadata(lng),
    languageData: {
      indentOnInput:
        lng == 'de'
          ? /^\s*((ende|\*)(wiederhole|wenn|anweisung))|sonst/i
          : /^\s*((end_|\*)(repeat|if|command))|else/i,
      autocomplete: buildMyAutocomplete(lng),
    },
  })
}

export const Theme = EditorView.theme({
  '&': {
    outline: 'none !important',
    height: '100%',
  },
  '.cm-gutters': {
    minWidth: '30px',
    display: 'flex',
    justifyContent: 'end',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'Hack, monospace',
  },
  '.cm-completionLabel': {
    fontFamily: 'Hack, monospace',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    background: '#17c !important',
  },
  '.cm-content': { paddingBottom: '75vh' },
})

export const editable = new Compartment()

interface BasicSetupProps {
  l: Parameters<typeof linter>[0]
  lng: 'de' | 'en'
  core: Core
}

export const autoFormat: Command = (view) => {
  // auto format
  const selection = view.state.selection
  const line = view.state.doc.lineAt(selection.main.anchor)
  const lineOffset =
    selection.main.anchor - view.state.doc.line(line.number).from
  selectAll(view)
  indentSelection(view)
  const newLine = view.state.doc.line(line.number)
  view.dispatch({
    selection: {
      anchor: Math.min(newLine.from + lineOffset, newLine.to),
      head: Math.min(newLine.from + lineOffset, newLine.to),
    },
  })
  return true
}

export function setEditable(view?: EditorView, value?: boolean) {
  if (view) {
    view.dispatch({
      effects: editable.reconfigure(EditorView.editable.of(value ?? false)),
    })
  }
}

export const defaultHighlightStyle = HighlightStyle.define([
  { tag: t.meta, color: '#7a757a' },
  { tag: t.link, textDecoration: 'underline' },
  { tag: t.heading, textDecoration: 'underline', fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.keyword, color: '#708' },
  {
    tag: [t.atom, t.bool, t.url, t.contentSeparator],
    color: '#219',
  },
  { tag: [t.literal, t.inserted], color: '#164' },
  { tag: [t.string, t.deleted], color: '#a11' },
  { tag: [t.regexp, t.escape, t.special(t.string)], color: '#e40' },
  { tag: t.definition(t.variableName), color: '#00f' },
  { tag: t.local(t.variableName), color: '#30a' },
  { tag: [t.typeName, t.namespace], color: '#085' },
  { tag: t.className, color: '#167' },
  { tag: [t.special(t.variableName), t.macroName], color: '#940' },
  { tag: t.definition(t.propertyName), color: '#00c' },
  { tag: t.comment, color: '#7a757a' },
  { tag: t.invalid, color: '#f00' },
  { tag: t.labelName, color: '#b33300' },
])

export const germanPhrases = {
  // @codemirror/search
  'Go to line': 'Springe zu Zeile',
  go: 'OK',
  Find: 'Suchen',
  Replace: 'Ersetzen',
  next: 'nächste',
  previous: 'vorherige',
  all: 'alle',
  'match case': 'groß/klein beachten',
  'by word': 'ganze Wörter',
  replace: 'ersetzen',
  'replace all': 'alle ersetzen',
  close: 'schließen',
  'current match': 'aktueller Treffer',
  'replaced $ matches': '$ Treffer ersetzt',
  'replaced match on line $': 'Treffer on Zeile $ ersetzt',
  'on line': 'auf Zeile',
}

const breakpointMarkerPlaceholder = new (class extends GutterMarker {
  toDOM() {
    return new DOMParser().parseFromString(
      '<div class="w-[16px] ml-[10px] mt-1 rounded-full h-[16px] select-none cursor-pointer bg-transparent hover:bg-red-200">&nbsp;</div>',
      'text/html'
    ).body.children[0]
  }
})()

const breakpointMarker = new (class extends GutterMarker {
  toDOM() {
    return new DOMParser().parseFromString(
      '<div class="w-[16px] ml-[10px] mt-1 rounded-full h-[16px] select-none bg-red-500 ">&nbsp;</div>',
      'text/html'
    ).body.children[0]
  }
})()

export function buildGutterWithBreakpoints(core: Core) {
  return gutter({
    class: 'w-8 my-gutter relative',
    lineMarker(view, line) {
      return core.ws.ui.breakpoints.includes(line.from)
        ? breakpointMarker
        : breakpointMarkerPlaceholder
    },
    domEventHandlers: {
      mousedown(view, line, event) {
        const target = event.target
        if (
          target &&
          'classList' in target &&
          (target as HTMLElement).classList.contains('w-[16px]')
        ) {
          const lineNumber = line.from
          if (core.ws.ui.breakpoints.includes(lineNumber)) {
            core.mutateWs((s) => {
              s.ui.breakpoints = s.ui.breakpoints.filter(
                (x) => x !== lineNumber
              )
            })
          } else {
            core.mutateWs((s) => {
              s.ui.breakpoints.push(lineNumber)
            })
          }
          view.dispatch()
          return true
        }
        return false
      },
    },
    lineMarkerChange(update) {
      return true
    },
  })
}

export const basicSetup = (props: BasicSetupProps) => [
  buildGutterWithBreakpoints(props.core),
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
    { key: 'Tab', run: buildMyTabExtension(props.lng) },
    indentWithTab,
    {
      key: 'Ctrl-s',
      run: autoFormat,
    },
  ]),
  autocompletion(),
  //highlightSelectionMatches(),
  EditorState.tabSize.of(2),
  ...[props.lng == 'de' ? [EditorState.phrases.of(germanPhrases)] : []],
  editable.of(EditorView.editable.of(true)),
  exampleLanguage(props.lng),
  linter(props.l, { delay: 0 }),
  Theme,
  myHighlightPlugin,
  EditorView.lineWrapping,
]

const generalOptionsDe = [
  { label: 'Schritt' },
  { label: 'LinksDrehen' },
  { label: 'RechtsDrehen' },
  { label: 'Hinlegen' },
  { label: 'Aufheben' },
  { label: 'MarkeSetzen', boost: 2 },
  { label: 'MarkeLöschen' },
  { label: 'wiederhole' },
  { label: 'endewiederhole' },
  { label: 'immer' },
  { label: 'wenn' },
  { label: 'endewenn' },
  { label: 'Anweisung' },
  { label: 'endeAnweisung' },
  { label: 'Beenden' },
  { label: 'karol' },
]

const generalOptionsEn = [
  { label: 'step', boost: 2 },
  { label: 'turn_left' },
  { label: 'turn_right' },
  { label: 'set_down' },
  { label: 'pick_up' },
  { label: 'mark_field' },
  { label: 'unmark_field' },
  { label: 'repeat' },
  { label: 'end_repeat' },
  { label: 'always' },
  { label: 'if' },
  { label: 'end_if' },
  { label: 'command' },
  { label: 'end_command' },
  { label: 'exit' },
  { label: 'karol' },
]

const conditionsDe = [
  { label: 'IstWand' },
  { label: 'NichtIstWand' },
  { label: 'IstZiegel' },
  { label: 'NichtIstZiegel' },
  { label: 'IstMarke' },
  { label: 'NichtIstMarke' },
  { label: 'IstNorden', boost: -2 },
  { label: 'NichtIstNorden', boost: -2 },
  { label: 'IstOsten', boost: -2 },
  { label: 'NichtIstOsten', boost: -2 },
  { label: 'IstSüden', boost: -2 },
  { label: 'NichtIstSüden', boost: -2 },
  { label: 'IstWesten', boost: -2 },
  { label: 'NichtIstWesten', boost: -2 },
]

const conditionsEn = [
  { label: 'is_wall' },
  { label: 'not_is_wall' },
  { label: 'is_brick' },
  { label: 'not_is_brick' },
  { label: 'is_mark' },
  { label: 'not_is_mark' },
  { label: 'is_north', boost: -2 },
  { label: 'not_is_north', boost: -2 },
  { label: 'is_east', boost: -2 },
  { label: 'not_is_east', boost: -2 },
  { label: 'is_south', boost: -2 },
  { label: 'not_is_south', boost: -2 },
  { label: 'is_west', boost: -2 },
  { label: 'not_is_west', boost: -2 },
]

const span = /[a-zA-Z_0-9äöüÄÜÖß]*$/

function buildMyAutocomplete(lng: 'de' | 'en'): CompletionSource {
  const keywords = lng == 'de' ? deKeywords : enKeywords
  return (context) => {
    const token = context.matchBefore(/[a-zA-Z_0-9äöüÄÜÖß]+$/)
    const tree = syntaxTree(context.state)

    const charAfter = context.state.doc.sliceString(
      context.pos,
      context.pos + 1
    )
    if (charAfter.trim().length > 0 && !context.explicit) return null

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

    let hasIf = false

    /*// debug
    const cursor = tree.cursor()
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

    console.log('-- debug end --')
    // debug*/

    if (around.name.includes('Comment') || endingHere.name.includes('Comment'))
      return null // no completion within comments

    if (around.name == 'CmdName' || endingHere.name == 'CmdName') return null // no completion in function name

    let options = (lng == 'de' ? generalOptionsDe : generalOptionsEn).map(
      (o) => ({ ...o })
    )

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
        hasIf = true
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

    if (hasIf) {
      options.push(
        lng == 'de'
          ? { label: 'sonst', boost: -1 }
          : { label: 'else', boost: -1 }
      )
    }

    const last = pendings.pop()

    if (last == 'repeat') {
      options.forEach((o) => {
        if (o.label == keywords.endewiederhole) {
          o.boost = 3
        }
      })
    }

    if (last == 'cmd') {
      options.forEach((o) => {
        if (o.label == keywords.endeanweisung) {
          o.boost = 3
        }
      })
    }

    if (last == 'if') {
      options.forEach((o) => {
        if (o.label == keywords.endewenn) {
          o.boost = 3
        }
      })
    }

    if (lastEndedNode.name == 'RepeatStart') {
      options =
        lng == 'de'
          ? [{ label: 'solange', boost: 2 }, { label: 'immer' }]
          : [{ label: 'while', boost: 2 }, { label: 'always' }]
    } else if (
      lastEndedNode.name == 'IfKey' ||
      lastEndedNode.name == 'RepeatWhileKey'
    ) {
      options = lng == 'de' ? conditionsDe : conditionsEn
    } else if (lastEndedNode.name == 'Times') {
      options = lng == 'de' ? [{ label: 'mal' }] : [{ label: 'times' }]
    } else if (
      lastEndedNode.name == 'Condition' &&
      lastEndedNode.parent?.name == 'IfThen'
    ) {
      options = lng == 'de' ? [{ label: 'dann' }] : [{ label: 'then' }]
    } else if (
      lastEndedNode.parent?.name == 'Condition' &&
      lastEndedNode.parent?.parent?.name == 'IfThen'
    ) {
      options = lng == 'de' ? [{ label: 'dann' }] : [{ label: 'then' }] // TODO
    }
    if (options.some((x) => x.label == token?.text)) return null

    return token || context.explicit
      ? {
          from: token ? token.from : context.pos,
          options,
          span,
        }
      : null
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
      syntaxTree(view.state).iterate({
        enter: (node) => {
          if (node.name == 'CmdName') {
            const str = Array.from(view.state.doc.slice(node.from, node.to))[0]

            availableCommands.push(str)
          }
        },
      })
      syntaxTree(view.state).iterate({
        enter: (node) => {
          if (node.name == 'CustomRef') {
            const str = Array.from(view.state.doc.slice(node.from, node.to))[0]
            if (availableCommands.includes(str)) {
              ranges.push(colorMark.range(node.from, node.to))
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

function buildMyTabExtension(lng: 'de' | 'en') {
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
            if (
              lng == 'de'
                ? preLine.includes('anweisung') ||
                  preLine.includes('wiederhole') ||
                  preLine.includes('wenn') ||
                  preLine.includes('sonst')
                : preLine.includes('command') ||
                  preLine.includes('repeat') ||
                  preLine.includes('if') ||
                  preLine.includes('else')
            ) {
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
}
