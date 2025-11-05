import { JumpOp, BranchOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { compileExpression } from './compileExpression'
import {
  SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'

export function checkForStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (matchChildren(['for', 'ForSpec', 'Block'], node.children)) {
    const spec = node.children[1]
    const block = node.children[2]

    // Regex preflight for counted loop: for (int i = 0; i < 10; i++)
    const specText = spec.text().replace(/\s+/g, ' ')
    const m = specText.match(
      /^\(\s*int ([A-Za-z_]\w*)\s*=\s*0;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)$/
    )

    if (m) {
      console.log('regex short path')
      const loopVar = m[1]
      const count = parseInt(m[2])

      if (context.variablesInScope.has(loopVar)) {
        // In Java, redeclaring a variable in the same scope is not allowed.
        co.warn(
          spec,
          `Variable '${loopVar}' existiert bereits, erwarte anderen Namen`
        )
        return
      }
      context.variablesInScope.add(loopVar)

      // init
      co.appendOutput({ type: 'constant', value: 0 })
      co.appendOutput({ type: 'store', variable: loopVar })

      // anchors and flow
      const anchorCond: AnchorOp = { type: 'anchor', callback: () => {} }
      const branch: BranchOp = {
        type: 'branch',
        targetF: -1,
        targetT: -1,
        line: co.lineAt(spec.from).number,
      }
      const anchorTop: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetT = target
        },
      }
      const jumpBack: JumpOp = { type: 'jump', target: -1 }
      const anchorEnd: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetF = target
        },
      }

      co.appendOutput(anchorCond)
      co.appendOutput({ type: 'load', variable: loopVar })
      co.appendOutput({ type: 'constant', value: count })
      co.appendOutput({ type: 'compare', kind: 'less-than' })
      co.appendOutput(branch)
      co.appendOutput(anchorTop)

      co.appendRkCode(`wiederhole ${count} mal`, spec.from)
      co.increaseIndent()
      compileDeclarationAndStatements(co, block, context)
      co.decreaseIndent()
      co.appendRkCode('endewiederhole', node.to)

      // i++
      co.appendOutput({ type: 'load', variable: loopVar })
      co.appendOutput({ type: 'constant', value: 1 })
      co.appendOutput({ type: 'operation', kind: 'add' })
      co.appendOutput({ type: 'store', variable: loopVar })

      anchorCond.callback = (target) => {
        jumpBack.target = target
      }
      co.appendOutput(jumpBack)
      co.appendOutput(anchorEnd)

      context.variablesInScope.delete(loopVar)
      return
    }

    // Generic fallback: reuse components in pro-mode
    co.activateProMode()
    if (
      matchChildren(
        [
          '(',
          'LocalVariableDeclaration',
          'BinaryExpression',
          ';',
          'UpdateExpression',
          ')',
        ],
        spec.children
      )
    ) {
      // init
      compileDeclarationAndStatements(co, spec.children[1], context)

      // condition flow
      const anchorCond: AnchorOp = { type: 'anchor', callback: () => {} }
      const branch: BranchOp = {
        type: 'branch',
        targetF: -1,
        targetT: -1,
        line: co.lineAt(spec.from).number,
      }
      const anchorTop: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetT = target
        },
      }
      const jumpBack: JumpOp = { type: 'jump', target: -1 }
      const anchorEnd: AnchorOp = {
        type: 'anchor',
        callback: (target) => {
          branch.targetF = target
        },
      }

      co.appendOutput(anchorCond)
      compileExpression(co, spec.children[2], context)
      co.appendOutput(branch)
      co.appendOutput(anchorTop)

      // body
      compileDeclarationAndStatements(co, block, context)

      // update (void)
      const prevExpect = context.expectVoid
      context.expectVoid = true
      compileExpression(co, spec.children[4], context)
      context.expectVoid = prevExpect

      // loop back
      anchorCond.callback = (target) => {
        jumpBack.target = target
      }
      co.appendOutput(jumpBack)
      co.appendOutput(anchorEnd)

      // best-effort: remove header-declared var from scope
      const initText = spec.children[1].text()
      const varMatch = initText.match(/\bint\s+([A-Za-z_]\w*)/)?.[1]
      if (varMatch) context.variablesInScope.delete(varMatch)
      return
    }

    // Not recognizable: warn and compile body to surface errors
    co.warn(spec, "Erwarte Schleifenkopf der Form 'int i = 0; i < 10; i++'")
    compileDeclarationAndStatements(co, block, context)
  } else {
    if (matchChildren(['for', 'ForSpec', '⚠'], node.children)) {
      compileDeclarationAndStatements(co, node.children[1], context)
    }
    co.warn(node, 'Erwarte Schleife mit Rumpf')
  }
}
