import { CompilerOutput } from '../../helper/CompilerOutput'
import type { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { compileValExpression } from './compileValExpression'
import { checkMethodInvocation } from './checkMethodInvocation'
import type {
  SemantikCheckContext,
  ValueType,
} from './compileDeclarationAndStatements'
import type { BranchOp, JumpOp } from '../../../state/types'

export const expressionNodes = [
  'IntegerLiteral',
  'BooleanLiteral',
  'Identifier',
  'BinaryExpression',
  'TernaryExpression',
  'UnaryExpression',
  'ParenthesizedExpression',
  'UpdateExpression',
  'AssignmentExpression',
  'MethodInvocation',
]

const compareOps = {
  '==': 'equal',
  '<=': 'less-equal',
  '<': 'less-than',
  '>': 'greater-than',
  '>=': 'greater-equal',
  '!=': 'unequal',
}

export function compileExpression(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
): ValueType {
  if (node.name === 'IntegerLiteral') {
    if (context.expectVoid) {
      return 'void'
    }
    co.appendOutput({ type: 'constant', value: parseInt(node.text()) })
    return 'int'
  }

  if (node.name === 'TernaryExpression') {
    // Pattern: <cond> ? <then> : <else>
    co.activateProMode()
    if (
      !matchChildren(
        [expressionNodes, 'LogicOp', expressionNodes, ':', expressionNodes],
        node.children,
      )
    ) {
      co.warn(node, 'Fehler im ternären Operator')
      return 'void'
    }

    const qmark = node.children[1]
    if (qmark.text() !== '?') {
      co.warn(qmark, 'Erwarte ? im ternären Operator')
      return 'void'
    }

    const cond = node.children[0]
    const thenExpr = node.children[2]
    const elseExpr = node.children[4]

    // Evaluate condition
    compileValExpression('boolean', co, cond, context)

    const line = co.lineAt(node.from).number
    const b: BranchOp = { type: 'branch', targetT: -1, targetF: -1, line }

    const anchorThenStart: any = {
      type: 'anchor',
      callback: (target: number) => {
        b.targetT = target
      },
    }
    const anchorElseStart: any = {
      type: 'anchor',
      callback: (target: number) => {
        b.targetF = target
      },
    }
    const jEnd: JumpOp = { type: 'jump', target: -1, line }
    const anchorEnd: any = {
      type: 'anchor',
      callback: (target: number) => {
        jEnd.target = target
      },
    }

    // Branch on condition
    co.appendOutput(b)

    // THEN branch
    co.appendOutput(anchorThenStart)
    const thenType = compileExpression(co, thenExpr, context)
    let resultType: ValueType = thenType
    if (thenType === 'void') {
      // Keep stack balanced; push default 0
      if (co.noWarningsInRange(thenExpr.from, thenExpr.to)) {
        co.warn(thenExpr, 'Erwarte Wert im ternären Operator')
      }
      return 'void'
    }
    // Jump over ELSE after THEN branch
    co.appendOutput(jEnd)

    // ELSE branch
    co.appendOutput(anchorElseStart)
    if (resultType !== 'void') {
      // Enforce same type as THEN branch (after possible defaulting)
      compileValExpression(resultType, co, elseExpr, context)
    } else {
      // Fallback, but should not happen as we default to int on void
      const elseType = compileExpression(co, elseExpr, context)
      if (elseType === 'void') {
        if (co.noWarningsInRange(elseExpr.from, elseExpr.to)) {
          co.warn(elseExpr, 'Erwarte Wert im ternären Operator')
        }
        return 'void'
      } else {
        resultType = elseType
      }
    }

    // End anchor
    co.appendOutput(anchorEnd)

    return resultType
  }

  if (node.name === 'BooleanLiteral') {
    if (context.expectVoid) {
      return 'void'
    }
    co.appendOutput({
      type: 'constant',
      value: node.text().trim() == 'true' ? 1 : 0,
    })
    return 'boolean'
  }

  if (node.name === 'Identifier') {
    co.activateProMode()
    if (context.expectVoid) {
      return 'void'
    }
    const variable = node.text()
    const t = context.variablesInScope.get(variable)
    if (!t) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      return 'void'
    }
    co.appendOutput({ type: 'load', variable })
    // HARDCODED: all variables are int
    return t
  }

  if (node.name === 'BinaryExpression') {
    co.activateProMode()
    if (
      matchChildren(
        [expressionNodes, 'ArithOp', expressionNodes],
        node.children,
      )
    ) {
      const op = node.children[1].text()
      if (!['+', '-', '*', '/', '%'].includes(op)) {
        co.warn(node.children[1], `Die Rechenart ${op} wird nicht unterstützt`)
        return 'void'
      }

      const expr1 = node.children[0]
      const expr2 = node.children[2]
      compileValExpression('int', co, expr1, context)
      compileValExpression('int', co, expr2, context)
      co.appendOutput({
        type: 'operation',
        kind:
          op === '+'
            ? 'add'
            : op === '-'
              ? 'sub'
              : op === '*'
                ? 'mult'
                : op === '/'
                  ? 'div'
                  : 'mod',
      })
      return 'int'
    }
    // Logical operators (&&, ||) with short-circuiting
    if (
      matchChildren(
        [expressionNodes, 'LogicOp', expressionNodes],
        node.children,
      )
    ) {
      const op = node.children[1].text()
      const left = node.children[0]
      const right = node.children[2]

      if (op !== '&&' && op !== '||') {
        co.warn(node.children[1], `Unbekannter logischer Operator`)
        // best effort: do not emit broken stack ops
        return 'void'
      }

      // Evaluate left side as boolean
      compileValExpression('boolean', co, left, context)

      const line = co.lineAt(node.from).number

      // First branch depending on left
      const b1: BranchOp = { type: 'branch', targetT: -1, targetF: -1, line }

      // Anchors that we will use to wire control flow
      const anchorRight: any = {
        type: 'anchor',
        callback: (target: number) => {
          // where to continue to evaluate right side
          if (op === '||') b1.targetF = target
          else b1.targetT = target // '&&'
        },
      }

      // Second branch after evaluating right
      const b2: BranchOp = { type: 'branch', targetT: -1, targetF: -1, line }

      const anchorTrue: any = {
        type: 'anchor',
        callback: (target: number) => {
          // both branches true-target should jump here
          if (op === '||') {
            b1.targetT = target
            b2.targetT = target
          } else {
            // '&&'
            b2.targetT = target
          }
        },
      }
      const anchorFalse: any = {
        type: 'anchor',
        callback: (target: number) => {
          // false target (only used where needed)
          if (op === '||') {
            b2.targetF = target
          } else {
            // '&&'
            b1.targetF = target
            b2.targetF = target
          }
        },
      }
      const jEnd: JumpOp = { type: 'jump', target: -1, line }
      const anchorEnd: any = {
        type: 'anchor',
        callback: (target: number) => {
          jEnd.target = target
        },
      }

      // Emit first branch and wire right-side start
      co.appendOutput(b1)
      co.appendOutput(anchorRight)

      // Right side
      compileValExpression('boolean', co, right, context)

      // Decide final result based on right side
      co.appendOutput(b2)

      // True path: push 1 and jump to end
      co.appendOutput(anchorTrue)
      co.appendOutput({ type: 'constant', value: 1 })
      co.appendOutput(jEnd)

      // False path: push 0
      co.appendOutput(anchorFalse)
      co.appendOutput({ type: 'constant', value: 0 })

      // End anchor
      co.appendOutput(anchorEnd)

      return 'boolean'
    }
    if (
      matchChildren(
        [expressionNodes, 'CompareOp', expressionNodes],
        node.children,
      )
    ) {
      const opText = node.children[1].text()
      // @ts-ignore We check it in next line
      const kind = compareOps[opText]
      // console.log(comparison.children[1].text(), kind)
      if (!kind) {
        co.warn(node.children[1], `Unbekannter Vergleichsoperator`)
        return 'void'
      }
      if (kind === 'equal' || kind === 'unequal') {
        // Allow equality on booleans as well as ints, as long as both sides have the same type
        // Compile left without enforcing a specific type
        const leftType = compileExpression(co, node.children[0], context)
        if (leftType === 'void') {
          if (co.noWarningsInRange(node.from, node.to)) {
            co.warn(node.children[0], 'Erwarte Wert für Vergleich')
          }
          return 'void'
        }
        // Enforce right side to match left side type
        compileValExpression(leftType, co, node.children[2], context)
      } else {
        // For relational comparisons, require integers
        compileValExpression('int', co, node.children[0], context)
        compileValExpression('int', co, node.children[2], context)
      }
      co.appendOutput({ type: 'compare', kind })
      return 'boolean'
    }
  }

  if (node.name === 'UnaryExpression') {
    co.activateProMode()
    if (matchChildren(['ArithOp', expressionNodes], node.children)) {
      if (node.children[0].text() !== '-') {
        co.warn(node.children[0], `Es wird nur Negation unterstützt`)
      }
      compileValExpression('int', co, node.children[1], context)
      co.appendOutput({ type: 'constant', value: -1 })
      co.appendOutput({ type: 'operation', kind: 'mult' })
      return 'int'
    }
    if (matchChildren(['LogicOp', expressionNodes], node.children)) {
      if (node.children[0].text() !== '!') {
        co.warn(node.children[0], `Es wird nur ! hier unterstützt`)
      }
      compileValExpression('boolean', co, node.children[1], context)
      co.appendOutput({ type: 'constant', value: 1 })
      co.appendOutput({ type: 'operation', kind: 'add' })
      co.appendOutput({ type: 'constant', value: 2 })
      co.appendOutput({ type: 'operation', kind: 'mod' })
      return 'boolean'
    }
  }

  if (node.name === 'ParenthesizedExpression') {
    if (matchChildren(['(', expressionNodes, ')'], node.children)) {
      // don't change context and pass through transparently
      return compileExpression(co, node.children[1], context)
    }
  }

  if (node.name == 'UpdateExpression') {
    co.activateProMode()
    let varName = ''
    let isIncr = true
    let postfix = false

    if (matchChildren(['UpdateOp', 'Identifier'], node.children)) {
      varName = node.children[1].text()
      isIncr = node.children[0].text() == '++'
    } else if (matchChildren(['Identifier', 'UpdateOp'], node.children)) {
      postfix = true
      varName = node.children[0].text()
      isIncr = node.children[1].text() == '++'
    } else {
      co.warn(node, 'Fehler in UpdateExpression')
      return 'void'
    }

    if (!context.variablesInScope.has(varName)) {
      co.warn(node, `Variable ${varName} nicht bekannt`)
      return 'void'
    }
    const varType = context.variablesInScope.get(varName)
    if (varType !== 'int') {
      co.warn(node, `Erwarte int für Update-Operator`)
      return 'void'
    }

    let putDataOnStack = false
    if (!context.expectVoid) {
      putDataOnStack = true
    }

    if (putDataOnStack && postfix) {
      co.appendOutput({ type: 'load', variable: varName })
    }
    co.appendOutput({ type: 'load', variable: varName })
    co.appendOutput({ type: 'constant', value: 1 })
    co.appendOutput({ type: 'operation', kind: isIncr ? 'add' : 'sub' })
    co.appendOutput({ type: 'store', variable: varName })
    if (putDataOnStack && !postfix) {
      co.appendOutput({ type: 'load', variable: varName })
    }
    return putDataOnStack ? 'int' : 'void'
  }

  if (node.name == 'AssignmentExpression') {
    co.activateProMode()
    if (
      !matchChildren(['Identifier', 'AssignOp', expressionNodes], node.children)
    ) {
      co.warn(node, 'Fehler beim Parser der Zuweisung')
      return 'void'
    }

    const variable = node.children[0].text()

    const varType = context.variablesInScope.get(variable)
    if (!varType) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      return 'void'
    }

    const op = node.children[1].text()
    const myExpectVoid = context.expectVoid

    if (op === '=') {
      // Simple assignment
      compileValExpression(varType, co, node.children[2], context)
      co.appendOutput({ type: 'store', variable })
      if (!myExpectVoid) {
        co.appendOutput({ type: 'load', variable })
      }
      return myExpectVoid ? 'void' : varType
    }

    // Compound assignments for integers: +=, -=, *=, /=, %=
    const compoundOps: Record<string, 'add' | 'sub' | 'mult' | 'div' | 'mod'> =
      {
        '+=': 'add',
        '-=': 'sub',
        '*=': 'mult',
        '/=': 'div',
        '%=': 'mod',
      }

    const opKind = compoundOps[op as keyof typeof compoundOps]
    if (!opKind) {
      co.warn(node.children[1], `Zuweisung ${op} nicht unterstützt`)
      return 'void'
    }

    if (varType !== 'int') {
      co.warn(
        node.children[0],
        'Erwarte int für zusammengesetzten Zuweisungsoperator',
      )
      return 'void'
    }

    // Load current value, evaluate RHS as int, apply operation, store back
    co.appendOutput({ type: 'load', variable })
    compileValExpression('int', co, node.children[2], context)
    co.appendOutput({ type: 'operation', kind: opKind })
    co.appendOutput({ type: 'store', variable })
    if (!myExpectVoid) {
      co.appendOutput({ type: 'load', variable })
    }
    return myExpectVoid ? 'void' : 'int'
  }

  if (node.name == 'MethodInvocation') {
    return checkMethodInvocation(co, node, context)
  }

  if (node.text().trim() == `${context.robotName}.`) {
    co.warn__internal({
      from: node.from,
      to: Math.min(node.to, co.lineAt(node.from).to), // cap error at end of line
      message: `Erwarte Methodenaufruf nach '${context.robotName}.'`,
    })
    return 'void'
  }

  co.warn(node, `Ausdruck ${node.name} konnte nicht eingelesen werden.`)
  return 'void'
}
