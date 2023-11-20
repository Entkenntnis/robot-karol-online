import { Text } from '@codemirror/state'
import { Tree } from '@lezer/common'
import { BranchOp, JumpOp, Op } from '../state/types'
import { Diagnostic } from '@codemirror/lint'
import { AstNode, cursorToAstNode, prettyPrintAstNode } from './astNode'
import { AnchorOp, methodName2action, methodsWithoutArgs } from './compileJava'
import { matchChildren } from './matchChildren'

interface SemantikCheckContext {
  robotKarolVar: string
  variablesInScope: Set<string>
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
  console.log(prettyPrintAstNode(ast))

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
      if (spaces == expectedLevel - 4) {
        // unindent
        indentionLevel--
      } else if (spaces !== expectedLevel) {
        warnings.push({
          from: line.from,
          to: line.to,
          severity: 'error',
          message: `Erwarte andere Einrückung an dieser Stelle`,
        })
      }
      if (t.trim().endsWith(':')) {
        indentionLevel++
      }
    }
  }

  const functions = ast.children.filter(
    (child) => child.name == 'FuntionDefinition'
  )

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

  const context: SemantikCheckContext = {
    robotKarolVar,
    variablesInScope: new Set(),
  }
  script.map((node) => semanticCheck(node, context))

  // TODO für später: Methoden kompilieren

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
            // TODO: parse condition
            const methodName = memberExpr.children[2].text()
            const action = methodName2action(methodName)
            if (!action) {
              warnings.push({
                from: memberExpr.children[2].from,
                to: memberExpr.children[2].to,
                severity: 'error',
                message: `Unbekannte Methode '${methodName}'`,
              })
              return
            }
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
        } else if (false) {
          // TODO while loop with condition
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
