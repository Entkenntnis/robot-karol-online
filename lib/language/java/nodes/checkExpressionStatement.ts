import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { checkSemikolon } from '../checkSemikolon'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkExpressionStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (matchChildren(['MethodInvocation', ';'], node.children)) {
    semanticCheck(co, node.children[0], context)
    return
  }
  const lastChild = node.children[node.children.length - 1]
  if (lastChild.isError) {
    node.children.pop()
  }
  if (matchChildren(['MethodInvocation'], node.children)) {
    semanticCheck(co, node.children[0], context)
    checkSemikolon(co, node)
    return
  }
  const prefix = `${context.robotName}.`
  co.warn__internal({
    from: node.from + (node.text().startsWith(prefix) ? prefix.length : 0),
    to: Math.min(node.to, co.lineAt(node.from).to),
    message: 'Erwarte Methodenaufruf',
  })
}
