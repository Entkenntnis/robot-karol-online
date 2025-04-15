import { Core } from '../state/core'

export function exitClassDiagram(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.interactiveClassdiagram = false
  })
}

export function startClassDiagram(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.interactiveClassdiagram = true
    ws.world = ws.quest.tasks[0].start
    ws.ui.showOutput = true
    ws.quest.lastStartedTask = 0
  })
}
