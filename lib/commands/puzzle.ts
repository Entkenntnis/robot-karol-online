import { Core } from '../state/core'

export function leavePreMode(core: Core) {
  core.mutateWs((ws) => {
    if (ws.type == 'puzzle') {
      ws.preMode = false
    }
  })
}

export function resetCode(core: Core) {
  core.mutateWs((ws) => {
    if (core.ws.type == 'puzzle') {
      ws.code = core.puzzle.code
      ws.ui.needsTextRefresh = true
    }
  })
}
