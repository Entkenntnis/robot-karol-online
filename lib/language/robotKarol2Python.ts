import { Tree } from '@lezer/common'
import { parser } from '../codemirror/parser/parser'
import { AstNode, cursorToAstNode, prettyPrintAstNode } from './astNode'
import { Text } from '@codemirror/state'

export function robotKarol2Python(code: string) {
  const tree: Tree = parser.parse(code)
  const ast = cursorToAstNode(tree.cursor(), Text.of(code.split('\n')))
  // console.log(prettyPrintAstNode(ast))

  const mainNodes = ast.children.filter((child) => child.name !== 'Cmd')
  const methods = ast.children.filter((child) => child.name == 'Cmd')

  let forLoopOffset = 0

  function nodes2Code(nodes: AstNode[], offset: number): string {
    let output = ''

    for (const node of nodes) {
      console.log('nodes2code', node.text())
      if (node.name == 'Command') {
        pad()
        output += `${toKarol(node.text())}\n`
      } else if (node.name == 'Repeat') {
        if (node.children.some((child) => child.name == 'RepeatAlwaysKey')) {
          moveCommentsOutOfHead(node, 2)
          const inner = node.children.slice(2, -1)
          pad()
          output += 'while True:\n'
          output += nodes2Code(inner, offset + 1) + '\n'
          pad()
          output += '\n'
        } else if (node.children.some((child) => child.name == 'Times')) {
          moveCommentsOutOfHead(node, 3)
          const times = parseInt(node.children[1].text())
          pad()
          const lv = `${
            'ijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[forLoopOffset]
          }`
          output += `for ${lv} in range(${times}):\n`
          forLoopOffset++
          output += nodes2Code(node.children.slice(3, -1), offset + 1) + '\n'
          forLoopOffset--
          pad()
          output += '\n'
        } else if (node.children.some((child) => child.name == 'Condition')) {
          moveCommentsOutOfHead(node, 3)
          const condition = node.children[2].text()
          pad()
          output += `while ${toKarol(condition)}:\n`
          output += nodes2Code(node.children.slice(3, -1), offset + 1) + '\n'
          pad()
          output += '\n'
        }
      } else if (node.name == 'IfThen') {
        if (!node.children.some((child) => child.name == 'ElseKey')) {
          moveCommentsOutOfHead(node, 3)
          const condition = node.children[1].text()
          pad()
          output += `if ${toKarol(condition)}:\n`
          output += nodes2Code(node.children.slice(3, -1), offset + 1) + '\n'
          pad()
          output += '\n'
        } else {
          moveCommentsOutOfHead(node, 3)
          const condition = node.children[1].text()
          const elseIndex = node.children.findIndex(
            (child) => child.name == 'ElseKey'
          )
          pad()
          output += `if ${toKarol(condition)}:\n`
          output +=
            nodes2Code(node.children.slice(3, elseIndex), offset + 1) + '\n'
          pad()
          output += 'else:\n'
          output +=
            nodes2Code(node.children.slice(elseIndex + 1, -1), offset + 1) +
            '\n'
          pad()
          output += '\n'
        }
      } else if (node.name == 'CustomRef') {
        pad()
        output += `${node.text()}()\n`
      } else if (node.name == 'LineComment') {
        pad()
        output += `#${node.text().substring(2)}\n`
      } else if (node.name == 'Comment') {
        const lines = node
          .text()
          .substring(1, node.text().length - 1)
          .split('\n')
        for (const line of lines) {
          pad()
          output += `# ${line}\n`
        }
      } else if (node.name == 'BlockComment') {
        const lines = node
          .text()
          .substring(2, node.text().length - 2)
          .split('\n')
        for (const line of lines) {
          pad()
          output += `# ${line}\n`
        }
      }
    }

    return output.trimEnd()

    function pad() {
      for (let i = 0; i < offset; i++) {
        output += '    '
      }
    }

    function toKarol(str: string) {
      return `karol.${str.charAt(0).toLowerCase() + str.slice(1)}${
        str.endsWith(')') ? '' : '()'
      }`
    }

    function moveCommentsOutOfHead(node: AstNode, count: number) {
      const comments = []
      for (let i = 0; i < count; i++) {
        while (node.children[i].name.includes('Comment')) {
          comments.push(...node.children.splice(i, 1))
        }
      }
      node.children.splice(count, 0, ...comments)
    }
  }

  const main = nodes2Code(mainNodes, 0)
  console.log('main', main)

  return `karol = Robot()

${main ? main : ''}${methods
    .map((method) => {
      const name = method.children[1].text()
      const inner = method.children.slice(2, -1)
      const code = nodes2Code(inner, 1)
      return `\n\ndef ${name}():\n${code ? code : '  '}`
    })
    .join('')}`
}
