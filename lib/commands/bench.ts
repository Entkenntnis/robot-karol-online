import { Core } from '../state/core'

export function exitBench(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.isBench = false
    ui.state = 'ready'
  })
  core.worker!.reset()
}

export async function startBench(core: Core) {
  await core.worker!.prepareBench()
  core.mutateWs((ws) => {
    ws.ui.isBench = true
    ws.world = ws.quest.tasks[0].start
    ws.ui.showOutput = true
    ws.quest.lastStartedTask = 0
    ws.ui.state = 'running'
  })
  updateBench(core)
}

export async function updateBench(core: Core) {
  const result = await core.worker!.messageBench({ request: 'listing' })
  alert(JSON.stringify(result))
}
