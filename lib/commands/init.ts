import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { loadLegacyProject, loadQuest } from './load'
import { switchToPage } from './page'
import { getAppearance, getLng } from '../storage/storage'
import { setLng, showOverviewList, updatePlaygroundHashToMode } from './mode'
import { createWorld } from '../state/create'
import { QuestSerialFormat } from '../state/types'
import { deserializeQuest } from './json'
import { startQuest } from './quest'
import { setLanguage } from './language'
import { analyze, submitAnalyzeEvent } from './analyze'
import { endExecution } from './vm'

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
      return
    }
    await loadLegacyProject(core, id)
    switchToPage(core, 'imported')
    return
  }

  const appearance = getAppearance()
  if (appearance) {
    core.mutateWs((ws) => {
      ws.appearance = appearance
    })
  }

  setLng(core, getLng())

  const hash = window.location.hash.toUpperCase()
  const normalHash = window.location.hash

  if (hash.startsWith('#SPIELWIESE')) {
    submitAnalyzeEvent(core, 'ev_show_playgroundHash' + hash.toLowerCase())
    const parts = hash.split('-')
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
    return
  }

  if (hash == '#OVERVIEW') {
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

  if (hash == '#DEMO') {
    submit_event('show_demo', core)
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
  })
  switchToPage(core, 'imported')
}
