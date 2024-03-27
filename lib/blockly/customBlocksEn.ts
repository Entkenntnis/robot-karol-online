// based on https://github.com/vanmeegen/react-three-karol/blob/main/src/blockly/CustomBlocks.ts

import blocks from './KarolBlocksEn.json'
import Blockly, { Block } from 'blockly'

let karolGenerator: any

const blockToCode: [string, (x: Block) => string | [string, number]][] = [
  [
    'step',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')

      if (val == 1) {
        return 'step' + '//blockId:' + block.id
      }
      return 'step(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'turnleft',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) return 'turn_left' + '//blockId:' + block.id
      return 'turn_left(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'turnright',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) return 'turn_right' + '//blockId:' + block.id
      return 'turn_right(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'laydown',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) return 'set_down' + '//blockId:' + block.id
      return 'set_down(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'pickup',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == '1') return 'pick_up' + '//blockId:' + block.id
      return 'pick_up(' + val + ')' + '//blockId:' + block.id
    },
  ],
  ['setmarker', (block: Block) => 'mark_field' + '//blockId:' + block.id],
  ['deletemarker', (block: Block) => 'unmark_field' + '//blockId:' + block.id],
  ['stop', (block: Block) => 'end' + '//blockId:' + block.id],
  [
    'repeat_times',
    (block: Block) =>
      'repeat ' +
      block.getFieldValue('COUNT') +
      ' times' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nend_repeat',
  ],
  [
    'while_do',
    (block: Block) =>
      'repeat while ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nend_repeat',
  ],
  [
    'repeat_forever',
    (block: Block) =>
      'repeat forever ' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nend_repeat',
  ],
  [
    'if_then',
    (block: Block) =>
      'if ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      ' then' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nend_if',
  ],
  [
    'if_then_else',
    (block: Block) =>
      'if ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      ' then' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nelse\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS_2') +
      '\nend_if',
  ],
  ['is_wall', (block: Block) => ['is_wall', 0]],
  ["isn't_wall", (block: Block) => ['not_is_wall', 0]],
  ['is_brick', (block: Block) => ['is_brick', 0]],
  ["isn't_brick", (block: Block) => ['not_is_brick', 0]],
  [
    'is_brick_count',
    (block: Block) => [`is_brick(${block.getFieldValue('COUNT')})`, 0],
  ],
  [
    "isn't_brick_count",
    (block: Block) => [`not_is_brick(${block.getFieldValue('COUNT')})`, 0],
  ],
  ['is_marker', (block: Block) => ['is_mark', 0]],
  ["isn't_marker", (block: Block) => ['not_is_mark', 0]],
  [
    'is_direction',
    (block: Block) => [`is_${block.getFieldValue('DIRECTION')}`, 0],
  ],
  [
    "isn't_direction",
    (block: Block) => [`not_is_${block.getFieldValue('DIRECTION')}`, 0],
  ],
  ['line_comment', (block: Block) => '// ' + block.getFieldValue('TEXT')],
  [
    'custom_command',
    (block: Block) => block.getFieldValue('COMMAND') + '//blockId:' + block.id,
  ],
  [
    'define_command',
    (block: Block) =>
      '\ncommand ' +
      block.getFieldValue('COMMAND') +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nend_command\n',
  ],
]

export function initCustomBlocksEn() {
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
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
    let nextCode = ''
    if (nextBlock) {
      nextCode = '\n' + karolGenerator.blockToCode(nextBlock)
    }
    return code + nextCode
  }
  ;(Blockly as any)['karol'] = karolGenerator // strange monkey patch
}
