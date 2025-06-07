import { levels } from '../data/karolmaniaLevels'
import { pythonKarolExamples } from '../data/pythonExamples'
import { CanvasObjects } from '../state/canvas-objects'
import { Core } from '../state/core'
import { createWorld } from '../state/create'
import { QuestSerialFormat_MUST_STAY_COMPATIBLE } from '../state/types'
import {
  getLearningPathScroll,
  getLng,
  getLockToKarolCode,
  getOverviewScroll,
  getRobotImage,
  getKarolmaniaCarouselIndex,
  restoreEditorSnapshot,
} from '../storage/storage'
import { analyze, submitAnalyzeEvent } from './analyze'
import { addNewTask } from './editor'
import { deserializeQuest } from './json'
import { loadLegacyProject, loadQuest } from './load'
import { setLng, setMode } from './mode'
import { startQuest } from './quest'

const bluejPlaygroundHash =
  '#SPIELWIESE-PYTHON:%23 Spielwiese%3A 15%2C 10%2C 6%0A%0A%23 Hallo! Die Spielwiese hat einen neuen Modus. Sobald du Python aktivierst%2C%0A%23 kannst du auf das interaktive Klassendiagramm zugreifen.%0A%0A%23 Dort kannst du Objekte erzeugen und Methoden aufrufen wie in BlueJ.%0A%0A%23 Probiere es jetzt aus! Klicke jetzt auf interaktives Klassendiagramm%2C%0A%23 erzeuge einen Robot und steuere Karol direkt über die Objektkarte.%0A%0A%0A%0A%23 Das Ganze funktioniert auch mit eigenen Klassen%3A%0A%23 (zum Testen auskommentieren)%0A%0A"""%0Aclass MeineKlasse%3A%0A%20%20%20 def hallo(self)%3A%0A%20%20%20%20%20%20%20 "Das ist ein Docstring für die Methode hallo"%0A%20%20%20%20%20%20%20 print("Hallo %3A)")%0A"""'

export async function navigate(core: Core, hash: string) {
  history.pushState(null, '', '/' + hash)

  // push state is not triggering hash change event, so hydrate manually
  await hydrateFromHash(core)
}

// Assume that all relevant data is in the hash
export async function hydrateFromHash(core: Core) {
  let raw_hash = window.location.hash
  let rewrite = ''

  // internal rewrites
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

  submitAnalyzeEvent(
    core,
    'ev_show_hash_' + (rewrite ? rewrite : page.slice(0, 100))
  )

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
  })

  /*if (previousWs.ui.tourModePage == 4) {
    core.mutateWs((ws) => {
      ws.ui.tourModePage = 4
    })
  }*/

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
              title: 'Spielwiese',
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
        s.ui.needsTextRefresh = true
      })
      if (core.ws.settings.mode == 'blocks') {
        // This "hack" is necessary to force an update for blockly
        // there is probably a better way of doing it
        // leaving it here for another day
        core.mutateWs((ws) => {
          ws.ui.state = 'ready'
        })
        setMode(core, 'code')
        const check = () => {
          if (core.ws.ui.needsTextRefresh) {
            setTimeout(check, 10)
          } else {
            setMode(core, 'blocks')
          }
        }
        check()
      }
      if (rewrite != 'BLUEJ-PLAYGROUND') {
        submitAnalyzeEvent(core, 'ev_show_modifier_playgroundWithDataHash')
      }
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
  if (page == 'FLASHCARDS') {
    core.mutateWs((ws) => {
      ws.page = 'flashcards'
    })
    document.title = 'Python Crash-Kurs'
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

  if (page == 'SPENDEN') {
    core.mutateWs((ws) => {
      ws.page = 'donate'
    })
    document.title = 'Spenden | Robot Karol Online'
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
