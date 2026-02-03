import { Text } from '@codemirror/state'
import { TreeCursor } from '@lezer/common'

export interface AstNode {
  name: string
  from: number
  to: number
  text: () => string
  isError: boolean
  children: AstNode[]
}

export function cursorToAstNode(
  cursor: TreeCursor,
  doc: Text,
  ignore: string[] = [],
  ignoredNodes: AstNode[] = [],
): AstNode {
  const from = cursor.from
  const to = cursor.to
  const node: AstNode = {
    name: cursor.name,
    from,
    to,
    isError: cursor.type.isError,
    text: () => doc.sliceString(from, to),
    children: [],
  }
  if (cursor.firstChild()) {
    do {
      if (!ignore.includes(cursor.name)) {
        node.children.push(
          cursorToAstNode(cursor.node.cursor(), doc, ignore, ignoredNodes),
        )
      } else {
        const text = doc.sliceString(cursor.from, cursor.to)
        ignoredNodes.push({
          name: cursor.name,
          from: cursor.from,
          to: cursor.to,
          children: [],
          text: () => text,
          isError: cursor.type.isError,
        })
      }
    } while (cursor.nextSibling())
  }
  return node
}

export function prettyPrintAstNode(node: AstNode, offset = 0) {
  let output = ''
  for (let i = 0; i < offset; i++) {
    output += '｜ '
  }
  output += `${node.name} (${node.from} - ${node.to})${
    node.children.length == 0 ? ` "${node.text()}"` : ''
  }\n`
  for (const child of node.children) {
    output += prettyPrintAstNode(child, offset + 1)
  }
  return output
}
