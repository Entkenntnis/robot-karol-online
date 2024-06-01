import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'
import { CallOp } from '../../state/types'
import { AstNode, cursorToAstNode, prettyPrintAstNode } from '../helper/astNode'
import { matchChildren } from '../helper/matchChildren'
import { CompilerOutput, CompilerResult } from '../helper/CompilerOutput'
import { warnForUnexpectedNodes } from '../helper/warnForUnexpectedNodes'
import { ensureBlock } from './ensureBlock'
import { ensureExactlyOneChild } from '../helper/ensureExactlyOneChild'
import { checkMainMethod } from './checkMainMethod'
import { checkRobotField } from './checkRobotField'
import { MethodContexts, semanticCheck } from './nodes/semanticCheck'

export function compileJava(tree: Tree, doc: Text): CompilerResult {
  const comments: AstNode[] = []
  // convert tree to ast node
  const ast = cursorToAstNode(
    tree.cursor(),
    doc,
    ['LineComment', 'BlockComment'],
    comments
  )

  const co = new CompilerOutput(doc, comments)

  // debug
  //console.log(prettyPrintAstNode(ast))

  if (ast.children.length == 0) {
    // empty program
    return { output: [], warnings: [], rkCode: '' }
  }

  const notClassOnTopLevel = ast.children.filter(
    (child) => child.name !== 'ClassDeclaration'
  )
  const classDeclOnToplevel = ast.children.filter(
    (child) => child.name == 'ClassDeclaration'
  )

  if (classDeclOnToplevel.length !== 1) {
    co.warn(
      ast,
      classDeclOnToplevel.length > 1
        ? 'Erwarte genau eine Klasse'
        : 'Erwarte eine Klassendefinition'
    )
    // can't continue
    return co.fatalResult()
  }

  warnForUnexpectedNodes(co, notClassOnTopLevel)

  // -------------------- next level -----------------------------------
  const classDeclaration = classDeclOnToplevel[0]

  const classDefinition = classDeclaration.children.find(
    (child) => child.name == 'Definition'
  )

  if (!classDefinition) {
    co.warn(classDeclaration, 'Erwarte Name der Klasse')
    // can't continue
    return co.fatalResult()
  }

  const classBody = classDeclaration.children.find(
    (child) => child.name == 'ClassBody'
  )

  if (!classBody) {
    co.warn(classDefinition, 'Erwarte Rumpf der Klasse')
    // can't continue
    return co.fatalResult()
  }

  const unwantedInClass = classDeclaration.children.filter(
    (child) =>
      !(
        child.name == 'ClassBody' ||
        child.name == 'class' ||
        child.name == 'Definition'
      )
  )

  warnForUnexpectedNodes(co, unwantedInClass)

  if (co.hasWarnings()) {
    return co.fatalResult()
  }
  // --------------------------- next level -------------------------------
  const classBodyChildren = classBody.children
  if (ensureBlock(co, classBodyChildren) === false) {
    return co.fatalResult()
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
      if (typeName[0].text() == 'Robot') {
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
      if (definition[0].text() == 'main') {
        return true
      }
    }
    return false
  })

  if (
    ensureExactlyOneChild(
      co,
      robotFields,
      (x) => true,
      classDefinition,
      `Erwarte ein Attribut vom Typ 'Robot' in Klasse '${classDefinition.text()}'`,
      `Erwarte genau ein Attribut vom Typ 'Robot' in Klasse '${classDefinition.text()}'`
    ) === false
  ) {
    return co.fatalResult()
  }

  const robotField = robotFields[0]
  const robotInstanceName = checkRobotField(co, robotField)

  if (!robotInstanceName || co.hasWarnings()) {
    return co.fatalResult()
  }

  if (
    ensureExactlyOneChild(
      co,
      mainMethods,
      (x) => true,
      classDefinition,
      `Erwarte eine Methode 'void main()' in Klasse '${classDefinition.text()}'`,
      `Erwarte genau eine Methode 'main' in Klasse '${classDefinition.text()}'`
    ) === false
  ) {
    return co.fatalResult()
  }

  warnForUnexpectedNodes(co, unwantedInClassBody)

  if (co.hasWarnings()) {
    return co.fatalResult()
  }

  // custom fields  not implemented yet
  for (const field of fields) {
    if (field != robotField) {
      co.warn(field, 'Keine eigenen Attribute unterstützt')
    }
  }

  const mainMethod = mainMethods[0]

  const availableMethods = new Map<string, string[]>()
  const methodContexts: MethodContexts = {}
  for (const method of methods) {
    if (method != mainMethod) {
      if (
        matchChildren(
          ['void', 'Definition', 'FormalParameters', 'Block'],
          method.children
        )
      ) {
        const formalParameters = method.children[2]
        const name = method.children[1].text()

        const params: string[] = []
        for (const param of formalParameters.children) {
          if (param.name == '(' || param.name == ')' || param.name == ',') {
            continue
          }
          if (matchChildren(['PrimitiveType', 'Definition'], param.children)) {
            const type = param.children[0].text()
            if (type !== 'int') {
              co.warn(param, 'Nur Typ int unterstützt')
            } else {
              const def = param.children[1].text()
              params.push(def)
            }
          } else {
            co.warn(param, 'Ungültiger Parameter, erwarte Typ int')
          }
        }
        availableMethods.set(name, params)
      } else {
        co.warn(method, 'Erwarte eigene Methode ohne Rückgabewert mit Rumpf')
      }
    }
  }

  checkMainMethod(co, mainMethod)

  const callOps: [string, CallOp][] = []

  semanticCheck(co, mainMethod, {
    robotName: robotInstanceName,
    variablesInScope: new Set(),
    availableMethods,
    methodContexts,
    callOps,
  })

  if (availableMethods.size > 0) {
    co.appendOutput({ type: 'jump', target: Infinity })
  }

  for (const method of methods) {
    if (method != mainMethod) {
      const name = method.children[1].text()
      co.appendOutput({
        type: 'anchor',
        callback: (target) => {
          callOps.forEach(([n, op]) => {
            if (n == name) {
              op.target = target
            }
          })
        },
      })
      co.appendRkCode('\nAnweisung ' + name, method.from)
      co.increaseIndent()
      const variablesInScope = new Set<string>()
      for (const v of availableMethods.get(name) ?? []) {
        variablesInScope.add(v)
      }
      semanticCheck(co, method, {
        robotName: robotInstanceName,
        variablesInScope,
        availableMethods,
        methodContexts,
        callOps,
      })
      co.appendOutput({ type: 'return' })
      co.decreaseIndent()
      co.appendRkCode('endeAnweisung', method.to)
    }
  }

  return co.getResult()
}
