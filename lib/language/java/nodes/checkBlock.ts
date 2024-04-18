import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { ensureBlock } from '../ensureBlock'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkBlock(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  ensureBlock(co, node.children)
  node.children
    .filter((child) => child.name !== '{' && child.name !== '}')
    .map((child) => semanticCheck(co, child, context))
}
