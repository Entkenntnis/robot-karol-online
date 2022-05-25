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

export function initWorld(core: Core) {
  if (core.ws.type == 'puzzle') {
    core.mutateWs((ws) => {
      if (core.puzzle.initWorld) {
        core.puzzle.initWorld(ws.world)
      }
      if (ws.type == 'puzzle') {
        ws.progress = 0
      }
    })
  }
}
