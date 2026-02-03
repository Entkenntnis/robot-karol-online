import type { JumpOp, BranchOp } from '../../../state/types'
import { CompilerOutput, type AnchorOp } from '../../helper/CompilerOutput'
import type { AstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { matchChildren } from '../../helper/matchChildren'
import {
  type SemantikCheckContext,
  type LoopControlContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'
import { compileExpression } from './compileExpression'

export function checkWhileStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
) {
  const loopContext: LoopControlContext = { breakJumps: [], continueJumps: [] }
  context.loopStack.push(loopContext)

  try {
    if (
      matchChildren(
        ['while', 'ParenthesizedExpression', 'Block'],
        node.children,
      )
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
        co.appendOutput({
          type: 'anchor',
          callback: (target) => {
            for (const j of loopContext.continueJumps) j.target = target
          },
        })
        co.appendRkCode('wiederhole immer', node.from)
        co.increaseIndent()
        compileDeclarationAndStatements(co, node.children[2], context)
        co.appendOutput(jump)
        co.decreaseIndent()
        co.appendRkCode('endewiederhole', node.to)
        co.appendOutput({
          type: 'anchor',
          callback: (target) => {
            for (const j of loopContext.breakJumps) j.target = target
          },
        })
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
        const anchorContinue: AnchorOp = {
          type: 'anchor',
          callback: (target) => {
            for (const j of loopContext.continueJumps) j.target = target
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
        co.appendOutput(anchorContinue)
        co.appendOutput(anchorCond)

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
          co.appendRkCode(
            `wiederhole solange ${conditionToRK(last.condition)}`,
            node.from,
          )
        } else {
          co.activateProMode()
        }

        co.appendOutput(branch)

        co.appendOutput(anchorTop)
        co.increaseIndent()
        compileDeclarationAndStatements(co, node.children[2], context)
        co.decreaseIndent()

        co.appendRkCode('endewiederhole', node.to)
        co.appendOutput(jumpToCond)
        co.appendOutput({
          type: 'anchor',
          callback: (target) => {
            for (const j of loopContext.breakJumps) j.target = target
          },
        })
        co.appendOutput(anchorEnd)
      }
    } else {
      co.warn(node, `Erwarte Schleife mit Rumpf`)
    }
  } finally {
    context.loopStack.pop()
  }
}
