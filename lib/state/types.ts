export type Heading = 'north' | 'east' | 'south' | 'west'

export interface World {
  dimX: number
  dimY: number
  height: number
  karol: {
    x: number
    y: number
    dir: Heading
  }[]
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
  lockLanguage?: 'java' | 'karol' | 'python-pro'
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
  isBench?: boolean
  karolmaniaLevelId?: number
  karolmaniaCarouselIndex?: number
  tourModePage?: number
  isChatMode: boolean
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
  chatCursor?: { chatIndex: number; msgIndex: number; mode: 'play' | 'warn' }

  chatVisualText: string
  chatVisualRole: 'out' | 'in' | 'spill'
  chatvisualWarning?: 'output-mismatch' | 'missing-output' | 'missing-input'
}

export interface Settings {
  mode: 'code' | 'blocks'
  language: 'robot karol' | 'java' | 'python-pro'
  lng: 'de' | 'en'
}

export interface Editor {
  showQuestPreview: boolean
  editWorld: number | null
  currentlyEditing: 'start' | 'target'
  showWorldPreview: boolean
  editOptions: 'all' | 'java-only' | 'karol-only' | 'python-pro-only'
  saveProgram: boolean
  keepQuest: boolean
  questScript: string
  originalCode?: string
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
  lockToKarolCode?: boolean
  chats: ChatTask[]
}

export interface Overview {
  overviewScroll: number
  learningPathScroll: number
  showSaveHint: boolean
  showOverviewList: boolean
  showProfile: boolean
  explanationId: number
}

export interface WorkspaceState {
  // IDE
  world: World
  __activeRobot: number
  ui: Ui
  code: string
  javaCode: string
  pythonCode: string
  vm: Vm
  settings: Settings

  // IDE Modes
  quest: Quest
  editor: Editor
  bench: Bench

  // canvas
  canvas: Canvas

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
    | 'karolmania'
    | 'karolmania-game'
    | 'donate'
    | 'flashcards'

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
    | 'invocation'
    | 'explanation'
    | 'character'
    | 'chat-guide'
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

export interface Bench {
  classInfo: { [key: string]: ClassInfo }
  objects: ObjectInfo[]
  invocationMode: 'constructor' | 'method'
  invocationParameters: ParameterInfo[]
  // only constructor
  invocationClass: string
  // only method
  invocationObject: string
  invocationMethod: string

  locked: boolean
  history: string
}

export interface ObjectInfo {
  name: string
  className: string
}

export interface ClassInfo {
  name: string
  doc: string
  constructor: FunctionInfo
  methods: { [key: string]: FunctionInfo }
}

export interface FunctionInfo {
  name: string
  doc: string
  parameters: ParameterInfo[]
}

export interface ParameterInfo {
  name: string
  default?: any
}

export interface Canvas {
  manualControl: boolean
  instrumentIdCounter: number
}

export interface ICanvsObjects {
  objects: CanvasObject[]
}

type CanvasObject = CanvasRectangle

export interface CanvasRectangle {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  fillColor: string
}

export interface QuestTask {
  title: string
  start: World
  target: World | null
}

export interface ChatTask {
  title: string
  messages: ChatMessage[]
}

export interface ChatMessage {
  text: string
  role: 'out' | 'in'
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
  quests: {
    [key: string]: { reachable: number; complete: number; completedAll: number }
  }
  karolmania: {
    [key: number]: { times: number[] }
  }
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
  survey: { value: string; ts: number }[]
  ratings: {
    [key: string]: { count: number; average: number; values: number[] }
  }
  newEventStats: {
    uniqueUsers: number
    stats: { [key: string]: { sessions: number; average: number } }
  }
  chapters: {
    [key: number]: { selected: number; explanation: number }
  }
  pythonKarol: {
    [key: string]: { count: number }
  }
  questions: {
    [key: number]: { questions: { text: string; ts: number }[] }
  }
  markedQuestions: string[]
  pythonExampleLevenshtein: {
    [name: string]: {
      distances: number[]
      count: number
      sessions: string[]
    }
  }
  danceScores: {
    [key: string]: {
      scores: number[]
    }
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
  setActiveRobot?: number
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
  setActiveRobot?: number
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

export interface AddRobotOp extends BaseOp {
  type: 'add-robot'
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
  | AddRobotOp

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

export interface QuestSessionData_MUST_STAY_COMPATIBLE {
  id: number
  completed: boolean
  code: string
  javaCode?: string
  pythonCode?: string
  mode: 'code' | 'blocks'
  completedOnce: boolean
  language?: 'robot karol' | 'java' | 'python' | 'python-pro'
}

export interface QuestSerialFormat_MUST_STAY_COMPATIBLE {
  version: 'v1'
  title: string
  description: string
  tasks: {
    title: string
    start: SerialWorld_MUST_STAY_COMPATIBLE
    target: SerialWorld_MUST_STAY_COMPATIBLE
  }[]
  lng?: 'de' | 'en'
  editOptions?: 'python-only' | 'java-only' | 'karol-only' | 'python-pro-only'
  program?: string
  language?: 'blocks' | 'karol' | 'python' | 'java' | 'python-pro'
  questScript?: string
  chats?: { title: string; messages: { text: string; role: 'out' | 'in' }[] }[]
}

export interface SerialWorld_MUST_STAY_COMPATIBLE {
  dimX: number
  dimY: number
  height: number
  karol: {
    x: number
    y: number
    dir: Heading
  }
  bricks: Compressed2D_MUST_STAY_COMPATIBLE<number>
  marks: Compressed2D_MUST_STAY_COMPATIBLE<boolean>
  blocks: Compressed2D_MUST_STAY_COMPATIBLE<boolean>
}

export interface Compressed2D_MUST_STAY_COMPATIBLE<T> {
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
  quest: QuestSerialFormat_MUST_STAY_COMPATIBLE
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
  lint: (input: string) => void
  pause: () => void
  resume: () => void
  step: () => void
  addBreakpoint: (line: number) => void
  removeBreakpoint: (line: number) => void
  prepareBench: () => Promise<object>
  messageBench: (payload: object) => Promise<object>
  sharedArrayDelay: Int32Array
  debugInterface: Int32Array
  questPromptConfirm?: Int32Array
  isFresh: boolean
  benchMessageIdCounter: number
  benchMessageResolvers: Map<number, (value: object) => void>
}

export interface PlaygroundHashData {
  dimX: number
  dimY: number
  height: number
  language: string
  program: string
}

export interface EditorSessionSnapshot {
  settings: Settings
  editor: Editor
  quest: Quest
  code: string
  javaCode: string
  pythonCode: string
  isChatMode: boolean
}

export interface KarolmaniaProgress_WILL_BE_STORED_ON_CLIENT {
  levels: {
    [key: number]: {
      pb: number // seconds
    }
  }
}

export interface OverviewMapData {
  x: number
  y: number
  deps: number[]
  dir?: Heading
  chapter?: number
}
