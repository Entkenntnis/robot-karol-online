import { puzzles } from '../data/puzzles'
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
    showMenu: false,
    enableStats: true,
    editorWorkspace: createFreeModeWorkspaceState(),
    inviteMenu: true,
    inviteStart: true,
    done: [],
  }
}

export function createFreeModeWorkspaceState(): WorkspaceStateFreeMode {
  const ws: WorkspaceState = {
    ...createBaseWorkspace(),
    type: 'free',
  }
  return ws
}

export function createPuzzleWorkspaceState(
  id: number
): WorkspaceStatePuzzleMode {
  const puzzle = puzzles.find((x) => x.id == id)!
  const ws: WorkspaceStatePuzzleMode = {
    ...createBaseWorkspace(),
    world: createWorld(
      puzzle.targetWorld.dimX,
      puzzle.targetWorld.dimY,
      puzzle.targetWorld.height
    ),
    code: puzzle.code,
    type: 'puzzle',
    id,
    preMode: true,
    progress: 0,
  }
  ws.settings.speed = 'normal'
  return ws
}

function createBaseWorkspace(): WorkspaceStateBase {
  return {
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
      showPreview: true,
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
  }
  return world
}
