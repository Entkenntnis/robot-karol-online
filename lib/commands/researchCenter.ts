import { Core } from '../state/core'
import { createPuzzleWorkspaceState } from '../state/create'
import { abort } from './vm'

export function showResearchCenter(core: Core) {
  core.mutateCore((state) => {
    state.showResearchCenter = true
    if (state.inviteMenu) {
      state.inviteMenu = false
    }
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

export function switchToPuzzle(core: Core, id: number) {
  core.mutateCore((state) => {
    state.showResearchCenter = false
    state.puzzleWorkspace = createPuzzleWorkspaceState(id)
    state.inviteStart = false
  })
}
