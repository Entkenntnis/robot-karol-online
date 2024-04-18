import { CompilerOutput } from './CompilerOutput'
import { AstNode } from './astNode'

export function ensureExactlyOneChild(
  co: CompilerOutput,
  nodes: AstNode[],
  pred: (node: AstNode) => boolean,
  placeMessageOnNode: AstNode,
  message0: string,
  messageMany: string
) {
  const matching = nodes.filter(pred)
  if (matching.length !== 1) {
    co.warn(placeMessageOnNode, matching.length == 0 ? message0 : messageMany)
    return false
  }
}
