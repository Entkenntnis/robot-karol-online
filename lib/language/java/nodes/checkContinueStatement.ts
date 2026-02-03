import type { JumpOp } from '../../../state/types'
import type { CompilerOutput } from '../../helper/CompilerOutput'
import type { AstNode } from '../../helper/astNode'
import type { SemantikCheckContext } from './compileDeclarationAndStatements'

export function checkContinueStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
) {
  const hasLabel = node.children.some(
    (c) => c.name !== 'continue' && c.name !== ';',
  )
  if (hasLabel) {
    co.warn(node, 'continue mit Label wird nicht unterstützt')
  }

  if (context.loopStack.length === 0) {
    co.warn(node, 'continue nur innerhalb einer Schleife erlaubt')
    return
  }

  co.activateProMode()

  const op: JumpOp = { type: 'jump', target: -1 }
  context.loopStack[context.loopStack.length - 1].continueJumps.push(op)
  co.appendOutput(op)
}
