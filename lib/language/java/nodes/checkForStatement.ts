import { JumpOp, BranchOp } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { compileExpression, expressionNodes } from './compileExpression'
import {
  SemantikCheckContext,
  compileDeclarationAndStatements,
} from './compileDeclarationAndStatements'
import { compileValExpression } from './compileValExpression'

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

    let condNode: AstNode | null = null
    let updateNode: AstNode | null = null

    // manually handle block for init scope
    const previousVariables = new Set(context.variablesInScope)

    if (
      matchChildren(
        [
          '(',
          'LocalVariableDeclaration',
          expressionNodes,
          ';',
          expressionNodes,
          ')',
        ],
        spec.children
      )
    ) {
      compileDeclarationAndStatements(co, spec.children[1], context)
      condNode = spec.children[2]
      updateNode = spec.children[4]
    } else if (
      matchChildren(
        ['(', expressionNodes, ';', expressionNodes, ';', expressionNodes, ')'],
        spec.children
      )
    ) {
      context.expectVoid = true
      compileExpression(co, spec.children[1], context)
      if (context.valueType != 'void') {
        co.appendOutput({ type: 'pop' })
      }
      condNode = spec.children[3]
      updateNode = spec.children[5]
    } else {
      co.warn(
        spec,
        'Erwarte gültigen for-Schleifen-Kopf (z.B. int i = 0; i < 10; i++)'
      )
      return
    }

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

    compileValExpression('boolean', co, condNode, context)

    co.appendOutput(branch)
    co.appendOutput(anchorTop)

    compileDeclarationAndStatements(co, block, context)

    context.expectVoid = true
    compileExpression(co, updateNode, context)
    if (context.valueType != 'void') {
      co.appendOutput({ type: 'pop' })
    }

    // loop back
    anchorCond.callback = (target) => {
      jumpBack.target = target
    }
    co.appendOutput(jumpBack)
    co.appendOutput(anchorEnd)

    // closing scope and remove all additional variables
    const keys = Array.from(context.variablesInScope.keys())
    for (const key of keys) {
      if (!previousVariables.has(key)) {
        context.variablesInScope.delete(key)
      }
    }
  } else {
    if (matchChildren(['for', 'ForSpec', '⚠'], node.children)) {
      co.warn(
        node.children[1],
        'Erwarte gültigen for-Schleifen-Kopf (z.B. int i = 0; i < 10; i++)'
      )
      return
    }
    co.warn(node, 'Erwarte Schleife mit Rumpf')
  }
}
