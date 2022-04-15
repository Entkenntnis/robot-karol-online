import type { EditorView } from '@codemirror/view'

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
  chips: {
    x: number
    y: number
    type: 'inverter'
    init: boolean
  }[]
}

export interface Message {
  text: string
  count: number
  ts: number
}

export interface Ui {
  messages: Message[]
  gutter: number
  gutterReturns: number[]
  state: 'ready' | 'loading' | 'running' | 'error'
  needTextRefresh: boolean
  filename?: string
  originalWorld?: World
  wireframe: boolean
  progress: number
  showTechTree: boolean
}

export interface Vm {
  bytecode?: Op[]
  pc: number
  entry: number
  checkpoint?: World
  handler?: NodeJS.Timeout
  frames: { [index: number]: number }[]
  callstack: number[]
}

export type Speed = 'slow' | 'fast' | 'step' | 'turbo'

export interface Settings {
  speed: Speed
}

export interface WorkspaceState {
  title: string

  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings
}

export interface CoreState {
  workspaces: WorkspaceState[]
  currentWorkspace: number
  showResearchCenter: boolean

  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings
}

export interface CoreRefs {
  state: CoreState
  view?: EditorView
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
}

export interface JumpCondOp {
  type: 'jumpcond'
  targetT: number
  targetF: number
  condition: Condition
}

export interface CallOp {
  type: 'call'
  target: number
  line: number
}

export interface ReturnOp {
  type: 'return'
}

export type Op = ActionOp | JumpNOp | JumpCondOp | CallOp | ReturnOp
