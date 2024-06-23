import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'
import { BranchOp, CallOp, Condition, JumpOp, Op } from '../../state/types'
import { Diagnostic } from '@codemirror/lint'
import { AstNode, cursorToAstNode, prettyPrintAstNode } from '../helper/astNode'
import { matchChildren } from '../helper/matchChildren'
import { methodName2action } from '../helper/methodName2action'
import { methodsWithoutArgs } from '../helper/methodsWithoutArgs'
import { AnchorOp } from '../helper/CompilerOutput'
import { conditionToRK } from '../helper/conditionToRk'

interface SemantikCheckContext {
  robotKarolVar: string
  variablesInScope: Set<string>
  expectCondition?: boolean
  condition?: Condition
  availableMethods: Set<string>
  callOps: [string, CallOp][]
}

export function compilePython(
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
      rkCode += '\n//' + pad() + c.text().substring(1)
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
  const ast = cursorToAstNode(tree.cursor(), doc, ['Comment'], comments)

  // debug
  // console.log(prettyPrintAstNode(ast))

  if (doc.toString().trim().length === 0) {
    // empty program
    return { output: [], warnings: [], rkCode: '' }
  }

  // compilation start
  let indentionLevel = 0
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    if (line.text.trim()) {
      let t = doc.sliceString(line.from, line.to)
      let spaces = 0
      while (t.startsWith(' ')) {
        t = t.substring(1)
        spaces++
      }
      const expectedLevel = indentionLevel * 4
      if (spaces < expectedLevel && (expectedLevel - spaces) % 4 == 0) {
        // unindent
        indentionLevel -= (expectedLevel - spaces) / 4
      } else if (spaces !== expectedLevel) {
        warnings.push({
          from: line.from,
          to: line.to,
          severity: 'error',
          message: `Erwarte andere Einrückung an dieser Stelle`,
        })
      }
      if (t.replace(/#.*$/, '').trim().endsWith(':')) {
        indentionLevel++
      }
    }
  }

  const availableMethods: Set<string> = new Set()
  const functions = ast.children.filter(
    (child) => child.name == 'FunctionDefinition'
  )

  for (const method of functions) {
    if (
      matchChildren(
        ['def', 'VariableName', 'ParamList', 'Body'],
        method.children
      )
    ) {
      const formalParameters = method.children[2]
      if (!matchChildren(['(', ')'], formalParameters.children)) {
        warnings.push({
          from: formalParameters.from,
          to: formalParameters.to,
          severity: 'error',
          message: 'Erwarte leere Parameterliste',
        })
      }
      const name = method.children[1].text()
      availableMethods.add(name)
    } else {
      warnings.push({
        from: method.from,
        to: method.to,
        severity: 'error',
        message: 'Erwarte eigene Methode ohne Rückgabewert mit Rumpf',
      })
    }
  }

  const script = ast.children.filter(
    (child) => child.name != 'FunctionDefinition'
  )

  let robotKarolVar = ''
  if (script.length > 0 && script[0].name == 'AssignStatement') {
    if (
      matchChildren(
        ['VariableName', 'AssignOp', 'CallExpression'],
        script[0].children
      )
    ) {
      const callExp = script[0].children[2]
      if (matchChildren(['VariableName', 'ArgList'], callExp.children)) {
        if (
          callExp.children[0].text() == 'Robot' &&
          matchChildren(['(', ')'], callExp.children[1].children)
        ) {
          robotKarolVar = script[0].children[0].text()
          script.shift()
        }
      }
    }
  }
  if (!robotKarolVar) {
    warnings.push({
      from: ast.from,
      to: ast.to,
      severity: 'error',
      message: `Erwarte 'karol = Robot()' am Anfang des Programms`,
    })
  }

  const callOps: [string, CallOp][] = []

  const context: SemantikCheckContext = {
    robotKarolVar,
    variablesInScope: new Set(),
    availableMethods,
    callOps,
  }
  script.map((node) => semanticCheck(node, context))

  if (availableMethods.size > 0) {
    output.push({ type: 'jump', target: Infinity })
  }

  for (const method of functions) {
    const name = method.children[1].text()
    output.push({
      type: 'anchor',
      callback: (target) => {
        callOps.forEach(([n, op]) => {
          if (n == name) {
            op.target = target
          }
        })
      },
    })
    appendRkCode('\nAnweisung ' + name, method.from)
    rkCodeIndent++
    if (method.children.length == 4) {
      semanticCheck(method.children[3], {
        robotKarolVar,
        variablesInScope: new Set(),
        availableMethods,
        callOps,
      })
      output.push({ type: 'return' })
    }
    rkCodeIndent--
    appendRkCode('endeAnweisung', method.to)
  }

  // compilation end

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

  // -------------------------------- HELPER ----------------------------
  function semanticCheck(node: AstNode, context: SemantikCheckContext) {
    switch (node.name) {
      case 'ExpressionStatement': {
        if (matchChildren(['CallExpression'], node.children)) {
          semanticCheck(node.children[0], context)
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: 'Erwarte Methodenaufruf',
          })
        }
        return
      }
      case 'CallExpression': {
        if (matchChildren(['MemberExpression', 'ArgList'], node.children)) {
          const memberExpr = node.children[0]
          const argList = node.children[1]

          if (
            !matchChildren(
              ['VariableName', '.', 'PropertyName'],
              memberExpr.children
            )
          ) {
            warnings.push({
              from: node.from,
              to: node.to,
              severity: 'error',
              message: `Erwarte Methode von '${context.robotKarolVar}'`,
            })
          } else {
            const methodName = memberExpr.children[2].text()
            const action = methodName2action(methodName)
            let integerArgument = NaN
            if (methodsWithoutArgs.includes(methodName)) {
              if (!matchChildren(['(', ')'], argList.children)) {
                warnings.push({
                  from: argList.from,
                  to: argList.to,
                  severity: 'error',
                  message: `Erwarte leere Argumentliste`,
                })
              }
            } else {
              if (matchChildren(['(', ')'], argList.children)) {
                // ok
              } else if (
                matchChildren(['(', 'Number', ')'], argList.children)
              ) {
                const numStr = argList.children[1].text()
                const num = parseInt(numStr)
                if (num.toString() !== numStr) {
                  warnings.push({
                    from: argList.children[1].from,
                    to: argList.children[1].to,
                    severity: 'error',
                    message: `Erwarte ganze Zahl`,
                  })
                } else if (num <= 0) {
                  warnings.push({
                    from: argList.children[1].from,
                    to: argList.children[1].to,
                    severity: 'error',
                    message: `Erwarte Anzahl größer Null`,
                  })
                } else {
                  integerArgument = num
                }
              } else {
                warnings.push({
                  from: argList.children[1].from,
                  to: argList.children[1].to,
                  severity: 'error',
                  message: `Erwarte positive Zahl`,
                })
              }
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
                  from: memberExpr.children[2].from,
                  to: memberExpr.children[2].to,
                  severity: 'error',
                  message: `Unbekannte Bedingung '${methodName}'`,
                })
                return
              }
              context.condition = cond
            } else {
              if (!action) {
                warnings.push({
                  from: memberExpr.children[2].from,
                  to: memberExpr.children[2].to,
                  severity: 'error',
                  message: `Unbekannte Methode '${methodName}'`,
                })
                return
              }
              // create output
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
          }
        } else if (matchChildren(['VariableName', 'ArgList'], node.children)) {
          const name = node.children[0].text()
          if (context.availableMethods.has(name)) {
            const argumentList = node.children[1]
            if (!matchChildren(['(', ')'], argumentList.children)) {
              warnings.push({
                from: argumentList.from,
                to: argumentList.to,
                severity: 'error',
                message: 'Erwarte keine Argumente',
              })
            } else {
              const op: CallOp = {
                type: 'call',
                target: -1,
                line: doc.lineAt(node.from).number,
              }
              output.push(op)
              appendRkCode(name, node.from)
              context.callOps.push([name, op])
            }
          } else {
            warnings.push({
              from: node.from,
              to: node.to,
              severity: 'error',
              message: `Erwarte Punktnotation '${context.robotKarolVar}.'`,
            })
          }
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte Methode von '${context.robotKarolVar}'`,
          })
        }
        return
      }
      case 'WhileStatement': {
        if (matchChildren(['while', 'Boolean', 'Body'], node.children)) {
          const condition = node.children[1].text()
          if (condition == 'True') {
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
            warnings.push({
              from: node.from,
              to: node.to,
              severity: 'error',
              message: `Wiederholung wird nie ausgeführt`,
            })
          }
        } else if (
          matchChildren(['while', 'CallExpression', 'Body'], node.children)
        ) {
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

            appendRkCode(
              `wiederhole solange ${conditionToRK(condition)}`,
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
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte bedingte Wiederholung`,
          })
        }
        return
      }
      case 'Body': {
        if (node.children.length > 0 && node.children[0].name == ':') {
          node.children
            .slice(1)
            .forEach((child) => semanticCheck(child, context))
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte ':' am Anfang des Blocks`,
          })
        }
        return
      }
      case 'PassStatement': {
        // needed for empty blocks
        return
      }
      case 'ForStatement': {
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
            ['for', 'VariableName', 'in', 'CallExpression', 'Body'],
            node.children
          )
        ) {
          const loopVar = node.children[1].text()
          if (context.variablesInScope.has(loopVar)) {
            warnings.push({
              from: node.children[1].from,
              to: node.children[1].to,
              severity: 'error',
              message: `Variable '${loopVar}' existiert bereits, erwarte anderen Namen`,
            })
          }
          if (
            !matchChildren(
              ['VariableName', 'ArgList'],
              node.children[3].children
            ) ||
            node.children[3].children[0].text() != 'range'
          ) {
            warnings.push({
              from: node.from,
              to: node.to,
              severity: 'error',
              message: `Erwarte 'range(<Anzahl>)' mit gewünschter Anzahl`,
            })
          } else {
            const argList = node.children[3].children[1]
            let count = NaN
            if (!matchChildren(['(', 'Number', ')'], argList.children)) {
              warnings.push({
                from: argList.from,
                to: argList.to,
                severity: 'error',
                message: `Erwarte Anzahl`,
              })
            } else {
              const numStr = argList.children[1].text()
              const num = parseInt(numStr)
              if (num.toString() !== numStr) {
                warnings.push({
                  from: argList.children[1].from,
                  to: argList.children[1].to,
                  severity: 'error',
                  message: `Erwarte ganze Zahl`,
                })
              } else if (num <= 0) {
                warnings.push({
                  from: argList.children[1].from,
                  to: argList.children[1].to,
                  severity: 'error',
                  message: `Erwarte Anzahl größer Null`,
                })
              } else {
                count = num
              }
            }
            // I'm ready to generate output
            output.push({ type: 'constant', value: count + 1 }) // we decrement before compare
            output.push({ type: 'store', variable: loopVar })
            const jumpToCheck: JumpOp = { type: 'jump', target: -1 }
            output.push(jumpToCheck)

            const branch: BranchOp = {
              type: 'branch',
              targetT: -1,
              targetF: -1,
              line: doc.lineAt(node.from).number,
            }

            output.push({
              type: 'anchor',
              callback: (target) => {
                branch.targetT = target
              },
            })

            appendRkCode(`wiederhole ${count} mal`, node.from)
            context.variablesInScope.add(loopVar)

            rkCodeIndent++
            semanticCheck(node.children[4], context)
            rkCodeIndent--

            appendRkCode('endewiederhole', node.to)
            context.variablesInScope.delete(loopVar)

            output.push({
              type: 'anchor',
              callback: (target) => {
                jumpToCheck.target = target
              },
            })
            output.push({ type: 'load', variable: loopVar })
            output.push({ type: 'constant', value: 1 })
            output.push({ type: 'operation', kind: 'sub' })
            output.push({ type: 'store', variable: loopVar })
            output.push({ type: 'load', variable: loopVar })
            output.push(branch)
            output.push({
              type: 'anchor',
              callback: (target) => {
                branch.targetF = target
              },
            })
          }
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte Schleife der Form 'for ${safeLoopVar} in range(10):'`,
          })
        }
        return
      }
      case 'IfStatement': {
        if (matchChildren(['if', 'CallExpression', 'Body'], node.children)) {
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
              output.push({ type: 'constant', value: condition.count! })
            }
            output.push({
              type: 'sense',
              condition,
            })
            output.push(branch)
            output.push(anchorBlock)

            appendRkCode(`wenn ${conditionToRK(condition)} dann`, node.from)
            rkCodeIndent++
            semanticCheck(node.children[2], context)
            rkCodeIndent--
            appendRkCode('endewenn', node.to)

            output.push(anchorEnd)
          }
        } else if (
          matchChildren(
            ['if', 'CallExpression', 'Body', 'else', 'Body'],
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
              output.push({ type: 'constant', value: condition.count! })
            }
            output.push({
              type: 'sense',
              condition,
            })
            output.push(branch)
            output.push(anchorBlock)

            appendRkCode(`wenn ${conditionToRK(condition)} dann`, node.from)
            rkCodeIndent++
            semanticCheck(node.children[2], context)
            rkCodeIndent--

            output.push(jump)
            appendRkCode('sonst', node.children[3].from)
            output.push(anchorElse)

            rkCodeIndent++
            semanticCheck(node.children[4], context)
            rkCodeIndent--
            appendRkCode('endewenn', node.to)

            output.push(anchorEnd)
          }
        } else {
          warnings.push({
            from: node.from,
            to: node.to,
            severity: 'error',
            message: `Erwarte bedingte Anweisung mit Rumpf`,
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
        message: 'Syntaxfehler',
      })
      return
    }

    warnings.push({
      from: node.from,
      to: node.to,
      severity: 'error',
      message: `Dieser Syntax ist nicht implementiert: '${node.name}'`,
    })
  }
}
