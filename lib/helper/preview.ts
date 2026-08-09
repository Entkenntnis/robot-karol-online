import type { Core } from '../state/core'
import type { QuestTask, World } from '../state/types'

export function getTaskPreview(
  core: Core,
  task: QuestTask,
): { world: World } | undefined {
  if (task.target === null) return undefined
  return core.ws.ui.showPreview ? { world: task.target } : undefined
}
