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
    tasks: [
      {
        title: 'Welt 1',
        start: {
          dimX: 6,
          dimY: 6,
          height: 6,
          karol: { x: 0, y: 0, dir: 'south' },
          bricks: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
          ],
        },
        target: {
          dimX: 6,
          dimY: 6,
          height: 6,
          karol: { x: 0, y: 0, dir: 'south' },
          bricks: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 0],
            [0, 0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
          ],
          marks: [
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
          ],
          blocks: [
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
          ],
        },
      },
    ],
  }
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
      state: 'quest',
      wireframe: false,
      needsTextRefresh: false,
      preview: undefined,
      showPreview: true,
      shouldFocusWrapper: false,
      hideKarol: false,
      keepWorldPreference: false,
      errorMessages: [],
      toBlockWarning: false,
      editorLoading: false,
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
      mode: 'blocks',
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
