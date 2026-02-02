// based on https://github.com/vanmeegen/react-three-karol/blob/main/src/blockly/CustomBlocks.ts

import { CmdBlocksStore } from '../state/cmd-blocks-store'
import blocks from './KarolBlocksEn.json'
import {
  Block,
  Generator,
  Blocks,
  FieldDropdown,
  Extensions,
  type MenuOption,
} from 'blockly'
import '@blockly/field-slider'

const karolGenerator = new Generator('karol')

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
  ['stop', (block: Block) => 'exit' + '//blockId:' + block.id],
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
      'repeat always ' +
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
  ['is_wall', (_: Block) => ['is_wall', 0]],
  ["isn't_wall", (_: Block) => ['not_is_wall', 0]],
  ['is_brick', (_: Block) => ['is_brick', 0]],
  ["isn't_brick", (_: Block) => ['not_is_brick', 0]],
  [
    'is_brick_count',
    (block: Block) => [`is_brick(${block.getFieldValue('COUNT')})`, 0],
  ],
  [
    "isn't_brick_count",
    (block: Block) => [`not_is_brick(${block.getFieldValue('COUNT')})`, 0],
  ],
  ['is_marker', (_: Block) => ['is_mark', 0]],
  ["isn't_marker", (_: Block) => ['not_is_mark', 0]],
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
      block.getFieldValue('COMMAND_NAME') +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nend_command\n',
  ],
  ['main', () => `// main program`],
]

export function initCustomBlocksEn() {
  blocks.forEach((block) => {
    Blocks[block.type] = {
      init: function () {
        this.jsonInit(block)
      },
    }
  })
  // karolGenerator.PRECEDENCE = 0
  blockToCode.forEach(([blockName, codeGenFct]) => {
    karolGenerator.forBlock[blockName] = codeGenFct
  })
  karolGenerator.scrub_ = function (block: Block, code: string) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
    let nextCode = ''
    if (nextBlock) {
      nextCode = '\n' + karolGenerator.blockToCode(nextBlock)
    }
    return code + nextCode
  }
  return karolGenerator
}

Extensions.register('custom_cmds_extension_en', function () {
  this.getInput('COMMAND')?.appendField(
    new FieldDropdown(function () {
      var options: MenuOption[] = []
      for (const name of CmdBlocksStore.getRawState().names) {
        options.push([name, name])
      }
      if (options.length == 0) {
        options.push(['DoWork', 'DoWork'])
      }
      return options
    }),
    'COMMAND',
  )
})
