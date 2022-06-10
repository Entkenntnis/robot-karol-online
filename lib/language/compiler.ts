import { ensureSyntaxTree } from '@codemirror/language'
import { Diagnostic } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'

import { Op, Condition, CallOp } from '../state/types'

export function compile(view: EditorView) {
  const tree = ensureSyntaxTree(view.state, 1000000, 1000)
  const output: Op[] = []
  const warnings: Diagnostic[] = []
  const parseStack: {
    type: string
    from: number
    stage: number
    op?: { target?: number; targetF?: number }
    start?: number
    condition?: Condition
    times?: number
    target?: number
    name?: string
    skipper?: { target?: number }
  }[] = []
  const functions: { op: CallOp; code: string; from: number; to: number }[] = []
  const declarations: { [key: string]: { target: number } } = {}
  if (tree) {
    let cursor = tree.cursor()
    do {
      const code = view.state.doc.sliceString(cursor.from, cursor.to)
      if (cursor.name == 'Command') {
        const repeat =
          cursor.node.lastChild?.name == 'Parameter'
            ? view.state.doc.sliceString(
                cursor.node.lastChild.from,
                cursor.node.lastChild.to
              )
            : 1
        const line = view.state.doc.lineAt(cursor.from).number
        let preparedCode = code.toLowerCase()
        if (preparedCode.startsWith('karol.')) {
          preparedCode = preparedCode.substring(6)
        }
        if (preparedCode.endsWith(')')) {
          preparedCode = preparedCode.replace(/\([0-9]*\)/, '')
        }
        if (preparedCode == 'schritt') {
          for (let i = 0; i < repeat; i++) {
            output.push({
              type: 'action',
              command: 'forward',
              line,
            })
          }
        } else if (preparedCode == 'linksdrehen') {
          for (let i = 0; i < repeat; i++) {
            output.push({
              type: 'action',
              command: 'left',
              line,
            })
          }
        } else if (preparedCode == 'rechtsdrehen') {
          for (let i = 0; i < repeat; i++) {
            output.push({
              type: 'action',
              command: 'right',
              line,
            })
          }
        } else if (preparedCode == 'hinlegen') {
          for (let i = 0; i < repeat; i++) {
            output.push({
              type: 'action',
              command: 'brick',
              line,
            })
          }
        } else if (preparedCode == 'aufheben') {
          for (let i = 0; i < repeat; i++) {
            output.push({
              type: 'action',
              command: 'unbrick',
              line,
            })
          }
        } else if (preparedCode == 'markesetzen') {
          output.push({
            type: 'action',
            command: 'setMark',
            line,
          })
        } else if (preparedCode == 'markelöschen') {
          output.push({
            type: 'action',
            command: 'resetMark',
            line,
          })
        } else if (preparedCode == 'beenden') {
          // jump into the black hole
          output.push({
            type: 'jumpn',
            target: Infinity,
            count: Infinity,
          })
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: `"${code}" ist kein bekannter Befehl`,
          })
        }
      }
      if (cursor.name === 'Return') {
        output.push({ type: 'return', line: undefined })
      }
      if (cursor.name == 'CustomRef') {
        const line = view.state.doc.lineAt(cursor.from).number
        const op: Op = { type: 'call', target: -1, line }
        functions.push({ op, code, from: cursor.from, to: cursor.to })
        output.push(op)
      }
      if (cursor.name == 'Repeat') {
        parseStack.push({ type: 'repeat', from: cursor.from, stage: 0 })
      }
      if (cursor.name == 'RepeatStart') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 0) {
          st.stage = 1
          const op: Op = { type: 'jumpn', target: -1, count: Infinity }
          output.push(op)
          st.op = op
          if (code !== 'wiederhole') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "wiederhole" fehlt',
            })
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Wiederholung',
          })
        }
      }
      if (cursor.name == 'RepeatWhileKey') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 1) {
          st.stage = 10
          if (code !== 'solange') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "solange" fehlt',
            })
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Wiederholung',
          })
        }
      }
      if (cursor.name == 'Condition') {
        const st = parseStack[parseStack.length - 1]
        let cond: Condition = {} as Condition
        if (code.toLowerCase() == 'nichtistwand') {
          cond = { type: 'wall', negated: true }
        } else if (code.toLowerCase() == 'istwand') {
          cond = { type: 'wall', negated: false }
        } else if (code.toLowerCase() == 'nichtistziegel') {
          cond = { type: 'brick', negated: true }
        } else if (code.toLowerCase() == 'istziegel') {
          cond = { type: 'brick', negated: false }
        } else if (code.toLowerCase() == 'nichtistmarke') {
          cond = { type: 'mark', negated: true }
        } else if (code.toLowerCase() == 'istmarke') {
          cond = { type: 'mark', negated: false }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'unbekannte Bedingung',
          })
        }
        if (st && st.type == 'repeat' && st.stage == 10) {
          st.stage = 11
          st.start = output.length
          st.condition = cond
        } else if (st && st.type == 'if' && st.stage == 1) {
          st.condition = cond
          st.stage = 2
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Wiederholung',
          })
        }
      }
      if (cursor.name == 'IfThen') {
        parseStack.push({ type: 'if', from: cursor.from, stage: 0 })
      }
      if (cursor.name == 'IfKey') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'if' && st.stage == 0) {
          st.stage = 1
          if (code !== 'wenn') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "wenn" fehlt',
            })
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige bedingte Anweisung',
          })
        }
      }
      if (cursor.name == 'ThenKey') {
        const st = parseStack[parseStack.length - 1]
        const line = view.state.doc.lineAt(st.from).number
        if (st.type == 'if' && st.stage == 2) {
          st.stage = 3
          if (code !== 'dann') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "dann" fehlt',
            })
          } else {
            const op: Op = {
              type: 'jumpcond',
              condition: st.condition!,
              targetT: output.length + 1,
              targetF: -1,
              line,
            }
            output.push(op)
            st.op = op
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige bedingte Anweisung',
          })
        }
      }
      if (cursor.name == 'ElseKey') {
        const st = parseStack[parseStack.length - 1]
        if (st && st.type == 'if' && st.stage == 3) {
          if (code !== 'sonst') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "sonst" fehlt',
            })
          } else {
            st.op!.targetF = output.length + 1
            const op: Op = { type: 'jumpn', count: Infinity, target: -1 }
            output.push(op)
            st.stage = 4
            st.op = op
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige bedingte Anweisung',
          })
        }
      }
      if (cursor.name == 'IfEndKey') {
        const st = parseStack[parseStack.length - 1]
        if (st && st.type == 'if') {
          if (
            code.toLowerCase() !== 'endewenn' &&
            code.toLowerCase() !== '*wenn'
          ) {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "endewenn" fehlt',
            })
          } else {
            if (st.stage == 3) {
              st.op!.targetF = output.length
            } else if (st.stage == 4) {
              st.op!.target = output.length
            }
            parseStack.pop()
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige bedingte Anweisung',
          })
        }
      }
      if (cursor.name == 'Times') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 1) {
          st.stage++
          st.times = parseInt(code)
          if (!code || isNaN(st.times) || st.times < 1) {
            warnings.push({
              from: cursor.from - 3,
              to: Math.min(cursor.to + 3, view.state.doc.length - 1),
              severity: 'error',
              message: 'Anzahl der Wiederholung muss eine natürliche Zahl sein',
            })
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Wiederholung',
          })
        }
      }
      if (cursor.name == 'RepeatTimesKey') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 2) {
          st.stage++
          st.start = output.length
          if (code !== 'mal') {
            warnings.push({
              from: st.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "mal" fehlt.',
            })
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Wiederholung',
          })
        }
      }
      if (cursor.name == 'RepeatEnd') {
        const st = parseStack[parseStack.length - 1]
        const line = view.state.doc.lineAt(st.from).number
        if (st.type == 'repeat' && st.stage == 3) {
          st.op!.target = output.length
          output.push({
            type: 'jumpn',
            count: st.times!,
            target: st.start!,
            line,
          })
          parseStack.pop()
          if (
            code.toLowerCase() !== 'endewiederhole' &&
            code.toLowerCase() !== '*wiederhole'
          ) {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "endewiederhole" fehlt.',
            })
          }
        } else if (st.type == 'repeat' && st.stage == 11) {
          st.op!.target = output.length
          const line = view.state.doc.lineAt(st.from).number
          output.push({
            type: 'jumpcond',
            targetT: st.start!,
            targetF: output.length + 1,
            condition: st.condition!,
            line,
          })
          parseStack.pop()
          if (
            code.toLowerCase() !== 'endewiederhole' &&
            code.toLowerCase() !== '*wiederhole'
          ) {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "endewiederhole" fehlt.',
            })
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Wiederholung',
          })
        }
      }
      if (cursor.name == 'Cmd') {
        parseStack.push({
          type: 'function',
          target: output.length + 1,
          stage: 0,
          from: cursor.from,
        })
      }
      if (cursor.name == 'CmdStart') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'function' && st.stage == 0) {
          st.stage = 1
          if (code.toLowerCase() !== 'anweisung') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "Anweisung" fehlt',
            })
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Anweisung',
          })
        }
      }
      if (cursor.name == 'CmdName') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'function' && st.stage == 1) {
          if (declarations[code]) {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Anweisung mit diesem Namen bereits vorhanden',
            })
          } else {
            st.stage = 2
            st.name = code
            const op: Op = { type: 'jumpn', count: Infinity, target: -1 }
            output.push(op)
            st.skipper = op
          }
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Anweisung',
          })
        }
      }
      if (cursor.name == 'CmdEnd') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'function' && st.stage == 2) {
          declarations[st.name!] = { target: st.target! }
          output.push({ type: 'return', line: undefined })
          st.skipper!.target = output.length
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: 'ungültige Anweisung',
          })
        }
      }
      if (cursor.type.isError) {
        warnings.push({
          from: cursor.from - 2,
          to: Math.min(cursor.to + 2, view.state.doc.length - 1),
          severity: 'error',
          message: 'Fehler',
        })
      }
    } while (cursor.next())
  }
  for (const f of functions) {
    if (declarations[f.code]) {
      f.op.target = declarations[f.code].target
    } else {
      warnings.push({
        from: f.from,
        to: f.to,
        severity: 'error',
        message: `"${f.code}" ist kein bekannter Befehl`,
      })
    }
  }
  return { warnings, output }
}
