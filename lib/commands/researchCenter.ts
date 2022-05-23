import { Core } from '../state/core'
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

export function switchToWorkspace(core: Core, id: number) {
  core.mutateCore((state) => {
    //state.currentWorkspace = id
    state.showResearchCenter = false
  })
}
