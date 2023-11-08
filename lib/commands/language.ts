import { Core } from '../state/core'
import { Settings } from '../state/types'

export function setLanguage(core: Core, language: Settings['language']) {
  core.mutateWs(({ settings, ui }) => {
    settings.language = language
    ui.showJavaInfo = false
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
