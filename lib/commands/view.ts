import { Core } from '../state/core'

export function toggleWireframe(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.wireframe = !ui.wireframe
  })
}

/*export function refreshDone(core: Core) {
  core.mutateWs((state) => {
    state.ui.needTextRefresh = false
  })
}*/
