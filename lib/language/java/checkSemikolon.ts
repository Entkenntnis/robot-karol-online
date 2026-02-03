import { CompilerOutput } from '../helper/CompilerOutput'
import type { AstNode } from '../helper/astNode'

export function checkSemikolon(co: CompilerOutput, nodeToCheck: AstNode) {
  const children = nodeToCheck.children
  if (children.length == 0 || children[children.length - 1].name != ';') {
    if (children.length > 0 && children[children.length - 1].isError) {
      children.pop()
    }
    const line = co.lineAt(nodeToCheck.from)
    const from = Math.max(nodeToCheck.from, line.to - 1)
    const to = line.to
    if (co.noWarningsInRange(from, to)) {
      co.warn__internal({
        from,
        to,
        message: "Erwarte Semikolon ';'",
      })
    }
    return false
  }
}
