import { CompilerOutput } from '../helper/CompilerOutput'
import { AstNode } from '../helper/astNode'

export function ensureBlock(co: CompilerOutput, nodes: AstNode[]) {
  if (nodes.length == 0 || nodes[0].name !== '{') {
    const start = nodes[0].from
    co.warn__internal({
      from: start,
      to: start + 1,
      message: "Erwarte öffnende geschweifte Klammer '{'",
    })
    if (nodes[0].isError) {
      nodes.shift()
    }
    // can't continue
    return false
  } else {
    nodes.shift()
  }

  if (nodes.length == 0 || nodes[nodes.length - 1].name !== '}') {
    const end = nodes[nodes.length - 1].to
    co.warn__internal({
      from: end - 1,
      to: end,
      message: "Erwarte schließende geschweifte Klammer '}'",
    })
    if (nodes[nodes.length - 1].isError) {
      nodes.pop()
    }
    // can't continue
    return false
  } else {
    nodes.pop()
  }
}
