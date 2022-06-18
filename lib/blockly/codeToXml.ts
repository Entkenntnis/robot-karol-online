import { parser } from '../codemirror/parser/parser'
import { Tree, TreeCursor } from '@lezer/common'

export function codeToXml(code: string): string {
  const tree: Tree = parser.parse(code)
  return parseTree(tree.cursor(), code)
}

function parseTree(
  cursor: TreeCursor,
  code: string,
  breaker?: (type: string) => boolean
): string {
  let callbackStack: ((val: string) => string)[] = []

  do {
    console.log(cursor.type.name)

    const t = cursor.type.name
    const c = code.substring(cursor.from, cursor.to)

    if (breaker) {
      console.log('breaker test', t)
      if (breaker(t)) {
        console.log('break', t)
        break
      }
    }

    if (t == 'Program') {
      callbackStack.push(
        (inner) => `<xml xmlns="https://developers.google.com/blockly/xml">
      ${inner}</xml>`
      )
    } else if (t == 'Command') {
      let count = ''
      let blockType = ''
      if (c.includes('(') && !c.includes('()')) {
        cursor.next()
        count = code.substring(cursor.from, cursor.to)
        //console.log(cursor.type.name, 'should be Parameter', count)
      }
      if (c.includes('schritt')) {
        blockType = 'step'
      }
      if (c.includes('hinlegen')) {
        blockType = 'laydown'
      }
      if (c.includes('aufheben')) {
        blockType = 'pickup'
      }
      if (c.includes('linksdrehen')) {
        blockType = 'turnleft'
        count = ''
      }
      if (c.includes('rechtsdrehen')) {
        blockType = 'turnright'
        count = ''
      }
      if (c.includes('markesetzen')) {
        blockType = 'setmarker'
        count = ''
      }
      if (c.includes('markelöschen')) {
        blockType = 'deletemarker'
        count = ''
      }
      if (c.includes('beenden')) {
        callbackStack.push(
          buildClosureWithoutInner(
            'stop',
            '',
            callbackStack.length == 1 ? 'x="40" y="30"' : undefined
          )
        )
        continue
      }
      callbackStack.push(
        buildClosure(
          blockType,
          count,
          callbackStack.length == 1 ? 'x="40" y="30"' : undefined
        )
      )
    } else if (t == 'Repeat') {
      cursor.next() // RepeatStart
      cursor.next() //
      if (cursor.type.name == 'Times') {
        const times = code.substring(cursor.from, cursor.to)
        cursor.next() // RepeatTimesKey
        cursor.next() // -> expression
        const inner = parseTree(cursor, code, (t) => t == 'RepeatEnd')
        //while ((cursor.type.name as string) !== 'RepeatEnd') cursor.next()
        console.log('inner', inner)
        callbackStack.push(
          buildRepeatTimes(
            times,
            inner,
            callbackStack.length == 1 ? 'x="40" y="30"' : undefined
          )
        )
        continue
      } else {
        cursor.next() // Condition
        const condition = code.substring(cursor.from, cursor.to)
        cursor.next()
        const inner = parseTree(cursor, code, (t) => t == 'RepeatEnd')
        //while (cursor.type.name !== 'RepeatEnd') cursor.next()
        callbackStack.push(
          buildRepeatWhile(
            buildCondition(condition),
            inner,
            callbackStack.length == 1 ? 'x="40" y="30"' : undefined
          )
        )
        continue
      }
    } else if (t == 'IfThen') {
      cursor.next() // IfKey
      cursor.next() // condition
      const condition = code.substring(cursor.from, cursor.to)
      cursor.next() // ThenKey
      if (!c.includes('sonst')) {
        const inner = parseTree(cursor, code, (t) => t == 'IfEndKey')
        //while (cursor.type.name !== 'IfEndKey') cursor.next()
        callbackStack.push(
          buildIf(
            buildCondition(condition),
            inner,
            callbackStack.length == 1 ? 'x="40" y="30"' : undefined
          )
        )
        continue
      } else {
        const inner = parseTree(cursor, code, (t) => t == 'ElseKey')
        //while (cursor.type.name !== 'ElseKey') cursor.next()
        const inner2 = parseTree(cursor, code, (t) => t == 'IfEndKey')
        //while ((cursor.type.name as string) !== 'IfEndKey') cursor.next()
        callbackStack.push(
          buildIfElse(
            buildCondition(condition),
            inner,
            inner2,
            callbackStack.length == 1 ? 'x="40" y="30"' : undefined
          )
        )
        continue
      }
    }
  } while (cursor.next())

  let output = ''
  for (let i = callbackStack.length - 1; i >= 0; i--) {
    output = callbackStack[i](output)
    //console.log(output)
  }
  return output
}

function buildClosure(blockType: string, count: string, attrs?: string) {
  return (inner: string) =>
    `<block type="${blockType}" ${attrs ?? ''}>${
      count ? `<field name="COUNT">${count}</field>` : ''
    }<next>${inner}</next></block>`
}

function buildClosureWithoutInner(
  blockType: string,
  count: string,
  attrs?: string
) {
  return () =>
    `<block type="${blockType}" ${attrs ?? ''}>${
      count ? `<field name="COUNT">${count}</field>` : ''
    }</block>`
}

function buildRepeatTimes(times: string, statements: string, attr?: string) {
  return (inner: String) => `<block type="repeat_times" ${
    attr ?? ''
  }><field name="COUNT">${times}</field>
  ${
    statements ? `<statement name="STATEMENTS">${statements}</statement>` : ''
  }${inner ? `<next>${inner}</next>` : ''}</block>`
}

function buildRepeatWhile(
  condition: string,
  statements: string,
  attr?: string
) {
  return (inner: String) => `<block type="while_do" ${
    attr ?? ''
  }><value name="CONDITION">${condition}</value>
  ${
    statements ? `<statement name="STATEMENTS">${statements}</statement>` : ''
  }${inner ? `<next>${inner}</next>` : ''}</block>`
}

function buildIf(condition: string, statements: string, attr?: string) {
  return (inner: String) => `<block type="if_then" ${
    attr ?? ''
  }><value name="CONDITION">${condition}</value>
  ${
    statements ? `<statement name="STATEMENTS">${statements}</statement>` : ''
  }${inner ? `<next>${inner}</next>` : ''}</block>`
}
function buildIfElse(
  condition: string,
  statements: string,
  statements2: string,
  attr?: string
) {
  return (inner: String) => `<block type="if_then_else" ${
    attr ?? ''
  }><value name="CONDITION">${condition}</value>
  ${
    statements ? `<statement name="STATEMENTS">${statements}</statement>` : ''
  }${
    statements2
      ? `<statement name="STATEMENTS_2">${statements2}</statement>`
      : ''
  }${inner ? `<next>${inner}</next>` : ''}</block>`
}

function buildCondition(type: string) {
  if (type == 'istwand') return `<block type="is_wall"></block>`
  if (type == 'nichtistwand') return `<block type="isn't_wall"></block>`
  if (type == 'istziegel') return `<block type="is_brick"></block>`
  if (type == 'nichtistziegel') return `<block type="isn't_brick"></block>`
  if (type == 'istmarke') return `<block type="is_marker"></block>`
  if (type == 'nichtistmarke') return `<block type="isn't_marker"></block>`
  return ''
}
