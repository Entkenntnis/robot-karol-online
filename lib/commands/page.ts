import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { CoreState } from '../state/types'
import { addNewTask } from './editor'
import { hideOverviewList } from './mode'

type Pages = CoreState['workspace']['page']

export function switchToPage(core: Core, target: Pages) {
  core.mutateWs((ws) => {
    ws.page = target
  })

  // some handlers
  if (target == 'editor') {
    resetQuestView(core)
    core.mutateWs(({ quest, ui }) => {
      quest.title = 'Titel der Aufgabe'
      quest.description = 'Beschreibe, um was es bei der Aufgabe geht ...'
      quest.tasks = []
      ui.isHighlightDescription = false
      quest.id = -1
    })

    submit_event('show_editor', core)
    addNewTask(core)
  }

  if (target == 'overview') {
    const hash = window.location.hash.toUpperCase()
    if (hash == '#DEMO') {
      switchToPage(core, 'demo')
    }
  }
}

function resetQuestView(core: Core) {
  // run this function for all quest views
  core.mutateWs((ws) => {
    ws.code = ''
    ws.ui.showOutput = false
    ws.ui.isAlreadyCompleted = false
    ws.ui.controlBarShowFinishQuest = false
    ws.ui.errorMessages = []
    ws.ui.isTesting = false
  })
}
