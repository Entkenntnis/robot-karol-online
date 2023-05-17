import { sliderToDelay } from '../helper/speedSlider'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import {
  copyLocalToSession,
  copySessionToLocal,
  setUserName as setUserNameStorage,
} from '../storage/storage'
import { closeModal, showModal } from './modal'

export function setMode(core: Core, mode: Core['ws']['settings']['mode']) {
  if (core.ws.settings.mode == 'blocks') {
    if (
      core.ws.ui.state == 'running' ||
      core.ws.ui.state == 'loading' ||
      core.ws.quest.testerHandler
    ) {
      return // ignore
    }
    if (core.ws.ui.state == 'error') {
      alert(
        'Bitte verbinde alle Blöcke und vervollständige das Programm, bevor du den Modus wechselst.'
      )
      return
    }
  } else {
    if (
      core.ws.ui.state == 'running' ||
      core.ws.ui.state == 'loading' ||
      core.ws.quest.testerHandler
    ) {
      return // ignore
    }
    if (core.ws.ui.state == 'error') {
      //alert('Löse bitte vor dem Wechsel des Modus alle Probleme im Programm.')
      return
    }
    if (core.ws.ui.toBlockWarning) {
      alert(
        'Anweisungen und mehrzeilige Kommentare sind nur im Code-Editor verfügbar.'
      )
      return
    }
  }
  core.mutateWs(({ settings, ui }) => {
    settings.mode = mode
    ui.toBlockWarning = false
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

export function editCodeAndResetProgress(core: Core) {
  core.mutateWs(({ quest, ui }) => {
    ui.isTesting = false
    quest.progress = false
    ui.isAlreadyCompleted = false
  })
}

export function setShowStructogram(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showStructogram = val
  })
}

export function setShowCodeInfo(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showCodeInfo = val
  })
}

export function forceRerender(core: Core) {
  core.mutateWs((ws) => {
    ws.renderCounter++
  })
}

export function setPersist(core: Core, val: boolean) {
  if (val) {
    submit_event('persist_progress', core)
  }
  if (val) {
    copySessionToLocal()
  } else {
    copyLocalToSession()
  }
}

export function setUserName(core: Core, name: string) {
  closeModal(core)
  core.mutateWs(({ ui }) => {
    ui.isHighlightDescription = true
  })
  submit_event('set_name_' + name, core)
  setUserNameStorage(name)
}

export function hideSaveHint(core: Core) {
  core.mutateWs(({ overview }) => {
    overview.showSaveHint = false
  })
}

export function openImage(core: Core, img: string) {
  core.mutateWs(({ ui }) => {
    ui.imageLightbox = img
  })
  showModal(core, 'lightbox')
}

export function closeHighlightDescription(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.isHighlightDescription = false
  })
}
