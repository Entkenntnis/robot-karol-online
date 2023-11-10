import { robotKarol2Java } from '../language/robotKarol2Java'
import { Core } from '../state/core'
import { Settings } from '../state/types'

export function setLanguage(core: Core, language: Settings['language']) {
  if (language == 'robot karol' && core.ws.ui.toBlockWarning) {
    alert(
      'Du verwendest Funktionen von Java, die nicht in Blöcken oder Robot Karol Code darstellbar sind. Eine Konvertierung ist im Moment nicht möglich.'
    )
    return
  }
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
