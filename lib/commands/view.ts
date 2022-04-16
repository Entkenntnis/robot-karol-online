import { Core } from '../state/core'

export function toggleWireframe(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.wireframe = !ui.wireframe
  })
}
