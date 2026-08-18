import type { Core } from '../state/core'

const zoomLevels = [
  0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7,
  1.8, 1.9, 2.0, 2.5, 3.0,
]

export function decreaseZoomLevel(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.zoomLevelIndex = Math.max(0, ws.ui.zoomLevelIndex - 1)
  })
}

export function increaseZoomLevel(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.zoomLevelIndex = Math.min(
      zoomLevels.length - 1,
      ws.ui.zoomLevelIndex + 1,
    )
  })
}

export function getZoom(core: Core) {
  return zoomLevels[core.ws.ui.zoomLevelIndex]
}
