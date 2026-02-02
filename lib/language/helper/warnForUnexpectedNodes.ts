import { CompilerOutput } from './CompilerOutput'
import type { AstNode } from './astNode'

export function warnForUnexpectedNodes(
  co: CompilerOutput,
  nodes: AstNode[],
  warnNode?: AstNode,
) {
  for (const node of nodes) {
    co.warn(
      warnNode ?? node,
      node.isError
        ? 'Bitte Syntaxfehler korrigieren'
        : `Bitte entferne '${node.text()}', wird hier nicht unterstützt`,
    )
  }
}
