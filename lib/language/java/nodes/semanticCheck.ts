import { Condition, CallOp, JumpOp, BranchOp, Op } from '../../../state/types'
import { AnchorOp, CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { conditionToRK } from '../../helper/conditionToRk'
import { matchChildren } from '../../helper/matchChildren'
import { methodName2action } from '../../helper/methodName2action'
import { methodsWithoutArgs } from '../../helper/methodsWithoutArgs'
import { checkBlock } from './checkBlock'
import { checkExpressionStatement } from './checkExpressionStatement'
import { checkForSpec } from './checkForSpec'
import { checkForStatement } from './checkForStatement'
import { checkIfStatement } from './checkIfStatement'
import { checkLocalVariableDeclaration } from './checkLocalVariableDeclaration'
import { checkMethodDeclaration } from './checkMethodDeclaration'
import { checkMethodInvocation } from './checkMethodInvocation'
import { checkParenthesizedExpression } from './checkParenthesizedExpression'
import { checkWhileStatement } from './checkWhileStatement'

export interface SemantikCheckContext {
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
    case 'ForSpec': {
      checkForSpec(co, node, context)
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
  }

  if (node.isError) {
    co.warn(node, 'SYNTAXFEHLER')
    return
  }

  co.warn(node, `Dieser Syntax ist nicht implementiert: '${node.name}'`)
}
