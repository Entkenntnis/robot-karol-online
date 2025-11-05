import { BranchOp, JumpOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { matchChildren } from '../../helper/matchChildren'
import { compileExpression } from './compileExpression'
import {
  SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'

export function checkIfStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (
    matchChildren(['if', 'ParenthesizedExpression', 'Block'], node.children)
  ) {
    // new logic
    context.expectVoid = false
    const t = compileExpression(co, node.children[1], context)
    if (t != 'boolean') {
      if (co.noWarningsInRange(node.from, node.to)) {
        co.warn(node.children[1], 'Erwarte Bedingung')
      }
      return
    }

    const last = co.peek()
    if (last.type == 'sense') {
      // I can convert
      co.appendRkCode(`wenn ${conditionToRK(last.condition)} dann`, node.from)
    } else {
      co.activateProMode()
    }

    const branch: BranchOp = {
      type: 'branch',
      targetT: -1,
      targetF: -1,
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
    compileDeclarationAndStatements(co, node.children[2], context)
    co.decreaseIndent()
    co.appendRkCode('endewenn', node.to)

    co.appendOutput(anchorEnd)
  } else if (
    matchChildren(
      ['if', 'ParenthesizedExpression', 'Block', 'else', 'Block'],
      node.children
    )
  ) {
    // new logic
    context.expectVoid = false
    const t = compileExpression(co, node.children[1], context)
    if (t != 'boolean') {
      if (co.noWarningsInRange(node.from, node.to)) {
        co.warn(node.children[1], 'Erwarte Bedingung')
      }
      return
    }

    const last = co.peek()
    if (last.type == 'sense') {
      // I can convert
      co.appendRkCode(`wenn ${conditionToRK(last.condition)} dann`, node.from)
    } else {
      co.activateProMode()
    }

    const branch: BranchOp = {
      type: 'branch',
      targetT: -1,
      targetF: -1,
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
    compileDeclarationAndStatements(co, node.children[2], context)
    co.decreaseIndent()

    co.appendOutput(jump)
    co.appendRkCode('sonst', node.children[3].from)
    co.appendOutput(anchorElse)

    co.increaseIndent()
    compileDeclarationAndStatements(co, node.children[4], context)
    co.decreaseIndent()
    co.appendRkCode('endewenn', node.to)

    co.appendOutput(anchorEnd)
  } else {
    co.warn(node, `Erwarte bedingte Anweisung mit Rumpf`)
  }
}
