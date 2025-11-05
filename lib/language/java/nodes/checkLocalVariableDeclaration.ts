import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { checkSemikolon } from '../checkSemikolon'
import { expressionNodes, compileExpression } from './compileExpression'
import { SemantikCheckContext } from './compileDeclarationAndStatements'

export function checkLocalVariableDeclaration(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  checkSemikolon(co, node)

  if (
    !matchChildren(['PrimitiveType', 'VariableDeclarator', ';'], node.children)
  ) {
    co.warn(node, 'Fehler beim Parser von LocalVariableDeclaration')
    return
  }

  if (node.children[0].text() !== 'int') {
    co.warn(node, `Nur Datentyp int unterstützt`)
    return
  }

  const declarator = node.children[1]

  if (
    !matchChildren(
      ['Definition', 'AssignOp', expressionNodes],
      declarator.children
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
  compileExpression(co, declarator.children[2], context)

  co.appendOutput({
    type: 'store',
    variable: name,
  })

  context.variablesInScope.add(name)
}
