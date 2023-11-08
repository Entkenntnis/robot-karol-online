export type Heading = 'north' | 'east' | 'south' | 'west'

export interface World {
  dimX: number
  dimY: number
  height: number
  karol: {
    x: number
    y: number
    dir: Heading
  }
  bricks: number[][]
  marks: boolean[][]
  blocks: boolean[][]
}

export interface Message {
  text: string
  count: number
  ts: number
}

export interface Preview {
  world: World
}

export type CmdBlockPositions = { [key: string]: { x: number; y: number } }

export interface Ui {
  // this state is only for ide
  messages: Message[]
  gutter: number
  gutterReturns: number[]
  state: 'ready' | 'loading' | 'running' | 'error'
  needsTextRefresh: boolean
  errorMessages: string[]
  toBlockWarning: boolean
  showOutput: boolean
  speedSliderValue: number
  showPreviewOfTarget: boolean
  karolCrashMessage?: string
  isManualAbort: boolean
  isEndOfRun: boolean
  freezeCode: boolean
  taskScroll: number
  isAlreadyCompleted: boolean
  showStructogram: boolean
  isTesting: boolean
  isTestingAborted: boolean
  controlBarShowFinishQuest: boolean
  imageLightbox: string | null
  isHighlightDescription: boolean
  showOk: boolean
  audioStarted: boolean
  cmdBlockPositions: CmdBlockPositions
  showJavaInfo: boolean
}

export interface Vm {
  bytecode?: Op[]
  pc: number
  handler?: NodeJS.Timeout
  frames: { [index: number]: number }[]
  callstack: number[]
  needsConfirmation: boolean
  confirmation: boolean
  startTime: number
  steps: number
}

export interface Settings {
  mode: 'code' | 'blocks'
  language: 'robot karol' | 'java'
}

export interface Editor {
  showQuestPreview: boolean
  editWorld: number | null
  currentlyEditing: 'start' | 'target'
  showWorldPreview: boolean
}

export interface Quest {
  tasks: QuestTask[]
  title: string
  description: string
  progress: boolean
  lastStartedTask?: number
  id: number
  testerHandler?: NodeJS.Timeout
  completedOnce: boolean
  audioSrc?: string
}

export interface Overview {
  overviewScroll: number
  showSaveHint: boolean
  showOverviewList: boolean
  showProfile: boolean
}

export interface WorkspaceState {
  // IDE
  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings

  // IDE Modes
  quest: Quest
  editor: Editor

  // Overview
  analyze: Analyze
  overview: Overview

  // System
  page:
    | 'init'
    | 'overview'
    | 'quest'
    | 'highscore'
    | 'editor'
    | 'quest'
    | 'shared'
    | 'imported'
    | 'analyze'
    | 'demo'

  modal:
    | 'name'
    | 'impressum'
    | 'privacy'
    | 'lightbox'
    | 'error'
    | 'share'
    | 'remix'
    | 'resize'
    | 'success'
    | 'appearance'
    | 'tutorial'
    | null

  renderCounter: number // e.g. if storage is updated

  appearance: Appearance
}

export interface Appearance {
  cap: number
  skin: number
  shirt: number
  legs: number
}

export interface QuestTask {
  title: string
  start: World
  target: World | null
}

export interface Analyze {
  published: { id: string; date: string }[]
  cutoff: string
  count: number
  showEditor: number
  showPlayground: number
  showDemo: number
  showStructogram: number
  usePersist: number
  useAudio: number
  customQuests: { [key: string]: { start: number; complete: number } }
  legacy: { [key: string]: { count: number } }
  appearance: { [key: string]: { count: number } }
  quests: { [key: string]: { reachable: number; complete: number } }
  userTimes: number[]
  solutions: {
    [questId: string]: {
      solution: string
      isCode: boolean
      isAttempt: boolean
      createdAt: string
    }[]
  }
  userEvents: {
    [key: string]: {
      events: {
        userId: string
        event: string
        createdAt: string
      }[]
    }
  }
  ratings: {
    [key: string]: { count: number; average: number; values: number[] }
  }
}

export interface CoreState {
  enableStats: boolean
  workspace: WorkspaceState
}

export interface CoreRefs {
  state: CoreState
}

export interface ActionOp {
  type: 'action'
  command:
    | 'forward'
    | 'left'
    | 'right'
    | 'brick'
    | 'unbrick'
    | 'setMark'
    | 'resetMark'
  line: number
}

export interface Condition {
  type:
    | 'brick'
    | 'mark'
    | 'wall'
    | 'north'
    | 'east'
    | 'south'
    | 'west'
    | 'brick_count'
  count?: number
  negated: boolean
}

export interface JumpNOp {
  type: 'jumpn'
  target: number
  count: number
  line?: number
}

export interface JumpCondOp {
  type: 'jumpcond'
  targetT: number
  targetF: number
  condition: Condition
  line: number
}

export interface CallOp {
  type: 'call'
  target: number
  line: number
}

export interface ReturnOp {
  type: 'return'
  line: undefined
}

export type Op = ActionOp | JumpNOp | JumpCondOp | CallOp | ReturnOp

export interface QuestData {
  title: string
  description: string
  tasks: QuestTask[]
  difficulty: string
  audioSrc?: string
}

export interface QuestSessionData {
  id: number
  completed: boolean
  code: string
  mode: Settings['mode']
  completedOnce: boolean
}

export interface QuestSerialFormat {
  version: 'v1'
  title: string
  description: string
  tasks: { title: string; start: SerialWorld; target: SerialWorld }[]
}

export interface SerialWorld {
  dimX: number
  dimY: number
  height: number
  karol: {
    x: number
    y: number
    dir: Heading
  }
  bricks: Compressed2D<number>
  marks: Compressed2D<boolean>
  blocks: Compressed2D<boolean>
}

export interface Compressed2D<T> {
  offsetX: number
  offsetY: number
  dimX: number
  dimY: number
  data: T[][]
}

export interface AppearanceData {
  type: 'cap' | 'skin' | 'shirt' | 'legs'
  title: string
  position: number
}
