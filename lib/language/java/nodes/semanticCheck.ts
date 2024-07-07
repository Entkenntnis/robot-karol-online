import { Condition, CallOp } from '../../../state/types'
import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { checkAssignmentExpression } from './checkAssignmentExpression'
import { checkBlock } from './checkBlock'
import { checkExpressionStatement } from './checkExpressionStatement'
import { checkForStatement } from './checkForStatement'
import { checkIfStatement } from './checkIfStatement'
import { checkLocalVariableDeclaration } from './checkLocalVariableDeclaration'
import { checkMethodDeclaration } from './checkMethodDeclaration'
import { checkMethodInvocation } from './checkMethodInvocation'
import { checkParenthesizedExpression } from './checkParenthesizedExpression'
import { checkUpdateExpression } from './checkUpdateExpression'
import { checkWhileStatement } from './checkWhileStatement'

interface Parameter {
  type: 'int'
  name: string
}

interface MethodContext {
  parameters: Parameter[]
}

export type MethodContexts = Record<string, MethodContext>

export interface SemantikCheckContext {
  robotName: string
  variablesInScope: Set<string>
  expectCondition?: boolean
  condition?: Condition
  availableMethods: Map<string, string[]>
  methodContexts: MethodContexts
  callOps: [string, CallOp][]
}

export function semanticCheck(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
) {
  switch (node.name) {
    case 'MethodDeclaration': {
      checkMethodDeclaration(co, node, context)
      return
    }
    case 'Block': {
      checkBlock(co, node, context)
      return
    }
    case 'ExpressionStatement': {
      checkExpressionStatement(co, node, context)
      return
    }
    case ';': {
      co.warn(node, 'Erwarte Methodenaufruf')
      return
    }
    case 'MethodInvocation': {
      checkMethodInvocation(co, node, context)
      return
    }
    case 'ForStatement': {
      checkForStatement(co, node, context)
      return
    }
    case 'WhileStatement': {
      checkWhileStatement(co, node, context)
      return
    }
    case 'ParenthesizedExpression': {
      checkParenthesizedExpression(co, node, context)
      return
    }
    case 'IfStatement': {
      checkIfStatement(co, node, context)
      return
    }
    case 'LocalVariableDeclaration': {
      checkLocalVariableDeclaration(co, node, context)
      return
    }
    case 'AssignmentExpression': {
      checkAssignmentExpression(co, node, context)
      return
    }
    case 'UpdateExpression': {
      checkUpdateExpression(co, node, context)
      return
    }
  }

  if (node.isError) {
    co.warn(node, 'SYNTAXFEHLER')
    return
  }

  co.warn(node, `Dieser Syntax ist nicht implementiert: '${node.name}'`)
}
