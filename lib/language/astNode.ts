import { Text } from '@codemirror/state'
import { TreeCursor } from '@lezer/common'

export interface AstNode {
  name: string
  from: number
  to: number
  text: string
  isError: boolean
  children: AstNode[]
}

export function cursorToAstNode(
  cursor: TreeCursor,
  doc: Text,
  ignore: string[] = []
): AstNode {
  const node: AstNode = {
    name: cursor.name,
    from: cursor.from,
    to: cursor.to,
    isError: cursor.type.isError,
    text: doc.sliceString(cursor.from, cursor.to),
    children: [],
  }
  if (cursor.firstChild()) {
    do {
      if (!ignore.includes(cursor.name)) {
        node.children.push(cursorToAstNode(cursor.node.cursor(), doc))
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
    node.children.length == 0 ? ` "${node.text}"` : ''
  }\n`
  for (const child of node.children) {
    output += prettyPrintAstNode(child, offset + 1)
  }
  return output
}
