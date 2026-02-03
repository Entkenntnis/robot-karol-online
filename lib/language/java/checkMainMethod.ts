import { CompilerOutput } from '../helper/CompilerOutput'
import type { AstNode } from '../helper/astNode'
import { warnForUnexpectedNodes } from '../helper/warnForUnexpectedNodes'

export function checkMainMethod(co: CompilerOutput, main: AstNode) {
  const definition = main.children.find((child) => child.name == 'Definition')! // parser will always emit subtree with definition

  if (!main.children.find((child) => child.name == 'void')) {
    co.warn(definition, "Erwarte Rückgabetyp 'void'")
  }

  const formalParameters = main.children.find(
    (child) => child.name == 'FormalParameters',
  )! // parser will allways emit formal parameters

  warnForUnexpectedNodes(
    co,
    formalParameters.children.filter((child) => child.isError),
    formalParameters,
  )

  if (
    formalParameters.children.some((child) => child.name == 'FormalParameter')
  ) {
    co.warn(definition, "Methode 'main' erwartet keine Parameter")
  }

  const block = main.children.find((child) => child.name == 'Block')

  if (!block) {
    co.warn(definition, "Erwarte Rumpf der Methode 'main'")
    if (main.children[main.children.length - 1].isError) {
      main.children.pop()
    }
  }

  const unwanted = main.children.filter(
    (child) =>
      ![
        'void',
        'TypeName',
        'PrimitiveType',
        'Definition',
        'FormalParameters',
        'Block',
      ].includes(child.name),
  )

  warnForUnexpectedNodes(co, unwanted, main)
}
