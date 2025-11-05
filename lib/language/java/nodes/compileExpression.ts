import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode, prettyPrintAstNode } from '../../helper/astNode'
import { matchChildren } from '../../helper/matchChildren'
import { compileValExpression } from './compileValExpression'
import { checkMethodInvocation } from './checkMethodInvocation'
import { SemantikCheckContext } from './compileDeclarationAndStatements'

export const expressionNodes = [
  'IntegerLiteral',
  'BooleanLiteral',
  'Identifier',
  'BinaryExpression',
  'UnaryExpression',
  'ParenthesizedExpression',
  'UpdateExpression',
  'AssignmentExpression',
  'MethodInvocation',
]

const compareOps = {
  '==': 'equal',
  '<=': 'less-equal',
  '<': 'less-than',
  '>': 'greater-than',
  '>=': 'greater-equal',
  '!=': 'unequal',
}

export function compileExpression(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  if (node.name === 'IntegerLiteral') {
    if (context.expectVoid) {
      context.valueType = 'void'
      return
    }
    co.appendOutput({ type: 'constant', value: parseInt(node.text()) })
    context.valueType = 'int'
    return
  }

  if (node.name === 'BooleanLiteral') {
    if (context.expectVoid) {
      context.valueType = 'void'
      return
    }
    co.appendOutput({
      type: 'constant',
      value: node.text().trim() == 'true' ? 1 : 0,
    })
    context.valueType = 'boolean'
    return
  }

  if (node.name === 'Identifier') {
    co.activateProMode()
    if (context.expectVoid) {
      context.valueType = 'void'
      return
    }
    const variable = node.text()
    if (!context.variablesInScope.has(variable)) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      context.valueType = 'void'
      return
    }
    co.appendOutput({ type: 'load', variable })
    // HARDCODED: all variables are int
    context.valueType = 'int'
    return
  }

  if (node.name === 'BinaryExpression') {
    co.activateProMode()
    if (
      matchChildren(
        [expressionNodes, 'ArithOp', expressionNodes],
        node.children
      )
    ) {
      const op = node.children[1].text()
      if (!['+', '-', '*', '/', '%'].includes(op)) {
        co.warn(node.children[1], `Die Rechenart ${op} wird nicht unterstützt`)
        context.valueType = 'void'
        return
      }

      const expr1 = node.children[0]
      const expr2 = node.children[2]
      compileValExpression('int', co, expr1, context)
      compileValExpression('int', co, expr2, context)
      co.appendOutput({
        type: 'operation',
        kind:
          op === '+'
            ? 'add'
            : op === '-'
            ? 'sub'
            : op === '*'
            ? 'mult'
            : op === '/'
            ? 'div'
            : 'mod',
      })
      context.valueType = 'int'
      return
    }
    if (
      matchChildren(
        [expressionNodes, 'CompareOp', expressionNodes],
        node.children
      )
    ) {
      // @ts-ignore We check it in next line
      const kind = compareOps[node.children[1].text()]
      // console.log(comparison.children[1].text(), kind)
      if (!kind) {
        co.warn(node.children[1], `Unbekannter Vergleichsoperator`)
        return
      }
      compileValExpression('int', co, node.children[0], context)
      compileValExpression('int', co, node.children[2], context)
      co.appendOutput({ type: 'compare', kind })
      context.valueType = 'boolean'
      return
    }
  }

  if (node.name === 'UnaryExpression') {
    co.activateProMode()
    if (matchChildren(['ArithOp', expressionNodes], node.children)) {
      if (node.children[0].text() !== '-') {
        co.warn(node.children[0], `Es wird nur Negation unterstützt`)
      }
      compileValExpression('int', co, node.children[1], context)
      co.appendOutput({ type: 'constant', value: -1 })
      co.appendOutput({ type: 'operation', kind: 'mult' })
      context.valueType = 'int'
      return
    }
    if (matchChildren(['LogicOp', expressionNodes], node.children)) {
      if (node.children[0].text() !== '!') {
        co.warn(node.children[0], `Es wird nur ! hier unterstützt`)
      }
      compileValExpression('boolean', co, node.children[1], context)
      co.appendOutput({ type: 'constant', value: 1 })
      co.appendOutput({ type: 'operation', kind: 'add' })
      co.appendOutput({ type: 'constant', value: 2 })
      co.appendOutput({ type: 'operation', kind: 'mod' })
      context.valueType = 'boolean'
      return
    }
  }

  if (node.name === 'ParenthesizedExpression') {
    if (matchChildren(['(', expressionNodes, ')'], node.children)) {
      compileExpression(co, node.children[1], context)
      // don't change context and pass through transparently
      return
    }
  }

  if (node.name == 'UpdateExpression') {
    co.activateProMode()
    let varName = ''
    let isIncr = true
    let postfix = false

    if (matchChildren(['UpdateOp', 'Identifier'], node.children)) {
      varName = node.children[1].text()
      isIncr = node.children[0].text() == '++'
    } else if (matchChildren(['Identifier', 'UpdateOp'], node.children)) {
      postfix = true
      varName = node.children[0].text()
      isIncr = node.children[1].text() == '++'
    } else {
      co.warn(node, 'Fehler in UpdateExpression')
      context.valueType = 'void'
      return
    }

    if (!context.variablesInScope.has(varName)) {
      co.warn(node, `Variable ${varName} nicht bekannt`)
      context.valueType = 'void'
      return
    }

    let putDataOnStack = false
    if (!context.expectVoid) {
      context.valueType = 'int'
      putDataOnStack = true
    }

    if (putDataOnStack && postfix) {
      co.appendOutput({ type: 'load', variable: varName })
    }
    co.appendOutput({ type: 'load', variable: varName })
    co.appendOutput({ type: 'constant', value: 1 })
    co.appendOutput({ type: 'operation', kind: isIncr ? 'add' : 'sub' })
    co.appendOutput({ type: 'store', variable: varName })
    if (putDataOnStack && !postfix) {
      co.appendOutput({ type: 'load', variable: varName })
    }
    if (putDataOnStack) {
      context.valueType = 'int'
    } else {
      context.valueType = 'void'
    }
    return
  }

  if (node.name == 'AssignmentExpression') {
    co.activateProMode()
    if (
      !matchChildren(['Identifier', 'AssignOp', expressionNodes], node.children)
    ) {
      co.warn(node, 'Fehler beim Parser der Zuweisung')
      context.valueType = 'void'
      return
    }

    const variable = node.children[0].text()

    if (!context.variablesInScope.has(variable)) {
      co.warn(node, `Variable ${variable} nicht bekannt`)
      context.valueType = 'void'
      return
    }

    const op = node.children[1].text()
    if (op != '=') {
      co.warn(node.children[1], `Zuweisung ${op} nicht unterstützt`)
      context.valueType = 'void'
      return
    }

    const myExpectVoid = context.expectVoid
    compileValExpression('int', co, node.children[2], context)
    co.appendOutput({ type: 'store', variable })
    if (!myExpectVoid) {
      co.appendOutput({ type: 'load', variable })
    }
    context.valueType = myExpectVoid ? 'void' : 'int'
    return
  }

  if (node.name == 'MethodInvocation') {
    checkMethodInvocation(co, node, context)
    return
  }

  if (node.text().trim() == `${context.robotName}.`) {
    co.warn__internal({
      from: node.from,
      to: Math.min(node.to, co.lineAt(node.from).to), // cap error at end of line
      message: `Erwarte Methodenaufruf nach '${context.robotName}.'`,
    })
    context.valueType = 'void'
    return
  }

  co.warn(node, `Ausdruck ${node.name} konnte nicht eingelesen werden.`)
}
