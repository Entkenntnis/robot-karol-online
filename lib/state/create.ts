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
      speedSliderValue: 11,
      showMenu: false,
      showPreviewOfTarget: true,
      isManualAbort: false,
      isEndOfRun: false,
      showErrorModal: false,
      freezeCode: false,
      taskScroll: 0,
      showQuestOverview: true,
      isImportedProject: false,
      showImpressum: false,
      showPrivacy: false,
      isAlreadyCompleted: false,
      showStructogram: false,
      isTesting: false,
      isTestingAborted: false,
      clientInitDone: false,
      controlBarShowFinishQuest: false,
      isEditor: false,
      isDemo: false,
      showCodeInfo: false,
      renderCounter: 0,
      isAnalyze: false,
      overviewScroll: 0,
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
    },
    editor: {
      showQuestPreview: false,
      editWorld: null,
      showResizeWorld: false,
      showShareModal: false,
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
      customQuests: [],
      quests: {},
      legacy: {},
      users: {},
      reachable: {},
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
