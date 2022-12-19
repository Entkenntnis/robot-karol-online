import { sliderToDelay } from '../helper/speedSlider'
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
  // WELP, some TODOs here
  core.mutateWs((ws) => {
    const previousDelay = sliderToDelay(ws.ui.speedSliderValue)
    ws.ui.speedSliderValue = val
    const delay = sliderToDelay(ws.ui.speedSliderValue)
    const now = Date.now()
    const excessTime = now - ws.vm.startTime - ws.vm.steps * previousDelay
    ws.vm.startTime = Date.now() - ws.vm.steps * delay - excessTime
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

export function editCodeAndResetProgress(core: Core) {
  core.mutateWs(({ quest, ui }) => {
    quest.completed = []
    ui.freezeCode = false
    ui.showOutput = false
    quest.progress = 0
  })
}
