import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { compileValExpression } from './compileValExpression'
import { checkMethodInvocation } from './checkMethodInvocation'
import { SemantikCheckContext } from './compileDeclarationAndStatements'
import { BranchOp, JumpOp } from '../../../state/types'

export const expressionNodes = [
  'IntegerLiteral',
  'BooleanLiteral',
  'Identifier',
  'BinaryExpression',
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
  context: SemantikCheckContext
) {
  if (node.name === 'IntegerLiteral') {
    if (context.expectVoid) {
      context.valueType = 'void'
      return
    }
    co.appendOutput({ type: 'constant', value: parseInt(node.text()) })
    context.valueType = 'int'
    return
  }

  if (node.name === 'BooleanLiteral') {
    if (context.expectVoid) {
      context.valueType = 'void'
      return
    }
    co.appendOutput({
      type: 'constant',
      value: node.text().trim() == 'true' ? 1 : 0,
    })
    context.valueType = 'boolean'
    return
  }

  if (node.name === 'Identifier') {
    co.activateProMode()
    if (context.expectVoid) {
      context.valueType = 'void'
      return
    }
    const variable = node.text()
    if (!context.variablesInScope.has(variable)) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      context.valueType = 'void'
      return
    }
    co.appendOutput({ type: 'load', variable })
    // HARDCODED: all variables are int
    context.valueType = 'int'
    return
  }

  if (node.name === 'BinaryExpression') {
    co.activateProMode()
    if (
      matchChildren(
        [expressionNodes, 'ArithOp', expressionNodes],
        node.children
      )
    ) {
      const op = node.children[1].text()
      if (!['+', '-', '*', '/', '%'].includes(op)) {
        co.warn(node.children[1], `Die Rechenart ${op} wird nicht unterstützt`)
        context.valueType = 'void'
        return
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
      context.valueType = 'int'
      return
    }
    // Logical operators (&&, ||) with short-circuiting
    if (
      matchChildren(
        [expressionNodes, 'LogicOp', expressionNodes],
        node.children
      )
    ) {
      const op = node.children[1].text()
      const left = node.children[0]
      const right = node.children[2]

      if (op !== '&&' && op !== '||') {
        co.warn(node.children[1], `Unbekannter logischer Operator`)
        // best effort: do not emit broken stack ops
        context.valueType = 'void'
        return
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

      context.valueType = 'boolean'
      return
    }
    if (
      matchChildren(
        [expressionNodes, 'CompareOp', expressionNodes],
        node.children
      )
    ) {
      // @ts-ignore We check it in next line
      const kind = compareOps[node.children[1].text()]
      // console.log(comparison.children[1].text(), kind)
      if (!kind) {
        co.warn(node.children[1], `Unbekannter Vergleichsoperator`)
        return
      }
      compileValExpression('int', co, node.children[0], context)
      compileValExpression('int', co, node.children[2], context)
      co.appendOutput({ type: 'compare', kind })
      context.valueType = 'boolean'
      return
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
      context.valueType = 'int'
      return
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
      context.valueType = 'boolean'
      return
    }
  }

  if (node.name === 'ParenthesizedExpression') {
    if (matchChildren(['(', expressionNodes, ')'], node.children)) {
      compileExpression(co, node.children[1], context)
      // don't change context and pass through transparently
      return
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
      context.valueType = 'void'
      return
    }

    if (!context.variablesInScope.has(varName)) {
      co.warn(node, `Variable ${varName} nicht bekannt`)
      context.valueType = 'void'
      return
    }

    let putDataOnStack = false
    if (!context.expectVoid) {
      context.valueType = 'int'
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
    if (putDataOnStack) {
      context.valueType = 'int'
    } else {
      context.valueType = 'void'
    }
    return
  }

  if (node.name == 'AssignmentExpression') {
    co.activateProMode()
    if (
      !matchChildren(['Identifier', 'AssignOp', expressionNodes], node.children)
    ) {
      co.warn(node, 'Fehler beim Parser der Zuweisung')
      context.valueType = 'void'
      return
    }

    const variable = node.children[0].text()

    if (!context.variablesInScope.has(variable)) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      context.valueType = 'void'
      return
    }

    const op = node.children[1].text()
    if (op != '=') {
      co.warn(node.children[1], `Zuweisung ${op} nicht unterstützt`)
      context.valueType = 'void'
      return
    }

    const myExpectVoid = context.expectVoid
    compileValExpression('int', co, node.children[2], context)
    co.appendOutput({ type: 'store', variable })
    if (!myExpectVoid) {
      co.appendOutput({ type: 'load', variable })
    }
    context.valueType = myExpectVoid ? 'void' : 'int'
    return
  }

  if (node.name == 'MethodInvocation') {
    checkMethodInvocation(co, node, context)
    return
  }

  if (node.text().trim() == `${context.robotName}.`) {
    co.warn__internal({
      from: node.from,
      to: Math.min(node.to, co.lineAt(node.from).to), // cap error at end of line
      message: `Erwarte Methodenaufruf nach '${context.robotName}.'`,
    })
    context.valueType = 'void'
    return
  }

  co.warn(node, `Ausdruck ${node.name} konnte nicht eingelesen werden.`)
}
