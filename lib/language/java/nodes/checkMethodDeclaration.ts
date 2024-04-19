import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkMethodDeclaration(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  // already checked by toplevel
  node.children
    .filter((child) => child.name == 'Block')
    .map((child) => semanticCheck(co, child, context))
}
