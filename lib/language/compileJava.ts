import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'
import { BranchOp, Condition, JumpOp, Op } from '../state/types'
import { Diagnostic } from '@codemirror/lint'
import { AstNode, cursorToAstNode, prettyPrintAstNode } from './astNode'

interface SemantikCheckContext {
  robotName: string
  variablesInScope: Set<string>
  __temp_remove_from_scope_after_for?: string
  expectCondition?: boolean
  condition?: Condition
}

interface AnchorOp {
  type: 'anchor'
  callback: (target: number) => void
}

export function compileJava(
  tree: Tree,
  doc: Text
): { output: Op[]; warnings: Diagnostic[]; rkCode?: string } {
  const warnings: Diagnostic[] = []
  const output: (Op | AnchorOp)[] = []
  let rkCode = ''
  let rkCodeIndent = 0

  let comments: AstNode[] = []

  function appendRkCode(code: string, pos: number) {
    const commentsToAdd = comments.filter((node) => node.from < pos)
    for (const c of commentsToAdd) {
      rkCode += '\n' + pad() + c.text()
    }
    if (commentsToAdd.length > 0) {
      comments = comments.filter((node) => node.from >= pos)
    }
    rkCode += '\n' + pad() + code
  }

  function pad() {
    let line = ''
    for (let i = 0; i < rkCodeIndent; i++) {
      line += '  '
    }
    return line
  }

  // convert tree to ast node
  const ast = cursorToAstNode(
    tree.cursor(),
    doc,
    ['LineComment', 'BlockComment'],
    comments
  )

  // debug
  console.log(prettyPrintAstNode(ast))

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

  const classDefinition = classDeclaration.children.find(
    (child) => child.name == 'Definition'
  )

  if (!classDefinition) {
    warnings.push({
      from: classDeclaration.from,
      to: classDeclaration.to,
      severity: 'error',
      message: 'Erwarte Name der Klasse',
    })
    // can't continue
    return { output: [], warnings }
  }

  const classBody = classDeclaration.children.find(
    (child) => child.name == 'ClassBody'
  )

  if (!classBody) {
    warnings.push({
      from: classDefinition.from,
      to: classDefinition.to,
      severity: 'error',
      message: 'Erwarte Rumpf der Klasse',
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
    return { output: [], warnings }
  }

  const robotField = robotFields[0]
  const robotInstanceName = checkRobotField(robotField)

  if (!robotInstanceName || warnings.length > 0) {
    return { output: [], warnings }
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
    return { output: [], warnings }
  }

  warnForUnexpectedNodes(unwantedInClassBody)

  if (warnings.length > 0) {
    return { output: [], warnings }
  }

  // additional checks for robot field and main method
  const mainMethod = mainMethods[0]
  checkMainMethod(mainMethod)

  // custom fields / methods not implemented yet
  for (const field of fields) {
    if (field != robotField) {
      warnings.push({
        from: field.from,
        to: field.to,
        severity: 'error',
        message: 'Keine eigenen Attribute unterstützt',
      })
    }
  }

  for (const method of methods) {
    if (method != mainMethod) {
      warnings.push({
        from: method.from,
        to: method.to,
        severity: 'error',
        message: 'Keine eigenen Methoden unterstützt',
      })
    }
  }

  semanticCheck(mainMethod, {
    robotName: robotInstanceName,
    variablesInScope: new Set(),
  })

  appendRkCode('', Infinity)
  rkCode = rkCode.trim()

  const finalOutput: Op[] = []

  for (const op of output) {
    if (op.type == 'anchor') {
      op.callback(finalOutput.length)
    } else {
      finalOutput.push(op)
    }
  }

  return { output: finalOutput, warnings, rkCode }

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
        // todo: frame context for variables?
        node.children.map((child) => semanticCheck(child, context))
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
        warnings.push({
          from:
            node.from + (node.text().startsWith(prefix) ? prefix.length : 0),
          to: Math.min(node.to, doc.lineAt(node.from).to),
          severity: 'error',
          message: 'Erwarte Methodenaufruf',
        })
        return
      }
      case ';': {
        warnings.push({
          from: node.from,
          to: node.to,
          severity: 'error',
          message: 'Erwarte Methodenaufruf',
        })
        return
      }
      case 'MethodInvocation': {
        if (matchChildren(['MethodName', 'ArgumentList'], node.children)) {
          // future: adapt if own methods become available
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte Punktnotation '${context.robotName}.'`,
          })
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
            warnings.push({
              from: node.children[0].from,
              to: node.children[0].to,
              severity: 'error',
              message: `Erwarte Objekt '${context.robotName}'`,
            })
          }

          const argumentList = node.children[3]
          let integerArgument: number = NaN

          const methodsWithoutArgs = [
            'markeSetzen',
            'markeLöschen',
            'beenden',
            'istWand',
            'nichtIstWand',
            'istMarke',
            'nichtIstMarke',
            'istSüden',
            'istNorden',
            'istWesten',
            'istOsten',
            'nichtIstSüden',
            'nichtIstNorden',
            'nichtIstWesten',
            'nichtIstOsten',
          ]

          const methodName = node.children[2].children[0].text()

          if (argumentList.children.some((child) => child.isError)) {
            warnings.push({
              from: argumentList.from,
              to: Math.min(argumentList.to, doc.lineAt(argumentList.from).to),
              severity: 'error',
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
                warnings.push({
                  from: argumentList.from,
                  to: argumentList.to,
                  severity: 'error',
                  message: `Erwarte eine Anzahl größer null`,
                })
                integerArgument = NaN
              }
            }
          } else if (!matchChildren(['(', ')'], argumentList.children)) {
            warnings.push({
              from: argumentList.from,
              to: argumentList.to,
              severity: 'error',
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
              warnings.push({
                from: node.children[2].from,
                to: node.children[2].to,
                severity: 'error',
                message: `Unbekannte Bedingung '${methodName}'`,
              })
              return
            }
            context.condition = cond
          } else {
            const action = methodName2action(methodName)
            if (!action) {
              warnings.push({
                from: node.children[2].from,
                to: node.children[2].to,
                severity: 'error',
                message: `Unbekannte Methode '${methodName}'`,
              })
              return
            }

            if (action == '--exit--') {
              output.push({ type: 'jump', target: Infinity })
              appendRkCode('Beenden', node.from)
              return
            }

            if (!isNaN(integerArgument)) {
              for (
                let i = 0;
                i < Math.min(1000, integerArgument) /* protect */;
                i++
              ) {
                output.push({
                  type: 'action',
                  command: action,
                  line: doc.lineAt(node.from).number,
                })
              }
              appendRkCode(
                methodName.charAt(0).toUpperCase() +
                  methodName.slice(1) +
                  '(' +
                  integerArgument.toString() +
                  ')',
                node.from
              )
            } else {
              output.push({
                type: 'action',
                command: action,
                line: doc.lineAt(node.from).number,
              })
              appendRkCode(
                methodName.charAt(0).toUpperCase() + methodName.slice(1),
                node.from
              )
            }
          }

          return
        }

        warnings.push({
          from: node.from,
          to: node.to,
          severity: 'error',
          message: 'Erwarte Methodenaufruf',
        })
        return
      }
      case 'ForStatement': {
        if (matchChildren(['for', 'ForSpec', 'Block'], node.children)) {
          semanticCheck(node.children[1], context)
          const toRemove = context.__temp_remove_from_scope_after_for
          context.__temp_remove_from_scope_after_for = undefined
          const position = output.length
          semanticCheck(node.children[2], context)
          if (toRemove && position >= 2) {
            rkCodeIndent--
            appendRkCode('endewiederhole', node.to)
            context.variablesInScope.delete(toRemove)
            const jump = output[position - 2]
            const anchor = output[position - 1] as AnchorOp

            console.log(anchor, jump)

            output.push({
              type: 'anchor',
              callback: (target) => {
                ;(jump as JumpOp).target = target
              },
            })
            output.push({ type: 'load', variable: toRemove })
            output.push({ type: 'constant', value: 1 })
            output.push({ type: 'operation', kind: 'sub' })
            output.push({ type: 'store', variable: toRemove })
            output.push({ type: 'load', variable: toRemove })
            const branch: BranchOp = {
              type: 'branch',
              targetT: -1,
              targetF: output.length + 1,
              line: doc.lineAt(node.from).number,
            }
            output.push(branch)
            output.push({
              type: 'anchor',
              callback: (target) => {
                branch.targetF = target
              },
            })
            anchor.callback = (target) => {
              console.log('callback for targetF', target)
              branch.targetT = target
            }
          }
        } else {
          if (matchChildren(['for', 'ForSpec', '⚠'], node.children)) {
            semanticCheck(node.children[1], context)
          }
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
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
              warnings.push({
                from: loopVar.from,
                to: loopVar.to,
                severity: 'error',
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
                warnings.push({
                  from: declarator.children[0].from,
                  to: declarator.children[0].to,
                  severity: 'error',
                  message: `Variable '${loopVarName}' existiert bereits, erwarte anderen Namen`,
                })
              } else {
                context.__temp_remove_from_scope_after_for = loopVarName
              }
              const initialValue = parseInt(declarator.children[2].text())
              if (initialValue != 0) {
                warnings.push({
                  from: declarator.children[2].from,
                  to: declarator.children[2].to,
                  severity: 'error',
                  message: `Erwarte Startwert 0`,
                })
              }
              context.variablesInScope.add(loopVarName)
            } else {
              warnings.push({
                from: loopVar.from,
                to: loopVar.to,
                severity: 'error',
                message: `Erwarte Schleifenzähler 'int ${safeLoopVar} = 0;'`,
              })
            }
          } else {
            warnings.push({
              from: loopVar.from,
              to: loopVar.to,
              severity: 'error',
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
              warnings.push({
                from: loopCond.children[0].from,
                to: loopCond.children[0].to,
                severity: 'error',
                message: `Erwarte Variable '${loopVarName}'`,
              })
            }
            if (loopCond.children[1].text() != '<') {
              warnings.push({
                from: loopCond.children[1].from,
                to: loopCond.children[1].to,
                severity: 'error',
                message: `Erwarte Vergleichsoperator '<'`,
              })
            }
            const count = parseInt(loopCond.children[2].text())
            if (count <= 0) {
              warnings.push({
                from: loopCond.children[2].from,
                to: loopCond.children[2].to,
                severity: 'error',
                message: `Erwarte Anzahl größer null`,
              })
            }
            // generate bytecode
            output.push({ type: 'constant', value: count + 1 }) // we decrement before compare
            output.push({ type: 'store', variable: loopVarName })
            const jump: Op = { type: 'jump', target: -1 }
            output.push(jump)
            output.push({ type: 'anchor', callback: () => {} })
            appendRkCode(`wiederhole ${count} mal`, node.from)
            rkCodeIndent++
          } else {
            warnings.push({
              from: loopCond.from,
              to: loopCond.to,
              severity: 'error',
              message: `Erwarte Schleifenbedingung der Form '${loopVarName} < 10'`,
            })
          }

          const loopUpdate = node.children[4]
          if (loopUpdate.text() !== loopVarName + '++') {
            warnings.push({
              from: loopUpdate.from,
              to: loopUpdate.to,
              severity: 'error',
              message: `Erwarte '${loopVarName}++'`,
            })
          }
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
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
            output.push({
              type: 'anchor',
              callback: (target) => {
                jump.target = target
              },
            })
            appendRkCode('wiederhole immer', node.from)
            rkCodeIndent++
            semanticCheck(node.children[2], context)
            output.push(jump)
            rkCodeIndent--
            appendRkCode('endewiederhole', node.to)
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
              output.push(jumpToCond)
              output.push(anchorTop)

              const part1 = condition.negated ? 'NichtIst' : 'Ist'
              const part2 = ((type) => {
                if (type == 'brick') return 'Ziegel'
                if (type == 'wall') return 'Wand'
                if (type == 'mark') return 'Marke'
                if (type == 'north') return 'Norden'
                if (type == 'south') return 'Süden'
                if (type == 'east') return 'Osten'
                if (type == 'west') return 'Westen'
                return 'Ziegel'
              })(condition.type)
              const part3 =
                condition.type == 'brick_count' ? `(${condition.count})` : ''

              appendRkCode(
                `wiederhole solange ${part1}${part2}${part3}`,
                node.from
              )
              rkCodeIndent++
              semanticCheck(node.children[2], context)
              rkCodeIndent--
              appendRkCode('endewiederhole', node.to)

              output.push(anchorCond)
              if (condition.type == 'brick_count') {
                output.push({ type: 'constant', value: condition.count! })
              }
              output.push({
                type: 'sense',
                condition,
              })
              output.push(branch)
              output.push(anchorEnd)
            }
          }
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte Schleife mit Rumpf`,
          })
        }
        return
      }
      case 'ParenthesizedExpression': {
        if (matchChildren(['(', 'MethodInvocation', ')'], node.children)) {
          semanticCheck(node.children[1], context)
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte Bedingung`,
          })
        }
        return
      }
      // ADD NEW NODES HERE
    }

    if (node.isError) {
      warnings.push({
        from: node.from,
        to: node.to,
        severity: 'error',
        message: 'SYNTAXFEHLER',
      })
      return
    }

    console.log('NOT IMPLEMENTED', node.name)
    node.children.forEach((child) => semanticCheck(child, context))
  }

  function methodName2action(name: string) {
    switch (name) {
      case 'schritt':
        return 'forward'
      case 'linksDrehen':
        return 'left'
      case 'rechtsDrehen':
        return 'right'
      case 'hinlegen':
        return 'brick'
      case 'aufheben':
        return 'unbrick'
      case 'markeSetzen':
        return 'setMark'
      case 'markeLöschen':
        return 'resetMark'
      case 'beenden':
        return '--exit--'
    }
  }

  function warnForUnexpectedNodes(nodes: AstNode[], warnNode?: AstNode) {
    for (const node of nodes) {
      warnings.push({
        from: (warnNode ?? node).from,
        to: (warnNode ?? node).to,
        severity: 'error',
        message: node.isError
          ? 'Bitte Syntaxfehler korrigieren'
          : `Bitte entferne '${node.text()}', wird hier nicht unterstützt`,
      })
    }
  }

  function matchChildren(names: string[], nodes: AstNode[]) {
    return (
      names.length == nodes.length &&
      names.every((name, i) => nodes[i].name == name)
    )
  }

  function ensureBlock(nodes: AstNode[]) {
    if (nodes.length == 0 || nodes[0].name !== '{') {
      const start = nodes[0].from
      warnings.push({
        from: start,
        to: start + 1,
        severity: 'error',
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
      warnings.push({
        from: end - 1,
        to: end,
        severity: 'error',
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
    const name = definition?.text()
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
      (child) => child.name == 'AssignOp' && child.text() == '='
    )
    if (!assignOp) {
      warnings.push({
        from: definition.from,
        to: definition.to,
        severity: 'error',
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
      warnings.push({
        from: definition.from,
        to: definition.to,
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

  function checkMainMethod(main: AstNode) {
    const definition = main.children.find(
      (child) => child.name == 'Definition'
    )! // parser will always emit subtree with definition

    if (!main.children.find((child) => child.name == 'void')) {
      warnings.push({
        from: definition.from,
        to: definition.to,
        severity: 'error',
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
      warnings.push({
        from: definition.from,
        to: definition.to,
        severity: 'error',
        message: "Methode 'main' erwartet keine Parameter",
      })
    }

    const block = main.children.find((child) => child.name == 'Block')

    if (!block) {
      warnings.push({
        from: definition.from,
        to: definition.to,
        severity: 'error',
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
      warnings.push({
        from: Math.max(nodeToCheck.from, line.to - 1),
        to: line.to,
        severity: 'error',
        message: "Erwarte Semikolon ';'",
      })
      return false
    }
  }
}
