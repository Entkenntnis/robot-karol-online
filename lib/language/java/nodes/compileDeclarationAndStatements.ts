import { Condition, CallOp, Op } from '../../../state/types'
import { CompilerOutput } from '../../helper/CompilerOutput'
import { AstNode } from '../../helper/astNode'
import { checkSemikolon } from '../checkSemikolon'
import { compileExpression } from './compileExpression'
import { checkBlock } from './checkBlock'
import { checkForStatement } from './checkForStatement'
import { checkIfStatement } from './checkIfStatement'
import { checkLocalVariableDeclaration } from './checkLocalVariableDeclaration'
import { checkMethodDeclaration } from './checkMethodDeclaration'
import { checkWhileStatement } from './checkWhileStatement'

interface Parameter {
  type: 'int'
  name: string
}

export type ValueType = 'boolean' | 'int' | 'void'

interface MethodContext {
  parameters: Parameter[]
}

export type MethodContexts = Record<string, MethodContext>

export interface SemantikCheckContext {
  robotName: string
  variablesInScope: Map<string, ValueType>
  expectCondition?: boolean
  condition?: Condition
  availableMethods: Map<string, string[]>
  methodContexts: MethodContexts
  callOps: [string, CallOp][]
  expectVoid?: boolean
}

export interface MethodSignature {
  name: string
  parameters: Parameter[]
  returnType: ValueType
  karolBuiltInOps?: Op[]
}

// rename to something other, like
// parseDeclarationsAndStatements
export function compileDeclarationAndStatements(
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
      context.expectVoid = true
      const t = compileExpression(co, node.children[0], context)
      if (t != 'void') {
        co.appendOutput({ type: 'pop' })
      }
      checkSemikolon(co, node)
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
    case 'IfStatement': {
      checkIfStatement(co, node, context)
      return
    }
    case 'LocalVariableDeclaration': {
      checkLocalVariableDeclaration(co, node, context)
      return
    }
    case ';': {
      // friendly message if there is empty statement
      co.warn(node, 'Erwarte Methodenaufruf')
      return
    }
  }

  if (node.isError) {
    co.warn(node, 'SYNTAXFEHLER')
    return
  }

  co.warn(node, `Dieser Syntax ist nicht implementiert: '${node.name}'`)
}
