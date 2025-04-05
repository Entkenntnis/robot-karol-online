import { Core } from '../state/core'
import { loadLegacyProject, loadQuest } from './load'
import { switchToPage } from './page'
import { getLng, getRobotImage } from '../storage/storage'
import { setLng, showOverviewList, updatePlaygroundHashToMode } from './mode'
import { createWorld } from '../state/create'
import { PlaygroundHashData, QuestSerialFormat } from '../state/types'
import { deserializeQuest } from './json'
import { startQuest } from './quest'
import { setLanguage } from './language'
import { analyze, submitAnalyzeEvent } from './analyze'
import { loadProgram } from './save'

export async function initClient(core: Core) {
  window.addEventListener('popstate', () => {
    window.location.reload()
  })

  const parameterList = new URLSearchParams(window.location.search)

  const id = parameterList.get('id')

  const code = parameterList.get('code')

  if (typeof code === 'string') {
    // lock ui to code only
    core.mutateWs((ws) => {
      ws.ui.lockLanguage = 'karol'
      ws.settings.mode = 'code'
    })
  }

  if (id) {
    if (id == 'Z9xO1rVGj') {
      submitAnalyzeEvent(core, 'ev_show_playgroundLegacyLink')
      buildPlayground(core)
      switchToPage(core, 'imported')
      return
    }
    await loadLegacyProject(core, id)
    switchToPage(core, 'imported')
    return
  }

  const robotImage = getRobotImage()
  if (robotImage) {
    core.mutateWs((ws) => {
      ws.robotImageDataUrl = robotImage
    })
  }

  setLng(core, getLng())

  const hash = window.location.hash.toUpperCase()
  const normalHash = window.location.hash

  if (hash.startsWith('#SPIELWIESE')) {
    const [mainHash, dataPart] = normalHash.split(':')
    submitAnalyzeEvent(core, 'ev_show_playgroundHash' + mainHash.toLowerCase())
    const parts = mainHash.toUpperCase().split('-')
    if (parts.length > 1) {
      const mode = parts[1]
      core.mutateWs((ws) => {
        ws.settings.mode = 'code'
      })
      if (mode == 'CODE') {
        core.mutateWs((ws) => {
          ws.settings.mode = 'code'
          ws.settings.language = 'robot karol'
        })
      } else if (mode == 'PYTHON') {
        setLanguage(
          core,
          parts.length == 3 && parts[2] == 'PRO' ? 'python-pro' : 'python'
        )
      } else if (mode == 'JAVA') {
        setLanguage(core, 'java')
      }
    }
    buildPlayground(core)
    updatePlaygroundHashToMode(core)
    if (dataPart) {
      // deserialize world
      try {
        const data: PlaygroundHashData = JSON.parse(atob(dataPart))
        core.mutateWs((ws) => {
          ws.quest.tasks = [
            {
              title: 'Spielwiese',
              start: createWorld(data.dimX, data.dimY, data.height),
              target: null,
            },
          ]
        })
        loadProgram(core, data.program, data.language as any)
        submitAnalyzeEvent(core, 'ev_show_modifier_playgroundWithDataHash')
      } catch (e) {}
    }
    switchToPage(core, 'imported')
    return
  }

  if (hash == '#OVERVIEW') {
    submitAnalyzeEvent(core, 'ev_show_listOfAll')
    showOverviewList(core)
    return
  }

  if (hash == '#INSPIRATION') {
    submitAnalyzeEvent(core, 'ev_show_inspiration')
    switchToPage(core, 'inspiration')
    return
  }

  if (hash == '#INSPIRATION-OLD') {
    switchToPage(core, 'inspiration-old')
    return
  }

  if (hash.startsWith('#QUEST-')) {
    const questId = parseInt(hash.substring(7))
    startQuest(core, questId)
    return
  }

  if (hash == '#ANALYZE' /* && window.location.hostname == 'localhost'*/) {
    await analyze(core)
    return
  }

  if (hash == '#EDITOR') {
    submitAnalyzeEvent(core, 'ev_show_editor')
    switchToPage(core, 'editor')
    return
  }

  if (hash.startsWith('#OPEN:')) {
    try {
      // extract url
      const url = normalHash.substring(6)
      // fetch data
      const response = await fetch(url)
      const text = await response.text()
      const obj = JSON.parse(text ?? '{}') as QuestSerialFormat
      if (obj.version !== 'v1') {
        throw 'bad format'
      }
      deserializeQuest(core, obj)
      switchToPage(core, 'shared')
      return
    } catch (e) {
      alert(e)
    }
  }

  if (hash.startsWith('#ROBOT:')) {
    const data = decodeURIComponent(normalHash.substring(7))
    core.mutateWs((ws) => {
      ws.ui.newRobotImage = data
    })
    submitAnalyzeEvent(
      core,
      'ev_show_robotImage_' + (data.length > 50 ? data.slice(-50) : data)
    )
    history.replaceState(null, '', '/')
    switchToPage(core, 'overview')
    return
  }

  if (hash == '#DEMO') {
    submitAnalyzeEvent(core, 'ev_show_demo')
    core.mutateWs(({ ui }) => {
      ui.returnToDemoPage = true
    })
    switchToPage(core, 'demo')
    return
  } else if (hash.length == 5) {
    await loadQuest(core, hash.substring(1))
    switchToPage(core, 'shared')
    return
  }

  submitAnalyzeEvent(core, 'ev_show_landing')
  switchToPage(core, 'overview')
}

export function buildPlayground(core: Core) {
  core.mutateWs((ws) => {
    ws.quest.title = 'Spielwiese'
    ws.quest.description = 'Programmiere frei und baue dein Herzensprojekt.'
    ws.ui.isPlayground = true
    ws.quest.tasks = [
      { title: 'Spielwiese', start: createWorld(15, 10, 6), target: null },
    ]
    ws.ui.needsTextRefresh = true
    ws.ui.isEndOfRun = false
    ws.quest.lastStartedTask = undefined
    ws.ui.showOutput = false
    ws.ui.isTesting = false
    ws.code = ''
    ws.javaCode = ''
    ws.pythonCode = ''
    ws.editor.questScript = ''
    ws.ui.lockLanguage = undefined
    ws.ui.controlBarShowFinishQuest = false
    ws.ui.isAlreadyCompleted = false
  })
}
