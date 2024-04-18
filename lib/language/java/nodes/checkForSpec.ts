import { Op } from '../../../state/types'
import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { SemantikCheckContext } from './semanticCheck'

export function checkForSpec(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
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
          context.__temp_remove_from_scope_after_for = loopVarName
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
        ['Identifier', 'CompareOp', 'IntegerLiteral'],
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
      const count = parseInt(loopCond.children[2].text())
      if (count <= 0) {
        co.warn(loopCond.children[2], `Erwarte Anzahl größer null`)
      }
      // generate bytecode
      co.appendOutput({ type: 'constant', value: count + 1 }) // we decrement before compare
      co.appendOutput({ type: 'store', variable: loopVarName })
      const jump: Op = { type: 'jump', target: -1 }
      co.appendOutput(jump)
      co.appendOutput({ type: 'anchor', callback: () => {} })
      co.appendRkCode(`wiederhole ${count} mal`, node.from)
      co.increaseIndent()
    } else {
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
}
