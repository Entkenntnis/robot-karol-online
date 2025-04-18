import { QuestSerialFormat_MUST_STAY_COMPATIBLE } from '../state/types'

export interface Level {
  id: number
  at: number
  gold: number
  silver: number
  bronze: number
  quest: QuestSerialFormat_MUST_STAY_COMPATIBLE
}

// Sample levels data
export const levels: Level[] = [
  {
    id: 1,
    at: 2,
    gold: 5,
    silver: 10,
    bronze: 15,
    quest: {
      version: 'v1',
      title: 'Informatik ist cool!',
      description: 'Eine Treppe, was für ein Wunderwerk.',
      tasks: [
        {
          title: 'Neuer Auftrag',
          start: {
            dimX: 6,
            dimY: 4,
            height: 6,
            karol: { x: 0, y: 0, dir: 'south' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
          target: {
            dimX: 6,
            dimY: 4,
            height: 6,
            karol: { x: 0, y: 0, dir: 'south' },
            bricks: {
              dimX: 4,
              dimY: 1,
              offsetX: 1,
              offsetY: 1,
              data: [[1, 2, 3, 4]],
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
    at: 3,
    gold: 7,
    silver: 12,
    bronze: 18,
    quest: {
      version: 'v1',
      title: 'Zickzack ',
      description: 'Aber zack alle Marken weg!',
      tasks: [
        {
          title: 'Neuer Auftrag',
          start: {
            dimX: 6,
            dimY: 6,
            height: 6,
            karol: { x: 0, y: 0, dir: 'south' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            marks: {
              dimX: 6,
              dimY: 6,
              offsetX: 0,
              offsetY: 0,
              data: [
                [true, false, false, false, false, false],
                [false, true, false, false, false, false],
                [false, false, true, false, false, false],
                [false, false, false, true, false, false],
                [false, false, false, false, true, false],
                [false, false, false, false, false, true],
              ],
            },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
          target: {
            dimX: 6,
            dimY: 6,
            height: 6,
            karol: { x: 0, y: 0, dir: 'south' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
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
    id: 3,
    at: 4,
    gold: 9,
    silver: 14,
    bronze: 21,
    quest: {
      version: 'v1',
      title: 'Pyramide',
      description: 'Nur für Wirtual <3',
      tasks: [
        {
          title: 'Neuer Auftrag',
          start: {
            dimX: 7,
            dimY: 7,
            height: 6,
            karol: { x: 0, y: 0, dir: 'south' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
          target: {
            dimX: 7,
            dimY: 7,
            height: 6,
            karol: { x: 2, y: 3, dir: 'east' },
            bricks: {
              dimX: 3,
              dimY: 3,
              offsetX: 2,
              offsetY: 2,
              data: [
                [1, 1, 1],
                [1, 2, 1],
                [1, 1, 1],
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
    id: 4,
    at: 5,
    gold: 11,
    silver: 16,
    bronze: 24,
    quest: {
      version: 'v1',
      title: 'Schachbrett-Muster',
      description: 'Und für Anna Cramling ♕',
      tasks: [
        {
          title: 'Muster-Challenge',
          start: {
            dimX: 5,
            dimY: 5,
            height: 1,
            karol: { x: 0, y: 0, dir: 'east' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
          },
          target: {
            dimX: 5,
            dimY: 5,
            height: 1,
            karol: { x: 4, y: 4, dir: 'north' },
            bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
            marks: {
              dimX: 5,
              dimY: 5,
              offsetX: 0,
              offsetY: 0,
              data: [
                [true, false, true, false, true],
                [false, true, false, true, false],
                [true, false, true, false, true],
                [false, true, false, true, false],
                [true, false, true, false, true],
              ],
            },
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
