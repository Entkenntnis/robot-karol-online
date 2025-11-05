import { CompilerOutput } from '../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../helper/astNode'
import { matchChildren } from '../helper/matchChildren'
import { compileValExpression } from './compileValExpression'
import { checkMethodInvocation } from './nodes/checkMethodInvocation'
import { SemantikCheckContext } from './nodes/semanticCheck'

export const expressionNodes = [
  'IntegerLiteral',
  'Identifier',
  'BinaryExpression',
  'UnaryExpression',
  'ParenthesizedExpression',
  'UpdateExpression',
  'AssignmentExpression',
  'MethodInvocation',
]

export function parseExpression(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (node.name === 'IntegerLiteral') {
    if (context.expectVoid) return
    co.appendOutput({ type: 'constant', value: parseInt(node.text()) })
    context.valueType = 'int'
    return
  }

  if (node.name === 'Identifier') {
    co.activateProMode()
    if (context.expectVoid) return
    const variable = node.text()
    if (!context.variablesInScope.has(variable)) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
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
  }

  if (node.name === 'ParenthesizedExpression') {
    if (matchChildren(['(', expressionNodes, ')'], node.children)) {
      parseExpression(co, node.children[1], context)
      // don't change context and pass through transparently
      return
    }
  }

  if (node.name == 'UpdateExpression') {
    co.activateProMode()
    let varName = ''
    let isIncr = true
    let prefix = false

    if (matchChildren(['UpdateOp', 'Identifier'], node.children)) {
      varName = node.children[1].text()
      isIncr = node.children[0].text() == '++'
    } else if (matchChildren(['Identifier', 'UpdateOp'], node.children)) {
      prefix = true
      varName = node.children[0].text()
      isIncr = node.children[1].text() == '++'
    } else {
      co.warn(node, 'Fehler in UpdateExpression')
    }

    if (!context.variablesInScope.has(varName)) {
      co.warn(node, `Variable ${varName} nicht bekannt`)
    }

    let putDataOnStack = false
    if (!context.expectVoid) {
      context.valueType = 'int'
      putDataOnStack = true
    }

    if (putDataOnStack && prefix) {
      co.appendOutput({ type: 'load', variable: varName })
    }
    co.appendOutput({ type: 'load', variable: varName })
    co.appendOutput({ type: 'constant', value: 1 })
    co.appendOutput({ type: 'operation', kind: isIncr ? 'add' : 'sub' })
    co.appendOutput({ type: 'store', variable: varName })
    if (putDataOnStack && !prefix) {
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
      return
    }

    const variable = node.children[0].text()

    if (!context.variablesInScope.has(variable)) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      return
    }

    const op = node.children[1].text()
    if (op != '=') {
      co.warn(node.children[1], `Zuweisung ${op} nicht unterstützt`)
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
    return
  }

  co.warn(node, `Ausdruck ${node.name} konnte nicht eingelesen werden.`)
}
