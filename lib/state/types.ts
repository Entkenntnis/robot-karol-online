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
  preview?: Preview
  showPreview: boolean
  shouldFocusWrapper: boolean
  hideKarol: boolean
  keepWorldPreference: boolean
  errorMessages: string[]
  toBlockWarning: boolean
  editorLoading: boolean
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

export type Speed = 'slow' | 'fast' | 'step' | 'turbo'

export interface Settings {
  speed: Speed
  mode: 'code' | 'blocks'
}

export interface WorkspaceStateBase {
  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings
}

export interface WorkspaceStateFreeMode extends WorkspaceStateBase {
  type: 'free'
}

export interface WorkspaceStatePuzzleMode extends WorkspaceStateBase {
  type: 'puzzle'
  id: number
  preMode: boolean
  progress: number
}

export interface Puzzle {
  id: number
  title: string
  posX: number
  posY: number
  targetWorld: World
  description: JSX.Element
  code: string
  deps: number[]
  initWorld?: (world: World) => void
  startSpeed?: Speed
  disableMovement?: boolean
}

export type WorkspaceState = WorkspaceStateFreeMode | WorkspaceStatePuzzleMode

export interface CoreState {
  showMenu: boolean
  enableStats: boolean
  projectTitle?: string
  projectInitialWorld?: World
  puzzleWorkspace?: WorkspaceStatePuzzleMode
  editorWorkspace: WorkspaceStateFreeMode
  inviteMenu: boolean
  inviteStart: boolean
  done: number[]
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
  type: 'brick' | 'mark' | 'wall'
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
