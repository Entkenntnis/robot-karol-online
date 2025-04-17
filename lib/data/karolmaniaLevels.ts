import { deserializeWorld } from '../commands/json'
import { QuestSerialFormat_MUST_STAY_COMPATIBLE } from '../state/types'

export interface Level {
  id: number
  quest: QuestSerialFormat_MUST_STAY_COMPATIBLE
}

// Sample levels data
export const levels: Level[] = [
  {
    id: 1,
    quest: {
      version: 'v1',
      title: 'Burg',
      description: 'Baue mit Karol eine Burg.',
      tasks: [
        {
          title: 'Neuer Auftrag',
          start: {
            dimX: 6,
            dimY: 4,
            height: 6,
            karol: { x: 2, y: 1, dir: 'south' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
          target: {
            dimX: 6,
            dimY: 4,
            height: 6,
            karol: { x: 2, y: 1, dir: 'south' },
            bricks: {
              dimX: 6,
              dimY: 4,
              offsetX: 0,
              offsetY: 0,
              data: [
                [4, 1, 1, 1, 1, 4],
                [1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1],
                [4, 1, 0, 0, 1, 4],
              ],
            },
            marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
        },
      ],
      lng: 'de',
      questScript: '',
      language: 'blocks',
      program: '',
    },
  },
  {
    id: 2,
    quest: {
      version: 'v1',
      title: 'Burg',
      description: 'Baue mit Karol eine Burg.',
      tasks: [
        {
          title: 'Neuer Auftrag',
          start: {
            dimX: 6,
            dimY: 4,
            height: 6,
            karol: { x: 2, y: 1, dir: 'south' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
          target: {
            dimX: 6,
            dimY: 4,
            height: 6,
            karol: { x: 2, y: 1, dir: 'south' },
            bricks: {
              dimX: 6,
              dimY: 4,
              offsetX: 0,
              offsetY: 0,
              data: [
                [4, 1, 1, 1, 1, 4],
                [1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1],
                [4, 1, 0, 0, 1, 4],
              ],
            },
            marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
        },
      ],
      lng: 'de',
      questScript: '',
      language: 'blocks',
      program: '',
    },
  },
]
