import { Core } from '../state/core'
import { PlaygroundHashData, QuestSerialFormat } from '../state/types'
import { serializeQuest } from './json'

export function saveCodeToFile(core: Core) {
  // 3. Create a Blob from the string
  const blob = new Blob(
    [
      core.ws.settings.language == 'robot karol'
        ? core.ws.code
        : core.ws.settings.language == 'python' ||
          core.ws.settings.language == 'python-pro'
        ? core.ws.pythonCode
        : core.ws.javaCode,
    ],
    {
      type: 'text/plain',
    }
  )

  // 4. Create a URL for the Blob
  const url = window.URL.createObjectURL(blob)

  // 5. Create an anchor element for the download link
  const a = document.createElement('a')
  a.href = url
  a.download = `${core.ws.quest.title.replace(
    /[^A-Za-z0-9äüöÄÜÖß]/g,
    '_'
  )}-karol.${
    core.ws.settings.language == 'robot karol'
      ? 'txt'
      : core.ws.settings.language == 'python'
      ? 'py.txt'
      : core.ws.settings.language == 'python-pro'
      ? 'py'
      : 'java.txt'
  }` // specify the filename

  // 6. Simulate a click on the anchor element to trigger the download
  a.click()

  // 7. Clean up by revoking the Blob URL
  window.URL.revokeObjectURL(url)
}

export function saveCodeToLocalStorage(core: Core) {
  if (core.ws.ui.sharedQuestId) {
    const state = getProgram(core)
    localStorage.setItem(
      `robot_karol_online_shared_quest_${core.ws.ui.sharedQuestId.toLowerCase()}_program`,
      JSON.stringify(state)
    )
  }
  if (core.ws.ui.isPlayground) {
    const state = getProgram(core)
    const json: PlaygroundHashData = {
      dimX: core.ws.quest.tasks[0].start.dimX,
      dimY: core.ws.quest.tasks[0].start.dimY,
      height: core.ws.quest.tasks[0].start.height,
      ...state,
    }
    // update hash
    const hash = btoa(JSON.stringify(json))
    const prefix = window.location.hash.split(':')[0]
    const newHash = `${prefix}:${hash}`
    if (newHash != window.location.hash) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + newHash
      )
    }
  }
}

export function attemptToLoadProgramFromLocalStorage(core: Core) {
  if (core.ws.ui.sharedQuestId) {
    try {
      const state = JSON.parse(
        localStorage.getItem(
          `robot_karol_online_shared_quest_${core.ws.ui.sharedQuestId.toLowerCase()}_program`
        ) ?? '{}'
      )
      if (
        state.language &&
        state.program &&
        typeof state.language == 'string' &&
        typeof state.program == 'string'
      ) {
        loadProgram(core, state.program, state.language)
      }
    } catch {}
  }
}

export function loadProgram(
  core: Core,
  program: string,
  language: QuestSerialFormat['language']
) {
  core.mutateWs((ws) => {
    if (language == 'blocks') {
      ws.settings.mode = 'blocks'
      ws.code = program
    }
    if (language == 'karol') {
      ws.settings.mode = 'code'
      ws.settings.language = 'robot karol'
      ws.code = program
    }
    if (language == 'python') {
      ws.settings.mode = 'code'
      ws.settings.language = 'python'
      ws.pythonCode = program
    }
    if (language == 'java') {
      ws.settings.mode = 'code'
      ws.settings.language = 'java'
      ws.javaCode = program
    }
    if (language == 'python-pro') {
      ws.settings.mode = 'code'
      ws.settings.language = 'python-pro'
      ws.pythonCode = program
      const lines = program.split('\n').map((line) => line.trim())
      if (lines.find((line) => line == '#Ausführung: sehr schnell')) {
        ws.ui.speedSliderValue = 20
      } else if (lines.find((line) => line == '#Ausführung: schnell')) {
        ws.ui.speedSliderValue = 18
      } else if (lines.find((line) => line == '#Ausführung: mittel')) {
        ws.ui.speedSliderValue = 15
      }
    }
  })
}

export function getProgram(core: Core) {
  if (core.ws.settings.mode == 'blocks') {
    return { language: 'blocks', program: core.ws.code }
  } else {
    if (core.ws.settings.language == 'robot karol') {
      return { language: 'karol', program: core.ws.code }
    } else if (core.ws.settings.language == 'python') {
      return { language: 'python', program: core.ws.pythonCode }
    } else if (core.ws.settings.language == 'java') {
      return { language: 'java', program: core.ws.javaCode }
    } else if (core.ws.settings.language == 'python-pro') {
      return { language: 'python-pro', program: core.ws.pythonCode }
    }
  }
  return { language: 'blocks', program: '' }
}
