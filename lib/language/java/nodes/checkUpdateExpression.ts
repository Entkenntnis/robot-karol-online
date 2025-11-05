import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { ensureBlock } from '../ensureBlock'
import { SemantikCheckContext, semanticCheck } from './semanticCheck'

// !!!! THIS FILE WILL BE REPLACED
export function checkUpdateExpression(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  let varName = ''
  let isIncr = true

  if (matchChildren(['UpdateOp', 'Identifier'], node.children)) {
    varName = node.children[1].text()
    isIncr = node.children[0].text() == '++'
  } else if (matchChildren(['Identifier', 'UpdateOp'], node.children)) {
    varName = node.children[0].text()
    isIncr = node.children[1].text() == '++'
  } else {
    co.warn(node, 'Fehler in UpdateExpression')
  }

  co.activateProMode()
  if (!context.variablesInScope.has(varName)) {
    co.warn(node, `Variable ${varName} nicht bekannt`)
  }

  co.appendOutput({ type: 'load', variable: varName })
  co.appendOutput({ type: 'constant', value: 1 })
  co.appendOutput({ type: 'operation', kind: isIncr ? 'add' : 'sub' })
  co.appendOutput({ type: 'store', variable: varName })
}
