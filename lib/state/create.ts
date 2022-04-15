import { CoreState, WorkspaceState, World } from './types'

export function createDefaultCoreState(): CoreState {
  return {
    workspaces: [
      createFreeModeWorkspaceState(0),
      createFreeModeWorkspaceState(1),
      createFreeModeWorkspaceState(2),
    ],
    currentWorkspace: 0,
    showResearchCenter: false,
  }
}

export function createFreeModeWorkspaceState(id: number): WorkspaceState {
  return {
    title: 'Freier Modus ' + id.toString(),
    world: createWorld(5, 10, 6),
    code: '\n',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      needTextRefresh: false,
      wireframe: false,
      progress: 0,
      showTechTree: false,
    },
    vm: { pc: 0, entry: 0, frames: [{}], callstack: [] },
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
    chips: [
      /*{ type: 'inverter', x: 3, y: 2, init: false }*/
    ],
  }
  for (const chip of world.chips) {
    chip.init = true
    if (chip.type == 'inverter') {
      const val = Math.random() < 0.5
      if (val) {
        world.bricks[chip.y + 1][chip.x] = 1
      }
    }
  }
  return world
}
