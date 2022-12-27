import { autoFormat, setEditable } from '../codemirror/basicSetup'
import { questData } from '../data/quests'
import { getQuestSessionData } from '../helper/session'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { QuestSessionData } from '../state/types'
import { showQuestOverview } from './mode'
import { endExecution, run } from './vm'

export function runTask(core: Core, index: number) {
  const task = core.ws.quest.tasks[index]

  core.mutateWs((ws) => {
    ws.world = task.start
    ws.ui.showOutput = true
    ws.quest.lastStartedTask = index
  })
  if (core.ws.ui.state == 'ready') {
    if (core.view?.current) {
      autoFormat(core.view.current)
      setEditable(core.view.current, false)
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

export function endTaskWaiting(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.taskWaitingToLoad = undefined
  })
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
    ui.showQuestOverview = false
    ui.isEndOfRun = false
    ws.code = ''
    quest.id = id
    ui.isAlreadyCompleted = false
    ws.ui.isTesting = false
    ws.ui.controlBarShowFinishQuest = false
    ws.ui.taskScroll = 0
  })
  submit_event(`start_quest_${id}`, core)
  const sessionData = getQuestSessionData(id)
  if (sessionData) restoreQuestFromSessionData(core, sessionData)
}

export function storeQuestToSession(core: Core) {
  const data: QuestSessionData = {
    code: core.ws.code,
    id: core.ws.quest.id,
    mode: core.ws.settings.mode,
    completed:
      core.ws.ui.controlBarShowFinishQuest || core.ws.ui.isAlreadyCompleted,
  }
  sessionStorage.setItem(
    `karol_quest_beta_${core.ws.quest.id}`,
    JSON.stringify(data)
  )
}

export function restoreQuestFromSessionData(
  core: Core,
  data: QuestSessionData
) {
  core.mutateWs((ws) => {
    ws.code = data.code
    ws.settings.mode = data.mode
    ws.ui.isAlreadyCompleted = data.completed
  })
}

export function startTesting(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.isTesting = true
    ui.showOutput = true
  })
  if (core.ws.ui.state == 'error') return

  function callback() {
    if (
      core.ws.quest.progress &&
      !core.ws.ui.karolCrashMessage &&
      !core.ws.ui.isManualAbort
    ) {
      const index = core.ws.quest.lastStartedTask!
      core.mutateWs((ws) => {
        if (index + 1 < core.ws.quest.tasks.length) {
          // not last task
          core.executionEndCallback = callback
          ws.quest.testerHandler = setTimeout(
            () => runTask(core, index + 1),
            500
          )
        } else {
          ws.ui.controlBarShowFinishQuest = true
        }
      })
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

  storeQuestToSession(core)
  showQuestOverview(core)
  submit_event(`quest_complete_${core.ws.quest.id}`, core)
}

export function setTaskScroll(core: Core, scrollTop: number) {
  core.mutateWs(({ ui }) => {
    ui.taskScroll = scrollTop
  })
}
