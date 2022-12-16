import { CoreState, WorkspaceState, World } from './types'

export function createDefaultCoreState(): CoreState {
  return {
    enableStats: true,
    workspace: createWorkspaceState(),
  }
}

export function createWorkspaceState(): WorkspaceState {
  const ws: WorkspaceState = {
    world: createWorld(5, 10, 6),
    code: '',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      wireframe: false,
      needsTextRefresh: false,
      errorMessages: [],
      toBlockWarning: false,
      editorLoading: false,
      showOutput: false,
      speedSliderValue: 4.4,
      showMenu: false,
      showPreviewOfTarget: false,
    },
    vm: {
      pc: 0,
      frames: [{}],
      callstack: [],
      needsConfirmation: false,
      confirmation: false,
    },
    settings: {
      mode: 'blocks',
    },
    quest: {
      progress: 0,
      title: 'Herzlich Willkommen',
      description:
        'Hallo, das ist eine Quest von Robot Karol. Es geht darum, ein Programm zu schreiben,' +
        'dass in der Lage ist, alle Welten auf den Zielzustand zu bringen. Baue dazu im Block-Editor deine Welt zusammen und starte dann das Programm.',
      completed: [],
      tasks: [
        {
          title: 'Auftrag 1: Ziegel in der Mitte',
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
    },

    /*{
        title: 'Welt 2',
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
      {
        title: 'Welt 3',
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
      {
        title: 'Welt 4',
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
      },*/
  }
  return ws
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
