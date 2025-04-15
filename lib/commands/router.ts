import { Core } from '../state/core'
import { createWorld } from '../state/create'
import { addNewTask } from './editor'
import { startQuest } from './quest'

export async function navigate(core: Core, hash: string) {
  history.pushState(null, '', '/' + hash)

  // push state is not triggering hash change event, so hydrate manually
  await hydrateFromHash(core)
}

// Assume that all relevant data is in the hash
export async function hydrateFromHash(core: Core) {
  const hash = window.location.hash.replace(/^#/, '')
  const page = hash.split(':')[0].toUpperCase()
  const colonIndex = hash.indexOf(':')
  const data = colonIndex !== -1 ? hash.substring(colonIndex + 1) : ''

  console.log('NAV: hydrate from hash', page, data)

  // PHASE 0: reset
  core.reset()

  // PHASE 1: hydrate
  if (page == '') {
    core.mutateWs((ws) => {
      ws.page = 'overview'
    })
    document.title = 'Robot Karol Online'
    return
  }

  if (page == 'EDITOR') {
    core.mutateWs((ws) => {
      ws.page = 'editor'

      const { quest } = ws
      quest.title = core.strings.editor.title
      quest.description = core.strings.editor.description
      quest.tasks = []
    })
    addNewTask(core)
    document.title = 'Editor'
    return
  }

  if (page.startsWith('SPIELWIESE')) {
    core.mutateWs((ws) => {
      ws.quest.title = 'Spielwiese'
      ws.quest.description = 'Programmiere frei und baue dein Herzensprojekt.'
      ws.quest.tasks = [
        { title: 'Spielwiese', start: createWorld(15, 10, 6), target: null },
      ]
      ws.ui.needsTextRefresh = true

      ws.ui.isPlayground = true
      ws.page = 'imported' // playground should get a separate page, but this is a battle for another day
    })
    // TODO: title, sync data
    return
  }

  if (page == 'INSPIRATION') {
    core.mutateWs((ws) => {
      ws.page = 'inspiration'
    })
    document.title = 'Aufgaben-Galerie'
    return
  }

  if (page.startsWith('QUEST-')) {
    const questId = parseInt(page.substring(6))
    startQuest(core, questId)
    document.title = core.ws.quest.title + ' | Robot Karol Online'
    return
  }

  if (page == 'HIGHSCORE') {
    core.mutateWs((ws) => {
      ws.page = 'highscore'
    })
    document.title = 'Highscore | Robot Karol Online'
    return
  }

  if (page == 'PROFIL') {
    core.mutateWs((ws) => {
      ws.page = 'overview'
      ws.overview.showProfile = true
    })
    document.title = 'Profil | Robot Karol Online'
    return
  }

  if (page == 'OVERVIEW') {
    core.mutateWs((ws) => {
      ws.page = 'overview'
      ws.overview.showOverviewList = true
    })
    document.title = core.strings.overview.showAll + ' | Robot Karol Online'
    return
  }

  // fall back
  await navigate(core, '')
}
