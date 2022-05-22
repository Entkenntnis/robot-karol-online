import React from 'react'
import { Core } from './core'

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
  chips: ChipInWorld[]
}

export interface ChipInWorld {
  x: number
  y: number
  tag: string
  chipState?: any
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
}

export interface Level {
  title: string
  target: number
  description: React.ReactNode
  previewImage: string
}

export interface Sparkle {
  type: 'happy' | 'fail'
  posX: number
  posY: number
}

export interface Chip {
  tag: string
  checkAction: (core: Core, chip: ChipInWorld) => boolean
  initAction: (core: Core, chip: ChipInWorld) => void
  isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => boolean
  image: string
  imageXOffset: number
  imageYOffset: number
  checkpointX: number
  checkpointY: number
  sparkleX: number
  sparkleY: number
}

export interface WorkspaceStateBase {
  title: string

  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings
}

interface WorkspaceStateFreeMode extends WorkspaceStateBase {
  type: 'free'
  tabs: [string, string, string, string]
  currentTab: number
}

export interface WorkspaceStatePuzzleMode extends WorkspaceStateBase {
  type: 'puzzle'
  targetImage: string
  posX: number
  posY: number
  targetWorld: World
}

export interface WorkspaceStateLevelMode extends WorkspaceStateBase {
  type: 'level'
  progress: number
  levelId: number
  worldInit: boolean
  worldCheckpoint?: World
  sparkle?: Sparkle
}

export type WorkspaceState =
  | WorkspaceStateFreeMode
  | WorkspaceStateLevelMode
  | WorkspaceStatePuzzleMode

export interface CoreState {
  workspaces: WorkspaceState[]
  currentWorkspace: number
  showResearchCenter: boolean
  enableStats: boolean
  projectTitle?: string
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
