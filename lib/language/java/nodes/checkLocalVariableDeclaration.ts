import { CompilerOutput } from '../../helper/CompilerOutput'
import type { AstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { checkSemikolon } from '../checkSemikolon'
import { expressionNodes } from './compileExpression'
import type {
  SemantikCheckContext,
  ValueType,
} from './compileDeclarationAndStatements'
import { compileValExpression } from './compileValExpression'

export function checkLocalVariableDeclaration(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
) {
  checkSemikolon(co, node)

  if (
    !matchChildren(['PrimitiveType', 'VariableDeclarator', ';'], node.children)
  ) {
    co.warn(node, 'Fehler beim Parser von LocalVariableDeclaration')
    return
  }

  const declTypeText = node.children[0].text()
  if (declTypeText !== 'int' && declTypeText !== 'boolean') {
    co.warn(node, `Nur Datentyp int oder boolean unterstützt`)
    return
  }
  const declType = declTypeText as ValueType

  const declarator = node.children[1]

  if (
    !matchChildren(
      ['Definition', 'AssignOp', expressionNodes],
      declarator.children,
    )
  ) {
    co.warn(node, `Erwarte Zuweisung`)
    return
  }

  const name = declarator.children[0].text()

  if (context.variablesInScope.has(name)) {
    co.warn(declarator.children[0], 'Variablename bereits belegt')
    return
  }

  co.activateProMode()

  // console.log(prettyPrintAstNode(node))
  compileValExpression(declType, co, declarator.children[2], context)

  co.appendOutput({
    type: 'store',
    variable: name,
  })

  context.variablesInScope.set(name, declType)
}
