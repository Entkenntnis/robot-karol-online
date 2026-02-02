import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'
import type { CallOp } from '../../state/types'
import { type AstNode, cursorToAstNode } from '../helper/astNode'
import { matchChildren } from '../helper/matchChildren'
import { CompilerOutput, type CompilerResult } from '../helper/CompilerOutput'
import { warnForUnexpectedNodes } from '../helper/warnForUnexpectedNodes'
import { ensureBlock } from './ensureBlock'
import { ensureExactlyOneChild } from '../helper/ensureExactlyOneChild'
import { checkMainMethod } from './checkMainMethod'
import { checkRobotField } from './checkRobotField'
import {
  type MethodContexts,
  compileDeclarationAndStatements,
  type ValueType,
} from './nodes/compileDeclarationAndStatements'

export function compileJava(tree: Tree, doc: Text): CompilerResult {
  const comments: AstNode[] = []
  // convert tree to ast node
  const ast = cursorToAstNode(
    tree.cursor(),
    doc,
    ['LineComment', 'BlockComment'],
    comments,
  )

  const co = new CompilerOutput(doc, comments)

  // debug
  // console.log(prettyPrintAstNode(ast))

  if (ast.children.length == 0) {
    // empty program
    return { output: [], warnings: [], rkCode: '' }
  }

  const notClassOnTopLevel = ast.children.filter(
    (child) => child.name !== 'ClassDeclaration',
  )
  const classDeclOnToplevel = ast.children.filter(
    (child) => child.name == 'ClassDeclaration',
  )

  if (classDeclOnToplevel.length !== 1) {
    co.warn(
      ast,
      classDeclOnToplevel.length > 1
        ? 'Erwarte genau eine Klasse'
        : 'Erwarte eine Klassendefinition',
    )
    // can't continue
    return co.fatalResult()
  }

  warnForUnexpectedNodes(co, notClassOnTopLevel)

  // -------------------- next level -----------------------------------
  const classDeclaration = classDeclOnToplevel[0]

  const classDefinition = classDeclaration.children.find(
    (child) => child.name == 'Definition',
  )

  if (!classDefinition) {
    co.warn(classDeclaration, 'Erwarte Name der Klasse')
    // can't continue
    return co.fatalResult()
  }

  const classBody = classDeclaration.children.find(
    (child) => child.name == 'ClassBody',
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
      ),
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
    (child) => child.name == 'FieldDeclaration',
  )
  const methods = classBodyChildren.filter(
    (child) => child.name == 'MethodDeclaration',
  )
  const unwantedInClassBody = classBodyChildren.filter(
    (child) =>
      !(child.name == 'FieldDeclaration' || child.name == 'MethodDeclaration'),
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
      (child) => child.name == 'Definition',
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
      () => true,
      classDefinition,
      `Erwarte ein Attribut vom Typ 'Robot' in Klasse '${classDefinition.text()}'`,
      `Erwarte genau ein Attribut vom Typ 'Robot' in Klasse '${classDefinition.text()}'`,
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
      () => true,
      classDefinition,
      `Erwarte eine Methode 'void main()' in Klasse '${classDefinition.text()}'`,
      `Erwarte genau eine Methode 'main' in Klasse '${classDefinition.text()}'`,
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
      let returnType: ValueType | null = null
      let name: string | null = null
      let formalParameters: AstNode | null = null

      if (
        matchChildren(
          ['void', 'Definition', 'FormalParameters', 'Block'],
          method.children,
        )
      ) {
        returnType = 'void'
        name = method.children[1].text()
        formalParameters = method.children[2]
      } else if (
        matchChildren(
          ['PrimitiveType', 'Definition', 'FormalParameters', 'Block'],
          method.children,
        )
      ) {
        co.activateProMode()
        const prim = method.children[0].text()
        if (prim === 'int' || prim === 'boolean') {
          returnType = prim
        } else {
          co.warn(
            method.children[0],
            'Nur Rückgabetyp int oder boolean unterstützt',
          )
          returnType = 'void'
        }
        name = method.children[1].text()
        formalParameters = method.children[2]
      }

      if (name && returnType !== null && formalParameters) {
        const params: string[] = []
        for (const param of formalParameters.children) {
          if (param.name == '(' || param.name == ')' || param.name == ',') {
            continue
          }
          if (matchChildren(['PrimitiveType', 'Definition'], param.children)) {
            co.activateProMode()
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
        methodContexts[name] = {
          parameters: params.map((p) => ({ name: p, type: 'int' })),
          returnType,
        }
      } else {
        co.warn(method, 'Erwarte gültige Methodendeklaration mit Rumpf')
      }
    }
  }

  checkMainMethod(co, mainMethod)

  const callOps: [string, CallOp][] = []

  compileDeclarationAndStatements(co, mainMethod, {
    robotName: robotInstanceName,
    variablesInScope: new Map(),
    availableMethods,
    methodContexts,
    callOps,
    currentMethodReturnType: 'void',
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
      const variablesInScope = new Map<string, 'int' | 'boolean' | 'void'>()
      for (const v of availableMethods.get(name)?.slice().reverse() ?? []) {
        variablesInScope.set(v, 'int')
        co.appendOutput({ type: 'store', variable: v })
      }
      compileDeclarationAndStatements(co, method, {
        robotName: robotInstanceName,
        variablesInScope,
        availableMethods,
        methodContexts,
        callOps,
        currentMethodReturnType: methodContexts[name]?.returnType ?? 'void',
      })
      // Determine if we need to append a default return
      const declaredReturn: ValueType =
        methodContexts[name]?.returnType ?? 'void'
      if (declaredReturn === 'void') {
        co.appendOutput({ type: 'return' })
      } else {
        // simple check whether all paths return; if not, synthesize default
        const block = method.children.find((c) => c.name === 'Block')
        const allReturn = block ? ensuresReturn(block) : false
        if (!allReturn) {
          co.warn(
            method.children[1],
            'Nicht alle Pfade geben einen Wert zurück',
          )
        }
      }
      co.decreaseIndent()
      co.appendRkCode('endeAnweisung', method.to)
    }
  }

  return co.getResult()
}

// Simple, conservative checker: true if this subtree guarantees a return
function ensuresReturn(node: AstNode): boolean {
  switch (node.name) {
    case 'ReturnStatement':
      return true
    case 'Block': {
      // if any statement ensures return and execution cannot continue beyond it,
      // we can consider the block as ensuring return only if control cannot fall through
      // Here: return true if there's a statement that ensures return and there's no path after it.
      // Conservative simplification: if any child ensures return and it's not followed by other children that might execute, we'll still accept true.
      // Implementation: if any child ensures return, return true.
      for (const child of node.children) {
        if (child.name === '{' || child.name === '}') continue
        if (ensuresReturn(child)) return true
      }
      return false
    }
    case 'IfStatement': {
      // requires if-else and both branches ensure return
      const children = node.children
      // Patterns: if (cond) Block [else Block]
      const hasElse = children.some((c) => c.name === 'else')
      if (!hasElse) return false
      // find then and else blocks
      let thenBlock: AstNode | undefined
      let elseBlock: AstNode | undefined
      for (let i = 0; i < children.length; i++) {
        if (children[i].name === 'Block') {
          if (!thenBlock) thenBlock = children[i]
          else {
            elseBlock = children[i]
            break
          }
        }
      }
      if (!thenBlock || !elseBlock) return false
      return ensuresReturn(thenBlock) && ensuresReturn(elseBlock)
    }
    case 'WhileStatement':
    case 'ForStatement':
      return false
    default:
      return false
  }
}
