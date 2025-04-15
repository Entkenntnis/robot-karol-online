import { Core } from '../state/core'
import { createWorld } from '../state/create'
import {
  PlaygroundHashData,
  QuestSerialFormat_MUST_STAY_COMPATIBLE,
} from '../state/types'
import {
  getLearningPathScroll,
  getLng,
  getLockToKarolCode,
  getOverviewScroll,
  getRobotImage,
  restoreEditorSnapshot,
} from '../storage/storage'
import { analyze, submitAnalyzeEvent } from './analyze'
import { addNewTask } from './editor'
import { deserializeQuest } from './json'
import { loadLegacyProject, loadQuest } from './load'
import { setLng } from './mode'
import { startQuest } from './quest'
import { loadProgram } from './save'

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

  submitAnalyzeEvent(core, 'ev_show_hash_' + page.slice(0, 100))

  // PHASE 0: reset
  core.reset()

  // PHASE 1: common
  setLng(core, getLng())

  const robotImage = getRobotImage()
  if (robotImage) {
    core.mutateWs((ws) => {
      ws.robotImageDataUrl = robotImage
    })
  }

  // restore overview scroll position
  core.mutateWs((ws) => {
    ws.overview.overviewScroll = getOverviewScroll()
    ws.overview.learningPathScroll = getLearningPathScroll()
    ws.quest.lockToKarolCode = getLockToKarolCode()
  })

  // PHASE 2: hydrate page
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
    document.title = 'Editor | Robot Karol Online'
    restoreEditorSnapshot(core)
    return
  }

  if (page.startsWith('SPIELWIESE')) {
    document.title = 'Spielwiese | Robot Karol Online'
    core.mutateWs((ws) => {
      ws.quest.title = 'Spielwiese'
      ws.quest.description = 'Programmiere frei und baue dein Herzensprojekt.'
      ws.quest.tasks = [
        { title: 'Spielwiese', start: createWorld(15, 10, 6), target: null },
      ]
      ws.ui.needsTextRefresh = true

      ws.ui.isPlayground = true
      ws.page = 'imported' // playground should get a separate page, but this is a battle for another day

      if (page == 'SPIELWIESE-CODE') {
        ws.settings.mode = 'code'
        ws.settings.language = 'robot karol'
      }

      if (page == 'SPIELWIESE-PYTHON' || page == 'SPIELWIESE-PYTHON-PRO') {
        ws.settings.mode = 'code'
        ws.settings.language = 'python-pro'
        document.title = 'Spielwiese Python | Robot Karol Online'
      }

      if (page == 'SPIELWIESE-JAVA') {
        ws.settings.mode = 'code'
        ws.settings.language = 'java'
        document.title = 'Spielwiese Karol Java | Robot Karol Online'
      }
    })
    if (data) {
      // deserialize world
      try {
        const dataObj: PlaygroundHashData = JSON.parse(
          decodeURIComponent(atob(data))
        )
        core.mutateWs((ws) => {
          ws.quest.tasks = [
            {
              title: 'Spielwiese',
              start: createWorld(dataObj.dimX, dataObj.dimY, dataObj.height),
              target: null,
            },
          ]
        })
        loadProgram(core, dataObj.program, dataObj.language as any)
        submitAnalyzeEvent(core, 'ev_show_modifier_playgroundWithDataHash')
      } catch (e) {}
    }
    return
  }

  if (page == 'INSPIRATION') {
    core.mutateWs((ws) => {
      ws.page = 'inspiration'
    })
    document.title = 'Aufgaben-Galerie | Robot Karol Online'
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

  if (page == 'ROBOT') {
    const decodedData = decodeURIComponent(data)
    core.mutateWs((ws) => {
      ws.ui.newRobotImage = decodedData
    })
    submitAnalyzeEvent(
      core,
      'ev_show_robotImage_' +
        (decodedData.length > 50 ? decodedData.slice(-50) : decodedData)
    )
    history.replaceState(null, '', '/')
    core.mutateWs((ws) => {
      ws.page = 'overview'
    })
    return
  }

  if (page == 'LEGACY') {
    await loadLegacyProject(core, data)
    core.mutateWs((ws) => {
      ws.page = 'imported'
    })
    document.title = 'Importiertes Projekt | Robot Karol Online'
    return
  }

  if (page == 'ANALYZE') {
    await analyze(core)
    document.title = 'Analyse-Dashboard'
    return
  }

  if (page == 'DEMO') {
    core.mutateWs((ws) => {
      ws.page = 'demo'
    })
    document.title = 'Demo | Robot Karol Online'
    return
  }

  if (page == 'OPEN') {
    try {
      // extract url
      const url = data
      // fetch data
      const response = await fetch(url)
      const text = await response.text()
      const obj = JSON.parse(
        text ?? '{}'
      ) as QuestSerialFormat_MUST_STAY_COMPATIBLE
      if (obj.version !== 'v1') {
        throw 'bad format'
      }
      deserializeQuest(core, obj)
      core.mutateWs((ws) => {
        ws.page = 'shared'
      })
      return
    } catch (e) {
      alert(e)
    }
  }

  if (page.length == 4) {
    await loadQuest(core, page)
    core.mutateWs((ws) => {
      ws.page = 'shared'
    })
    return
  }

  // fall back
  await navigate(core, '')
}
