import { robotKarol2Java } from '../language/robotKarol2Java'
import { Core } from '../state/core'
import { Settings } from '../state/types'

export function setLanguage(core: Core, language: Settings['language']) {
  core.mutateWs((state) => {
    const { settings, ui } = state
    if (settings.language == 'robot karol' && language == 'java') {
      state.javaCode = robotKarol2Java(state.code)
    }
    settings.language = language
    ui.showJavaInfo = false
  })
  setTimeout(() => {
    core.view?.current?.focus()
  })
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
