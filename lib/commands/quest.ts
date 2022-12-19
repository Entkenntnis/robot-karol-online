import { autoFormat, setEditable } from '../codemirror/basicSetup'
import { Core } from '../state/core'
import { showErrorModal } from './mode'
import { run } from './vm'

export function runTask(core: Core, index: number) {
  const task = core.ws.quest.tasks[index]

  if (core.ws.ui.state == 'error') {
    //alert('Programm enthält Fehler, bitte korrigieren!')
    showErrorModal(core)
  } else {
    if (core.ws.ui.state == 'loading') {
      // alert('Programm wird geladen, bitte nochmal probieren')
      core.mutateWs(({ ui }) => {
        ui.taskWaitingToLoad = index
      })
    } else {
      if (core.view?.current) {
        autoFormat(core.view.current)
        setEditable(core.view.current, false)
      }
      core.mutateWs((ws) => {
        ws.world = task.start
        ws.ui.showOutput = true
        ws.quest.lastStartedTask = index
      })
      run(core)
    }
  }
}

export function closeOutput(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.showOutput = false
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
    })
  }
}

export function endTaskWaiting(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.taskWaitingToLoad = undefined
  })
}
