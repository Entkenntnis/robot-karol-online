import type { AstNode } from './astNode'

export function matchChildren(names: (string | string[])[], nodes: AstNode[]) {
  return (
    names.length == nodes.length &&
    names.every((name, i) =>
      Array.isArray(name)
        ? name.includes(nodes[i].name)
        : nodes[i].name == name,
    )
  )
}
