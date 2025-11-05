import { CallOp, Op } from '../../../state/types'
import { AstNode } from '../../helper/astNode'
import { CompilerOutput } from '../../helper/CompilerOutput'
import { matchChildren } from '../../helper/matchChildren'
import { compileValExpression } from './compileValExpression'
import { expressionNodes, compileExpression } from './compileExpression'
import {
  MethodSignature,
  SemantikCheckContext,
  ValueType,
} from './compileDeclarationAndStatements'

export function checkMethodInvocation(
  co: CompilerOutput,
  node: AstNode,
  context: SemantikCheckContext
): ValueType {
  let sig: MethodSignature | null = null
  let argList: AstNode | null = null

  // ========= 1. Step: populate sig
  function countArguments() {
    let num = 0
    for (const paramEl of argList!.children) {
      if (paramEl.name == '(' || paramEl.name == ')' || paramEl.name == ',') {
        continue
      }
      num++
    }
    return num
  }

  if (matchChildren(['MethodName', 'ArgumentList'], node.children)) {
    const name = node.children[0].text()
    argList = node.children[1]
    const numArgs = countArguments()

    if (context.availableMethods.has(name)) {
      // Method context not available yet
      const expectedArgsLength = context.availableMethods.get(name)?.length ?? 0
      if (expectedArgsLength == numArgs) {
        sig = {
          name,
          parameters: context.availableMethods
            .get(name)!
            .map((name) => ({ name, type: 'int' })),
          returnType: context.methodContexts[name]?.returnType ?? 'void',
        }
      } else {
        co.warn(
          node.children[1],
          `Falsche Anzahl Argumente, erwarte ${expectedArgsLength}`
        )
        return 'void'
      }
    } else {
      // friendly error message: check for possible built-in
      if (builtins.find((el) => el.name == name)) {
        co.warn(node, `Erwarte Punktnotation 'karol.'`)
        return 'void'
      }
      co.warn(node, `Unbekannte Methode`)
      return 'void'
    }
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

    const methodName = node.children[2].children[0].text()
    argList = node.children[3]
    const numArgs = countArguments()
    sig =
      builtins.find((el) => {
        return (
          el.name == methodName &&
          el.karolBuiltInOps &&
          el.parameters.length == numArgs // <-- add more sophisticated version with better check
        )
      }) ?? null
  }

  if (argList && argList.children.some((child) => child.isError)) {
    co.warn__internal({
      from: argList.from,
      to: Math.min(argList.to, co.lineAt(argList.from).to),
      message: `Bitte runde Klammer schließen`,
    })
    return 'void'
  }

  if (!sig || !argList) {
    co.warn(node, `Keine passende Methode gefunden, prüfe Name und Argumente`)
    return 'void'
  }

  // Step 2: Ok, now we are talking.
  if (sig.parameters.length > 0) {
    // handle parameters
    for (const paramEl of argList.children) {
      if (paramEl.name == '(' || paramEl.name == ')' || paramEl.name == ',') {
        continue
      }
      compileValExpression('int', co, paramEl, context) // <-- TODO: adjust types
    }
  }
  // parameters are all parsed on the stack

  // Step 3: invocation!!
  if (sig.karolBuiltInOps) {
    // This will destroy Infinity, uff!!
    const newOp: Op = JSON.parse(JSON.stringify(sig.karolBuiltInOps[0]))
    if (sig.returnType == 'void') {
      // all except beenden (<-- VM would crash if target = null)
      if (sig.name != 'beenden') {
        newOp.line = co.lineAt(node.from).number
      } else if (newOp.type == 'jump') {
        newOp.target = Infinity
      }
      co.appendRkCode(
        sig.name.charAt(0).toUpperCase() +
          sig.name.slice(1) +
          (sig.parameters.length > 0
            ? `(${parseInt(argList.children[1].text())})`
            : ''),
        node.from
      )
    }
    co.appendOutput(newOp)
    // BEWARE: rkcode generation for conditions have to be handled downstream
    // provide brick-count to help
    if (newOp.type == 'sense' && newOp.condition.type == 'brick_count') {
      newOp.condition.count = parseInt(argList.children[1].text())
    }
  } else {
    // call into custom method
    const op: CallOp = {
      type: 'call',
      target: -1,
      line: co.lineAt(node.from).number,
      arguments: sig.parameters.length > 0 ? sig.parameters.length : undefined,
    }
    co.appendOutput(op)
    co.appendRkCode(sig.name, node.from)
    context.callOps.push([sig.name, op])
  }

  return sig.returnType
}

const builtins: MethodSignature[] = [
  // Actions
  {
    name: 'schritt',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'action', command: 'forward' }],
  },
  {
    name: 'schritt',
    parameters: [{ name: 'count', type: 'int' }],
    returnType: 'void',
    karolBuiltInOps: [
      { type: 'action', command: 'forward', useParameterFromStack: true },
    ],
  },
  {
    name: 'linksDrehen',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'action', command: 'left' }],
  },
  {
    name: 'linksDrehen',
    parameters: [{ name: 'count', type: 'int' }],
    returnType: 'void',
    karolBuiltInOps: [
      { type: 'action', command: 'left', useParameterFromStack: true },
    ],
  },
  {
    name: 'rechtsDrehen',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'action', command: 'right' }],
  },
  {
    name: 'rechtsDrehen',
    parameters: [{ name: 'count', type: 'int' }],
    returnType: 'void',
    karolBuiltInOps: [
      { type: 'action', command: 'right', useParameterFromStack: true },
    ],
  },
  {
    name: 'hinlegen',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'action', command: 'brick' }],
  },
  {
    name: 'hinlegen',
    parameters: [{ name: 'count', type: 'int' }],
    returnType: 'void',
    karolBuiltInOps: [
      { type: 'action', command: 'brick', useParameterFromStack: true },
    ],
  },
  {
    name: 'aufheben',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'action', command: 'unbrick' }],
  },
  {
    name: 'aufheben',
    parameters: [{ name: 'count', type: 'int' }],
    returnType: 'void',
    karolBuiltInOps: [
      { type: 'action', command: 'unbrick', useParameterFromStack: true },
    ],
  },
  {
    name: 'markeSetzen',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'action', command: 'setMark' }],
  },
  {
    name: 'markeLöschen',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'action', command: 'resetMark' }],
  },
  {
    name: 'beenden',
    parameters: [],
    returnType: 'void',
    karolBuiltInOps: [{ type: 'jump', target: Infinity }],
  },

  // Senses
  {
    name: 'istWand',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'wall', negated: false } },
    ],
  },
  {
    name: 'nichtIstWand',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'wall', negated: true } },
    ],
  },
  {
    name: 'istZiegel',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'brick', negated: false } },
    ],
  },
  {
    name: 'istZiegel',
    parameters: [{ name: 'count', type: 'int' }],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'brick_count', negated: false } },
    ],
  },
  {
    name: 'nichtIstZiegel',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'brick', negated: true } },
    ],
  },
  {
    name: 'nichtIstZiegel',
    parameters: [{ name: 'count', type: 'int' }],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'brick_count', negated: true } },
    ],
  },
  {
    name: 'istMarke',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'mark', negated: false } },
    ],
  },
  {
    name: 'nichtIstMarke',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'mark', negated: true } },
    ],
  },
  {
    name: 'istNorden',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'north', negated: false } },
    ],
  },
  {
    name: 'nichtIstNorden',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'north', negated: true } },
    ],
  },
  {
    name: 'istOsten',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'east', negated: false } },
    ],
  },
  {
    name: 'nichtIstOsten',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'east', negated: true } },
    ],
  },
  {
    name: 'istSüden',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'south', negated: false } },
    ],
  },
  {
    name: 'nichtIstSüden',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'south', negated: true } },
    ],
  },
  {
    name: 'istWesten',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'west', negated: false } },
    ],
  },
  {
    name: 'nichtIstWesten',
    parameters: [],
    returnType: 'boolean',
    karolBuiltInOps: [
      { type: 'sense', condition: { type: 'west', negated: true } },
    ],
  },
]
