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
    let title = core.strings.editor.newTask

    if (quest.tasks.some((x) => x.title == title)) {
      let counter = 2
      do {
        title = `${core.strings.editor.newTask} ${counter++}`
      } while (quest.tasks.some((x) => x.title == title))
    }

    quest.tasks.push({
      title,
      start: createWorld(6, 4, 6),
      target: createWorld(6, 4, 6),
    })
  })
}

export function setTaskTitle(core: Core, index: number, title: string) {
  core.mutateWs(({ quest }) => {
    quest.tasks[index].title = title
  })
}

export function deleteTask(core: Core, index: number) {
  const result = confirm(core.strings.editor.delete + '?')
  if (result) {
    core.mutateWs(({ quest }) => {
      quest.tasks.splice(index, 1)
    })
  }
}

export function cloneTask(core: Core, index: number) {
  core.mutateWs(({ quest }) => {
    quest.tasks.splice(index, 0, { ...quest.tasks[index] })
  })
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
    ws.editor.showWorldPreview = true
    ws.editor.currentlyEditing = 'start'
    ws.world = ws.quest.tasks[ws.editor.editWorld!].start
    if (!ws.quest.tasks[ws.editor.editWorld!].target) {
      ws.quest.tasks[ws.editor.editWorld!].target = ws.world
    }
  })
}

export function closeWorldEditor(core: Core) {
  core.mutateWs(({ editor, quest, world }) => {
    quest.tasks[editor.editWorld!][editor.currentlyEditing] = world
    editor.editWorld = null
  })
}

export function switchCurrentlyEditedWorld(
  core: Core,
  val: Core['ws']['editor']['currentlyEditing']
) {
  if (
    val == core.ws.editor.currentlyEditing &&
    !core.ws.editor.showWorldPreview
  )
    return

  core.mutateWs((ws) => {
    if (ws.editor.showWorldPreview) {
      ws.editor.showWorldPreview = false
    } else {
      ws.quest.tasks[ws.editor.editWorld!][ws.editor.currentlyEditing] =
        ws.world
    }
    if (val == 'start') {
      ws.editor.currentlyEditing = val
      ws.world = ws.quest.tasks[ws.editor.editWorld!].start
    } else {
      ws.editor.currentlyEditing = 'target'
      ws.world = ws.quest.tasks[ws.editor.editWorld!].target!
      ws.world.karol = ws.quest.tasks[ws.editor.editWorld!].start.karol
    }
  })
}

export function cloneStartIntoTarget(core: Core) {
  core.mutateWs((ws) => {
    ws.world = ws.quest.tasks[ws.editor.editWorld!].start
  })
}

export function showPreview(core: Core) {
  core.mutateWs((ws) => {
    if (!ws.editor.showWorldPreview) {
      ws.quest.tasks[ws.editor.editWorld!][ws.editor.currentlyEditing] =
        ws.world
    }
    ws.editor.showWorldPreview = true
  })
}
