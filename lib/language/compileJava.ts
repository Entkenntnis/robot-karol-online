import { Text } from '@codemirror/state'
import { Tree, TreeCursor } from '@lezer/common'
import { Op } from '../state/types'
import { Diagnostic } from '@codemirror/lint'

interface AstNode {
  name: string
  from: number
  to: number
  text: string
  isError: boolean
  children: AstNode[]
}

export function compileJava(
  tree: Tree,
  doc: Text
): { output: Op[]; warnings: Diagnostic[]; rkCode?: string } {
  const warnings: Diagnostic[] = []

  // convert tree to ast node
  const ast = cursorToAstNode(tree.cursor(), doc)

  // debug
  console.log(prettyPrintAstNode(ast))

  // I think lezer will always respect this
  if (ast.name !== 'Program') {
    throw 'internal parse error'
  }

  if (ast.children.length == 0) {
    // empty program
    return { output: [], warnings: [] }
  }

  const notClassOnTopLevel = ast.children.filter(
    (child) => child.name !== 'ClassDeclaration'
  )
  const classDeclOnToplevel = ast.children.filter(
    (child) => child.name == 'ClassDeclaration'
  )

  if (classDeclOnToplevel.length !== 1) {
    warnings.push({
      from: ast.from,
      to: ast.to,
      severity: 'error',
      message:
        classDeclOnToplevel.length > 1
          ? 'Erwarte genau eine Klasse'
          : 'Erwarte eine Klassendefinition',
    })
    // can't continue
    return { output: [], warnings }
  }

  warnForUnexpectedNodes(notClassOnTopLevel)

  // -------------------- next level -----------------------------------
  const classDeclaration = classDeclOnToplevel[0]

  const classBodys = classDeclaration.children.filter(
    (child) => child.name == 'ClassBody'
  )

  if (classBodys.length !== 1) {
    warnings.push({
      from: ast.from,
      to: ast.to,
      severity: 'error',
      message:
        classBodys.length == 0
          ? 'Erwarte Rumpf der Klasse'
          : 'Klasse enthält mehrere Rümpfe',
    })
    // can't continue
    return { output: [], warnings }
  }

  const unwantedInClass = classDeclaration.children.filter(
    (child) =>
      !(
        child.name == 'ClassBody' ||
        child.name == 'class' ||
        child.name == 'Definition'
      )
  )

  warnForUnexpectedNodes(unwantedInClass)

  if (warnings.length > 0) {
    return { output: [], warnings }
  }
  // --------------------------- next level -------------------------------
  const classBody = classBodys[0]

  const classBodyChildren = classBody.children
  if (ensureBlock(classBodyChildren) === false) {
    return { output: [], warnings }
  }

  // collect fields and methods
  const fields = classBodyChildren.filter(
    (child) => child.name == 'FieldDeclaration'
  )
  const methods = classBodyChildren.filter(
    (child) => child.name == 'MethodDeclaration'
  )
  const unwantedInClassBody = classBodyChildren.filter(
    (child) =>
      !(child.name == 'FieldDeclaration' || child.name == 'MethodDeclaration')
  )

  const robotFields = fields.filter((field) => {
    const typeName = field.children.filter((child) => child.name == 'TypeName')
    if (typeName.length == 1) {
      if (typeName[0].text == 'Robot') {
        return true
      }
    }
    return false
  })

  const mainMethods = methods.filter((methods) => {
    const definition = methods.children.filter(
      (child) => child.name == 'Definition'
    )
    if (definition.length == 1) {
      if (definition[0].text == 'main') {
        return true
      }
    }
    return false
  })

  if (
    ensureExactlyOneChild(
      robotFields,
      (x) => true,
      classBody,
      `Erwarte ein Attribut vom Typ 'Robot'`,
      `Erwarte genau ein Attribut vom Typ 'Robot'`
    ) === false
  ) {
    return { output: [], warnings }
  }

  if (
    ensureExactlyOneChild(
      mainMethods,
      (x) => true,
      classBody,
      `Erwarte eine Methode 'main'`,
      `Erwarte genau eine Methode 'main'`
    ) === false
  ) {
    return { output: [], warnings }
  }

  warnForUnexpectedNodes(unwantedInClassBody)

  if (warnings.length > 0) {
    return { output: [], warnings }
  }

  // additional checks for robot field and main method
  const robotField = robotFields[0]
  const mainMethod = mainMethods[0]

  const robotInstanceName = checkRobotField(robotField)

  if (!robotInstanceName) {
    return { output: [], warnings }
  }

  if (ast.text.includes('//warn')) {
    // test for toBlockWarning
    return { output: [], warnings: [] }
  }

  // -> generic method checker, because I would need this quite often

  return { output: [], warnings, rkCode: '' }

  // --------------------------- HELPER ------------------------

  function warnForUnexpectedNodes(nodes: AstNode[]) {
    for (const node of nodes) {
      warnings.push({
        from: node.from,
        to: node.to,
        severity: 'error',
        message: node.isError
          ? 'Bitte Syntaxfehler korrigieren'
          : `Bitte entferne '${node.text}', wird hier nicht unterstützt`,
      })
    }
  }

  function ensureBlock(nodes: AstNode[]) {
    if (nodes.length == 0 || nodes[0].name !== '{') {
      warnings.push({
        from: classBody.from,
        to: classBody.to,
        severity: 'error',
        message: "Erwarte öffnende geschweifte Klammer '{'",
      })
      // can't continue
      return false
    } else {
      nodes.shift()
    }

    if (nodes.length == 0 || nodes[nodes.length - 1].name !== '}') {
      warnings.push({
        from: classBody.from,
        to: classBody.to,
        severity: 'error',
        message: "Erwarte schließende geschweifte Klammer '}'",
      })
      // can't continue
      return false
    } else {
      nodes.pop()
    }
  }

  function ensureExactlyOneChild(
    nodes: AstNode[],
    pred: (node: AstNode) => boolean,
    placeMessageOnNode: AstNode,
    message0: string,
    messageMany: string
  ) {
    const matching = nodes.filter(pred)
    if (matching.length !== 1) {
      warnings.push({
        from: placeMessageOnNode.from,
        to: placeMessageOnNode.to,
        severity: 'error',
        message: matching.length == 0 ? message0 : messageMany,
      })
      return false
    }
  }

  function checkRobotField(robotField: AstNode): string | null {
    // what are the most important pieces?
    const variableDeclaration = robotField.children.find(
      (child) => child.name == 'VariableDeclarator'
    )
    if (!variableDeclaration) {
      warnings.push({
        from: robotField.from,
        to: robotField.to,
        severity: 'error',
        message: 'Erwarte Name für Attribut',
      })
      return null
    }
    // extract name from definition
    const definition = variableDeclaration.children.find(
      (child) => child.name == 'Definition'
    )
    const name = definition?.text
    if (!definition || !name) {
      warnings.push({
        from: robotField.from,
        to: robotField.to,
        severity: 'error',
        message: 'Erwarte Name für Attribut',
      })
      return null
    }
    const assignOp = variableDeclaration.children.find(
      (child) => child.name == 'AssignOp' && child.text == '='
    )
    if (!assignOp) {
      warnings.push({
        from: robotField.from,
        to: robotField.to,
        severity: 'error',
        message: 'Erwarte Initialisierung des Attributes',
      })
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
      objectCreationExpression.children[1].text !== 'Robot' ||
      objectCreationExpression.children[2].children.length !== 2 ||
      objectCreationExpression.children[2].children[0].name !== '(' ||
      objectCreationExpression.children[2].children[1].name !== ')'
    ) {
      warnings.push({
        from: robotField.from,
        to: robotField.to,
        severity: 'error',
        message: "Erwarte Initialisierung mit 'new Robot()'",
      })
      return name
    }
    const unwantedInVariableDeclarator = variableDeclaration.children.filter(
      (child) =>
        child !== assignOp &&
        child !== objectCreationExpression &&
        child !== definition
    )

    warnForUnexpectedNodes(unwantedInVariableDeclarator)

    if (warnings.length > 0) return name

    checkSemikolon(robotField)

    warnForUnexpectedNodes(
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

  function checkSemikolon(nodeToCheck: AstNode) {
    const children = nodeToCheck.children
    if (children.length == 0 || children[children.length - 1].name != ';') {
      if (children.length > 0 && children[children.length - 1].isError) {
        children.pop()
      }
      warnings.push({
        from: nodeToCheck.from,
        to: nodeToCheck.to,
        severity: 'error',
        message: "Erwarte Abschluss mit Semikolon ';'",
      })
    }
  }
}

function cursorToAstNode(cursor: TreeCursor, doc: Text): AstNode {
  const node: AstNode = {
    name: cursor.name,
    from: cursor.from,
    to: cursor.to,
    isError: cursor.type.isError,
    text: doc.sliceString(cursor.from, cursor.to),
    children: [],
  }
  if (cursor.firstChild()) {
    do {
      if (cursor.name !== 'LineComment' && cursor.name !== 'BlockComment') {
        node.children.push(cursorToAstNode(cursor.node.cursor(), doc))
      }
    } while (cursor.nextSibling())
  }
  return node
}

function prettyPrintAstNode(node: AstNode, offset = 0) {
  let output = ''
  for (let i = 0; i < offset; i++) {
    output += '｜ '
  }
  output += `${node.name} (${node.from} - ${node.to})${
    node.children.length == 0 ? ` "${node.text}"` : ''
  }\n`
  for (const child of node.children) {
    output += prettyPrintAstNode(child, offset + 1)
  }
  return output
}
