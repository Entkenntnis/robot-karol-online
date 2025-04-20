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
    javaCode: '',
    pythonCode: '',
    ui: {
      messages: [],
      gutter: 0,
      state: 'loading',
      needsTextRefresh: false,
      errorMessages: [],
      pythonProCanSwitch: true,
      showOutput: false,
      speedSliderValue: 7,
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
      snippets: [],
      showJavaInfo: false,
      proMode: false,
      isPlayground: false,
      showPreview: true,
      show2D: false,
      breakpoints: [],
      collapseDescription: false,
      initDone: false,
      keybindings: [],
      showFlyoutMenu: false,
      resetCode: {},
      returnToDemoPage: false,
      editQuestScript: false,
    },
    vm: {
      pc: 0,
      frames: [],
      callstack: [],
      steps: 0,
      startTime: 0,
      isDebugging: false,
      debuggerRequestNextStep: false,
    },
    settings: {
      mode: 'blocks',
      language: 'robot karol',
      lng: 'de',
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
      editOptions: 'all',
      saveProgram: true,
      keepQuest: false,
      questScript: '',
    },
    bench: {
      classInfo: {},
    },
    analyze: {
      published: [],
      cutoff: '',
      count: 0,
      showEditor: 0,
      showPlayground: 0,
      showHighscore: 0,
      showDemo: 0,
      showStructogram: 0,
      usePersist: 0,
      useJava: 0,
      usePython: 0,
      playSnake: 0,
      proMode: 0,
      lngEn: 0,
      limitEditOptions: 0,
      showQuestList: 0,
      showMaterials: 0,
      showInspiration: 0,
      customQuests: {},
      quests: {},
      legacy: {},
      appearance: {},
      userTimes: [],
      solutions: {},
      userEvents: {},
      ratings: {},
      newEventStats: {
        uniqueUsers: 0,
        stats: {},
      },
      survey: [],
      brushColors: {},
      loadedRobotImages: {},
    },
    overview: {
      overviewScroll: 0,
      learningPathScroll: 0,
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
