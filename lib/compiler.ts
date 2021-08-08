import { ensureSyntaxTree } from '@codemirror/language'
import { Diagnostic } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'

import { Op, Condition } from './types'

export function compile(view: EditorView) {
  const tree = ensureSyntaxTree(view.state, 1000000, 1000)
  const output: Op[] = []
  const warnings: Diagnostic[] = []
  const parseStack: any[] = []
  const functions: any[] = []
  const declarations: any = {}
  if (tree) {
    let cursor = tree.cursor()
    do {
      const code = view.state.doc.sliceString(cursor.from, cursor.to)
      //console.log(cursor.name)
      if (cursor.name == 'Command') {
        const line = view.state.doc.lineAt(cursor.from).number
        if (code == 'Schritt') {
          output.push({
            type: 'action',
            command: 'forward',
            line,
          })
        } else if (code == 'LinksDrehen') {
          output.push({
            type: 'action',
            command: 'left',
            line,
          })
        } else if (code == 'RechtsDrehen') {
          output.push({
            type: 'action',
            command: 'right',
            line,
          })
        } else if (code == 'Hinlegen') {
          output.push({
            type: 'action',
            command: 'brick',
            line,
          })
        } else if (code == 'Aufheben') {
          output.push({
            type: 'action',
            command: 'unbrick',
            line,
          })
        } else if (code == 'MarkeSetzen') {
          output.push({
            type: 'action',
            command: 'setMark',
            line,
          })
        } else if (code == 'MarkeLöschen') {
          output.push({
            type: 'action',
            command: 'resetMark',
            line,
          })
        } else if (code == 'Beenden') {
          // jump into the black hole
          output.push({
            type: 'jumpn',
            target: Infinity,
            count: Infinity,
          })
        } else if (code == 'Unterbrechen') {
          output.push({ type: 'return' })
        } else {
          warnings.push({
            from: cursor.from,
            to: cursor.to,
            severity: 'error',
            message: `"${code}" ist kein bekannter Befehl`,
          })
        }
      }
      if (cursor.name == 'CustomRef') {
        const op: Op = { type: 'call', target: -1 }
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
        if (code == 'NichtIstWand') {
          cond = { type: 'wall', negated: true }
        } else if (code == 'IstWand') {
          cond = { type: 'wall', negated: false }
        } else if (code == 'NichtIstZiegel') {
          cond = { type: 'brick', negated: true }
        } else if (code == 'IstZiegel') {
          cond = { type: 'brick', negated: false }
        } else if (code == 'NichtIstMarke') {
          cond = { type: 'mark', negated: true }
        } else if (code == 'IstMarke') {
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
              condition: st.condition,
              targetT: output.length + 1,
              targetF: -1,
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
            st.op.targetF = output.length + 1
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
          if (code !== 'endewenn') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "endewenn" fehlt',
            })
          } else {
            if (st.stage == 3) {
              st.op.targetF = output.length
            } else if (st.stage == 4) {
              st.op.target = output.length
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
        if (st.type == 'repeat' && st.stage == 3) {
          st.op.target = output.length
          output.push({
            type: 'jumpn',
            count: st.times,
            target: st.start,
          })
          parseStack.pop()
          if (code !== 'endewiederhole') {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Schlüsselwort "endewiederhole" fehlt.',
            })
          }
        } else if (st.type == 'repeat' && st.stage == 11) {
          st.op.target = output.length
          output.push({
            type: 'jumpcond',
            targetT: st.start,
            targetF: output.length + 1,
            condition: st.condition,
          })
          parseStack.pop()
          if (code !== 'endewiederhole') {
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
        })
      }
      if (cursor.name == 'CmdStart') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'function' && st.stage == 0) {
          st.stage = 1
          if (code !== 'Anweisung') {
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
          declarations[st.name] = { target: st.target }
          output.push({ type: 'return' })
          st.skipper.target = output.length
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
