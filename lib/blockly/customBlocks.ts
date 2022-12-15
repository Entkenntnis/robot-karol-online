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
        return 'Schritt' + '//blockId:' + block.id
      }
      return 'Schritt(' + val + ')' + '//blockId:' + block.id
    },
  ],
  ['turnleft', (block: Block) => 'LinksDrehen' + '//blockId:' + block.id],
  ['turnright', (block: Block) => 'RechtsDrehen' + '//blockId:' + block.id],
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
  ['is_marker', (block: Block) => ['IstMarke', 0]],
  ["isn't_marker", (block: Block) => ['NichtIstMarke', 0]],
  ['is_north', (block: Block) => ['IstNorden', 0]],
  ["isn't_north", (block: Block) => ['NichtIstNorden', 0]],
  ['line_comment', (block: Block) => '// ' + block.getFieldValue('TEXT')],
]

export function initCustomBlocks() {
  blocks.forEach((block) => {
    Blockly.Blocks[block.type] = {
      init: function () {
        (this as any).jsonInit(block)
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
  ;(Blockly as any)['karol'] = karolGenerator
}
