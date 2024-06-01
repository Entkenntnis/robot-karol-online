import { CallOp, Condition } from '../../../state/types'
import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { methodName2action } from '../../helper/methodName2action'
import { methodsWithoutArgs } from '../../helper/methodsWithoutArgs'
import { expressionNodes, parseExpression } from '../parseExpression'
import { SemantikCheckContext } from './semanticCheck'

export function checkMethodInvocation(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (matchChildren(['MethodName', 'ArgumentList'], node.children)) {
    const name = node.children[0].text()
    if (context.availableMethods.has(name)) {
      const argumentList = node.children[1]
      let numOfParams = 0
      for (const paramEl of argumentList.children) {
        if (paramEl.name == '(' || paramEl.name == ')' || paramEl.name == ',') {
          continue
        }
        if (expressionNodes.includes(paramEl.name)) {
          parseExpression(co, paramEl, context)
          numOfParams++
        }
      }
      const expectedParams = context.availableMethods.get(name)?.length ?? 0
      if (expectedParams !== numOfParams) {
        co.warn(
          argumentList,
          `Falsche Anzahl Argumente, erwarte ${expectedParams}`
        )
      } else {
        const op: CallOp = {
          type: 'call',
          target: -1,
          line: co.lineAt(node.from).number,
          arguments: numOfParams > 0 ? numOfParams : undefined,
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
    let variableParameter = false

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
    } else if (
      matchChildren(['(', expressionNodes, ')'], argumentList.children) &&
      !methodsWithoutArgs.includes(methodName)
    ) {
      co.activateProMode()
      parseExpression(co, argumentList.children[1], context)

      variableParameter = true
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

      if (variableParameter) {
        //co.appendOutput({ type: 'load', variable: variableParameter })
        co.appendOutput({
          type: 'action',
          command: action,
          line: co.lineAt(node.from).number,
          useParameterFromStack: true,
        })
      } else if (!isNaN(integerArgument)) {
        co.appendOutput({ type: 'constant', value: integerArgument })
        co.appendOutput({
          type: 'action',
          command: action,
          line: co.lineAt(node.from).number,
          useParameterFromStack: true,
        })
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
}
