import { BranchOp, JumpOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { matchChildren } from '../../helper/matchChildren'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkIfStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (
    matchChildren(['if', 'ParenthesizedExpression', 'Block'], node.children)
  ) {
    context.expectCondition = true
    semanticCheck(co, node.children[1], context)
    context.expectCondition = undefined
    const condition = context.condition
    if (condition) {
      const branch: BranchOp = {
        type: 'branch',
        targetF: -1,
        targetT: -1,
        line: co.lineAt(node.from).number,
      }
      const anchorBlock: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetT = target
        },
      }
      const anchorEnd: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetF = target
        },
      }
      if (condition.type == 'brick_count') {
        co.appendOutput({ type: 'constant', value: condition.count! })
      }
      co.appendOutput({
        type: 'sense',
        condition,
      })
      co.appendOutput(branch)
      co.appendOutput(anchorBlock)

      co.appendRkCode(`wenn ${conditionToRK(condition)} dann`, node.from)
      co.increaseIndent()
      semanticCheck(co, node.children[2], context)
      co.decreaseIndent()
      co.appendRkCode('endewenn', node.to)

      co.appendOutput(anchorEnd)
    }
  } else if (
    matchChildren(
      ['if', 'ParenthesizedExpression', 'Block', 'else', 'Block'],
      node.children
    )
  ) {
    context.expectCondition = true
    semanticCheck(co, node.children[1], context)
    context.expectCondition = undefined
    const condition = context.condition
    if (condition) {
      const branch: BranchOp = {
        type: 'branch',
        targetF: -1,
        targetT: -1,
        line: co.lineAt(node.from).number,
      }
      const jump: JumpOp = {
        type: 'jump',
        target: -1,
      }
      const anchorBlock: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetT = target
        },
      }
      const anchorEnd: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          jump.target = target
        },
      }
      const anchorElse: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetF = target
        },
      }
      if (condition.type == 'brick_count') {
        co.appendOutput({ type: 'constant', value: condition.count! })
      }
      co.appendOutput({
        type: 'sense',
        condition,
      })
      co.appendOutput(branch)
      co.appendOutput(anchorBlock)

      co.appendRkCode(`wenn ${conditionToRK(condition)} dann`, node.from)
      co.increaseIndent()
      semanticCheck(co, node.children[2], context)
      co.decreaseIndent()

      co.appendOutput(jump)
      co.appendRkCode('sonst', node.children[3].from)
      co.appendOutput(anchorElse)

      co.increaseIndent()
      semanticCheck(co, node.children[4], context)
      co.decreaseIndent()
      co.appendRkCode('endewenn', node.to)

      co.appendOutput(anchorEnd)
    }
  } else {
    co.warn(node, `Erwarte bedingte Anweisung mit Rumpf`)
  }
}
