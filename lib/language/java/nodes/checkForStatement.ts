import { JumpOp, BranchOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkForStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (matchChildren(['for', 'ForSpec', 'Block'], node.children)) {
    semanticCheck(co, node.children[1], context)
    const toRemove = context.__temp_remove_from_scope_after_for
    context.__temp_remove_from_scope_after_for = undefined
    const position = co.getPosition()
    semanticCheck(co, node.children[2], context)
    if (toRemove && position >= 2) {
      co.decreaseIndent()
      co.appendRkCode('endewiederhole', node.to)
      context.variablesInScope.delete(toRemove)
      const jump = co.getOpAt(position - 2)
      const anchor = co.getOpAt(position - 1) as AnchorOp

      co.appendOutput({
        type: 'anchor',
        callback: (target) => {
          ;(jump as JumpOp).target = target
        },
      })
      co.appendOutput({ type: 'load', variable: toRemove })
      co.appendOutput({ type: 'constant', value: 1 })
      co.appendOutput({ type: 'operation', kind: 'sub' })
      co.appendOutput({ type: 'store', variable: toRemove })
      co.appendOutput({ type: 'load', variable: toRemove })
      const branch: BranchOp = {
        type: 'branch',
        targetT: -1,
        targetF: co.getPosition() + 1,
        line: co.lineAt(node.from).number,
      }
      co.appendOutput(branch)
      co.appendOutput({
        type: 'anchor',
        callback: (target) => {
          branch.targetF = target
        },
      })
      anchor.callback = (target) => {
        branch.targetT = target
      }
    }
  } else {
    if (matchChildren(['for', 'ForSpec', '⚠'], node.children)) {
      semanticCheck(co, node.children[1], context)
    }
    co.warn(node, 'Erwarte Schleife mit Rumpf')
  }
}
