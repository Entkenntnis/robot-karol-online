import { AstNode } from './astNode'

export function matchChildren(names: string[], nodes: AstNode[]) {
  return (
    names.length == nodes.length &&
    names.every((name, i) => nodes[i].name == name)
  )
}
