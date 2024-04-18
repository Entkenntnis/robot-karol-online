import { Condition, CallOp, JumpOp, BranchOp, Op } from '../../state/types'
import { AnchorOp, CompilerOutput } from '../helper/CompilerOutput'
import { AstNode } from '../helper/astNode'
import { conditionToRK } from '../helper/conditionToRk'
import { matchChildren } from '../helper/matchChildren'
import { methodName2action } from '../helper/methodName2action'
import { methodsWithoutArgs } from '../helper/methodsWithoutArgs'
import { checkSemikolon } from './checkSemikolon'
import { ensureBlock } from './ensureBlock'

interface SemantikCheckContext {
  robotName: string
  variablesInScope: Set<string>
  __temp_remove_from_scope_after_for?: string
  expectCondition?: boolean
  condition?: Condition
  availableMethods: Set<string>
  callOps: [string, CallOp][]
}

export function semanticCheck(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  switch (node.name) {
    case 'MethodDeclaration': {
      // already checked by toplevel
      node.children
        .filter((child) => child.name == 'Block')
        .map((child) => semanticCheck(co, child, context))
      return
    }
    case 'Block': {
      ensureBlock(co, node.children)
      node.children
        .filter((child) => child.name !== '{' && child.name !== '}')
        .map((child) => semanticCheck(co, child, context))
      return
    }
    case 'ExpressionStatement': {
      if (matchChildren(['MethodInvocation', ';'], node.children)) {
        semanticCheck(co, node.children[0], context)
        return
      }
      const lastChild = node.children[node.children.length - 1]
      if (lastChild.isError) {
        node.children.pop()
      }
      if (matchChildren(['MethodInvocation'], node.children)) {
        semanticCheck(co, node.children[0], context)
        checkSemikolon(co, node)
        return
      }
      const prefix = `${context.robotName}.`
      co.warn__internal({
        from: node.from + (node.text().startsWith(prefix) ? prefix.length : 0),
        to: Math.min(node.to, co.lineAt(node.from).to),
        message: 'Erwarte Methodenaufruf',
      })
      return
    }
    case ';': {
      co.warn(node, 'Erwarte Methodenaufruf')
      return
    }
    case 'MethodInvocation': {
      if (matchChildren(['MethodName', 'ArgumentList'], node.children)) {
        const name = node.children[0].text()
        if (context.availableMethods.has(name)) {
          const argumentList = node.children[1]
          if (!matchChildren(['(', ')'], argumentList.children)) {
            co.warn(argumentList, 'Erwarte keine Argumente')
          } else {
            const op: CallOp = {
              type: 'call',
              target: -1,
              line: co.lineAt(node.from).number,
            }
            co.appendOutput(op)
            co.appendRkCode(name, node.from)
            context.callOps.push([name, op])
          }
        } else {
          co.warn(node, `Erwarte Punktnotation '${context.robotName}.'`)
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
          co.warn(node.children[0], `Erwarte Objekt '${context.robotName}'`)
        }

        const argumentList = node.children[3]
        let integerArgument: number = NaN

        const methodName = node.children[2].children[0].text()

        if (argumentList.children.some((child) => child.isError)) {
          co.warn__internal({
            from: argumentList.from,
            to: Math.min(argumentList.to, co.lineAt(argumentList.from).to),
            message: `Bitte runde Klammer schließen`,
          })
        } else if (
          matchChildren(['(', 'IntegerLiteral', ')'], argumentList.children) &&
          !methodsWithoutArgs.includes(methodName)
        ) {
          integerArgument = parseInt(argumentList.children[1].text())
          if (!isNaN(integerArgument)) {
            if (integerArgument <= 0) {
              co.warn(argumentList, `Erwarte eine Anzahl größer null`)
              integerArgument = NaN
            }
          }
        } else if (!matchChildren(['(', ')'], argumentList.children)) {
          co.warn(
            argumentList,
            methodsWithoutArgs.includes(methodName)
              ? `Erwarte leere Parameterliste`
              : `Erwarte Zahl als Parameter`
          )
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
            co.warn(node.children[2], `Unbekannte Bedingung '${methodName}'`)
            return
          }
          context.condition = cond
        } else {
          const action = methodName2action(methodName)
          if (!action) {
            co.warn(node.children[2], `Unbekannte Methode '${methodName}'`)
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
                line: co.lineAt(node.from).number,
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
              line: co.lineAt(node.from).number,
            })
            co.appendRkCode(
              methodName.charAt(0).toUpperCase() + methodName.slice(1),
              node.from
            )
          }
        }

        return
      }

      co.warn(node, 'Erwarte Methodenaufruf')
      return
    }
    case 'ForStatement': {
      if (matchChildren(['for', 'ForSpec', 'Block'], node.children)) {
        semanticCheck(co, node.children[1], context)
        const toRemove = context.__temp_remove_from_scope_after_for
        context.__temp_remove_from_scope_after_for = undefined
        const position = co.getPosition()
        semanticCheck(co, node.children[2], context)
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
            line: co.lineAt(node.from).number,
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
          semanticCheck(co, node.children[1], context)
        }
        co.warn(node, 'Erwarte Schleife mit Rumpf')
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
            co.warn(loopVar, `Erwarte Schleifenzähler mit Typ 'int'`)
          }

          if (
            matchChildren(
              ['Definition', 'AssignOp', 'IntegerLiteral'],
              declarator.children
            )
          ) {
            loopVarName = declarator.children[0].text()
            if (context.variablesInScope.has(loopVarName)) {
              co.warn(
                declarator.children[0],
                `Variable '${loopVarName}' existiert bereits, erwarte anderen Namen`
              )
            } else {
              context.__temp_remove_from_scope_after_for = loopVarName
            }
            const initialValue = parseInt(declarator.children[2].text())
            if (initialValue != 0) {
              co.warn(declarator.children[2], `Erwarte Startwert 0`)
            }
            context.variablesInScope.add(loopVarName)
          } else {
            co.warn(
              loopVar,
              `Erwarte Schleifenzähler 'int ${safeLoopVar} = 0;'`
            )
          }
        } else {
          co.warn(loopVar, `Erwarte Schleifenzähler 'int ${safeLoopVar} = 0;'`)
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
            co.warn(loopCond.children[0], `Erwarte Variable '${loopVarName}'`)
          }
          if (loopCond.children[1].text() != '<') {
            co.warn(loopCond.children[1], `Erwarte Vergleichsoperator '<'`)
          }
          const count = parseInt(loopCond.children[2].text())
          if (count <= 0) {
            co.warn(loopCond.children[2], `Erwarte Anzahl größer null`)
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
          co.warn(
            loopCond,
            `Erwarte Schleifenbedingung der Form '${loopVarName} < 10'`
          )
        }

        const loopUpdate = node.children[4]
        if (loopUpdate.text() !== loopVarName + '++') {
          co.warn(loopUpdate, `Erwarte '${loopVarName}++'`)
        }
      } else {
        co.warn(
          node,
          `Erwarte Schleifenkopf mit 'int ${safeLoopVar} = 0; ${safeLoopVar} < 10; ${safeLoopVar}++'`
        )
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
          semanticCheck(co, node.children[2], context)
          co.appendOutput(jump)
          co.decreaseIndent()
          co.appendRkCode('endewiederhole', node.to)
        } else {
          context.expectCondition = true
          semanticCheck(co, node.children[1], context)
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
            semanticCheck(co, node.children[2], context)
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
        co.warn(node, `Erwarte Schleife mit Rumpf`)
      }
      return
    }
    case 'ParenthesizedExpression': {
      if (matchChildren(['(', 'MethodInvocation', ')'], node.children)) {
        semanticCheck(co, node.children[1], context)
      } else {
        co.warn(node, `Erwarte Bedingung`)
      }
      return
    }
    case 'IfStatement': {
      if (
        matchChildren(['if', 'ParenthesizedExpression', 'Block'], node.children)
      ) {
        context.expectCondition = true
        semanticCheck(co, node.children[1], context)
        context.expectCondition = undefined
        const condition = context.condition
        if (condition) {
          const branch: BranchOp = {
            type: 'branch',
            targetF: -1,
            targetT: -1,
            line: co.lineAt(node.from).number,
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
          semanticCheck(co, node.children[2], context)
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
        semanticCheck(co, node.children[1], context)
        context.expectCondition = undefined
        const condition = context.condition
        if (condition) {
          const branch: BranchOp = {
            type: 'branch',
            targetF: -1,
            targetT: -1,
            line: co.lineAt(node.from).number,
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
          semanticCheck(co, node.children[2], context)
          co.decreaseIndent()

          co.appendOutput(jump)
          co.appendRkCode('sonst', node.children[3].from)
          co.appendOutput(anchorElse)

          co.increaseIndent()
          semanticCheck(co, node.children[4], context)
          co.decreaseIndent()
          co.appendRkCode('endewenn', node.to)

          co.appendOutput(anchorEnd)
        }
      } else {
        co.warn(node, `Erwarte bedingte Anweisung mit Rumpf`)
      }
      return
    }
    /*
    
    WIP

    case 'LocalVariableDeclaration': {
      checkSemikolon(node)
      console.log(prettyPrintAstNode(node))
      if (
        matchChildren(
          ['PrimitiveType', 'VariableDeclarator', ';'],
          node.children
        )
      ) {
        if (node.children[0].text() !== 'int') {
          co.warn(node, `Nur Datentyp int unterstützt`)
          return
        }
      } else {
        co.warn(node, 'Fehler beim Parser von LocalVariableDeclaration')
      }
      return
    }*/
    // ADD NEW NODES HERE
  }

  if (node.isError) {
    co.warn(node, 'SYNTAXFEHLER')
    return
  }

  co.warn(node, `Dieser Syntax ist nicht implementiert: '${node.name}'`)

  //console.log('NOT IMPLEMENTED', node.name)
  //node.children.forEach((child) => semanticCheck(child, context))
}
