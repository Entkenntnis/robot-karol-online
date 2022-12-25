import { Core } from '../state/core'
import { createWorld } from '../state/create'

export function setTitle(core: Core, title: string) {
  core.mutateWs(({ quest }) => {
    quest.title = title
  })
}

export function setDescription(core: Core, desc: string) {
  core.mutateWs(({ quest }) => {
    quest.description = desc
  })
}

export function setQuestPreview(core: Core, val: boolean) {
  core.mutateWs(({ editor }) => {
    editor.questPreview = val
  })
}

export function addNewTask(core: Core) {
  core.mutateWs(({ quest }) => {
    quest.tasks.push({
      title: 'Neuer Auftrag',
      target: null,
      start: createWorld(6, 4, 6),
    })
  })
}
