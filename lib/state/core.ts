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
import { createDefaultCoreState } from './create'
import { puzzles } from '../data/puzzles'

// set up core within app
export function useCreateCore() {
  const [coreState, setCoreState] = useState<CoreState>(() =>
    createDefaultCoreState()
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
  _setCoreState: Dispatch<SetStateAction<CoreState>>
  _coreRef: MutableRefObject<CoreRefs>
  _workspaceStorage: { [key: string]: { world: World; code: string } }

  userId: string

  constructor(
    setCoreState: Dispatch<SetStateAction<CoreState>>,
    coreRef: MutableRefObject<CoreRefs>
  ) {
    this._setCoreState = setCoreState
    this._coreRef = coreRef
    this._workspaceStorage = {}
    this.userId = Math.random().toString()
  }

  // async-safe way to access core state
  get state() {
    return this._coreRef.current.state
  }

  get ws() {
    return this.state.puzzleWorkspace || this.state.editorWorkspace
  }

  get puzzle() {
    if (!this.state.puzzleWorkspace) {
      throw 'bad'
    }
    return puzzles.find((x) => x.id == this.state.puzzleWorkspace!.id)!
  }

  // always mutate core state with this function
  mutateCore(updater: (draft: Draft<CoreState>) => void) {
    const newState = produce(this.state, updater)
    this._coreRef.current.state = newState
    this._setCoreState(newState)
  }

  // proxy call to core, workspace aware
  mutateWs(updater: (draft: Draft<WorkspaceState>) => void) {
    this.mutateCore((state) => {
      updater(state.puzzleWorkspace || state.editorWorkspace)
    })
  }

  retrieveWsFromStorage(id: number) {
    return this._workspaceStorage[id.toString()]
  }

  setWsToStorage(id: number, world: World, code: string) {
    this._workspaceStorage[id.toString()] = { world, code }
  }

  deleteWsFromStorage(id: number) {
    delete this._workspaceStorage[id.toString()]
  }
}
