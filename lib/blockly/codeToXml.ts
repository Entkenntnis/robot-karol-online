import { Tree, TreeCursor } from '@lezer/common'
import { CmdBlockPositions } from '../state/types'
import { deKeywords, enKeywords } from '../language/compiler'
import { getParserWithLng } from '../codemirror/parser/get-parser-with-lng'

export function codeToXml(
  code: string,
  cmdBlockPositions: CmdBlockPositions,
  systemLng: 'de' | 'en'
): string {
  // blocks are always showing in the current lng, so we parse the code according to
  // detected lng and convert it if necessary
  const lng = detectLng(code.toLowerCase()) ?? systemLng
  const keywords = lng == 'de' ? deKeywords : enKeywords
  const tree: Tree = getParserWithLng(lng).parse(code)
  return parseTree(tree.cursor(), code)

  function parseTree(
    cursor: TreeCursor,
    code: string,
    breaker?: (type: string) => boolean
  ): string {
    let callbackStack: ((val: string) => string)[] = []

    let cmds: string[] = []
    let xOffset = 200

    do {
      //console.log(cursor.type.name)

      const t = cursor.type.name
      const c = code.substring(cursor.from, cursor.to).toLowerCase()

      if (breaker) {
        //console.log('breaker test', t)
        if (breaker(t)) {
          //console.log('break', t)
          break
        }
      }

      if (t == 'Program') {
        callbackStack.push(
          (inner) => `<xml xmlns="https://developers.google.com/blockly/xml">
      ${inner}${cmds.join('')}</xml>`
        )
      } else if (t == 'Cmd') {
        nextIgnoreComment(cursor) // CmdStart
        nextIgnoreComment(cursor) // CmdName
        const name = code.substring(cursor.from, cursor.to)
        cursor.next()
        const statements = parseTree(cursor, code, (t) => t == 'CmdEnd')
        let x = xOffset
        let y = 7
        if (cmdBlockPositions[name]) {
          x = cmdBlockPositions[name].x
          y = cmdBlockPositions[name].y
        } else {
          xOffset += 200
        }
        cmds.push(
          `<block type="define_command" x="${x}" y="${y}"><field name="COMMAND">${name}</field>${
            statements
              ? `<statement name="STATEMENTS">${statements}</statement>`
              : ''
          }</block>`
        )
      } else if (t == 'Command') {
        let count = ''
        let blockType = ''
        if (c.includes('(') && !c.includes('()')) {
          while (cursor.type.name !== 'Parameter') {
            cursor.next()
          }
          count = code.substring(cursor.from, cursor.to)
          //console.log(cursor.type.name, 'should be Parameter', count)
        }
        if (c.includes(keywords.schritt)) {
          blockType = 'step'
        }
        if (c.includes(keywords.hinlegen)) {
          blockType = 'laydown'
        }
        if (c.includes(keywords.aufheben)) {
          blockType = 'pickup'
        }
        if (c.includes(keywords.linksdrehen)) {
          blockType = 'turnleft'
          //count = ''
        }
        if (c.includes(keywords.rechtsdrehen)) {
          blockType = 'turnright'
          //count = ''
        }
        if (c.includes(keywords.markesetzen)) {
          blockType = 'setmarker'
          count = ''
        }
        if (c.includes(keywords.markelöschen)) {
          blockType = 'deletemarker'
          count = ''
        }
        if (c.includes(keywords.beenden)) {
          callbackStack.push(
            buildClosureWithoutInner(
              'stop',
              ''
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
            )
          )
          continue
        }
        callbackStack.push(
          buildClosure(
            blockType,
            count
            //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
          )
        )
      } else if (t == 'CustomRef') {
        callbackStack.push(
          buildCustomCommand(code.substring(cursor.from, cursor.to))
        )
      } else if (t == 'Repeat') {
        nextIgnoreComment(cursor) // RepeatStart
        nextIgnoreComment(cursor) //
        if (cursor.type.name == 'RepeatAlwaysKey') {
          const inner = parseTree(cursor, code, (t) => t == 'RepeatEnd')
          //while ((cursor.type.name as string) !== 'RepeatEnd') cursor.next()
          //console.log('inner', inner)
          callbackStack.push(
            buildRepeatAlways(
              inner
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
            )
          )
          continue
        } else if (cursor.type.name == 'Times') {
          const times = code.substring(cursor.from, cursor.to)
          //nextIgnoreComment(cursor) // RepeatTimesKey
          const inner = parseTree(cursor, code, (t) => t == 'RepeatEnd')
          //while ((cursor.type.name as string) !== 'RepeatEnd') cursor.next()
          //console.log('inner', inner)
          callbackStack.push(
            buildRepeatTimes(
              times,
              inner
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
            )
          )
          continue
        } else {
          nextIgnoreComment(cursor) // Condition
          const condition = code.substring(cursor.from, cursor.to)
          cursor.next()
          const inner = parseTree(cursor, code, (t) => t == 'RepeatEnd')
          //while (cursor.type.name !== 'RepeatEnd') cursor.next()
          callbackStack.push(
            buildRepeatWhile(
              buildCondition(condition),
              inner
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
            )
          )
          continue
        }
      } else if (t == 'IfThen') {
        nextIgnoreComment(cursor) // IfKey
        nextIgnoreComment(cursor) // condition
        const condition = code.substring(cursor.from, cursor.to)
        cursor.next()

        if (
          cursor.node.name == 'Parameter' ||
          cursor.node.name == 'ConditionWithoutParam' ||
          cursor.node.name == 'ConditionMaybeWithParam'
        ) {
          cursor.next()
        }

        let hasElse = false
        const subcursor = cursor.node.cursor()
        do {
          if (subcursor.type.name == 'ElseKey') {
            hasElse = true
          }
        } while (subcursor.nextSibling())
        if (!hasElse) {
          const inner = parseTree(cursor, code, (t) => t == 'IfEndKey')
          //while (cursor.type.name !== 'IfEndKey') cursor.next()
          callbackStack.push(
            buildIf(
              buildCondition(condition),
              inner
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
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
              inner2
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
            )
          )
          continue
        }
      } else if (t == 'LineComment') {
        const text = code.substring(cursor.from + 2, cursor.to).trim()
        callbackStack.push(
          buildCommentClosure(
            text
            //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
          )
        )
      } else if (t == 'Comment') {
        const lines = code
          .substring(cursor.from + 1, cursor.to - 1)
          .trim()
          .split('\n')
        for (const line of lines) {
          callbackStack.push(
            buildCommentClosure(
              line
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
            )
          )
        }
      } else if (t == 'BlockComment') {
        const lines = code
          .substring(cursor.from + 2, cursor.to - 2)
          .trim()
          .split('\n')
        for (const line of lines) {
          callbackStack.push(
            buildCommentClosure(
              line
              //callbackStack.length == 1 ? 'x="40" y="30"' : undefined
            )
          )
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
}

function nextIgnoreComment(cursor: TreeCursor) {
  cursor.next()
  while (cursor.type.name.includes('Comment')) cursor.next()
}

function buildClosure(blockType: string, count: string, attrs?: string) {
  return (inner: string) =>
    `<block type="${blockType}" ${attrs ?? ''}>${
      count ? `<field name="COUNT">${count}</field>` : ''
    }<next>${inner}</next></block>`
}

function buildCustomCommand(name: string, attrs?: string) {
  return (inner: string) =>
    `<block type="custom_command" ${
      attrs ?? ''
    }><field name="COMMAND">${name}</field><next>${inner}</next></block>`
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

function buildCondition(typeRaw: string) {
  const type = typeRaw.toLowerCase()
  if (type == 'istwand') return `<block type="is_wall"></block>`
  if (type == 'nichtistwand') return `<block type="isn't_wall"></block>`
  if (type == 'istziegel') return `<block type="is_brick"></block>`
  if (type == 'nichtistziegel') return `<block type="isn't_brick"></block>`
  if (type == 'istmarke') return `<block type="is_marker"></block>`
  if (type == 'nichtistmarke') return `<block type="isn't_marker"></block>`
  if (type == 'istnorden')
    return `<block type="is_direction"><field name="DIRECTION">Norden</field></block>`
  if (type == 'nichtistnorden')
    return `<block type="isn't_direction"><field name="DIRECTION">Norden</field></block>`
  if (type == 'istosten')
    return `<block type="is_direction"><field name="DIRECTION">Osten</field></block>`
  if (type == 'nichtistosten')
    return `<block type="isn't_direction"><field name="DIRECTION">Osten</field></block>`
  if (type == 'istsüden')
    return `<block type="is_direction"><field name="DIRECTION">Süden</field></block>`
  if (type == 'nichtistsüden')
    return `<block type="isn't_direction"><field name="DIRECTION">Süden</field></block>`
  if (type == 'istwesten')
    return `<block type="is_direction"><field name="DIRECTION">Westen</field></block>`
  if (type == 'nichtistwesten')
    return `<block type="isn't_direction"><field name="DIRECTION">Westen</field></block>`
  if (type.startsWith('istziegel(')) {
    const count = type.replace('istziegel(', '').replace(')', '')
    return `<block type="is_brick_count"><field name="COUNT">${count}</field></block>`
  }
  if (type.startsWith('nichtistziegel(')) {
    const count = type.replace('nichtistziegel(', '').replace(')', '')
    return `<block type="isn't_brick_count"><field name="COUNT">${count}</field></block>`
  }
  return ''
}

function buildCommentClosure(msg: string, attrs?: string) {
  return (inner: string) =>
    `<block type="line_comment" ${
      attrs ?? ''
    }><field name="TEXT">${msg}</field><next>${inner}</next></block>`
}
function buildRepeatAlways(statements: string) {
  return (inner: String) => `<block type="repeat_forever">
  ${
    statements ? `<statement name="STATEMENTS">${statements}</statement>` : ''
  }${inner ? `<next>${inner}</next>` : ''}</block>`
}

function detectLng(code: string) {
  let enScore = 0,
    deScore = 0

  Object.values(deKeywords).forEach((str) => {
    if (code.includes(str.toLowerCase())) {
      deScore++
    }
  })

  Object.values(enKeywords).forEach((str) => {
    if (code.includes(str.toLowerCase())) {
      enScore++
    }
  })

  if (deScore > enScore) {
    return 'de'
  }

  if (deScore < enScore) {
    return 'en'
  }

  return null
}
