import { setExecutionMarker } from '../codemirror/basicSetup'
import { sliderToDelay } from '../helper/speedSlider'
import { submit_event } from '../helper/submit'
import { robotKarol2Java } from '../language/java/robotKarol2Java'
import { robotKarol2Python } from '../language/python/robotKarol2Python'
import { Core } from '../state/core'
import {
  copyLocalToSession,
  copySessionToLocal,
  setUserName as setUserNameStorage,
} from '../storage/storage'
import { showModal } from './modal'
import { saveCodeToLocalStorage } from './save'

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
      showModal(core, 'error')
      return
    }
    if (mode == 'code' && core.ws.settings.lng == 'en') {
      // alert(core.strings.quest.warn)
    }
  } else {
    if (
      core.ws.ui.state == 'running' ||
      (core.ws.ui.state == 'loading' &&
        !(
          core.ws.settings.language == 'python-pro' &&
          core.worker &&
          !core.worker.mainWorkerReady
        )) ||
      core.ws.quest.testerHandler ||
      core.ws.ui.proMode
    ) {
      return // ignore
    }
    if (core.ws.ui.state == 'error') {
      //alert('Löse bitte vor dem Wechsel des Modus alle Probleme im Programm.')
      return
    }
  }
  core.mutateWs(({ settings, ui }) => {
    settings.mode = mode
    ui.gutter = 0
    ui.breakpoints = []
  })
  setExecutionMarker(core, 0)
  if (mode == 'code') {
    setTimeout(() => {
      core.view?.current?.focus()
    })
    if (core.ws.settings.language == 'java') {
      core.mutateWs((state) => {
        state.javaCode = robotKarol2Java(state.code)
      })
    }
    if (core.ws.settings.language == 'python-pro') {
      core.mutateWs((state) => {
        state.pythonCode = robotKarol2Python(state.code)
      })
    }
  }
  updatePlaygroundHashToMode(core)
}

export function setSpeedSliderValue(core: Core, val: number) {
  core.mutateWs((ws) => {
    const previousDelay = sliderToDelay(ws.ui.speedSliderValue)
    ws.ui.speedSliderValue = val
    const delay = sliderToDelay(ws.ui.speedSliderValue)
    const now = Date.now()
    const excessTime = now - ws.vm.startTime - ws.vm.steps * previousDelay
    ws.vm.startTime = Date.now() - ws.vm.steps * delay - excessTime
  })
  if (core.worker) {
    Atomics.store(
      core.worker.sharedArrayDelay,
      0,
      Math.round(sliderToDelay(core.ws.ui.speedSliderValue) * 1000)
    )
  }
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
  submit_event('open_image_' + img, core)
  showModal(core, 'lightbox')
}

export function closeHighlightDescription(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.isHighlightDescription = false
  })
}

export function setLng(core: Core, lng: 'de' | 'en') {
  core.mutateWs(({ settings }) => {
    settings.lng = lng
  })
}

export function updatePlaygroundHashToMode(core: Core) {
  saveCodeToLocalStorage(core, true)
}
