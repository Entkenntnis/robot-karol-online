import { Core } from '../state/core'
import type { CoreState } from '../state/types'

type Modal = CoreState['workspace']['modal']

export function showModal(core: Core, modal: Modal) {
  core.mutateWs((ws) => {
    ws.modal = modal
  })
}

export function closeModal(core: Core) {
  core.mutateWs((ws) => {
    ws.modal = null
  })
}
