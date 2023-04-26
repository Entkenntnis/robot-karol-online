import { CoreState, WorkspaceState, World } from './types'

export function createDefaultCoreState(): CoreState {
  return {
    enableStats: true,
    workspace: createWorkspaceState(),
  }
}

export function createWorkspaceState(): WorkspaceState {
  const ws: WorkspaceState = {
    page: 'init',
    modal: null,
    renderCounter: 0,
    world: createWorld(5, 10, 6),
    code: '',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      needsTextRefresh: false,
      errorMessages: [],
      toBlockWarning: false,
      showOutput: false,
      speedSliderValue: 11,
      showPreviewOfTarget: true,
      isManualAbort: false,
      isEndOfRun: false,
      freezeCode: false,
      taskScroll: 0,
      isAlreadyCompleted: false,
      showStructogram: false,
      isTesting: false,
      isTestingAborted: false,
      controlBarShowFinishQuest: false,
      showCodeInfo: false,
      imageLightbox: null,
      isHighlightDescription: false,
    },
    vm: {
      pc: 0,
      frames: [{}],
      callstack: [],
      needsConfirmation: false,
      confirmation: false,
      steps: 0,
      startTime: 0,
    },
    settings: {
      mode: 'blocks',
    },
    quest: {
      progress: false,
      title: '',
      description: '',
      tasks: [],
      id: -1,
      completedOnce: false,
    },
    editor: {
      showQuestPreview: false,
      editWorld: null,
      currentlyEditing: 'start',
      showWorldPreview: false,
    },
    analyze: {
      published: [],
      cutoff: '',
      count: 0,
      showEditor: 0,
      showPlayground: 0,
      showDemo: 0,
      showStructogram: 0,
      usePersist: 0,
      customQuests: {},
      quests: {},
      legacy: {},
      userTimes: [],
      solutions: {},
    },
    overview: {
      overviewScroll: 0,
      showSaveHint: true,
    },
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
