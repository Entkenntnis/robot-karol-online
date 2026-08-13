import { backend } from '../../backend'
import { flightdeckTabs } from '../data/flightdeckTabs'
import { levels } from '../data/karolmaniaLevels'
import { pythonKarolExamples } from '../data/pythonExamples'
import { ____submitAnalyzeEvent } from '../helper/submit'
import { superfetch } from '../helper/superfetch'
import { CanvasObjects } from '../state/canvas-objects'
import { Core } from '../state/core'
import { createWorld } from '../state/create'
import type {
  QuestSerialFormat_MUST_STAY_COMPATIBLE,
  Tab,
} from '../state/types'
import {
  getLearningPathScroll,
  getLng,
  getLockToKarolCode,
  getOverviewScroll,
  getRobotImage,
  getKarolmaniaCarouselIndex,
  restoreEditorSnapshot,
  getMiniProjectCollapsed,
  setLockToKarolCode,
  setLngStorage,
} from '../storage/storage'
import { refreshEditArea } from './editing'
import { addNewTask } from './editor'
import { triggerEvent } from './experiment'
import { deserializeQuest } from './json'
import { loadLegacyProject, loadQuest } from './load'
import { setLng } from './mode'
import { startQuest } from './quest'
import { isBot } from 'isbot'

const bluejPlaygroundHash =
  '#SPIELWIESE-PYTHON:%23 Spielwiese%3A 15%2C 10%2C 6%0A%0A%23 Hallo! Die Spielwiese hat einen neuen Modus. Sobald du Python aktivierst%2C%0A%23 kannst du auf das interaktive Klassendiagramm zugreifen.%0A%0A%23 Dort kannst du Objekte erzeugen und Methoden aufrufen wie in BlueJ.%0A%0A%23 Probiere es jetzt aus! Klicke jetzt auf interaktives Klassendiagramm%2C%0A%23 erzeuge einen Robot und steuere Karol direkt über die Objektkarte.%0A%0A%0A%0A%23 Das Ganze funktioniert auch mit eigenen Klassen%3A%0A%23 (zum Testen auskommentieren)%0A%0A"""%0Aclass MeineKlasse%3A%0A%20%20%20 def hallo(self)%3A%0A%20%20%20%20%20%20%20 "Das ist ein Docstring für die Methode hallo"%0A%20%20%20%20%20%20%20 print("Hallo %3A)")%0A"""'

export async function navigate(core: Core, url: string) {
  history.pushState(null, '', '/' + url)

  // push state is not triggering hash change event, so hydrate manually
  await hydrate(core)
}

// Main router entry point and fully flexible routing logic
// Handles pathname, hash and query
// Calling this function will fully reset the client and transition to a known state
export async function hydrate(core: Core) {
  let raw_hash = window.location.hash
  const path = window.location.pathname
  const parameterList = new URLSearchParams(window.location.search)

  console.log(
    `-> hydrate path:${path}, hash:${raw_hash}, search:${parameterList}`,
  )

  // search parameter redirects (heavy)
  const code = parameterList.get('code')
  if (code) {
    setLockToKarolCode()
    window.open('/', '_self')
    return
  }

  const id = parameterList.get('id')
  if (id) {
    if (id == 'Z9xO1rVGj') {
      ____submitAnalyzeEvent(core, 'ev_show_playgroundLegacyLink')
      window.open('/#SPIELWIESE', '_self')
      return
    }
    window.open('/#LEGACY:' + id, '_self')
    return
  }

  // internal rewrites
  let rewrite = ''
  if (raw_hash.toLocaleUpperCase() == '#BLUEJ-PLAYGROUND') {
    raw_hash = bluejPlaygroundHash
    rewrite = 'BLUEJ-PLAYGROUND'
  }
  if (raw_hash.toLocaleUpperCase() == '#DANCE') {
    raw_hash =
      pythonKarolExamples.find((el) => el.title == 'Dance, Dance')?.link || ''
    rewrite = 'DANCE'
  }

  const hash = raw_hash.replace(/^#/, '')
  const page = hash.split(':')[0].toUpperCase()
  const colonIndex = hash.indexOf(':')
  const data = colonIndex !== -1 ? hash.substring(colonIndex + 1) : ''

  // This is what we count
  if (!isBot(navigator.userAgent) && window.location.host == 'karol.arrrg.de') {
    // register pageview, fire-and-forget
    fetch(backend.pageviewEndpoint, { method: 'POST' })
  }

  // all paths use the root path for now
  setCanonical('')

  // PHASE 0: reset
  // const previousWs = core.ws
  core.reset()
  CanvasObjects.update((s) => {
    s.objects = []
  })

  // PHASE 1: common
  setLng(core, getLng())

  const robotImage = getRobotImage()
  if (robotImage) {
    core.mutateWs((ws) => {
      ws.robotImageDataUrl = robotImage
    })
  }

  // restore overview scroll position and chapter
  core.mutateWs((ws) => {
    ws.overview.overviewScroll = getOverviewScroll()
    ws.overview.learningPathScroll = getLearningPathScroll()
    ws.quest.lockToKarolCode = getLockToKarolCode()
    ws.ui.miniProjectsOpen = !getMiniProjectCollapsed()
  })

  /*if (previousWs.ui.tourModePage == 4) {
    core.mutateWs((ws) => {
      ws.ui.tourModePage = 4
    })
  }*/

  // PHASE 2: hydrate page
  if (path == '/python' && (page == '' || page == 'DEMO')) {
    core.mutateWs((ws) => {
      ws.page = 'python-path'
      if (page == 'DEMO') {
        ws.ui.demoModus = true
      }
      ws.settings.lng = 'de'
      // language versions are hard
    })
    setLngStorage('de') // make sure UI is in German, because the whole mode only works with German
    document.title = 'Python Lernpfad'
    setCanonical('python')
    return
  }

  if (page == 'EDITOR' || (path == '/editor' && page == '')) {
    core.mutateWs((ws) => {
      ws.page = 'editor'
      const { quest } = ws
      quest.title = core.ttung('Titel der Aufgabe')
      quest.description = core.ttung(
        'Beschreibe, um was es bei der Aufgabe geht ...',
      )
      quest.tasks = []
    })
    addNewTask(core)
    document.title = 'Editor | Robot Karol Online'
    restoreEditorSnapshot(core)
    refreshEditArea(core)
    setCanonical('editor')
    return
  }

  if (page.startsWith('SPIELWIESE')) {
    document.title = core.ttung('Spielwiese') + ' | Robot Karol Online'
    core.mutateWs((ws) => {
      ws.quest.title = core.ttung('Spielwiese')
      ws.quest.description = core.ttung(
        'Programmiere frei und baue dein Herzensprojekt.',
      )
      ws.quest.tasks = [
        {
          title: core.ttung('Spielwiese'),
          start: createWorld(15, 10, 6),
          target: null,
        },
      ]

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
      let code = decodeURIComponent(data)
      // check for playground pragma and extract world size
      const match = code.match(/(\/\/|#) Spielwiese: (\d+), (\d+), (\d+)\n\n/)
      if (match) {
        const dimX = parseInt(match[2])
        const dimY = parseInt(match[3])
        const height = parseInt(match[4])
        core.mutateWs((ws) => {
          ws.quest.tasks = [
            {
              title: core.ttung('Spielwiese'),
              start: createWorld(dimX, dimY, height),
              target: null,
            },
          ]
        })
        code = code.replace(match[0], '')
      }
      core.mutateWs((s) => {
        if (core.ws.settings.language == 'java') {
          s.javaCode = code
        } else if (core.ws.settings.language == 'python-pro') {
          s.pythonCode = code
        } else {
          s.code = code
        }
      })
      if (rewrite != 'BLUEJ-PLAYGROUND') {
        ____submitAnalyzeEvent(core, 'ev_show_modifier_playgroundWithDataHash')
      }
    }
    refreshEditArea(core)
    return
  }

  if (
    path == '/flightdeck' &&
    (page == '' || flightdeckTabs.find((el) => el.id == page.toLowerCase()))
  ) {
    const tab = (page.toLowerCase() || 'karol') as Tab
    core.mutateWs((ws) => {
      ws.page = 'flightdeck'
      ws.ui.flightdeckTab = tab
    })
    const tabTitle = flightdeckTabs.find((el) => el.id == tab)!.label
    document.title = `[ Flightdeck | ${tabTitle} ]`
    return
  }

  if (page == '') {
    core.mutateWs((ws) => {
      ws.page = 'overview'
    })
    document.title = 'Robot Karol Online'
    triggerEvent(core, 'visit-landing')
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
    refreshEditArea(core)
    triggerEvent(core, 'start-quest-' + questId)
    document.title = core.ws.quest.title + ' | Robot Karol Online'
    return
  }

  if (page == 'OVERVIEW') {
    core.mutateWs((ws) => {
      ws.page = 'overview'
      ws.overview.showOverviewList = true
    })
    document.title = 'Robot Karol Online'
    return
  }

  if (page == 'ROBOT') {
    const decodedData = decodeURIComponent(data)
    core.mutateWs((ws) => {
      ws.ui.newRobotImage = decodedData
    })
    ____submitAnalyzeEvent(
      core,
      'ev_show_robotImage_' +
        (decodedData.length > 50 ? decodedData.slice(-50) : decodedData),
    )
    history.replaceState(null, '', '/')
    core.mutateWs((ws) => {
      ws.page = 'overview'
    })
    triggerEvent(core, 'load-robot-image')
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

  if (page == 'DEMO') {
    core.mutateWs((ws) => {
      ws.page = 'demo'
    })
    document.title = 'Demo | Robot Karol Online'
    return
  }

  if (page == 'KAROLMANIA') {
    core.mutateWs((ws) => {
      ws.page = 'karolmania'
      // Set the carousel index from session storage
      ws.ui.karolmaniaCarouselIndex = getKarolmaniaCarouselIndex()
    })
    document.title = 'Karolmania'
    return
  }

  if (page.startsWith('KAROLMANIA-')) {
    const levelId = parseInt(page.substring(11))
    const level = levels.find((l) => l.id == levelId)
    if (!level) {
      console.error('Level not found:', levelId)
      return
    }
    deserializeQuest(core, level.quest)
    core.mutateWs((ws) => {
      ws.page = 'karolmania-game'
      // We could store the selected level in the workspace state here if needed
      ws.ui.karolmaniaLevelId = levelId
      ws.world = ws.quest.tasks[0].start
    })
    document.title = 'Karolmania - ' + level.quest.title
    return
  }

  if (page == 'OPEN') {
    try {
      // extract url
      const url = data
      // fetch data, a more reliable fetch is useful here I think
      const response = await superfetch(url)
      const text = await response.text()
      const obj = JSON.parse(
        text ?? '{}',
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

  if (page == 'LOCAL') {
    try {
      const obj = JSON.parse(
        decodeURIComponent(data) ?? '{}',
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
    document.title = `${document.title} | #${page}`
    refreshEditArea(core)
    return
  }

  // fall back
  await navigate(core, '')
}

function setCanonical(url: string) {
  let link = document.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = 'https://karol.arrrg.de/' + url
}
