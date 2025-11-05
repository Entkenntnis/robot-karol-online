import { AstNode } from '../../helper/astNode'
import { CompilerOutput } from '../../helper/CompilerOutput'
import {
  SemantikCheckContext,
  ValueType,
} from './compileDeclarationAndStatements'
import { compileExpression } from './compileExpression'

export function compileValExpression(
  expectedType: ValueType,
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  context.expectVoid = false
  compileExpression(co, node, context)
  if (context.valueType != expectedType) {
    if (co.noWarningsInRange(node.from, node.to)) {
      co.warn(
        node,
        `Erwarte ${expectedType}-Wert, aber ${context.valueType} erhalten`
      )
    }
  }
}
