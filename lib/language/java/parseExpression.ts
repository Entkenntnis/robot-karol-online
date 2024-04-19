import { CompilerOutput } from '../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../helper/astNode'
import { matchChildren } from '../helper/matchChildren'
import { SemantikCheckContext } from './nodes/semanticCheck'

export const expressionNodes = [
  'IntegerLiteral',
  'Identifier',
  'BinaryExpression',
  'UnaryExpression',
  'ParenthesizedExpression',
]

export function parseExpression(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  co.activateProMode()

  if (node.name === 'IntegerLiteral') {
    co.appendOutput({ type: 'constant', value: parseInt(node.text()) })
    return
  }

  if (node.name === 'Identifier') {
    const variable = node.text()
    if (!context.variablesInScope.has(variable)) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      return
    }
    co.appendOutput({ type: 'load', variable })
    return
  }

  if (node.name === 'BinaryExpression') {
    if (
      matchChildren(
        [expressionNodes, 'ArithOp', expressionNodes],
        node.children
      )
    ) {
      const op = node.children[1].text()
      if (!['+', '-', '*', '/'].includes(op)) {
        co.warn(node.children[1], `Die Rechenart ${op} wird nicht unterstützt`)
      }

      const expr1 = node.children[0]
      const expr2 = node.children[2]
      parseExpression(co, expr1, context)
      parseExpression(co, expr2, context)
      co.appendOutput({
        type: 'operation',
        kind:
          op === '+' ? 'add' : op === '-' ? 'sub' : op === '*' ? 'mult' : 'div',
      })
      return
    }
  }

  if (node.name === 'UnaryExpression') {
    if (matchChildren(['ArithOp', expressionNodes], node.children)) {
      if (node.children[0].text() !== '-') {
        co.warn(node.children[0], `Es wird Negation unterstützt`)
      }
      parseExpression(co, node.children[1], context)
      co.appendOutput({ type: 'constant', value: -1 })
      co.appendOutput({ type: 'operation', kind: 'mult' })
      return
    }
  }

  if (node.name === 'ParenthesizedExpression') {
    if (matchChildren(['(', expressionNodes, ')'], node.children)) {
      parseExpression(co, node.children[1], context)
      return
    }
  }

  co.warn(node, `Ausdruck ${node.name} konnte nicht eingelesen werden`)
}
