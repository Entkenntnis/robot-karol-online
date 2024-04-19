import { JumpOp, BranchOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { matchChildren } from '../../helper/matchChildren'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

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
      semanticCheck(co, node.children[2], context)
      co.appendOutput(jump)
      co.decreaseIndent()
      co.appendRkCode('endewiederhole', node.to)
    } else {
      context.expectCondition = true
      semanticCheck(co, node.children[1], context)
      context.expectCondition = undefined
      const condition = context.condition
      if (condition) {
        const jumpToCond: JumpOp = { type: 'jump', target: -1 }
        const branch: BranchOp = {
          type: 'branch',
          targetF: -1,
          targetT: -1,
          line: node.from,
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
        co.appendOutput(jumpToCond)
        co.appendOutput(anchorTop)

        co.appendRkCode(
          `wiederhole solange ${conditionToRK(condition)}`,
          node.from
        )
        co.increaseIndent()
        semanticCheck(co, node.children[2], context)
        co.decreaseIndent()
        co.appendRkCode('endewiederhole', node.to)

        co.appendOutput(anchorCond)
        if (condition.type == 'brick_count') {
          co.appendOutput({ type: 'constant', value: condition.count! })
        }
        co.appendOutput({
          type: 'sense',
          condition,
        })
        co.appendOutput(branch)
        co.appendOutput(anchorEnd)
      }
    }
  } else {
    co.warn(node, `Erwarte Schleife mit Rumpf`)
  }
}
