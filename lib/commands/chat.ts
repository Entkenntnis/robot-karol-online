import { Core } from '../state/core'

export function startChatRunner(core: Core) {
  console.log('Chat runner started')
  core.mutateWs((ws) => {
    ws.ui.state = 'running'
  })
}

export function stopChatRunner(core: Core) {
  console.log('Chat runner stopped')
  core.mutateWs((ws) => {
    ws.ui.state = 'ready'
  })
}
