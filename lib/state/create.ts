import { levels } from '../data/levels'
import {
  CoreState,
  WorkspaceState,
  WorkspaceStateBase,
  WorkspaceStateFreeMode,
  WorkspaceStatePuzzleMode,
  World,
} from './types'

export function createDefaultCoreState(): CoreState {
  return {
    showResearchCenter: false,
    enableStats: true,
    editorWorkspace: createFreeModeWorkspaceState(),
  }
}

export function createFreeModeWorkspaceState(): WorkspaceStateFreeMode {
  const ws: WorkspaceState = {
    ...createBaseWorkspace(),
    title: 'Neue Welt',
    type: 'free',
  }
  ws.ui.showPreview = true
  return ws
}

export function createPuzzle1WorkspaceState(): WorkspaceStatePuzzleMode {
  const ws: WorkspaceStatePuzzleMode = {
    ...createBaseWorkspace(),
    world: createWorld(10, 10, 6),
    targetWorld: {
      dimX: 10,
      dimY: 10,
      height: 6,
      karol: { x: 0, y: 0, dir: 'south' },
      bricks: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      marks: [
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
      ],
      blocks: [
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
      ],
      chips: [],
    },
    title: 'Start',
    type: 'puzzle',
    id: 1,
    code: `Hinlegen
Schritt
LinksDrehen
Hinlegen
RechtsDrehen
Hinlegen
Schritt
LinksDrehen
Hinlegen
RechtsDrehen
Schritt`,
    targetImage: '/puzzle/start.png',
    posX: 253,
    posY: 91,
    preMode: true,
  }
  ws.ui.showPreview = true
  return ws
}

function createBaseWorkspace(): WorkspaceStateBase {
  return {
    title: '',
    world: createWorld(5, 10, 6),
    code: '',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      wireframe: false,
      needsTextRefresh: false,
      preview: undefined,
      showPreview: false,
      shouldFocusWrapper: false,
    },
    vm: {
      pc: 0,
      frames: [{}],
      callstack: [],
      needsConfirmation: false,
      confirmation: false,
    },
    settings: {
      speed: 'fast',
    },
  }
}

export function createWorld(dimX: number, dimY: number, height: number): World {
  const world: World = {
    dimX,
    dimY,
    height,
    karol: {
      x: 0,
      y: 0,
      dir: 'south',
    },
    bricks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(0)),

    marks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
    blocks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
    chips: [],
  }
  return world
}
