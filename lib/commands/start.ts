import { sliderToDelay } from '../helper/speedSlider'
import { Core } from '../state/core'
import { exitBench } from './bench'
import { startChatRunner, stopChatRunner } from './chat'
import {
  runTask,
  closeOutput,
  startTesting,
  restartProgram,
  openTask,
} from './quest'
import { abort } from './vm'
import { twoWorldsEqual } from './world'

export function startButtonClicked(core: Core) {
  if (core.ws.ui.isBench) {
    exitBench(core)
    return
  }

  if (core.ws.ui.isChatMode) {
    if (core.ws.ui.state == 'ready') {
      startChatRunner(core)
    } else if (core.ws.ui.state == 'running') {
      stopChatRunner(core)
      core.worker?.reset()
    }
    return
  }

  if (core.ws.ui.tourModePage == 2) {
    core.mutateWs((ws) => {
      ws.ui.tourModePage = -1
    })
  }

  if (core.ws.editor.editWorld !== null && core.ws.ui.state == 'ready') {
    if (core.ws.editor.showWorldPreview) {
      alert('Bitte wähle Start- oder Zielwelt aus.')
      return
    }
    runTask(core, core.ws.editor.editWorld)
    closeOutput(core)
    return
  }

  if (core.ws.ui.isTesting && core.ws.ui.state == 'ready') {
    core.mutateWs((ws) => {
      ws.ui.isTesting = false
    })
    restartProgram(core)
    return
  }
  if (!core.ws.ui.showOutput && core.ws.ui.state == 'ready') {
    if (
      core.ws.ui.isPlayground ||
      core.ws.quest.tasks.every(
        (t) => !t.target || twoWorldsEqual(t.start, t.target)
      ) ||
      core.ws.quest.tasks.length == 1
    ) {
      openTask(core, 0)
      runTask(core, 0)
    } else {
      startTesting(core)
    }
    return
  }

  if (core.ws.ui.state == 'running') {
    if (core.ws.settings.language == 'python-pro') {
      core.worker?.reset()
    } else {
      abort(core)
    }
    return
  }

  if (core.ws.ui.showOutput && core.ws.ui.state == 'ready') {
    restartProgram(core)
  }
}
