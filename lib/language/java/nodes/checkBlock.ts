import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { ensureBlock } from '../ensureBlock'
import {
  SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'

export function checkBlock(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  ensureBlock(co, node.children)
  const previousVariables = new Set(context.variablesInScope.keys())
  node.children
    .filter((child) => child.name !== '{' && child.name !== '}')
    .map((child) => compileDeclarationAndStatements(co, child, context))

  // closing scope and remove all additional variables
  const keys = Array.from(context.variablesInScope.keys())
  for (const key of keys) {
    if (!previousVariables.has(key)) {
      context.variablesInScope.delete(key)
    }
  }
}
