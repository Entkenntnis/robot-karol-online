import { AstNode } from '../helper/astNode'
import { CompilerOutput } from '../helper/CompilerOutput'
import { SemantikCheckContext, ValueType } from './nodes/semanticCheck'
import { parseExpression } from './parseExpression'

export function compileValExpression(
  expectedType: ValueType,
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  context.expectVoid = false
  parseExpression(co, node, context)
  if (context.valueType != expectedType) {
    if (co.noWarningsInRange(node.from, node.to)) {
      co.warn(
        node,
        `Erwarte ${expectedType}-Wert, aber ${context.valueType} erhalten`
      )
    }
  }
}
