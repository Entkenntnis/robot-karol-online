import { JumpOp, BranchOp, Op } from '../../../state/types'
import { CompilerOutput, AnchorOp } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { expressionNodes, parseExpression } from '../parseExpression'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

export function checkForStatement(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (matchChildren(['for', 'ForSpec', 'Block'], node.children)) {
    const { toRemove, branch, anchor } = checkForSpec(node.children[1])
    const position = co.getPosition()
    semanticCheck(co, node.children[2], context)
    if (toRemove && position >= 2) {
      co.decreaseIndent()
      co.appendRkCode('endewiederhole', node.to)
      context.variablesInScope.delete(toRemove)

      // increment
      co.appendOutput({ type: 'load', variable: toRemove })
      co.appendOutput({ type: 'constant', value: 1 })
      co.appendOutput({ type: 'operation', kind: 'add' })
      co.appendOutput({ type: 'store', variable: toRemove })

      // back up to condition
      const jump: JumpOp = {
        type: 'jump',
        target: -1,
      }
      anchor.callback = (target) => {
        jump.target = target
      }
      co.appendOutput(jump)

      co.appendOutput({
        type: 'anchor',
        callback: (target) => {
          branch.targetF = target
        },
      })
    }
  } else {
    if (matchChildren(['for', 'ForSpec', '⚠'], node.children)) {
      semanticCheck(co, node.children[1], context)
    }
    co.warn(node, 'Erwarte Schleife mit Rumpf')
  }

  function checkForSpec(node: AstNode) {
    let toRemove = ''
    const branch: BranchOp = {
      type: 'branch',
      targetF: -1,
      targetT: -1,
      line: co.lineAt(node.from).number,
    }
    const anchor: AnchorOp = { type: 'anchor', callback: () => {} }

    let safeLoopVar = 'i'
    const candidates = 'ijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZi'
    for (let i = 0; i < candidates.length; i++) {
      safeLoopVar = candidates[i]
      if (!context.variablesInScope.has(safeLoopVar)) {
        break // found it
      }
    }
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
        node.children
      )
    ) {
      const loopVar = node.children[1]
      let loopVarName = safeLoopVar

      if (
        matchChildren(
          ['PrimitiveType', 'VariableDeclarator', ';'],
          loopVar.children
        )
      ) {
        const type = loopVar.children[0]
        const declarator = loopVar.children[1]

        if (type.text() !== 'int') {
          co.warn(loopVar, `Erwarte Schleifenzähler mit Typ 'int'`)
        }

        if (
          matchChildren(
            ['Definition', 'AssignOp', 'IntegerLiteral'],
            declarator.children
          )
        ) {
          loopVarName = declarator.children[0].text()
          if (context.variablesInScope.has(loopVarName)) {
            co.warn(
              declarator.children[0],
              `Variable '${loopVarName}' existiert bereits, erwarte anderen Namen`
            )
          } else {
            toRemove = loopVarName
          }
          const initialValue = parseInt(declarator.children[2].text())
          if (initialValue != 0) {
            co.warn(declarator.children[2], `Erwarte Startwert 0`)
          }
          context.variablesInScope.add(loopVarName)
        } else {
          co.warn(loopVar, `Erwarte Schleifenzähler 'int ${safeLoopVar} = 0;'`)
        }
      } else {
        co.warn(loopVar, `Erwarte Schleifenzähler 'int ${safeLoopVar} = 0;'`)
      }

      const loopCond = node.children[2]

      if (
        matchChildren(
          ['Identifier', 'CompareOp', expressionNodes],
          loopCond.children
        )
      ) {
        const id = loopCond.children[0].text()
        if (id != loopVarName) {
          co.warn(loopCond.children[0], `Erwarte Variable '${loopVarName}'`)
        }
        if (loopCond.children[1].text() != '<') {
          co.warn(loopCond.children[1], `Erwarte Vergleichsoperator '<'`)
        }
        const isLiteral = loopCond.children[2].name === 'IntegerLiteral'
        let count = -1
        if (isLiteral) {
          count = parseInt(loopCond.children[2].text())
          if (count <= 0) {
            co.warn(loopCond.children[2], `Erwarte Anzahl größer null`)
          }
        }
        // init
        co.appendOutput({ type: 'constant', value: 0 })
        co.appendOutput({ type: 'store', variable: loopVarName })

        co.appendOutput(anchor)

        // check condition
        co.appendOutput({ type: 'load', variable: loopVarName })
        if (isLiteral) {
          co.appendOutput({ type: 'constant', value: count })
        } else {
          parseExpression(co, loopCond.children[2], context)
        }
        co.appendOutput({ type: 'compare', kind: 'less-than' })

        // branch
        co.appendOutput(branch)
        co.appendOutput({
          type: 'anchor',
          callback(target) {
            branch.targetT = target
          },
        })

        co.appendRkCode(`wiederhole ${count} mal`, node.from)
        co.increaseIndent()
      } else {
        console.log(prettyPrintAstNode(loopCond))
        co.warn(
          loopCond,
          `Erwarte Schleifenbedingung der Form '${loopVarName} < 10'`
        )
      }

      const loopUpdate = node.children[4]
      if (loopUpdate.text() !== loopVarName + '++') {
        co.warn(loopUpdate, `Erwarte '${loopVarName}++'`)
      }
    } else {
      co.warn(
        node,
        `Erwarte Schleifenkopf mit 'int ${safeLoopVar} = 0; ${safeLoopVar} < 10; ${safeLoopVar}++'`
      )
    }
    return { toRemove, branch, anchor }
  }
}
