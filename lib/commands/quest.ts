import { autoFormat, setEditable } from '../codemirror/basicSetup'
import { questData } from '../data/quests'
import { getQuestSessionData } from '../helper/session'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { QuestSessionData } from '../state/types'
import { showQuestOverview } from './mode'
import { run } from './vm'

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
    ws.quest.progress = 0
    ws.ui.karolCrashMessage = undefined
  })
}

export function closeOutput(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.showOutput = false
    ws.ui.isTesting = false
    ws.ui.karolCrashMessage = undefined
  })
}

export function finishTask(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.showOutput = false
    ws.ui.state = 'ready'
    if (!ws.quest.completed.includes(ws.quest.lastStartedTask!))
      ws.quest.completed.push(ws.quest.lastStartedTask!)
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
      ws.quest.progress = 0
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
    quest.progress = 0
    quest.completed = []
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
  })
  submit_event(`start_quest_${id}`, core)
  const sessionData = getQuestSessionData(id)
  if (sessionData) restoreQuestFromSessionData(core, sessionData)
}

export function storeQuestToSession(core: Core) {
  const data: QuestSessionData = {
    completed: core.ws.quest.completed,
    code: core.ws.code,
    id: core.ws.quest.id,
    mode: core.ws.settings.mode,
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
    ws.quest.completed = data.completed
    ws.settings.mode = data.mode
    if (data.completed.length == ws.quest.tasks.length) {
      ws.ui.isAlreadyCompleted = true
    }
  })
}

export function startTesting(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.isTesting = true
    ui.showOutput = true
  })
  if (core.ws.ui.state == 'error') return

  core.executionEndCallback = () => {
    if (core.ws.quest.progress == 100) {
      // all other checks are already done
      core.mutateWs((ws) => {
        if (!ws.quest.completed.includes(ws.quest.lastStartedTask!))
          ws.quest.completed.push(ws.quest.lastStartedTask!)

        // TODO: only after last task
        const { ui } = ws
        ui.controlBarShowFinishQuest = true
      })
    }
  }

  runTask(core, 0)
}

export function finishQuest(core: Core) {
  storeQuestToSession(core)
  showQuestOverview(core)
  submit_event(`quest_complete_${core.ws.quest.id}`, core)
}
