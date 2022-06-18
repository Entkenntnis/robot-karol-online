import { parser } from '../codemirror/parser/parser'
import { Tree, TreeCursor } from '@lezer/common'

export function codeToXml(code: string): string {
  const tree: Tree = parser.parse(code)

  let toWarn = false

  const cursor = tree.cursor()
  do {
    if (cursor.type.name == 'Comment' || cursor.type.name == 'Cmd') {
      toWarn = true
    }
  } while (cursor.next())

  if (toWarn) {
    alert('Bei der Konvertierung gehen Daten verloren')
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
  }

  const newCursor = tree.cursor()
  newCursor.next()

  return `<xml xmlns="https://developers.google.com/blockly/xml">
      ${parseNode(newCursor)}
    </xml>`
}

function parseNode(node: TreeCursor): string {
  if (node.type.name == 'Command') {
    const inner = node.nextSibling() ? parseNode(node) : ''
    return `<block type="step"><field name="COUNT">1</field><next>${inner}</next></block>`
  }
  return ''
}

/*

<block type="step">
        <field name="COUNT">1</field>
        <next>
          <block type="step">
            <field name="COUNT">1</field>
            <next></next>
          </block>
        </next>
      </block>

      */
