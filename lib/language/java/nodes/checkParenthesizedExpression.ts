import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkParenthesizedExpression(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (matchChildren(['(', 'MethodInvocation', ')'], node.children)) {
    semanticCheck(co, node.children[1], context)
  } else {
    co.warn(node, `Erwarte Bedingung`)
  }
}
