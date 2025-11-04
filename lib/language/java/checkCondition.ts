import { CompilerOutput } from '../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../helper/astNode'
import { conditionToRK } from '../helper/conditionToRk'
import { matchChildren } from '../helper/matchChildren'
import { SemantikCheckContext, semanticCheck } from './nodes/semanticCheck'
import { expressionNodes, parseExpression } from './parseExpression'

const compareOps = {
  '==': 'equal',
  '<=': 'less-equal',
  '<': 'less-than',
  '>': 'greater-than',
  '>=': 'greater-equal',
  '!=': 'unequal',
}
export function checkCondition(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
  rkTemplate: (condition: string) => string
) {
  if (matchChildren(['(', 'BinaryExpression', ')'], node.children)) {
    const comparison = node.children[1]
    if (
      matchChildren(
        [expressionNodes, 'CompareOp', expressionNodes],
        comparison.children
      )
    ) {
      // @ts-ignore We check it later
      const kind = compareOps[comparison.children[1].text()]
      console.log(comparison.children[1].text(), kind)
      if (!kind) {
        co.warn(comparison.children[1], `Unbekannter Vergleichsoperator`)
        return false
      }
      parseExpression(co, comparison.children[0], context)
      parseExpression(co, comparison.children[2], context)
      co.appendOutput({ type: 'compare', kind })
      co.activateProMode()
      return true
    }
  } else {
    context.expectCondition = true
    semanticCheck(co, node, context)
    context.expectCondition = undefined
    const condition = context.condition
    if (condition) {
      if (condition.type == 'brick_count' && condition.count !== undefined) {
        co.appendOutput({ type: 'constant', value: condition.count })
      }
      co.appendOutput({
        type: 'sense',
        condition,
      })
      co.appendRkCode(rkTemplate(conditionToRK(condition)), node.from)
      return true
    }
  }
  return false
}
