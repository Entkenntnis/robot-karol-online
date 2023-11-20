import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'
import { Op } from '../state/types'
import { Diagnostic } from '@codemirror/lint'
import { AstNode, cursorToAstNode, prettyPrintAstNode } from './astNode'
import { AnchorOp } from './compileJava'

export function compilePython(
  tree: Tree,
  doc: Text
): { output: Op[]; warnings: Diagnostic[]; rkCode?: string } {
  const warnings: Diagnostic[] = []
  const output: (Op | AnchorOp)[] = []
  let rkCode = ''
  let rkCodeIndent = 0

  let comments: AstNode[] = []

  function appendRkCode(code: string, pos: number) {
    const commentsToAdd = comments.filter((node) => node.from < pos)
    for (const c of commentsToAdd) {
      rkCode += '\n//' + pad() + c.text().substring(1)
    }
    if (commentsToAdd.length > 0) {
      comments = comments.filter((node) => node.from >= pos)
    }
    rkCode += '\n' + pad() + code
  }

  function pad() {
    let line = ''
    for (let i = 0; i < rkCodeIndent; i++) {
      line += '  '
    }
    return line
  }

  // convert tree to ast node
  const ast = cursorToAstNode(tree.cursor(), doc, ['Comment'], comments)

  // debug
  console.log(prettyPrintAstNode(ast))

  // compilation start
  console.log('todo: compile python')
  // compilation end

  appendRkCode('', Infinity)
  rkCode = rkCode.trim()

  const finalOutput: Op[] = []

  for (const op of output) {
    if (op.type == 'anchor') {
      op.callback(finalOutput.length)
    } else {
      finalOutput.push(op)
    }
  }
  return { output: finalOutput, warnings, rkCode: undefined }
}
