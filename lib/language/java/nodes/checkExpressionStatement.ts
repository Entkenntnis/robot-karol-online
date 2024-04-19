import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { checkSemikolon } from '../checkSemikolon'
import { expressionNodes } from '../parseExpression'
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
  if (matchChildren(['AssignmentExpression', ';'], node.children)) {
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
  if (matchChildren(['UpdateExpression', ';'], node.children)) {
    co.warn(node, 'UpdateExpression nicht unterstützt')
    return
  }
  const prefix = `${context.robotName}.`
  co.warn__internal({
    from: node.from + (node.text().startsWith(prefix) ? prefix.length : 0),
    to: Math.min(node.to, co.lineAt(node.from).to),
    message: 'Erwarte Methodenaufruf',
  })
  console.log('ExpressionStatement', prettyPrintAstNode(node))
}
