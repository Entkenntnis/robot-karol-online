import {
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import produce, { Draft } from 'immer'

import { CoreRefs, CoreState, WorkspaceState, World } from './types'
import { Workspace } from './workspace'
import { EditorView } from '@codemirror/view'

// set up core within app
export function useCreateCore() {
  const [coreState, setCoreState] = useState<CoreState>(() =>
    getDefaultCoreState()
  )
  const coreRef = useRef<CoreRefs>({ state: coreState })
  return useMemo(() => new Core(setCoreState, coreRef), [])
}

const CoreContext = createContext<Core | null>(null)

// access to core
export function useCore() {
  const val = useContext(CoreContext)
  if (val) {
    return val
  }
  throw new Error('Bad usage of core state')
}

// wrap App
export const CoreProvider = CoreContext.Provider

export class Core {
  setCoreState: Dispatch<SetStateAction<CoreState>>
  coreRef: MutableRefObject<CoreRefs>
  workspaces: { [key: string]: Workspace }

  constructor(
    setCoreState: Dispatch<SetStateAction<CoreState>>,
    coreRef: MutableRefObject<CoreRefs>
  ) {
    this.setCoreState = setCoreState
    this.coreRef = coreRef
    this.workspaces = {}
  }

  // async-safe way to access core state
  get state() {
    return this.coreRef.current.state
  }

  // always mutate core state with this function
  mutate(updater: (draft: Draft<CoreState>) => void) {
    const newState = produce(this.state, updater)
    this.coreRef.current.state = newState
    this.setCoreState(newState)
  }

  showResearchCenter() {
    this.mutate((state) => {
      state.showResearchCenter = true
    })
  }

  hideResearchCenter() {
    this.mutate((state) => {
      state.showResearchCenter = false
    })
  }

  switchToWorkspace(id: number) {
    this.mutate((state) => {
      state.currentWorkspace = id
      state.showResearchCenter = false
    })
  }

  // give core a reference to editor view
  injectEditorView(view: EditorView) {
    this.coreRef.current.view = view
  }

  // access editor view instance - if present
  get view() {
    return this.coreRef.current.view
  }
}

// ----- pure helper functions

function getDefaultCoreState(): CoreState {
  return {
    world: createWorld(5, 10, 6),
    code: '\n',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      needTextRefresh: false,
      wireframe: false,
      progress: 0,
      showTechTree: false,
    },
    vm: { pc: 0, entry: 0, frames: [{}], callstack: [] },
    settings: {
      speed: 'fast',
    },
    workspaces: [
      getFreeModeWorkspaceState(),
      getFreeModeWorkspaceState(),
      getFreeModeWorkspaceState(),
    ],
    currentWorkspace: 0,
    showResearchCenter: false,
  }
}

function getFreeModeWorkspaceState(): WorkspaceState {
  return {
    title: 'Freier Modus',
    world: createWorld(5, 10, 6),
    code: '\n',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      needTextRefresh: false,
      wireframe: false,
      progress: 0,
      showTechTree: false,
    },
    vm: { pc: 0, entry: 0, frames: [{}], callstack: [] },
    settings: {
      speed: 'fast',
    },
  }
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
    chips: [
      /*{ type: 'inverter', x: 3, y: 2, init: false }*/
    ],
  }
  for (const chip of world.chips) {
    chip.init = true
    if (chip.type == 'inverter') {
      const val = Math.random() < 0.5
      if (val) {
        world.bricks[chip.y + 1][chip.x] = 1
      }
    }
  }
  return world
}
