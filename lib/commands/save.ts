import { Core } from '../state/core'
import type { QuestSerialFormat_MUST_STAY_COMPATIBLE } from '../state/types'

const debouncedReplaceState = (() => {
  const data = {
    latestHash: '',
    lastestTitle: '',
    hasTimeout: false,
    lastUpdate: -1,
  }

  return (hash: string, title: string, immediate: boolean) => {
    data.latestHash = hash
    data.lastestTitle = title

    if (immediate) {
      execute()
      return
    }

    if (!data.hasTimeout) {
      if (data.lastUpdate + 2000 < Date.now()) {
        execute()
      } else {
        setTimeout(execute, 2000)
        data.hasTimeout = true
      }
    }
  }

  function execute() {
    if (window.location.hash == data.latestHash) {
      return
    }
    window.history.replaceState(
      {},
      data.lastestTitle,
      window.location.pathname + data.latestHash,
    )
    window.document.title = data.lastestTitle
    data.hasTimeout = false
    data.lastUpdate = Date.now()
  }
})()

export function saveCodeToFile(core: Core) {
  // Create header
  let header = ''

  if (
    window.location.host === 'karol.arrrg.de' ||
    window.location.host.includes('localhost')
  ) {
    if (core.ws.quest.id >= 1) {
      // I'm within the context of a quest
      header = `${core.ws.settings.language == 'python' ? '#' : '//'} Bearbeitung von "${core.ws.quest.title}" (${window.location.toString()})\n\n`
    }
  }

  // 3. Create a Blob from the string
  const blob = new Blob(
    [
      header +
        (core.ws.settings.language == 'robot karol' ||
        core.ws.settings.mode == 'blocks'
          ? core.ws.code
          : core.ws.settings.language == 'python'
            ? core.ws.pythonCode
            : core.ws.javaCode),
    ],
    {
      type: 'text/plain',
    },
  )

  // 4. Create a URL for the Blob
  const url = window.URL.createObjectURL(blob)

  // 5. Create an anchor element for the download link
  const a = document.createElement('a')
  a.href = url
  const extension =
    core.ws.settings.language == 'robot karol' ||
    core.ws.settings.mode == 'blocks'
      ? 'txt'
      : core.ws.settings.language == 'python'
        ? 'py'
        : 'java.txt'
  a.download =
    core.ws.page == 'spielwiese'
      ? core.ttung('Programm') + '.' + extension
      : `${core.ws.quest.title.replace(/[^A-Za-z0-9äüöÄÜÖß]/g, '_')}${
          core.ws.ui.sharedQuestId ? '-' + core.ws.ui.sharedQuestId : ''
        }.${extension}` // specify the filename

  // 6. Simulate a click on the anchor element to trigger the download
  a.click()

  // 7. Clean up by revoking the Blob URL
  window.URL.revokeObjectURL(url)
}

export function saveCodeToLocalStorage(core: Core, immediate = false) {
  if (core.ws.ui.sharedQuestId) {
    const state = getProgram(core)
    localStorage.setItem(
      `robot_karol_online_shared_quest_${core.ws.ui.sharedQuestId.toLowerCase()}_program`,
      JSON.stringify(state),
    )
  }
  if (core.ws.page == 'spielwiese') {
    let hash = ''
    if (core.ws.settings.mode == 'code') {
      if (core.ws.settings.language == 'robot karol') {
        hash = '#CODE'
      } else if (core.ws.settings.language == 'java') {
        hash = '#JAVA'
      } else if (core.ws.settings.language == 'python') {
        hash = '#PYTHON'
      }
    }
    if (window.location.hash == hash) {
      return
    }
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + hash,
    )
  }
  if (core.ws.ui.isPlayground) {
    const prefix = `#SPIELWIESE${
      core.ws.settings.mode == 'blocks'
        ? ''
        : `-${
            core.ws.settings.language == 'robot karol'
              ? 'CODE'
              : core.ws.settings.language == 'java'
                ? 'JAVA'
                : core.ws.settings.language == 'python'
                  ? 'PYTHON'
                  : 'PYTHON'
          }`
    }`
    const newWindowTitle =
      'Spielwiese' +
      (core.ws.settings.mode == 'blocks'
        ? ''
        : core.ws.settings.language == 'robot karol'
          ? ''
          : core.ws.settings.language == 'java'
            ? ' Karol Java'
            : core.ws.settings.language == 'python'
              ? ' Python'
              : ' Karol Python')
    const code =
      (core.ws.ui.isPlayground
        ? `${
            core.ws.settings.language == 'python' ? '#' : '//'
          } Spielwiese: ${core.ws.quest.tasks[0].start.dimX}, ${
            core.ws.quest.tasks[0].start.dimY
          }, ${core.ws.quest.tasks[0].start.height}\n\n`
        : '') +
      (core.ws.settings.language == 'robot karol' ||
      core.ws.settings.mode == 'blocks'
        ? core.ws.code
        : core.ws.settings.language == 'python'
          ? core.ws.pythonCode
          : core.ws.javaCode)
    const hash = encodeURIComponent(code)
    let newHash = `${prefix}:${hash}`
    if (
      code == '// Spielwiese: 15, 10, 6\n\n' ||
      code == '# Spielwiese: 15, 10, 6\n\nkarol = Robot()\n\n' ||
      code ==
        '// Spielwiese: 15, 10, 6\n\nclass Programm {\n  Robot karol = new Robot();\n\n  void main() {\n    \n  }\n}'
    ) {
      newHash = prefix
    }
    if (
      newHash != window.location.hash ||
      window.document.title != newWindowTitle
    ) {
      {
        debouncedReplaceState(newHash, newWindowTitle, immediate)
      }
    }
  }
}

export function attemptToLoadProgramFromLocalStorage(core: Core) {
  if (core.ws.ui.sharedQuestId) {
    try {
      const state = JSON.parse(
        localStorage.getItem(
          `robot_karol_online_shared_quest_${core.ws.ui.sharedQuestId.toLowerCase()}_program`,
        ) ?? '{}',
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
  language: QuestSerialFormat_MUST_STAY_COMPATIBLE['language'],
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
      ws.settings.language = 'python'
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

export function getProgram(core: Core): {
  language: QuestSerialFormat_MUST_STAY_COMPATIBLE['language']
  program: string
} {
  if (core.ws.settings.mode == 'blocks') {
    return { language: 'blocks', program: core.ws.code }
  } else {
    if (core.ws.settings.language == 'robot karol') {
      return { language: 'karol', program: core.ws.code }
    } else if (core.ws.settings.language == 'java') {
      return { language: 'java', program: core.ws.javaCode }
    } else if (core.ws.settings.language == 'python') {
      return { language: 'python', program: core.ws.pythonCode }
    }
  }
  return { language: 'blocks', program: '' }
}

export function updatePlaygroundHashToMode(core: Core) {
  saveCodeToLocalStorage(core, true)
}
