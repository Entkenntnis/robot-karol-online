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
    appearance: {
      cap: 0,
      skin: 1,
      shirt: 2,
      legs: 3,
    },
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
      speedSliderValue: 7,
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
      imageLightbox: null,
      isHighlightDescription: false,
      showOk: false,
      audioStarted: false,
      cmdBlockPositions: {},
      showJavaInfo: false,
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
      language: 'robot karol',
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
      useAudio: 0,
      customQuests: {},
      quests: {},
      legacy: {},
      appearance: {},
      userTimes: [],
      solutions: {},
      userEvents: {},
      ratings: {},
    },
    overview: {
      overviewScroll: 0,
      showSaveHint: true,
      showOverviewList: false,
      showProfile: false,
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
