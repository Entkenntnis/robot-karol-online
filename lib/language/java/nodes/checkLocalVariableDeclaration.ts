import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { checkSemikolon } from '../checkSemikolon'
import { SemantikCheckContext } from './semanticCheck'

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
      ['Definition', 'AssignOp', 'IntegerLiteral'],
      declarator.children
    )
  ) {
    co.warn(node, `Erwarte Zuweisung`)
    return
  }

  const name = declarator.children[0].text()
  const value = parseInt(declarator.children[2].text())

  if (context.variablesInScope.has(name)) {
    co.warn(declarator.children[0], 'Variablename bereits belegt')
    return
  }

  co.activateProMode()
  context.variablesInScope.add(name)
  co.appendOutput({ type: 'constant', value })
  co.appendOutput({
    type: 'store',
    variable: name,
  })
}
