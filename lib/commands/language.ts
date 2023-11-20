import { submit_event } from '../helper/submit'
import { robotKarol2Java } from '../language/robotKarol2Java'
import { robotKarol2Python } from '../language/robotKarol2Python'
import { Core } from '../state/core'
import { Settings } from '../state/types'

export function setLanguage(core: Core, language: Settings['language']) {
  if (language == 'robot karol' && core.ws.ui.toBlockWarning) {
    alert(
      'Du verwendest Funktionen von Java, die nicht in Blöcken oder Robot Karol Code darstellbar sind. Eine Konvertierung ist im Moment nicht möglich.'
    )
    return
  }
  if (language == 'java') {
    submit_event('use_java', core)
  }
  core.mutateWs((state) => {
    const { settings, ui } = state
    if (settings.language != 'java' && language == 'java') {
      state.javaCode = robotKarol2Java(state.code)
    }
    if (settings.language != 'python' && language == 'python') {
      state.pythonCode = robotKarol2Python(state.code)
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
