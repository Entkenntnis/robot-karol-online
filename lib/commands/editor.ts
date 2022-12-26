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
    editor.showQuestPreview = val
  })
}

export function addNewTask(core: Core) {
  core.mutateWs(({ quest }) => {
    let title = 'Neuer Auftrag'

    if (quest.tasks.some((x) => x.title == title)) {
      let counter = 2
      do {
        title = `Neuer Auftrag ${counter++}`
      } while (quest.tasks.some((x) => x.title == title))
    }

    quest.tasks.push({
      title,
      target: null,
      start: createWorld(6, 4, 6),
    })
  })
}

export function setTaskTitle(core: Core, index: number, title: string) {
  core.mutateWs(({ quest }) => {
    quest.tasks[index].title = title
  })
}

export function deleteTask(core: Core, index: number) {
  const result = confirm('Auftrag löschen?')
  if (result) {
    core.mutateWs(({ quest }) => {
      quest.tasks.splice(index, 1)
    })
  }
}

export function moveTaskUp(core: Core, index: number) {
  if (index > 0) {
    core.mutateWs(({ quest }) => {
      const element = quest.tasks.splice(index, 1)[0]
      quest.tasks.splice(index - 1, 0, element)
    })
  }
}

export function moveTaskDown(core: Core, index: number) {
  if (index + 1 < core.ws.quest.tasks.length) {
    core.mutateWs(({ quest }) => {
      const element = quest.tasks.splice(index, 1)[0]
      quest.tasks.splice(index + 1, 0, element)
    })
  }
}

export function editWorld(core: Core, index: number) {
  core.mutateWs((ws) => {
    ws.editor.editWorld = index
    ws.world = ws.quest.tasks[index].start
  })
}

export function closeWorldEditor(core: Core) {
  core.mutateWs(({ editor, quest, world }) => {
    quest.tasks[editor.editWorld!].start = world
    editor.editWorld = null
  })
}

export function setShowResizeWorld(core: Core, val: boolean) {
  core.mutateWs(({ editor }) => {
    editor.showResizeWorld = val
  })
}
