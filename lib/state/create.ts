import { stat } from 'fs'
import { levels } from '../data/levels'
import { CoreState, WorkspaceState, WorkspaceStateBase, World } from './types'

export function createDefaultCoreState(): CoreState {
  return {
    workspaces: [
      createFreeModeWorkspaceState(),
      createLevel3WorkspaceState(),
      createLevel7WorkspaceState(),
      createLevel5WorkspaceState(),
      createLevel1WorkspaceState(),
      createLevel4WorkspaceState(),
      createLevel6WorkspaceState(),
      createLevel8WorkspaceState(),
    ],
    currentWorkspace: 0,
    showResearchCenter: false,
  }
}

export function createLevel8WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(15, 14, 6),
    title: levels[7].title,
    type: 'level',
    progress: 0,
    levelId: 7,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'fullung', x: 3, y: 3 })
  //state.world.marks[0][0] = true
  state.world.karol.x = 7
  state.world.karol.y = 3
  return state
}

export function createLevel7WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(11, 12, 6),
    title: levels[6].title,
    type: 'level',
    progress: 0,
    levelId: 6,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'kopierer', x: 3, y: 3 })
  //state.world.marks[0][0] = true
  state.world.karol.x = 5
  state.world.karol.y = 3
  return state
}

export function createLevel6WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(13, 10, 10),
    title: levels[5].title,
    type: 'level',
    progress: 0,
    levelId: 5,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'stapler', x: 3, y: 3 })
  //state.world.marks[0][0] = true
  state.world.karol.x = 7
  state.world.karol.y = 3
  return state
}

export function createLevel5WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(14, 10, 6),
    title: levels[4].title,
    type: 'level',
    progress: 0,
    levelId: 4,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'aufraumer', x: 3, y: 3 })
  //state.world.marks[0][0] = true
  state.world.karol.x = 10
  state.world.karol.y = 4
  state.world.karol.dir = 'west'
  return state
}

export function createLevel4WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(14, 10, 6),
    title: levels[3].title,
    type: 'level',
    progress: 0,
    levelId: 3,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'treppe', x: 3, y: 3 })
  //state.world.marks[0][0] = true
  state.world.karol.x = 10
  state.world.karol.y = 4
  state.world.karol.dir = 'west'
  return state
}

export function createLevel3WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(13, 13, 6),
    title: levels[2].title,
    type: 'level',
    progress: 0,
    levelId: 2,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'copy', x: 4, y: 3 })
  state.world.marks[0][0] = true
  state.world.karol.x = 6
  state.world.karol.y = 3
  return state
}

export function createLevel2WorkspaceState(): WorkspaceState {
  const state: WorkspaceState = {
    ...createBaseWorkspace(),
    world: createWorld(12, 9, 6),
    title: levels[1].title,
    type: 'level',
    progress: 0,
    levelId: 1,
    worldInit: false,
  }
  state.world.chips.push({ tag: 'start', x: 4, y: 3 })
  state.world.karol.x = 6
  state.world.karol.y = 3
  return state
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
  state.world.marks[0][0] = true
  state.world.karol.x = 6
  state.world.karol.y = 3
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
    code: '',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      wireframe: false,
      needsTextRefresh: false,
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
