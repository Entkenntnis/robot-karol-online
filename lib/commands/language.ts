import { setExecutionMarker } from '../codemirror/basicSetup'
import { robotKarol2Java } from '../language/java/robotKarol2Java'
import { robotKarol2Python } from '../language/python/robotKarol2Python'
import { Core } from '../state/core'
import type { Settings } from '../state/types'
import { updatePlaygroundHashToMode } from './mode'

export function setLanguage(core: Core, language: Settings['language']) {
  core.mutateWs((state) => {
    const { settings, ui } = state
    if (settings.language != 'java' && language == 'java') {
      state.javaCode = robotKarol2Java(state.code)
    }
    if (settings.language != 'python-pro' && language == 'python-pro') {
      state.pythonCode = robotKarol2Python(state.code)
    }
    settings.language = language
    ui.showJavaInfo = false
    ui.gutter = 0
    state.ui.errorMessages = []
  })
  setExecutionMarker(core, 0)
  setTimeout(() => {
    core.view?.current?.focus()
  })
  updatePlaygroundHashToMode(core)
}

export function showJavaInfo(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showJavaInfo = true
  })
}

export function hideJavaInfo(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showJavaInfo = false
  })
}
