import { Diagnostic } from '@codemirror/lint'
import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'

import { Op, Condition, CallOp } from '../state/types'

export function compile(tree: Tree, doc: Text) {
  let loopVarCounter = 0
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
    loopVar?: string
  }[] = []
  const functions: { op: CallOp; code: string; from: number; to: number }[] = []
  const declarations: { [key: string]: { target: number } } = {}
  if (tree) {
    let cursor = tree.cursor()
    do {
      const code = doc.sliceString(cursor.from, cursor.to)
      if (cursor.name == 'Command') {
        const repeat =
          cursor.node.lastChild?.name == 'Parameter'
            ? parseInt(
                doc.sliceString(
                  cursor.node.lastChild.from,
                  cursor.node.lastChild.to
                )
              )
            : 1
        const line = doc.lineAt(cursor.from).number
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
            type: 'jump',
            target: Infinity,
          })
        }
      }
      if (cursor.name === 'Return') {
        output.push({ type: 'return' })
      }
      if (cursor.name == 'CustomRef') {
        const line = doc.lineAt(cursor.from).number
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
        }
      }
      if (cursor.name == 'RepeatAlwaysKey') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 1) {
          const op: Op = { type: 'jump', target: -1 }
          output.push(op)
          st.op = op
          st.start = output.length
          st.stage = 20
        }
      }
      if (cursor.name == 'RepeatWhileKey') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 1) {
          st.stage = 10
          const op: Op = { type: 'jump', target: -1 }
          output.push(op)
          st.op = op
        }
      }
      if (cursor.name == 'Condition') {
        const st = parseStack[parseStack.length - 1]
        let cond: Condition = {} as Condition

        const repeat =
          cursor.node.lastChild?.name == 'Parameter'
            ? doc.sliceString(
                cursor.node.lastChild.from,
                cursor.node.lastChild.to
              )
            : null

        const preparedCode = code.toLowerCase().replace(/\([0-9]*\)/, '')

        if (code.toLowerCase() == 'nichtistwand') {
          cond = { type: 'wall', negated: true }
        } else if (code.toLowerCase() == 'istwand') {
          cond = { type: 'wall', negated: false }
        } else if (code.toLowerCase() == 'nichtistziegel' && repeat === null) {
          cond = { type: 'brick', negated: true }
        } else if (code.toLowerCase() == 'istziegel' && repeat === null) {
          cond = { type: 'brick', negated: false }
        } else if (code.toLowerCase() == 'nichtistmarke') {
          cond = { type: 'mark', negated: true }
        } else if (code.toLowerCase() == 'istmarke') {
          cond = { type: 'mark', negated: false }
        } else if (code.toLowerCase() == 'nichtistnorden') {
          cond = { type: 'north', negated: true }
        } else if (code.toLowerCase() == 'istnorden') {
          cond = { type: 'north', negated: false }
        } else if (code.toLowerCase() == 'nichtistosten') {
          cond = { type: 'east', negated: true }
        } else if (code.toLowerCase() == 'istosten') {
          cond = { type: 'east', negated: false }
        } else if (code.toLowerCase() == 'nichtistsüden') {
          cond = { type: 'south', negated: true }
        } else if (code.toLowerCase() == 'istsüden') {
          cond = { type: 'south', negated: false }
        } else if (code.toLowerCase() == 'nichtistwesten') {
          cond = { type: 'west', negated: true }
        } else if (code.toLowerCase() == 'istwesten') {
          cond = { type: 'west', negated: false }
        } else if (preparedCode == 'istziegel' && repeat !== null) {
          cond = {
            type: 'brick_count',
            negated: false,
            count: parseInt(repeat),
          }
        } else if (preparedCode == 'nichtistziegel' && repeat !== null) {
          cond = { type: 'brick_count', negated: true, count: parseInt(repeat) }
        }
        if (st && st.type == 'repeat' && st.stage == 10) {
          st.stage = 11
          st.start = output.length
          st.condition = cond
        } else if (st && st.type == 'if' && st.stage == 1) {
          st.condition = cond
          st.stage = 2
        }
      }
      if (cursor.name == 'IfThen') {
        parseStack.push({ type: 'if', from: cursor.from, stage: 0 })
      }
      if (cursor.name == 'IfKey') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'if' && st.stage == 0) {
          st.stage = 1
        }
      }
      if (cursor.name == 'ThenKey') {
        const st = parseStack[parseStack.length - 1]
        const line = doc.lineAt(st.from).number
        if (st.type == 'if' && st.stage == 2) {
          st.stage = 3
          const hasArg = st.condition!.count !== undefined
          if (hasArg) {
            output.push({ type: 'constant', value: st.condition!.count! })
          }
          output.push({
            type: 'sense',
            condition: st.condition!,
            hasArg,
          })
          const op: Op = {
            type: 'branch',
            targetT: output.length + 1,
            targetF: -1,
            line,
          }
          output.push(op)
          st.op = op
        }
      }
      if (cursor.name == 'ElseKey') {
        const st = parseStack[parseStack.length - 1]
        if (st && st.type == 'if' && st.stage == 3) {
          st.op!.targetF = output.length + 1
          const op: Op = { type: 'jump', target: -1 }
          output.push(op)
          st.stage = 4
          st.op = op
        }
      }
      if (cursor.name == 'IfEndKey') {
        const st = parseStack[parseStack.length - 1]
        if (st && st.type == 'if') {
          if (st.stage == 3 && st.op) {
            st.op.targetF = output.length
          } else if (st.stage == 4 && st.op) {
            st.op.target = output.length
          }
          parseStack.pop()
        }
      }
      if (cursor.name == 'Times') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 1) {
          st.stage++
          st.times = parseInt(code)
          if (!code || isNaN(st.times) || st.times < 0) {
            // additional compiler check
            warnings.push({
              from: cursor.from - 3,
              to: Math.min(cursor.to + 3, doc.length - 1),
              severity: 'error',
              message:
                'Anzahl der Wiederholung ist negativ, erwarte ein Zahl größer gleich 0',
            })
          }
          output.push({ type: 'constant', value: st.times! + 1 }) // we decrement before compare
          const loopVar = `//internal_loop$${loopVarCounter++}`
          output.push({ type: 'store', variable: loopVar })
          const op: Op = { type: 'jump', target: -1 }
          output.push(op)
          st.op = op
          st.loopVar = loopVar
        }
      }
      if (cursor.name == 'RepeatTimesKey') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'repeat' && st.stage == 2) {
          st.stage++
          st.start = output.length
        }
      }
      if (cursor.name == 'RepeatEnd') {
        const st = parseStack[parseStack.length - 1]
        const line = doc.lineAt(st.from).number
        if (st.type == 'repeat' && st.stage == 3) {
          st.op!.target = output.length
          output.push({ type: 'load', variable: st.loopVar! })
          output.push({ type: 'constant', value: 1 })
          output.push({ type: 'operation', kind: 'sub' })
          output.push({ type: 'store', variable: st.loopVar! })
          output.push({ type: 'load', variable: st.loopVar! })
          output.push({
            type: 'branch',
            targetT: st.start!,
            targetF: output.length + 1,
            line,
          })
          parseStack.pop()
        } else if (st.type == 'repeat' && st.stage == 11) {
          st.op!.target = output.length
          const line = doc.lineAt(st.from).number
          const hasArg = st.condition!.count !== undefined
          if (hasArg) {
            output.push({ type: 'constant', value: st.condition!.count! })
          }
          output.push({
            type: 'sense',
            condition: st.condition!,
            hasArg,
          })
          output.push({
            type: 'branch',
            targetT: st.start!,
            targetF: output.length + 1,
            line,
          })
          parseStack.pop()
        } else if (st.type == 'repeat' && st.stage == 20) {
          st.op!.target = output.length
          const line = doc.lineAt(st.from).number
          output.push({
            type: 'jump',
            target: st.start!,
            line,
          })
          parseStack.pop()
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
        }
      }
      if (cursor.name == 'CmdName') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'function' && st.stage == 1) {
          if (declarations[code]) {
            // additional compiler check
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'Anweisung mit diesem Namen bereits vorhanden',
            })
          } else {
            st.stage = 2
            st.name = code
            const op: Op = { type: 'jump', target: -1 }
            output.push(op)
            st.skipper = op
          }
        }
      }
      if (cursor.name == 'CmdEnd') {
        const st = parseStack[parseStack.length - 1]
        if (st.type == 'function' && st.stage == 2) {
          declarations[st.name!] = { target: st.target! }
          output.push({ type: 'return' })
          st.skipper!.target = output.length
        }
      }
      if (cursor.type.isError) {
        //console.log(cursor.node, parseStack)
        const topOfStack = parseStack[parseStack.length - 1]
        let message = 'Kontrollstruktur unvollständig'
        if (topOfStack) {
          if (topOfStack.type == 'repeat') {
            message = 'Schleife unvollständig'
            if (topOfStack.stage == 1) {
              message += ', Zahl oder "solange" erwartet'
            }
            if (topOfStack.stage == 2 && topOfStack.times) {
              message += ', "mal" erwartet'
            }
            if (topOfStack.stage == 3) {
              message += ', "endewiederhole" erwartet'
            }
            if (
              topOfStack.stage == 10 ||
              (topOfStack.stage == 11 && !topOfStack.condition?.type)
            ) {
              message += ', Bedingung erwartet'
            }
            if (topOfStack.stage == 11 && topOfStack.condition?.type) {
              message += ', "endewiederhole" erwartet'
            }
          }
          if (topOfStack.type == 'if') {
            message = 'Bedingte Anweisung unvollständig'
            if (
              topOfStack.stage == 1 ||
              (topOfStack.stage == 2 && !topOfStack.op)
            ) {
              message += ', Bedingung erwartet'
            } else if (
              topOfStack.stage == 2 ||
              (topOfStack.stage > 2 && !topOfStack.op)
            ) {
              message += ', "dann" erwartet'
            }
            if (
              (topOfStack.stage == 3 || topOfStack.stage == 4) &&
              topOfStack.op
            ) {
              message += ', "endewenn" erwartet'
            }
          }
          if (topOfStack.type == 'function') {
            message = 'Anweisung unvollständig'
            if (
              cursor.node.parent?.name === 'CmdName' ||
              topOfStack.stage == 1
            ) {
              message += ', Name der Anweisung erwartet'
            } else {
              message += ', "endeAnweisung" erwartet'
            }
          }
        }
        warnings.push({
          from: Math.max(0, cursor.from - 2),
          to: Math.min(cursor.to + 2, doc.length - 1),
          severity: 'error',
          message,
        })
      }
    } while (cursor.next())
  }
  for (const f of functions) {
    if (declarations[f.code]) {
      f.op.target = declarations[f.code].target
    } else {
      // additional compiler check
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
