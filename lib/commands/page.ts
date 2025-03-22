import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { CoreState } from '../state/types'
import { addNewTask } from './editor'
import { hideProfile } from './mode'

type Pages = CoreState['workspace']['page']

export function switchToPage(core: Core, target: Pages) {
  core.mutateWs((ws) => {
    ws.page = target
  })

  const pushHistory = core.ws.ui.initDone

  // console.log('SWITCH TO PAGE', target, { pushHistory })

  // some handlers
  if (target == 'editor') {
    document.title = 'Editor'
    resetQuestView(core)
    core.mutateWs(({ quest, ui, editor }) => {
      quest.title = core.strings.editor.title
      quest.description = core.strings.editor.description
      quest.tasks = []
      ui.isHighlightDescription = false
      quest.id = -1
      editor.editOptions = 'all'
      editor.saveProgram = true
      ui.isPlayground = false
    })

    submit_event('show_editor', core)
    addNewTask(core)
    if (pushHistory) history.pushState(null, '', '/#EDITOR')
    return
  }

  if (target == 'overview') {
    document.title = 'Robot Karol Online'
    hideProfile(core)
    const hash = window.location.hash.toUpperCase()
    if (hash == '#DEMO') {
      switchToPage(core, 'demo')
      return
    } else if (core.ws.overview.showOverviewList) {
      document.title = core.strings.overview.showAll + ' | Robot Karol Online'
      if (pushHistory) history.pushState(null, '', '/#OVERVIEW')
      return
    } else {
      if (pushHistory) history.pushState(null, '', '/')
    }
    return
  }

  if (target == 'imported') {
    if (core.ws.ui.isPlayground) {
      if (pushHistory) history.pushState(null, '', '/#SPIELWIESE')
    }
    document.title = core.ws.quest.title
    return
  }

  if (target == 'quest') {
    core.mutateWs(({ ui }) => {
      ui.isPlayground = false
    })
    document.title = core.ws.quest.title + ' | Robot Karol Online'
    if (pushHistory) history.pushState(null, '', '#QUEST-' + core.ws.quest.id)
    return
  }

  if (target == 'inspiration') {
    if (pushHistory) history.pushState(null, '', '/#INSPIRATION')
    document.title = 'Aufgaben-Galerie'
    return
  }

  if (target == 'shared') {
    core.mutateWs(({ ui }) => {
      ui.isPlayground = false
    })
    // don't set title
    return
  }

  document.title = 'Robot Karol Online'
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
