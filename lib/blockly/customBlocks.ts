// based on https://github.com/vanmeegen/react-three-karol/blob/main/src/blockly/CustomBlocks.ts

import blocks from './KarolBlocks.json'
import Blockly, { Block } from 'blockly'

let karolGenerator: any

const blockToCode: [string, (x: Block) => string | [string, number]][] = [
  [
    'step',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) {
        return 'Schritt'
      }
      return 'Schritt(' + val + ')'
    },
  ],
  ['turnleft', (block: Block) => 'LinksDrehen'],
  ['turnright', (block: Block) => 'RechtsDrehen'],
  [
    'laydown',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) return 'Hinlegen'
      return 'Hinlegen(' + val + ')'
    },
  ],
  [
    'laydown_color',
    (block: Block) => 'Hinlegen(' + block.getFieldValue('COLOR') + ')',
  ],
  [
    'pickup',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == '1') return 'Aufheben'
      return 'Aufheben(' + val + ')'
    },
  ],
  ['setmarker', (block: Block) => 'MarkeSetzen'],
  ['deletemarker', (block: Block) => 'MarkeLöschen'],
  ['wait', (block: Block) => 'Warten(' + block.getFieldValue('COUNT') + ')'],
  ['beep', (block: Block) => 'Ton'],
  ['stop', (block: Block) => 'Beenden'],
  [
    'repeat_times',
    (block: Block) =>
      'wiederhole ' +
      block.getFieldValue('COUNT') +
      ' mal\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole',
  ],
  [
    'while_do',
    (block: Block) =>
      'wiederhole solange ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole',
  ],
  [
    'repeat_until',
    (block: Block) =>
      'wiederhole \n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole' +
      '\nbis ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0),
  ],
  [
    'repeat_while',
    (block: Block) =>
      'wiederhole \n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole' +
      '\nsolange ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0),
  ],
  [
    'repeat_forever',
    (block: Block) =>
      'wiederhole immer\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole',
  ],
  [
    'if_then',
    (block: Block) =>
      'wenn ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      ' dann\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewenn',
  ],
  [
    'if_then_else',
    (block: Block) =>
      'wenn ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      ' dann\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nsonst\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS_2') +
      '\nendewenn',
  ],
  ['is_wall', (block: Block) => ['IstWand', 0]],
  ["isn't_wall", (block: Block) => ['NichtIstWand', 0]],
  ['is_brick', (block: Block) => ['IstZiegel', 0]],
  [
    'is_brick_count',
    (block: Block) => ['IstZiegel(' + block.getFieldValue('COUNT') + ')', 0],
  ],
  [
    'is_brick_color',
    (block: Block) => ['IstZiegel(' + block.getFieldValue('COLOR') + ')', 0],
  ],
  ["isn't_brick", (block: Block) => ['NichtIstZiegel', 0]],
  [
    "isn't_brick_count",
    (block: Block) => [
      'NichtIstZiegel(' + block.getFieldValue('COUNT') + ')',
      0,
    ],
  ],
  [
    "isn't_brick_color",
    (block: Block) => [
      'NichtIstZiegel(' + block.getFieldValue('COLOR') + ')',
      0,
    ],
  ],
  ['is_marker', (block: Block) => ['IstMarke', 0]],
  [
    'is_marker_color',
    (block: Block) => ['IstMarke(' + block.getFieldValue('COLOR') + ')', 0],
  ],
  ["isn't_marker", (block: Block) => ['NichtIstMarke', 0]],
  [
    "isn't_marker_color",
    (block: Block) => [
      'NichtIstMarke(' + block.getFieldValue('COLOR') + ')',
      0,
    ],
  ],
  ['is_south', (block: Block) => ['IstSüden', 0]],
  ['is_north', (block: Block) => ['IstNorden', 0]],
  ['is_west', (block: Block) => ['IstWesten', 0]],
  ['is_east', (block: Block) => ['IstOsten', 0]],
  ['is_full', (block: Block) => ['IstVoll', 0]],
  ["isn't_full", (block: Block) => ['NichtIstVoll', 0]],
  ['is_empty', (block: Block) => ['IstLeer', 0]],
  ["isn't_empty", (block: Block) => ['NichtIstLeer', 0]],
  ['has_bricks', (block: Block) => ['HatZiegel', 0]],
  [
    'has_bricks_count',
    (block: Block) => ['HatZiegel(' + block.getFieldValue('COUNT') + ')', 0],
  ],
  [
    'anweisung',
    (block: Block) =>
      'Anweisung ' +
      block.getFieldValue('COMMAND_NAME') +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendeAnweisung\n',
  ],
  [
    'anweisung_aufruf',
    (block: Block) => {
      return block.getFieldValue('COMMAND_NAME')
    },
  ],
]

export function initCustomBlocks() {
  blocks.forEach((block) => {
    Blockly.Blocks[block.type] = {
      init: function () {
        this.jsonInit(block)
      },
    }
  })
  karolGenerator = new Blockly.Generator('karol')
  karolGenerator.PRECEDENCE = 0
  blockToCode.forEach(([blockName, codeGenFct]) => {
    karolGenerator[blockName] = codeGenFct
  })
  karolGenerator.scrub_ = function (block: Block, code: string) {
    //let commentCode = ''
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection || !block.outputConnection.targetConnection) {
      // Collect comment for this block.
      let comment = block.getCommentText()
      if (comment) {
        //comment = stringUtils.wrap(comment, this.COMMENT_WRAP - 3)
        commentCode += this.prefixLines(comment + '\n', '// ')
      }
      // Collect comments for all value arguments.
      // Don't collect comments for nested statements.
      /*for (let i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type === inputTypes.VALUE) {
          const childBlock = block.inputList[i].connection.targetBlock()
          if (childBlock) {
            comment = this.allNestedComments(childBlock)
            if (comment) {
              commentCode += this.prefixLines(comment, '// ')
            }
          }
        }
      }*/
    }
    const comment = block.getCommentText()?.trim()

    let commentCode = ''

    if (comment) {
      if (comment.trim().includes('\n')) {
        commentCode = `/* ${comment?.trim()} */\n`
      } else {
        commentCode = `// ${comment.trim()}\n`
      }
    }

    const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
    let nextCode = ''
    if (nextBlock) {
      nextCode = '\n' + karolGenerator.blockToCode(nextBlock)
    }
    return commentCode + code + nextCode
  }
  ;(Blockly as any)['karol'] = karolGenerator
}
