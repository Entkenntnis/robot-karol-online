import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { CoreState } from '../state/types'
import { addNewTask } from './editor'
import { hideProfile } from './mode'
import { loadProgram } from './save'

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
    if (core.ws.editor.keepQuest) {
      const questId = core.ws.ui.sharedQuestId
      core.mutateWs((ws) => {
        ws.ui.sharedQuestId = undefined
      })
      if (questId && core.ws.ui.resetCode[questId]) {
        const [language, program] = core.ws.ui.resetCode[questId]
        loadProgram(core, program, language as any)
      }
      core.mutateWs((ws) => {
        const { editor, ui, quest } = ws
        editor.keepQuest = false
        ui.isPlayground = false
        editor.editOptions = 'all'
        editor.saveProgram = true
        ui.isHighlightDescription = false
        ui.errorMessages = []
        ui.collapseDescription = false

        if (!questId || !ui.resetCode[questId]) {
          ws.code = ''
          ws.javaCode = ''
          ws.pythonCode = ''
          ws.editor.questScript = ''
        }

        ui.resetCode = {}
        quest.id = -1
        ui.needsTextRefresh = true
        editor.editOptions = 'all'
        if (ui.lockLanguage == 'java') {
          editor.editOptions = 'java-only'
        } else if (ui.lockLanguage == 'python') {
          editor.editOptions = 'python-only'
        } else if (ui.lockLanguage == 'karol') {
          editor.editOptions = 'karol-only'
        } else if (ui.lockLanguage == 'python-pro') {
          editor.editOptions = 'python-pro-only'
        }
      })
    } else {
      core.mutateWs((ws) => {
        const { quest, ui, editor } = ws
        quest.title = core.strings.editor.title
        quest.description = core.strings.editor.description
        quest.tasks = []
        ui.isHighlightDescription = false
        quest.id = -1
        editor.editOptions = 'all'
        editor.saveProgram = true
        ui.isPlayground = false
        ws.code = ''
        ws.javaCode = ''
        ws.pythonCode = ''
        ws.editor.questScript = ''
        ui.errorMessages = []
        ui.collapseDescription = false
        ui.resetCode = {}
        ui.sharedQuestId = undefined
        ui.pythonProCanSwitch = true
        ws.settings.language = 'robot karol'
        ws.settings.mode = 'blocks'
      })
      addNewTask(core)
    }

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
    document.title = core.ws.quest.title + ' | Robot Karol Online'
    if (pushHistory) history.pushState(null, '', '#QUEST-' + core.ws.quest.id)
    return
  }

  if (target == 'inspiration') {
    if (pushHistory) history.pushState(null, '', '/#INSPIRATION')
    document.title = 'Aufgaben-Galerie'
    return
  }

  if (target == 'demo') {
    document.title = 'Robot Karol Online'
    if (pushHistory) history.pushState(null, '', '/#DEMO')
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
    ws.ui.showOutput = false
    ws.ui.isAlreadyCompleted = false
    ws.ui.controlBarShowFinishQuest = false
    ws.ui.errorMessages = []
    ws.ui.isTesting = false
  })
}
