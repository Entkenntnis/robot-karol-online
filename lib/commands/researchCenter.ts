import { Core } from '../state/core'
import { createPuzzle1WorkspaceState } from '../state/create'
import { abort } from './vm'

export function showResearchCenter(core: Core) {
  core.mutateCore((state) => {
    state.showResearchCenter = true
  })
  abort(core)
}

export function hideResearchCenter(core: Core) {
  core.mutateCore((state) => {
    state.showResearchCenter = false
  })
}

export function switchToFreeWorkspace(core: Core) {
  core.mutateCore((state) => {
    state.showResearchCenter = false
    state.puzzleWorkspace = undefined
  })
}

export function switchToPuzzle(core: Core) {
  core.mutateCore((state) => {
    state.showResearchCenter = false
    state.puzzleWorkspace = createPuzzle1WorkspaceState()
  })
}
