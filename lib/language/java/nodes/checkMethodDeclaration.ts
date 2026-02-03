import { CompilerOutput } from '../../helper/CompilerOutput'
import type { AstNode } from '../../helper/astNode'
import {
  type SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'

export function checkMethodDeclaration(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
) {
  // already checked by toplevel
  node.children
    .filter((child) => child.name == 'Block')
    .map((child) => compileDeclarationAndStatements(co, child, context))
}
