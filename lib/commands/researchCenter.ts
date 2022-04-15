import { Core } from '../state/core'

export function showResearchCenter(core: Core) {
  core.mutateCore((state) => {
    state.showResearchCenter = true
  })
}

export function hideResearchCenter(core: Core) {
  core.mutateCore((state) => {
    state.showResearchCenter = false
  })
}

export function switchToWorkspace(core: Core, id: number) {
  core.mutateCore((state) => {
    state.currentWorkspace = id
    state.showResearchCenter = false
  })
}
