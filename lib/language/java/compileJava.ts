import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'
import { BranchOp, CallOp, Condition, JumpOp, Op } from '../../state/types'
import { Diagnostic } from '@codemirror/lint'
import { AstNode, cursorToAstNode } from '../helper/astNode'
import { matchChildren } from '../helper/matchChildren'
import {
  AnchorOp,
  CompilerOutput,
  CompilerResult,
} from '../helper/CompilerOutput'
import { methodName2action } from '../helper/methodName2action'
import { methodsWithoutArgs } from '../helper/methodsWithoutArgs'
import { conditionToRK } from '../helper/conditionToRk'

interface SemantikCheckContext {
  robotName: string
  variablesInScope: Set<string>
  __temp_remove_from_scope_after_for?: string
  expectCondition?: boolean
  condition?: Condition
  availableMethods: Set<string>
  callOps: [string, CallOp][]
}

export function compileJava(tree: Tree, doc: Text): CompilerResult {
  const co = new CompilerOutput()

  const comments: AstNode[] = []
  // convert tree to ast node
  const ast = cursorToAstNode(
    tree.cursor(),
    doc,
    ['LineComment', 'BlockComment'],
    comments
  )

  co.registerComments(comments)

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
    co.warn({
      from: ast.from,
      to: ast.to,
      message:
        classDeclOnToplevel.length > 1
          ? 'Erwarte genau eine Klasse'
          : 'Erwarte eine Klassendefinition',
    })
    // can't continue
    return co.fatalResult()
  }

  warnForUnexpectedNodes(notClassOnTopLevel)

  // -------------------- next level -----------------------------------
  const classDeclaration = classDeclOnToplevel[0]

  const classDefinition = classDeclaration.children.find(
    (child) => child.name == 'Definition'
  )

  if (!classDefinition) {
    co.warn({
      from: classDeclaration.from,
      to: classDeclaration.to,
      message: 'Erwarte Name der Klasse',
    })
    // can't continue
    return co.fatalResult()
  }

  const classBody = classDeclaration.children.find(
    (child) => child.name == 'ClassBody'
  )

  if (!classBody) {
    co.warn({
      from: classDefinition.from,
      to: classDefinition.to,
      message: 'Erwarte Rumpf der Klasse',
    })
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

  warnForUnexpectedNodes(unwantedInClass)

  if (co.hasWarnings()) {
    return co.fatalResult()
  }
  // --------------------------- next level -------------------------------
  const classBodyChildren = classBody.children
  if (ensureBlock(classBodyChildren) === false) {
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
  const robotInstanceName = checkRobotField(robotField)

  if (!robotInstanceName || co.hasWarnings()) {
    return co.fatalResult()
  }

  if (
    ensureExactlyOneChild(
      mainMethods,
      (x) => true,
      classDefinition,
      `Erwarte eine Methode 'void main()' in Klasse '${classDefinition.text()}'`,
      `Erwarte genau eine Methode 'main' in Klasse '${classDefinition.text()}'`
    ) === false
  ) {
    return co.fatalResult()
  }

  warnForUnexpectedNodes(unwantedInClassBody)

  if (co.hasWarnings()) {
    return co.fatalResult()
  }

  // custom fields  not implemented yet
  for (const field of fields) {
    if (field != robotField) {
      co.warn({
        from: field.from,
        to: field.to,
        message: 'Keine eigenen Attribute unterstützt',
      })
    }
  }

  const mainMethod = mainMethods[0]

  const availableMethods = new Set<string>()
  for (const method of methods) {
    if (method != mainMethod) {
      if (
        matchChildren(
          ['void', 'Definition', 'FormalParameters', 'Block'],
          method.children
        )
      ) {
        const formalParameters = method.children[2]
        if (!matchChildren(['(', ')'], formalParameters.children)) {
          co.warn({
            from: formalParameters.from,
            to: formalParameters.to,
            message: 'Erwarte leere Parameterliste',
          })
        }
        const name = method.children[1].text()
        availableMethods.add(name)
      } else {
        co.warn({
          from: method.from,
          to: method.to,
          message: 'Erwarte eigene Methode ohne Rückgabewert mit Rumpf',
        })
      }
    }
  }

  checkMainMethod(mainMethod)

  const callOps: [string, CallOp][] = []

  semanticCheck(mainMethod, {
    robotName: robotInstanceName,
    variablesInScope: new Set(),
    availableMethods,
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
      semanticCheck(method, {
        robotName: robotInstanceName,
        variablesInScope: new Set(),
        availableMethods,
        callOps,
      })
      co.appendOutput({ type: 'return' })
      co.decreaseIndent()
      co.appendRkCode('endeAnweisung', method.to)
    }
  }

  return co.getResult()

  // --------------------------- HELPER ------------------------

  function semanticCheck(node: AstNode, context: SemantikCheckContext) {
    switch (node.name) {
      case 'MethodDeclaration': {
        // already checked by toplevel
        node.children
          .filter((child) => child.name == 'Block')
          .map((child) => semanticCheck(child, context))
        return
      }
      case 'Block': {
        ensureBlock(node.children)
        node.children
          .filter((child) => child.name !== '{' && child.name !== '}')
          .map((child) => semanticCheck(child, context))
        return
      }
      case 'ExpressionStatement': {
        if (matchChildren(['MethodInvocation', ';'], node.children)) {
          semanticCheck(node.children[0], context)
          return
        }
        const lastChild = node.children[node.children.length - 1]
        if (lastChild.isError) {
          node.children.pop()
        }
        if (matchChildren(['MethodInvocation'], node.children)) {
          semanticCheck(node.children[0], context)
          checkSemikolon(node)
          return
        }
        const prefix = `${context.robotName}.`
        co.warn({
          from:
            node.from + (node.text().startsWith(prefix) ? prefix.length : 0),
          to: Math.min(node.to, doc.lineAt(node.from).to),
          message: 'Erwarte Methodenaufruf',
        })
        return
      }
      case ';': {
        co.warn({
          from: node.from,
          to: node.to,
          message: 'Erwarte Methodenaufruf',
        })
        return
      }
      case 'MethodInvocation': {
        if (matchChildren(['MethodName', 'ArgumentList'], node.children)) {
          const name = node.children[0].text()
          if (context.availableMethods.has(name)) {
            const argumentList = node.children[1]
            if (!matchChildren(['(', ')'], argumentList.children)) {
              co.warn({
                from: argumentList.from,
                to: argumentList.to,
                message: 'Erwarte keine Argumente',
              })
            } else {
              const op: CallOp = {
                type: 'call',
                target: -1,
                line: doc.lineAt(node.from).number,
              }
              co.appendOutput(op)
              co.appendRkCode(name, node.from)
              context.callOps.push([name, op])
            }
          } else {
            co.warn({
              from: node.from,
              to: node.to,
              message: `Erwarte Punktnotation '${context.robotName}.'`,
            })
          }
          return
        }

        if (
          matchChildren(
            ['Identifier', '.', 'MethodName', 'ArgumentList'],
            node.children
          ) &&
          matchChildren(['Identifier'], node.children[2].children)
        ) {
          const obj = node.children[0].text()
          if (obj !== context.robotName) {
            co.warn({
              from: node.children[0].from,
              to: node.children[0].to,
              message: `Erwarte Objekt '${context.robotName}'`,
            })
          }

          const argumentList = node.children[3]
          let integerArgument: number = NaN

          const methodName = node.children[2].children[0].text()

          if (argumentList.children.some((child) => child.isError)) {
            co.warn({
              from: argumentList.from,
              to: Math.min(argumentList.to, doc.lineAt(argumentList.from).to),
              message: `Bitte runde Klammer schließen`,
            })
          } else if (
            matchChildren(
              ['(', 'IntegerLiteral', ')'],
              argumentList.children
            ) &&
            !methodsWithoutArgs.includes(methodName)
          ) {
            integerArgument = parseInt(argumentList.children[1].text())
            if (!isNaN(integerArgument)) {
              if (integerArgument <= 0) {
                co.warn({
                  from: argumentList.from,
                  to: argumentList.to,
                  message: `Erwarte eine Anzahl größer null`,
                })
                integerArgument = NaN
              }
            }
          } else if (!matchChildren(['(', ')'], argumentList.children)) {
            co.warn({
              from: argumentList.from,
              to: argumentList.to,
              message: methodsWithoutArgs.includes(methodName)
                ? `Erwarte leere Parameterliste`
                : `Erwarte Zahl als Parameter`,
            })
          }

          if (context.expectCondition) {
            let cond: Condition = {} as Condition
            if (methodName == 'nichtIstWand') {
              cond = { type: 'wall', negated: true }
            } else if (methodName == 'istWand') {
              cond = { type: 'wall', negated: false }
            } else if (methodName == 'nichtIstZiegel') {
              if (isNaN(integerArgument)) {
                cond = { type: 'brick', negated: true }
              } else {
                cond = {
                  type: 'brick_count',
                  negated: true,
                  count: integerArgument,
                }
              }
            } else if (methodName == 'istZiegel') {
              if (isNaN(integerArgument)) {
                cond = { type: 'brick', negated: false }
              } else {
                cond = {
                  type: 'brick_count',
                  negated: false,
                  count: integerArgument,
                }
              }
            } else if (methodName == 'nichtIstMarke') {
              cond = { type: 'mark', negated: true }
            } else if (methodName == 'istMarke') {
              cond = { type: 'mark', negated: false }
            } else if (methodName == 'nichtIstNorden') {
              cond = { type: 'north', negated: true }
            } else if (methodName == 'istNorden') {
              cond = { type: 'north', negated: false }
            } else if (methodName == 'nichtIstOsten') {
              cond = { type: 'east', negated: true }
            } else if (methodName == 'istOsten') {
              cond = { type: 'east', negated: false }
            } else if (methodName == 'nichtIstSüden') {
              cond = { type: 'south', negated: true }
            } else if (methodName == 'istSüden') {
              cond = { type: 'south', negated: false }
            } else if (methodName == 'nichtIstWesten') {
              cond = { type: 'west', negated: true }
            } else if (methodName == 'istWesten') {
              cond = { type: 'west', negated: false }
            }
            if (!cond.type) {
              co.warn({
                from: node.children[2].from,
                to: node.children[2].to,
                message: `Unbekannte Bedingung '${methodName}'`,
              })
              return
            }
            context.condition = cond
          } else {
            const action = methodName2action(methodName)
            if (!action) {
              co.warn({
                from: node.children[2].from,
                to: node.children[2].to,
                message: `Unbekannte Methode '${methodName}'`,
              })
              return
            }

            if (action == '--exit--') {
              co.appendOutput({ type: 'jump', target: Infinity })
              co.appendRkCode('Beenden', node.from)
              return
            }

            if (!isNaN(integerArgument)) {
              for (
                let i = 0;
                i < Math.min(1000, integerArgument) /* protect */;
                i++
              ) {
                co.appendOutput({
                  type: 'action',
                  command: action,
                  line: doc.lineAt(node.from).number,
                })
              }
              co.appendRkCode(
                methodName.charAt(0).toUpperCase() +
                  methodName.slice(1) +
                  '(' +
                  integerArgument.toString() +
                  ')',
                node.from
              )
            } else {
              co.appendOutput({
                type: 'action',
                command: action,
                line: doc.lineAt(node.from).number,
              })
              co.appendRkCode(
                methodName.charAt(0).toUpperCase() + methodName.slice(1),
                node.from
              )
            }
          }

          return
        }

        co.warn({
          from: node.from,
          to: node.to,
          message: 'Erwarte Methodenaufruf',
        })
        return
      }
      case 'ForStatement': {
        if (matchChildren(['for', 'ForSpec', 'Block'], node.children)) {
          semanticCheck(node.children[1], context)
          const toRemove = context.__temp_remove_from_scope_after_for
          context.__temp_remove_from_scope_after_for = undefined
          const position = co.getPosition()
          semanticCheck(node.children[2], context)
          if (toRemove && position >= 2) {
            co.decreaseIndent()
            co.appendRkCode('endewiederhole', node.to)
            context.variablesInScope.delete(toRemove)
            const jump = co.getOpAt(position - 2)
            const anchor = co.getOpAt(position - 1) as AnchorOp

            co.appendOutput({
              type: 'anchor',
              callback: (target) => {
                ;(jump as JumpOp).target = target
              },
            })
            co.appendOutput({ type: 'load', variable: toRemove })
            co.appendOutput({ type: 'constant', value: 1 })
            co.appendOutput({ type: 'operation', kind: 'sub' })
            co.appendOutput({ type: 'store', variable: toRemove })
            co.appendOutput({ type: 'load', variable: toRemove })
            const branch: BranchOp = {
              type: 'branch',
              targetT: -1,
              targetF: co.getPosition() + 1,
              line: doc.lineAt(node.from).number,
            }
            co.appendOutput(branch)
            co.appendOutput({
              type: 'anchor',
              callback: (target) => {
                branch.targetF = target
              },
            })
            anchor.callback = (target) => {
              branch.targetT = target
            }
          }
        } else {
          if (matchChildren(['for', 'ForSpec', '⚠'], node.children)) {
            semanticCheck(node.children[1], context)
          }
          co.warn({
            from: node.from,
            to: node.to,
            message: 'Erwarte Schleife mit Rumpf',
          })
        }
        return
      }
      case 'ForSpec': {
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
              co.warn({
                from: loopVar.from,
                to: loopVar.to,
                message: `Erwarte Schleifenzähler mit Typ 'int'`,
              })
            }

            if (
              matchChildren(
                ['Definition', 'AssignOp', 'IntegerLiteral'],
                declarator.children
              )
            ) {
              loopVarName = declarator.children[0].text()
              if (context.variablesInScope.has(loopVarName)) {
                co.warn({
                  from: declarator.children[0].from,
                  to: declarator.children[0].to,
                  message: `Variable '${loopVarName}' existiert bereits, erwarte anderen Namen`,
                })
              } else {
                context.__temp_remove_from_scope_after_for = loopVarName
              }
              const initialValue = parseInt(declarator.children[2].text())
              if (initialValue != 0) {
                co.warn({
                  from: declarator.children[2].from,
                  to: declarator.children[2].to,
                  message: `Erwarte Startwert 0`,
                })
              }
              context.variablesInScope.add(loopVarName)
            } else {
              co.warn({
                from: loopVar.from,
                to: loopVar.to,
                message: `Erwarte Schleifenzähler 'int ${safeLoopVar} = 0;'`,
              })
            }
          } else {
            co.warn({
              from: loopVar.from,
              to: loopVar.to,
              message: `Erwarte Schleifenzähler 'int ${safeLoopVar} = 0;'`,
            })
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
              co.warn({
                from: loopCond.children[0].from,
                to: loopCond.children[0].to,
                message: `Erwarte Variable '${loopVarName}'`,
              })
            }
            if (loopCond.children[1].text() != '<') {
              co.warn({
                from: loopCond.children[1].from,
                to: loopCond.children[1].to,
                message: `Erwarte Vergleichsoperator '<'`,
              })
            }
            const count = parseInt(loopCond.children[2].text())
            if (count <= 0) {
              co.warn({
                from: loopCond.children[2].from,
                to: loopCond.children[2].to,
                message: `Erwarte Anzahl größer null`,
              })
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
            co.warn({
              from: loopCond.from,
              to: loopCond.to,
              message: `Erwarte Schleifenbedingung der Form '${loopVarName} < 10'`,
            })
          }

          const loopUpdate = node.children[4]
          if (loopUpdate.text() !== loopVarName + '++') {
            co.warn({
              from: loopUpdate.from,
              to: loopUpdate.to,
              message: `Erwarte '${loopVarName}++'`,
            })
          }
        } else {
          co.warn({
            from: node.from,
            to: node.to,
            message: `Erwarte Schleifenkopf mit 'int ${safeLoopVar} = 0; ${safeLoopVar} < 10; ${safeLoopVar}++'`,
          })
        }

        return
      }
      case 'WhileStatement': {
        if (
          matchChildren(
            ['while', 'ParenthesizedExpression', 'Block'],
            node.children
          )
        ) {
          const condition = node.children[1]
          if (
            matchChildren(['(', 'BooleanLiteral', ')'], condition.children) &&
            condition.children[1].text() == 'true'
          ) {
            // endless loop
            const jump: JumpOp = { type: 'jump', target: -1 }
            co.appendOutput({
              type: 'anchor',
              callback: (target) => {
                jump.target = target
              },
            })
            co.appendRkCode('wiederhole immer', node.from)
            co.increaseIndent()
            semanticCheck(node.children[2], context)
            co.appendOutput(jump)
            co.decreaseIndent()
            co.appendRkCode('endewiederhole', node.to)
          } else {
            context.expectCondition = true
            semanticCheck(node.children[1], context)
            context.expectCondition = undefined
            const condition = context.condition
            if (condition) {
              const jumpToCond: JumpOp = { type: 'jump', target: -1 }
              const branch: BranchOp = {
                type: 'branch',
                targetF: -1,
                targetT: -1,
                line: node.from,
              }
              const anchorTop: AnchorOp = {
                type: 'anchor',
                callback: (target) => {
                  branch.targetT = target
                },
              }
              const anchorCond: AnchorOp = {
                type: 'anchor',
                callback: (target) => {
                  jumpToCond.target = target
                },
              }
              const anchorEnd: AnchorOp = {
                type: 'anchor',
                callback: (target) => {
                  branch.targetF = target
                },
              }
              co.appendOutput(jumpToCond)
              co.appendOutput(anchorTop)

              co.appendRkCode(
                `wiederhole solange ${conditionToRK(condition)}`,
                node.from
              )
              co.increaseIndent()
              semanticCheck(node.children[2], context)
              co.decreaseIndent()
              co.appendRkCode('endewiederhole', node.to)

              co.appendOutput(anchorCond)
              if (condition.type == 'brick_count') {
                co.appendOutput({ type: 'constant', value: condition.count! })
              }
              co.appendOutput({
                type: 'sense',
                condition,
              })
              co.appendOutput(branch)
              co.appendOutput(anchorEnd)
            }
          }
        } else {
          co.warn({
            from: node.from,
            to: node.to,
            message: `Erwarte Schleife mit Rumpf`,
          })
        }
        return
      }
      case 'ParenthesizedExpression': {
        if (matchChildren(['(', 'MethodInvocation', ')'], node.children)) {
          semanticCheck(node.children[1], context)
        } else {
          co.warn({
            from: node.from,
            to: node.to,
            message: `Erwarte Bedingung`,
          })
        }
        return
      }
      case 'IfStatement': {
        if (
          matchChildren(
            ['if', 'ParenthesizedExpression', 'Block'],
            node.children
          )
        ) {
          context.expectCondition = true
          semanticCheck(node.children[1], context)
          context.expectCondition = undefined
          const condition = context.condition
          if (condition) {
            const branch: BranchOp = {
              type: 'branch',
              targetF: -1,
              targetT: -1,
              line: doc.lineAt(node.from).number,
            }
            const anchorBlock: AnchorOp = {
              type: 'anchor',
              callback: (target) => {
                branch.targetT = target
              },
            }
            const anchorEnd: AnchorOp = {
              type: 'anchor',
              callback: (target) => {
                branch.targetF = target
              },
            }
            if (condition.type == 'brick_count') {
              co.appendOutput({ type: 'constant', value: condition.count! })
            }
            co.appendOutput({
              type: 'sense',
              condition,
            })
            co.appendOutput(branch)
            co.appendOutput(anchorBlock)

            co.appendRkCode(`wenn ${conditionToRK(condition)} dann`, node.from)
            co.increaseIndent()
            semanticCheck(node.children[2], context)
            co.decreaseIndent()
            co.appendRkCode('endewenn', node.to)

            co.appendOutput(anchorEnd)
          }
        } else if (
          matchChildren(
            ['if', 'ParenthesizedExpression', 'Block', 'else', 'Block'],
            node.children
          )
        ) {
          context.expectCondition = true
          semanticCheck(node.children[1], context)
          context.expectCondition = undefined
          const condition = context.condition
          if (condition) {
            const branch: BranchOp = {
              type: 'branch',
              targetF: -1,
              targetT: -1,
              line: doc.lineAt(node.from).number,
            }
            const jump: JumpOp = {
              type: 'jump',
              target: -1,
            }
            const anchorBlock: AnchorOp = {
              type: 'anchor',
              callback: (target) => {
                branch.targetT = target
              },
            }
            const anchorEnd: AnchorOp = {
              type: 'anchor',
              callback: (target) => {
                jump.target = target
              },
            }
            const anchorElse: AnchorOp = {
              type: 'anchor',
              callback: (target) => {
                branch.targetF = target
              },
            }
            if (condition.type == 'brick_count') {
              co.appendOutput({ type: 'constant', value: condition.count! })
            }
            co.appendOutput({
              type: 'sense',
              condition,
            })
            co.appendOutput(branch)
            co.appendOutput(anchorBlock)

            co.appendRkCode(`wenn ${conditionToRK(condition)} dann`, node.from)
            co.increaseIndent()
            semanticCheck(node.children[2], context)
            co.decreaseIndent()

            co.appendOutput(jump)
            co.appendRkCode('sonst', node.children[3].from)
            co.appendOutput(anchorElse)

            co.increaseIndent()
            semanticCheck(node.children[4], context)
            co.decreaseIndent()
            co.appendRkCode('endewenn', node.to)

            co.appendOutput(anchorEnd)
          }
        } else {
          co.warn({
            from: node.from,
            to: node.to,
            message: `Erwarte bedingte Anweisung mit Rumpf`,
          })
        }
        return
      }
      // ADD NEW NODES HERE
    }

    if (node.isError) {
      co.warn({
        from: node.from,
        to: node.to,
        message: 'SYNTAXFEHLER',
      })
      return
    }

    co.warn({
      from: node.from,
      to: node.to,
      message: `Dieser Syntax ist nicht implementiert: '${node.name}'`,
    })

    // console.log('NOT IMPLEMENTED', node.name)
    // node.children.forEach((child) => semanticCheck(child, context))
  }

  function warnForUnexpectedNodes(nodes: AstNode[], warnNode?: AstNode) {
    for (const node of nodes) {
      co.warn({
        from: (warnNode ?? node).from,
        to: (warnNode ?? node).to,
        message: node.isError
          ? 'Bitte Syntaxfehler korrigieren'
          : `Bitte entferne '${node.text()}', wird hier nicht unterstützt`,
      })
    }
  }

  function ensureBlock(nodes: AstNode[]) {
    if (nodes.length == 0 || nodes[0].name !== '{') {
      const start = nodes[0].from
      co.warn({
        from: start,
        to: start + 1,
        message: "Erwarte öffnende geschweifte Klammer '{'",
      })
      if (nodes[0].isError) {
        nodes.shift()
      }
      // can't continue
      return false
    } else {
      nodes.shift()
    }

    if (nodes.length == 0 || nodes[nodes.length - 1].name !== '}') {
      const end = nodes[nodes.length - 1].to
      co.warn({
        from: end - 1,
        to: end,
        message: "Erwarte schließende geschweifte Klammer '}'",
      })
      if (nodes[nodes.length - 1].isError) {
        nodes.pop()
      }
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
      co.warn({
        from: placeMessageOnNode.from,
        to: placeMessageOnNode.to,
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
      co.warn({
        from: robotField.from,
        to: robotField.to,
        message: 'Erwarte Name für Attribut',
      })
      return null
    }
    // extract name from definition
    const definition = variableDeclaration.children.find(
      (child) => child.name == 'Definition'
    )
    const name = definition?.text()
    if (!definition || !name) {
      co.warn({
        from: robotField.from,
        to: robotField.to,
        message: 'Erwarte Name für Attribut',
      })
      return null
    }
    const assignOp = variableDeclaration.children.find(
      (child) => child.name == 'AssignOp' && child.text() == '='
    )
    if (!assignOp) {
      co.warn({
        from: definition.from,
        to: definition.to,
        message: `Erwarte Initialisierung des Attributes '${definition.text()}'`,
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
      objectCreationExpression.children[1].text() !== 'Robot' ||
      objectCreationExpression.children[2].children.length !== 2 ||
      objectCreationExpression.children[2].children[0].name !== '(' ||
      objectCreationExpression.children[2].children[1].name !== ')'
    ) {
      co.warn({
        from: definition.from,
        to: definition.to,
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

    if (co.hasWarnings()) return name

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

  function checkMainMethod(main: AstNode) {
    const definition = main.children.find(
      (child) => child.name == 'Definition'
    )! // parser will always emit subtree with definition

    if (!main.children.find((child) => child.name == 'void')) {
      co.warn({
        from: definition.from,
        to: definition.to,
        message: "Erwarte Rückgabetyp 'void'",
      })
    }

    const formalParameters = main.children.find(
      (child) => child.name == 'FormalParameters'
    )! // parser will allways emit formal parameters

    warnForUnexpectedNodes(
      formalParameters.children.filter((child) => child.isError),
      formalParameters
    )

    if (
      formalParameters.children.some((child) => child.name == 'FormalParameter')
    ) {
      co.warn({
        from: definition.from,
        to: definition.to,
        message: "Methode 'main' erwartet keine Parameter",
      })
    }

    const block = main.children.find((child) => child.name == 'Block')

    if (!block) {
      co.warn({
        from: definition.from,
        to: definition.to,
        message: "Erwarte Rumpf der Methode 'main'",
      })
      if (main.children[main.children.length - 1].isError) {
        main.children.pop()
      }
    }

    const unwanted = main.children.filter(
      (child) =>
        ![
          'void',
          'TypeName',
          'PrimitiveType',
          'Definition',
          'FormalParameters',
          'Block',
        ].includes(child.name)
    )

    warnForUnexpectedNodes(unwanted, main)
  }

  function checkSemikolon(nodeToCheck: AstNode) {
    const children = nodeToCheck.children
    if (children.length == 0 || children[children.length - 1].name != ';') {
      if (children.length > 0 && children[children.length - 1].isError) {
        children.pop()
      }
      const line = doc.lineAt(nodeToCheck.from)
      co.warn({
        from: Math.max(nodeToCheck.from, line.to - 1),
        to: line.to,
        message: "Erwarte Semikolon ';'",
      })
      return false
    }
  }
}
