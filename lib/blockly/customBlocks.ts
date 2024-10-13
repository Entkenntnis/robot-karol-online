// based on https://github.com/vanmeegen/react-three-karol/blob/main/src/blockly/CustomBlocks.ts

import { CmdBlocksStore } from '../state/cmd-blocks-store'
import blocks from './KarolBlocks.json'
import Blockly, { Block, MenuOption } from 'blockly'

let karolGenerator: any

const blockToCode: [string, (x: Block) => string | [string, number]][] = [
  [
    'step',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')

      if (val == 1) {
        return 'Schritt' + '//blockId:' + block.id
      }
      return 'Schritt(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'turnleft',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) return 'LinksDrehen' + '//blockId:' + block.id
      return 'LinksDrehen(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'turnright',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) return 'RechtsDrehen' + '//blockId:' + block.id
      return 'RechtsDrehen(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'laydown',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == 1) return 'Hinlegen' + '//blockId:' + block.id
      return 'Hinlegen(' + val + ')' + '//blockId:' + block.id
    },
  ],
  [
    'pickup',
    (block: Block) => {
      const val = block.getFieldValue('COUNT')
      if (val == '1') return 'Aufheben' + '//blockId:' + block.id
      return 'Aufheben(' + val + ')' + '//blockId:' + block.id
    },
  ],
  ['setmarker', (block: Block) => 'MarkeSetzen' + '//blockId:' + block.id],
  ['deletemarker', (block: Block) => 'MarkeLöschen' + '//blockId:' + block.id],
  ['stop', (block: Block) => 'Beenden' + '//blockId:' + block.id],
  [
    'repeat_times',
    (block: Block) =>
      'wiederhole ' +
      block.getFieldValue('COUNT') +
      ' mal' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole',
  ],
  [
    'while_do',
    (block: Block) =>
      'wiederhole solange ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole',
  ],
  [
    'repeat_forever',
    (block: Block) =>
      'wiederhole immer ' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewiederhole',
  ],
  [
    'if_then',
    (block: Block) =>
      'wenn ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      ' dann' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendewenn',
  ],
  [
    'if_then_else',
    (block: Block) =>
      'wenn ' +
      karolGenerator.valueToCode(block, 'CONDITION', 0) +
      ' dann' +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nsonst\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS_2') +
      '\nendewenn',
  ],
  ['is_wall', (block: Block) => ['IstWand', 0]],
  ["isn't_wall", (block: Block) => ['NichtIstWand', 0]],
  ['is_brick', (block: Block) => ['IstZiegel', 0]],
  ["isn't_brick", (block: Block) => ['NichtIstZiegel', 0]],
  [
    'is_brick_count',
    (block: Block) => [`IstZiegel(${block.getFieldValue('COUNT')})`, 0],
  ],
  [
    "isn't_brick_count",
    (block: Block) => [`NichtIstZiegel(${block.getFieldValue('COUNT')})`, 0],
  ],
  ['is_marker', (block: Block) => ['IstMarke', 0]],
  ["isn't_marker", (block: Block) => ['NichtIstMarke', 0]],
  [
    'is_direction',
    (block: Block) => [`Ist${block.getFieldValue('DIRECTION')}`, 0],
  ],
  [
    "isn't_direction",
    (block: Block) => [`NichtIst${block.getFieldValue('DIRECTION')}`, 0],
  ],
  ['line_comment', (block: Block) => '// ' + block.getFieldValue('TEXT')],
  [
    'custom_command',
    (block: Block) => block.getFieldValue('COMMAND') + '//blockId:' + block.id,
  ],
  [
    'define_command',
    (block: Block) =>
      '\nAnweisung ' +
      block.getFieldValue('COMMAND_NAME') +
      '//blockId:' +
      block.id +
      '\n' +
      karolGenerator.statementToCode(block, 'STATEMENTS') +
      '\nendeAnweisung\n',
  ],
  ['main', () => `// Hauptprogramm`],
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
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
    let nextCode = ''
    if (nextBlock) {
      nextCode = '\n' + karolGenerator.blockToCode(nextBlock)
    }
    return code + nextCode
  }
  ;(Blockly as any)['karol'] = karolGenerator // strange monkey patch
}

Blockly.Extensions.register('custom_cmds_extension', function () {
  //@ts-expect-error Difficult for ts to parse
  this.getInput('COMMAND').appendField(
    new Blockly.FieldDropdown(function () {
      var options: MenuOption[] = []
      for (const name of CmdBlocksStore.getRawState().names) {
        options.push([name, name])
      }
      if (options.length == 0) {
        options.push(['TueEtwas', 'TueEtwas'])
      }
      options.sort((a, b) => (a[0] as string).localeCompare(b[0] as string))
      return options
    }),
    'COMMAND'
  )
})
