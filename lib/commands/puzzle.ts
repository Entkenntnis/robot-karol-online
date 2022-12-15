import { Core } from '../state/core'

export function leavePreMode(core: Core) {
  core.mutateWs((ws) => {
    if (ws.type == 'puzzle') {
      ws.preMode = false
    }
  })
}

export function resetCode(core: Core) {
  core.mutateWs((ws) => {})
}

export function initWorld(core: Core) {}
