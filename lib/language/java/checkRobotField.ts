import { CompilerOutput } from '../helper/CompilerOutput'
import { AstNode } from '../helper/astNode'
import { checkSemikolon } from './checkSemikolon'
import { warnForUnexpectedNodes } from '../helper/warnForUnexpectedNodes'

export function checkRobotField(
  co: CompilerOutput,
  robotField: AstNode
): string | null {
  // what are the most important pieces?
  const variableDeclaration = robotField.children.find(
    (child) => child.name == 'VariableDeclarator'
  )
  if (!variableDeclaration) {
    co.warn(robotField, 'Erwarte Name für Attribut')
    return null
  }
  // extract name from definition
  const definition = variableDeclaration.children.find(
    (child) => child.name == 'Definition'
  )
  const name = definition?.text()
  if (!definition || !name) {
    co.warn(robotField, 'Erwarte Name für Attribut')
    return null
  }
  const assignOp = variableDeclaration.children.find(
    (child) => child.name == 'AssignOp' && child.text() == '='
  )
  if (!assignOp) {
    co.warn(
      definition,
      `Erwarte Initialisierung des Attributes '${definition.text()}'`
    )
    return name
  }
  const objectCreationExpression = variableDeclaration.children.find(
    (child) => child.name == 'ObjectCreationExpression'
  )
  if (
    !objectCreationExpression ||
    objectCreationExpression.children[0].name !== 'new' ||
    objectCreationExpression.children[1].name !== 'TypeName' ||
    objectCreationExpression.children[2].name !== 'ArgumentList' ||
    objectCreationExpression.children.length > 3 ||
    objectCreationExpression.children[1].text() !== 'Robot' ||
    objectCreationExpression.children[2].children.length !== 2 ||
    objectCreationExpression.children[2].children[0].name !== '(' ||
    objectCreationExpression.children[2].children[1].name !== ')'
  ) {
    co.warn(definition, "Erwarte Initialisierung mit 'new Robot()'")
    return name
  }
  const unwantedInVariableDeclarator = variableDeclaration.children.filter(
    (child) =>
      child !== assignOp &&
      child !== objectCreationExpression &&
      child !== definition
  )

  warnForUnexpectedNodes(co, unwantedInVariableDeclarator)

  if (co.hasWarnings()) return name

  checkSemikolon(co, robotField)

  warnForUnexpectedNodes(
    co,
    robotField.children.filter(
      (child) =>
        child !== variableDeclaration &&
        child.name !== 'TypeName' &&
        child.name !== ';'
    )
  )

  // done
  return name
}
