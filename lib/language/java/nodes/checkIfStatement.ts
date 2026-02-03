import type { BranchOp, JumpOp } from '../../../state/types'
import { CompilerOutput, type AnchorOp } from '../../helper/CompilerOutput'
import type { AstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { compileExpression } from './compileExpression'
import {
  type SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'

export function checkIfStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
) {
  const ch = node.children
  // Expect: if, ParenthesizedExpression, <then>, [else, <elseBody>]
  if (
    !(
      ch.length >= 3 &&
      ch[0].name === 'if' &&
      ch[1].name === 'ParenthesizedExpression'
    )
  ) {
    co.warn(node, 'Erwarte bedingte Anweisung mit Rumpf')
    return
  }

  context.expectVoid = false
  const t = compileExpression(co, ch[1], context)
  if (t !== 'boolean') {
    if (co.noWarningsInRange(node.from, node.to))
      co.warn(ch[1], 'Erwarte Bedingung')
    return
  }

  // Detect whether there's an else and whether it's an else-if chain
  const hasElse = ch.length >= 5 && ch[3].name === 'else'
  const elseIsIf = hasElse && ch[4].name === 'IfStatement'

  // If there is an else-if chain, force pro mode as requested
  if (elseIsIf) {
    co.activateProMode()
  }

  const last = co.peek()
  if (last.type === 'sense' && !elseIsIf) {
    // Convert to RK only for simple if/else; else-if activates pro mode
    co.appendRkCode(`wenn ${conditionToRK(last.condition)} dann`, node.from)
  } else {
    // Either not convertible or else-if chain present
    co.activateProMode()
  }

  const branch: BranchOp = {
    type: 'branch',
    targetT: -1,
    targetF: -1,
    line: co.lineAt(node.from).number,
  }
  const anchorThen: AnchorOp = {
    type: 'anchor',
    callback: (target) => {
      branch.targetT = target
    },
  }
  const anchorElse: AnchorOp = {
    type: 'anchor',
    callback: (target) => {
      branch.targetF = target
    },
  }

  co.appendOutput(branch)
  co.appendOutput(anchorThen)

  // then-block
  co.increaseIndent()
  compileDeclarationAndStatements(co, ch[2], context)
  co.decreaseIndent()

  if (hasElse) {
    const jump: JumpOp = { type: 'jump', target: -1 }
    const anchorAfter: AnchorOp = {
      type: 'anchor',
      callback: (target) => {
        jump.target = target
      },
    }

    co.appendOutput(jump)
    co.appendRkCode('sonst', ch[3].from)
    co.appendOutput(anchorElse)

    co.increaseIndent()
    // Else body may be a Block or an IfStatement (else-if chain)
    compileDeclarationAndStatements(co, ch[4], context)
    co.decreaseIndent()

    co.appendRkCode('endewenn', node.to)
    co.appendOutput(anchorAfter)
  } else {
    // no else: false branch falls through here
    co.appendRkCode('endewenn', node.to)
    co.appendOutput(anchorElse)
  }
}
