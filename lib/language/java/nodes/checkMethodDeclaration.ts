import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import {
  SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'

export function checkMethodDeclaration(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  // already checked by toplevel
  node.children
    .filter((child) => child.name == 'Block')
    .map((child) => compileDeclarationAndStatements(co, child, context))
}
