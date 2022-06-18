import { parser } from '../codemirror/parser/parser'
import { Core } from '../state/core'

export function setMode(core: Core, mode: Core['ws']['settings']['mode']) {
  // todo: convert between representations
  core.mutateWs(({ settings, ui }) => {
    settings.mode = mode
    ui.toBlockWarning = false
  })
}
