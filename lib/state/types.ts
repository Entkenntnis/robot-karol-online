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
  track: { x: number; y: number }[]
  karol?: {
    x: number
    y: number
    dir: Heading
  }
  world: World
}

export interface Ui {
  messages: Message[]
  gutter: number
  gutterReturns: number[]
  state: 'ready' | 'loading' | 'running' | 'error'
  wireframe: boolean
  needsTextRefresh: boolean
  errorMessages: string[]
  toBlockWarning: boolean
  editorLoading: boolean
  showOutput: boolean
  speedSliderValue: number
  showMenu: boolean
  showPreviewOfTarget: boolean
  karolCrashMessage?: string
  isManualAbort: boolean
  isEndOfRun: boolean
  taskWaitingToLoad?: number
  showErrorModal: boolean
  freezeCode: boolean
  taskScroll: number
  showQuestOverview: boolean
  isImportedProject: boolean
  showImpressum: boolean
  showPrivacy: boolean
  isAlreadyCompleted: boolean
  showStructogram: boolean
  isTesting: boolean
  isTestingAborted: boolean
  clientInitDone: boolean
  controlBarShowFinishQuest: boolean
  isEditor: boolean
  isDemo: boolean
  showCodeInfo: boolean
  renderCounter: number
  isAnalyze: boolean
  overviewScroll: number
  isPlayground: boolean
  showHighscore: boolean
  showNameModal: boolean
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
}

export interface Editor {
  showQuestPreview: boolean
  editWorld: number | null
  showResizeWorld: boolean
  showShareModal: boolean
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
}

export interface WorkspaceState {
  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings
  quest: Quest
  editor: Editor
  analyze: Analyze
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
  customQuests: { [key: string]: { start: number; complete: number } }
  legacy: { [key: string]: { count: number } }
  quests: { [key: string]: { reachable: number; complete: number } }
  userTimes: number[]
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
  type: 'brick' | 'mark' | 'wall' | 'north' | 'brick_count'
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
}

export interface QuestSessionData {
  id: number
  completed: boolean
  code: string
  mode: Settings['mode']
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
