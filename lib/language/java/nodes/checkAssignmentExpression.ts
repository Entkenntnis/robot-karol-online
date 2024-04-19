import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { expressionNodes, parseExpression } from '../parseExpression'
import { SemantikCheckContext } from './semanticCheck'

export function checkAssignmentExpression(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (
    !matchChildren(['Identifier', 'AssignOp', expressionNodes], node.children)
  ) {
    co.warn(node, 'Fehler beim Parser von LocalVariableDeclaration')
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

  co.activateProMode()
  parseExpression(co, node.children[2], context)
  co.appendOutput({ type: 'store', variable })
}
