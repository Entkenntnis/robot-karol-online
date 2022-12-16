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
  state: 'ready' | 'loading' | 'running' | 'error' | 'stopped'
  wireframe: boolean
  needsTextRefresh: boolean
  errorMessages: string[]
  toBlockWarning: boolean
  editorLoading: boolean
  showOutput: boolean
  speedSliderValue: number
  showMenu: boolean
  showPreviewOfTarget: boolean
}

export interface Vm {
  bytecode?: Op[]
  pc: number
  handler?: NodeJS.Timeout
  frames: { [index: number]: number }[]
  callstack: number[]
  needsConfirmation: boolean
  confirmation: boolean
}

export interface Settings {
  mode: 'code' | 'blocks'
}

export interface Quest {
  tasks: QuestTask[]
  title: string
  description: string
  completed: number[]
  progress: number
  lastStartedTask?: number
}

export interface WorkspaceState {
  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings
  quest: Quest
}

export interface QuestTask {
  title: string
  start: World
  target: World
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
  type: 'brick' | 'mark' | 'wall' | 'north'
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
