import { BranchOp, CompareOp, Condition, JumpOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { matchChildren } from '../../helper/matchChildren'
import { checkCondition } from '../checkCondition'
import { expressionNodes } from '../parseExpression'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkIfStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (
    matchChildren(['if', 'ParenthesizedExpression', 'Block'], node.children)
  ) {
    const hasCondition = checkCondition(
      co,
      node.children[1],
      context,
      (condition) => `wenn ${condition} dann`
    )

    if (hasCondition) {
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

      co.appendOutput(branch)
      co.appendOutput(anchorBlock)

      co.increaseIndent()
      semanticCheck(co, node.children[2], context)
      co.decreaseIndent()
      co.appendRkCode('endewenn', node.to)

      co.appendOutput(anchorEnd)
    } else {
      co.warn(node.children[1], 'Erwarte Bedingung')
    }
  } else if (
    matchChildren(
      ['if', 'ParenthesizedExpression', 'Block', 'else', 'Block'],
      node.children
    )
  ) {
    const hasCondition = checkCondition(
      co,
      node.children[1],
      context,
      (condition) => `wenn ${condition} dann`
    )
    if (hasCondition) {
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
      co.appendOutput(branch)
      co.appendOutput(anchorBlock)

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
    } else {
      co.warn(node.children[1], 'Erwarte Bedingung')
    }
  } else {
    co.warn(node, `Erwarte bedingte Anweisung mit Rumpf`)
  }
}
