import { backend } from '../../backend'
import { questData } from '../data/quests'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { QuestSerialFormat } from '../state/types'
import { addNewTask } from './editor'
import { deserializeQuest } from './json'
import { loadLegacyProject, loadQuest } from './load'

export async function initClient(core: Core) {
  if (core.ws.ui.clientInitDone) return

  const parameterList = new URLSearchParams(window.location.search)

  const id = parameterList.get('id')

  if (id) {
    core.mutateWs(({ ui }) => {
      ui.editorLoading = true
      ui.showQuestOverview = false
      ui.isImportedProject = true
    })
    await loadLegacyProject(core, id)
    core.mutateWs(({ ui }) => {
      ui.clientInitDone = true
    })
    return
  }

  const hash = window.location.hash.toUpperCase()

  if (hash == '#EDITOR') {
    core.mutateWs(({ ui, quest }) => {
      ui.isEditor = true
      ui.showQuestOverview = false
      quest.title = 'Titel der Aufgabe'
      quest.description = 'Beschreibe, um was es bei der Aufgabe geht ...'
    })

    submit_event('show_editor', core)

    const id = parseInt(parameterList.get('quest') ?? '')

    if (id > 0) {
      const obj = questData[id]
      core.mutateWs((ws) => {
        ws.quest.title = obj.title
        ws.quest.description = obj.description
        ws.quest.tasks = obj.tasks
      })
    } else {
      addNewTask(core)
    }

    core.mutateWs(({ ui }) => {
      ui.clientInitDone = true
    })
    return
  }

  if (hash == '#DEMO') {
    core.mutateWs(({ ui }) => {
      ui.isDemo = true
    })
    submit_event('show_demo', core)
  } else if (hash.length == 5) {
    core.mutateWs(({ ui }) => {
      ui.editorLoading = true
      ui.showQuestOverview = false
    })
    await loadQuest(core, hash.substring(1))
    core.mutateWs(({ ui }) => {
      ui.clientInitDone = true
    })
    return
  }

  core.mutateWs(({ ui }) => {
    ui.clientInitDone = true
  })
}
