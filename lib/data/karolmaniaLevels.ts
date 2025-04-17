import { deserializeWorld } from '../commands/json'
import { World } from '../state/types'

export interface Level {
  id: number
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  targetWorld: World
  initialWorld?: World
}

// Sample levels data
export const levels: Level[] = [
  {
    id: 1,
    name: 'Markenrätsel',
    difficulty: 'easy',
    description: 'Platziere die Marken im richtigen Muster',
    targetWorld: deserializeWorld({
      dimX: 5,
      dimY: 5,
      height: 3,
      karol: { x: 0, y: 0, dir: 'east' },
      bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
      marks: {
        dimX: 3,
        dimY: 3,
        offsetX: 1,
        offsetY: 1,
        data: [
          [true, true, true],
          [true, false, true],
          [true, true, true],
        ],
      },
      blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
    }),
  },
  {
    id: 2,
    name: 'Ziegelturm',
    difficulty: 'medium',
    description: 'Baue einen Turm mit genau 3 Ziegeln',
    targetWorld: deserializeWorld({
      dimX: 5,
      dimY: 5,
      height: 5,
      karol: { x: 2, y: 2, dir: 'south' },
      bricks: {
        dimX: 1,
        dimY: 1,
        offsetX: 2,
        offsetY: 2,
        data: [[3]],
      },
      marks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
      blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
    }),
  },
  {
    id: 3,
    name: 'Labyrinth',
    difficulty: 'hard',
    description: 'Finde den Weg durch das Labyrinth',
    targetWorld: deserializeWorld({
      dimX: 8,
      dimY: 8,
      height: 1,
      karol: { x: 7, y: 7, dir: 'west' },
      bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
      marks: {
        dimX: 1,
        dimY: 1,
        offsetX: 7,
        offsetY: 7,
        data: [[true]],
      },
      blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
    }),
  },
  {
    id: 4,
    name: 'Quadratur',
    difficulty: 'medium',
    description: 'Erstelle ein Quadrat aus Marken',
    targetWorld: deserializeWorld({
      dimX: 6,
      dimY: 6,
      height: 1,
      karol: { x: 2, y: 2, dir: 'east' },
      bricks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
      marks: {
        dimX: 4,
        dimY: 4,
        offsetX: 1,
        offsetY: 1,
        data: [
          [true, true, true, true],
          [true, false, false, true],
          [true, false, false, true],
          [true, true, true, true],
        ],
      },
      blocks: { offsetX: -1, offsetY: -1, dimX: 0, dimY: 0, data: [] },
    }),
  },
]
