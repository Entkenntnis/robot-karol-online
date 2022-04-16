import { levels } from '../data/levels'
import { CoreState, WorkspaceState, WorkspaceStateBase, World } from './types'

export function createDefaultCoreState(): CoreState {
  return {
    workspaces: [createLevel1WorkspaceState(), createFreeModeWorkspaceState()],
    currentWorkspace: 0,
    showResearchCenter: false,
  }
}

export function createLevel1WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(13, 10, 6),
    title: levels[0].title,
    type: 'level',
    progress: 0,
    levelId: 0,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'inverter', x: 4, y: 3 })
  return state
}

export function createFreeModeWorkspaceState(): WorkspaceState {
  return {
    ...createBaseWorkspace(),
    title: 'Freier Modus',
    type: 'free',
  }
}

function createBaseWorkspace(): WorkspaceStateBase {
  return {
    title: '',
    world: createWorld(5, 10, 6),
    code: '\n',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      wireframe: false,
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
