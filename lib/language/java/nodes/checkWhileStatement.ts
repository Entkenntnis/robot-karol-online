import { JumpOp, BranchOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { matchChildren } from '../../helper/matchChildren'
import { checkCondition } from '../checkCondition___OLD'
import {
  SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'

export function checkWhileStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (
    matchChildren(['while', 'ParenthesizedExpression', 'Block'], node.children)
  ) {
    const condition = node.children[1]
    if (
      matchChildren(['(', 'BooleanLiteral', ')'], condition.children) &&
      condition.children[1].text() == 'true'
    ) {
      // endless loop
      const jump: JumpOp = { type: 'jump', target: -1 }
      co.appendOutput({
        type: 'anchor',
        callback: (target) => {
          jump.target = target
        },
      })
      co.appendRkCode('wiederhole immer', node.from)
      co.increaseIndent()
      compileDeclarationAndStatements(co, node.children[2], context)
      co.appendOutput(jump)
      co.decreaseIndent()
      co.appendRkCode('endewiederhole', node.to)
    } else {
      const jumpToCond: JumpOp = { type: 'jump', target: -1 }
      const branch: BranchOp = {
        type: 'branch',
        targetF: -1,
        targetT: -1,
        line: co.lineAt(node.from).number,
      }
      const anchorTop: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetT = target
        },
      }
      const anchorCond: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          jumpToCond.target = target
        },
      }
      const anchorEnd: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetF = target
        },
      }
      co.appendOutput(anchorCond)

      if (
        !checkCondition(
          co,
          node.children[1],
          context,
          (condition) => `wiederhole solange ${condition}`
        )
      ) {
        co.warn(node.children[1], 'Erwarte Bedingung')
      }

      co.appendOutput(branch)

      co.appendOutput(anchorTop)
      co.increaseIndent()
      compileDeclarationAndStatements(co, node.children[2], context)
      co.decreaseIndent()

      co.appendRkCode('endewiederhole', node.to)
      co.appendOutput(jumpToCond)
      co.appendOutput(anchorEnd)
    }
  } else {
    co.warn(node, `Erwarte Schleife mit Rumpf`)
  }
}
