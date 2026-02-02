import type { Condition, CallOp, Op } from '../../../state/types'
import { CompilerOutput } from '../../helper/CompilerOutput'
import type { AstNode } from '../../helper/astNode'
import { checkSemikolon } from '../checkSemikolon'
import { compileExpression } from './compileExpression'
import { checkBlock } from './checkBlock'
import { checkForStatement } from './checkForStatement'
import { checkIfStatement } from './checkIfStatement'
import { checkLocalVariableDeclaration } from './checkLocalVariableDeclaration'
import { checkMethodDeclaration } from './checkMethodDeclaration'
import { checkWhileStatement } from './checkWhileStatement'
import { compileValExpression } from './compileValExpression'

interface Parameter {
  type: 'int'
  name: string
}

export type ValueType = 'boolean' | 'int' | 'void'

interface MethodContext {
  parameters: Parameter[]
  returnType: ValueType
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
  currentMethodReturnType: ValueType
}

export interface MethodSignature {
  name: string
  parameters: Parameter[]
  returnType: ValueType
  karolBuiltInOps?: Op[]
}

export function compileDeclarationAndStatements(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext,
) {
  switch (node.name) {
    case 'ReturnStatement': {
      // return ;
      // return <expr> ;
      const children = node.children
      // ensure trailing semicolon warning if missing
      checkSemikolon(co, node)

      const retType = context.currentMethodReturnType
      // find optional expression before last semicolon
      const exprNode = (() => {
        if (children.length >= 2) {
          // pattern 'return' ';'
          const last = children[children.length - 1]
          if (last.name === ';' && children.length === 2) return null
          if (last.name === ';' && children.length === 3) {
            // return <something> ;
            const middle = children[1]
            return middle
          }
        }
        return null
      })()

      if (retType === 'void') {
        if (exprNode) {
          // returning a value from void method: warn and drop
          if (co.noWarningsInRange(node.from, node.to)) {
            co.warn(exprNode, 'Erwarte kein Rückgabewert in void-Methode')
          }
          // still compile expression to keep parser progress and pop it
          context.expectVoid = false
          compileExpression(co, exprNode, context)
        }
        co.appendOutput({ type: 'return' })
      } else {
        if (exprNode) {
          // must return typed value
          compileValExpression(retType, co, exprNode, context)
          co.appendOutput({ type: 'return', withValue: true })
        } else {
          // missing value: warn and supply default 0/false
          if (co.noWarningsInRange(node.from, node.to)) {
            co.warn(node, `Erwarte Rückgabewert vom Typ ${retType}`)
          }
        }
      }
      return
    }
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
