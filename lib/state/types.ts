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
  state: 'ready' | 'loading' | 'running' | 'error'
  needsTextRefresh: boolean
  errorMessages: string[]
  pythonProCanSwitch: boolean
  proMode: boolean
  showOutput: boolean
  speedSliderValue: number
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
  snippets: string[]
  showJavaInfo: boolean
  lockLanguage?: 'python' | 'java' | 'karol' | 'python-pro'
  isPlayground: boolean
  showPreview: boolean
  show2D: boolean
  breakpoints: number[]
  sharedQuestId?: string
  collapseDescription: boolean
  initDone: boolean
  inputPrompt?: string
  keybindings: { key: string; title: string; pressed: boolean }[]
  showFlyoutMenu: boolean
  resetCode: { [key: string]: [string, string] }
  returnToDemoPage: boolean
  newRobotImage?: string
  questPrompt?: string
  questPromptConfirm?: string
  editQuestScript: boolean
}

export interface Vm {
  bytecode?: Op[]
  pc: number
  frames: {
    variables: { [index: string]: number }
    opstack: number[]
  }[]
  callstack: number[]
  startTime: number
  steps: number
  isDebugging: boolean
  debuggerRequestNextStep: boolean
}

export interface Settings {
  mode: 'code' | 'blocks'
  language: 'robot karol' | 'java' | 'python' | 'python-pro'
  lng: 'de' | 'en'
}

export interface Editor {
  showQuestPreview: boolean
  editWorld: number | null
  currentlyEditing: 'start' | 'target'
  showWorldPreview: boolean
  editOptions:
    | 'all'
    | 'python-only'
    | 'java-only'
    | 'karol-only'
    | 'python-pro-only'
  saveProgram: boolean
  keepQuest: boolean
  questScript: string
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
  thisTaskIsAlreadyCompleted?: number
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
  javaCode: string
  pythonCode: string
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
    | 'inspiration'
    | 'inspiration-old'

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
    | 'sync'
    | 'survey'
    | null

  renderCounter: number // e.g. if storage is updated

  appearance: Appearance

  robotImageDataUrl?: string
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
  showHighscore: number
  showDemo: number
  showStructogram: number
  usePersist: number
  useJava: number
  usePython: number
  proMode: number
  playSnake: number
  lngEn: number
  limitEditOptions: number
  showQuestList: number
  showMaterials: number
  showInspiration: number
  customQuests: { [key: string]: { start: number; complete: number } }
  legacy: { [key: string]: { count: number } }
  appearance: { [key: string]: { count: number } }
  brushColors: { [key: string]: { count: number } }
  loadedRobotImages: { [key: string]: { count: number } }
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
  newEventStats: {
    uniqueUsers: number
    stats: { [key: string]: { sessions: number; average: number } }
  }
}

export interface CoreState {
  enableStats: boolean
  workspace: WorkspaceState
}

export interface CoreRefs {
  state: CoreState
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

interface BaseOp {
  line?: number
}

export interface ActionOp extends BaseOp {
  type: 'action'
  command:
    | 'forward'
    | 'left'
    | 'right'
    | 'brick'
    | 'unbrick'
    | 'setMark'
    | 'resetMark'
  useParameterFromStack?: boolean
}

export interface CompareOp extends BaseOp {
  type: 'compare'
  kind:
    | 'less-than'
    | 'less-equal'
    | 'greater-than'
    | 'greater-equal'
    | 'equal'
    | 'unequal'
}

export interface SenseOp extends BaseOp {
  type: 'sense'
  condition: Condition
}

export interface JumpOp extends BaseOp {
  type: 'jump'
  target: number
}

export interface BranchOp extends BaseOp {
  type: 'branch'
  targetT: number
  targetF: number
}

export interface CallOp extends BaseOp {
  type: 'call'
  target: number
  arguments?: number
}

export interface ReturnOp extends BaseOp {
  type: 'return'
}

export interface OperationOp extends BaseOp {
  type: 'operation'
  kind: 'add' | 'mult' | 'sub' | 'div'
}

export interface ConstantOp extends BaseOp {
  type: 'constant'
  value: number
}

export interface LoadOp extends BaseOp {
  type: 'load'
  variable: string
}

export interface StoreOp extends BaseOp {
  type: 'store'
  variable: string
}

export type Op =
  | ActionOp
  | SenseOp
  | JumpOp
  | BranchOp
  | CallOp
  | ReturnOp
  | OperationOp
  | ConstantOp
  | LoadOp
  | StoreOp
  | CompareOp

export interface QuestData {
  title: string
  description: string
  tasks: QuestTask[]
  difficulty: string
  audioSrc?: string
  script?: {
    program: string
    questScript: string
  }
}

export interface QuestSessionData {
  id: number
  completed: boolean
  code: string
  javaCode?: string
  pythonCode?: string
  mode: Settings['mode']
  completedOnce: boolean
  language?: Settings['language']
}

export interface QuestSerialFormat {
  version: 'v1'
  title: string
  description: string
  tasks: { title: string; start: SerialWorld; target: SerialWorld }[]
  lng?: 'de' | 'en'
  editOptions?: 'python-only' | 'java-only' | 'karol-only' | 'python-pro-only'
  program?: string
  language?: 'blocks' | 'karol' | 'python' | 'java' | 'python-pro'
  questScript?: string
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
  titleEn: string
  position: number
}

export interface ICmdBlocksStore {
  names: string[]
}

export interface InspirationData {
  id: string
  publicId: string
  content: string
  createdAt: string
}

export interface EntryType {
  id: string
  title: string
  tags: string[]
  quest: QuestSerialFormat
  score: number
  jitter: number
}

export interface PyodideWorker {
  mainWorker: Worker | null
  backupWorker: Worker | null
  mainWorkerReady: boolean
  backupWorkerReady: boolean
  init: () => Promise<void>
  run: (code: string) => Promise<void>
  reset: () => void
  input: (input: string) => void
  sharedArrayDelay: Int32Array
  questPromptConfirm?: Int32Array
}

export interface PlaygroundHashData {
  dimX: number
  dimY: number
  height: number
  language: string
  program: string
}
