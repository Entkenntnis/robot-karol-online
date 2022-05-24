import { Core } from '../state/core'

export function focusWrapper(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.shouldFocusWrapper = true
  })
}

export function focusWrapperDone(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.shouldFocusWrapper = false
  })
}
