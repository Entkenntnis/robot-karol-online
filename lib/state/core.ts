import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { produce, Draft } from 'immer'
import { EditorView } from '@codemirror/view'

import { CoreRefs, CoreState, PyodideWorker, WorkspaceState } from './types'
import { createDefaultCoreState } from './create'
import { deStrings } from '../strings/de'
import { enStrings } from '../strings/en'
import { Instrument } from 'tone/build/esm/instrument/Instrument'

// set up core within app
export function useCreateCore() {
  const [coreState, setCoreState] = useState<CoreState>(() =>
    createDefaultCoreState()
  )
  const coreRef = useRef<CoreRefs>({ state: coreState })
  return useMemo(() => new Core(setCoreState, coreRef), [])
}

export const CoreContext = createContext<Core | null>(null)

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
  _coreRef: RefObject<CoreRefs>

  worker?: PyodideWorker
  executionEndCallback?: () => void

  // these two are managed by react lifecycles and should be always up to date
  blockyResize?: () => void
  view?: RefObject<EditorView | undefined>

  instruments: Map<number, Instrument<any>> = new Map()

  constructor(
    setCoreState: Dispatch<SetStateAction<CoreState>>,
    coreRef: RefObject<CoreRefs>
  ) {
    this._setCoreState = setCoreState
    this._coreRef = coreRef
  }

  // async-safe way to access core state
  get state() {
    return this._coreRef.current.state
  }

  get ws() {
    return this.state.workspace
  }

  get strings() {
    return this.state.workspace.settings.lng == 'de' ? deStrings : enStrings
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
      updater(state.workspace)
    })
  }

  reset() {
    if (this.worker && !this.worker.isFresh) {
      this.worker.reset()
    }
    this.executionEndCallback = undefined

    const cleanState = createDefaultCoreState()
    this._coreRef.current.state = cleanState
    this._setCoreState(cleanState)
    this.instruments.forEach((instrument) => {
      instrument.dispose()
    })
    this.instruments.clear()
  }
}
