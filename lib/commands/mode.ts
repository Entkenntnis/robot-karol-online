import { Core } from '../state/core'

export function setMode(core: Core, mode: Core['ws']['settings']['mode']) {
  core.mutateWs(({ settings, ui }) => {
    settings.mode = mode
    ui.toBlockWarning = false
  })
}

export function showMenu(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showMenu = true
  })
}

export function closeMenu(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showMenu = false
  })
}

export function setShowTarget(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showPreviewOfTarget = val
  })
}

export function setSpeedSliderValue(core: Core, val: number) {
  core.mutateWs((ws) => {
    ws.ui.speedSliderValue = val
  })
}

export function showErrorModal(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showErrorModal = true
  })
}

export function hideErrorModal(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showErrorModal = false
  })
}
