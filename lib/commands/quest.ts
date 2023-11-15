import { autoFormat, setEditable } from '../codemirror/basicSetup'
import { questData } from '../data/quests'
import { submit_event } from '../helper/submit'
import { submitSolution } from '../helper/submitSolution'
import { robotKarol2Java } from '../language/robotKarol2Java'
import { Core } from '../state/core'
import { QuestSessionData } from '../state/types'
import { getQuestData, getUserName, setQuestData } from '../storage/storage'
import { showModal } from './modal'
import { switchToPage } from './page'
import { run } from './vm'

export function runTask(core: Core, index: number) {
  const task = core.ws.quest.tasks[index]

  core.mutateWs((ws) => {
    ws.world = task.start
    ws.ui.showOutput = true
    ws.quest.lastStartedTask = index
    ws.quest.progress = false
  })
  if (core.ws.ui.state == 'ready') {
    if (core.view?.current) {
      autoFormat(core.view.current)
      setEditable(core.view.current, false)
    }
    if (!core.ws.ui.isTesting && core.ws.page != 'editor') {
      core.executionEndCallback = () => {
        if (
          core.ws.quest.tasks.length == 1 &&
          core.ws.quest.progress &&
          !core.ws.ui.karolCrashMessage &&
          !core.ws.ui.isManualAbort
        ) {
          core.mutateWs((ws) => {
            ws.ui.controlBarShowFinishQuest = true
          })
          showModal(core, 'success')
        }
      }
    }

    run(core)
  }
}

export function openTask(core: Core, index: number) {
  const task = core.ws.quest.tasks[index]
  core.mutateWs((ws) => {
    ws.world = task.start
    ws.ui.showOutput = true
    ws.quest.lastStartedTask = index
    ws.ui.isEndOfRun = false
    ws.quest.progress = false
    ws.ui.karolCrashMessage = undefined
  })
}

export function closeOutput(core: Core) {
  if (core.ws.quest.testerHandler !== undefined) {
    clearTimeout(core.ws.quest.testerHandler)
  }
  core.mutateWs((ws) => {
    ws.ui.showOutput = false
    ws.ui.isTesting = false
    ws.ui.karolCrashMessage = undefined
    ws.quest.progress = false
  })
}

export function finishTask(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.showOutput = false
  })
}

export function restartProgram(core: Core) {
  if (core.ws.quest.lastStartedTask !== undefined) {
    runTask(core, core.ws.quest.lastStartedTask)
  }
}

export function resetOutput(core: Core) {
  if (core.ws.quest.lastStartedTask !== undefined) {
    core.mutateWs((ws) => {
      ws.world = ws.quest.tasks[core.ws.quest.lastStartedTask!].start
      ws.ui.messages = []
      ws.quest.progress = false
      ws.ui.isEndOfRun = false
      ws.ui.karolCrashMessage = undefined
      ws.ui.gutter = 0
    })
  }
}

export function startQuest(core: Core, id: number) {
  const data = questData[id]

  core.mutateWs((ws) => {
    const { ui, quest } = ws
    ui.showOutput = false
    quest.progress = false
    quest.title = data.title
    quest.description = data.description
    quest.tasks = data.tasks
    quest.completedOnce = false
    ui.isEndOfRun = false
    ws.code = ''
    ws.javaCode = robotKarol2Java('')
    quest.id = id
    quest.audioSrc = data.audioSrc
    ui.isAlreadyCompleted = false
    ws.ui.isTesting = false
    ws.ui.controlBarShowFinishQuest = false
    ws.ui.taskScroll = 0
    ws.page = 'quest'
    ws.ui.isHighlightDescription = true
    ws.ui.audioStarted = false
    ui.speedSliderValue = 7
  })
  if ((id == 1 || core.ws.page == 'demo') && !getUserName()) {
    showModal(core, 'name')
    core.mutateWs(({ ui }) => {
      ui.isHighlightDescription = false
    })
  }
  if (id == 1) {
    core.mutateWs(({ ui }) => {
      ui.isHighlightDescription = false
    })
  }
  submit_event(`start_quest_${id}`, core)
  const sessionData = getQuestData(id)
  if (sessionData) restoreQuestFromSessionData(core, sessionData)
}

export function storeQuestToSession(core: Core) {
  const data: QuestSessionData = {
    code: core.ws.code,
    javaCode: core.ws.javaCode,
    id: core.ws.quest.id,
    mode: core.ws.settings.mode,
    completed:
      core.ws.ui.controlBarShowFinishQuest || core.ws.ui.isAlreadyCompleted,
    completedOnce:
      core.ws.ui.controlBarShowFinishQuest ||
      core.ws.ui.isAlreadyCompleted ||
      core.ws.quest.completedOnce,
    language: core.ws.settings.language,
  }
  setQuestData(data)
}

export function restoreQuestFromSessionData(
  core: Core,
  data: QuestSessionData
) {
  core.mutateWs((ws) => {
    ws.code = data.code
    if (data.javaCode) {
      ws.javaCode = data.javaCode
    }
    ws.settings.mode = data.mode
    ws.ui.isAlreadyCompleted = data.completed
    ws.quest.completedOnce = data.completedOnce
    if (data.completedOnce) {
      ws.ui.isHighlightDescription = false
    }
    if (ws.code) {
      ws.ui.isHighlightDescription = false
    }
    if (data.language) {
      ws.settings.language = data.language
    }
  })
}

export function startTesting(core: Core) {
  core.mutateWs(({ ui, quest }) => {
    ui.isTesting = true
    ui.showOutput = true
    quest.progress = false
    ui.isAlreadyCompleted = false
    quest.lastStartedTask = 0
  })
  if (core.ws.ui.state == 'error') {
    runTask(core, 0)
    return
  }

  function callback() {
    if (
      core.ws.quest.progress &&
      !core.ws.ui.karolCrashMessage &&
      !core.ws.ui.isManualAbort
    ) {
      const index = core.ws.quest.lastStartedTask!
      if (index + 1 < core.ws.quest.tasks.length) {
        // not last task
        core.executionEndCallback = callback

        core.mutateWs((ws) => {
          ws.quest.testerHandler = setTimeout(() => {
            core.mutateWs((ws) => {
              ws.quest.testerHandler = undefined
            })
            runTask(core, index + 1)
          }, 500)
        })
      } else {
        core.mutateWs((ws) => {
          ws.ui.controlBarShowFinishQuest = true
        })
        showModal(core, 'success')
      }
    }
  }
  core.executionEndCallback = callback

  runTask(core, 0)
}

export function finishQuest(core: Core) {
  if (core.ws.quest.id < 0) {
    submit_event(
      `custom_quest_complete_${window.location.hash.substring(1)}`,
      core
    )
    core.mutateWs((ws) => {
      ws.ui.isAlreadyCompleted = true
      ws.ui.controlBarShowFinishQuest = false
    })
    closeOutput(core)
    return
  }

  /*if (!getQuestData(core.ws.quest.id)) {
    submitSolution(
      core,
      core.ws.quest.id,
      (core.ws.settings.mode == 'code' ? '//code-tab\n' : '') + core.ws.code
    )
  }*/
  storeQuestToSession(core)
  switchToPage(core, 'overview')
  submit_event(`quest_complete_${core.ws.quest.id}`, core)
}

export function setTaskScroll(core: Core, scrollTop: number) {
  core.mutateWs(({ ui }) => {
    ui.taskScroll = scrollTop
  })
}

export function setOverviewScroll(core: Core, scrollTop: number) {
  core.mutateWs(({ overview }) => {
    overview.overviewScroll = scrollTop
  })
}
