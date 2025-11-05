import { CallOp } from '../../../state/types'
import { AstNode } from '../../helper/astNode'
import { CompilerOutput } from '../../helper/CompilerOutput'
import { matchChildren } from '../../helper/matchChildren'
import { expressionNodes, parseExpression } from '../parseExpression'
import { SemantikCheckContext } from './semanticCheck'

export function checkMethodInvocation(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  // custom methods - this is properly contained and tidy
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
          context.expectVoid = undefined
          parseExpression(co, paramEl, context)
          if (context.valueType != 'int') {
            co.warn(paramEl, 'Erwarte int-Wert')
          }
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
      co.warn(node, `Unbekannte Methode`)
    }
    // check for return type -> future
    context.valueType = 'void'
    return
  }

  // we have a built-in karol method
  if (
    matchChildren(
      ['Identifier', '.', 'MethodName', 'ArgumentList'],
      node.children
    ) &&
    matchChildren(['Identifier'], node.children[2].children)
  ) {
    // TODO
    // An diesem Punkt wäre es nun gut, eine allgemeine Form von Funktionsdefinition zu haben
    // Eine Art Grundgerüst, dass ich eventuell auch für andere Systeme wiederverwenden kann
    // Ich muss die Parameter Anzahl und Typen parsen und auf den Stack tun
    // d.h. in der Deklaration, weil dass über call übertragen wird
    // --- Dann kommt der Client Code, der emitted wird im Sandwich
    // und dann muss die VM den Returnwert in den ursprünglichen Frame zurückkopieren -> dazu fehlt noch was in der VM
    //
    // Eigentlich kann ich das dann viel mehr vereinen, anstatt dass so getrennt zu handhaben
  }

  co.warn(node, 'Erwarte Methodenaufruf')
}
