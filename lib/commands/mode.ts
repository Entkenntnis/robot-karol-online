import { uiPosition } from 'blockly'
import { questData } from '../data/quests'
import { getQuestSessionData } from '../helper/session'
import { sliderToDelay } from '../helper/speedSlider'
import { submit_event, userIdKey } from '../helper/submit'
import { Core } from '../state/core'

export function setMode(core: Core, mode: Core['ws']['settings']['mode']) {
  if (core.ws.settings.mode == 'blocks') {
    if (core.ws.ui.state == 'running' || core.ws.ui.state == 'loading') {
      return // ignore
    }
    if (core.ws.ui.state == 'error') {
      alert(
        'Bitte verbinde alle Blöcke und vervollständige das Programm, bevor du den Modus wechselst.'
      )
      return
    }
  } else {
    if (core.ws.ui.state == 'running' || core.ws.ui.state == 'loading') {
      return // ignore
    }
    if (core.ws.ui.state == 'error') {
      //alert('Löse bitte vor dem Wechsel des Modus alle Probleme im Programm.')
      return
    }
    if (core.ws.ui.toBlockWarning) {
      alert(
        'Anweisungen und mehrzeilige Kommentare sind nur im Code-Editor verfügbar.'
      )
      return
    }
  }
  core.mutateWs(({ settings, ui }) => {
    settings.mode = mode
    ui.toBlockWarning = false
  })
}

export function showMenu(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showMenu = true
  })
}

export function closeMenu(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showMenu = false
  })
}

export function setShowTarget(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showPreviewOfTarget = val
  })
}

export function setSpeedSliderValue(core: Core, val: number) {
  // WELP, some TODOs here
  core.mutateWs((ws) => {
    const previousDelay = sliderToDelay(ws.ui.speedSliderValue)
    ws.ui.speedSliderValue = val
    const delay = sliderToDelay(ws.ui.speedSliderValue)
    const now = Date.now()
    const excessTime = now - ws.vm.startTime - ws.vm.steps * previousDelay
    ws.vm.startTime = Date.now() - ws.vm.steps * delay - excessTime
  })
}

export function showErrorModal(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showErrorModal = true
  })
}

export function hideErrorModal(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showErrorModal = false
  })
}

export function editCodeAndResetProgress(core: Core) {
  core.mutateWs(({ quest, ui }) => {
    ui.isTesting = false
    quest.progress = false
    ui.isAlreadyCompleted = false
  })
}

export function showQuestOverview(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showQuestOverview = true
  })
}

export function dummyOpenQuest(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showQuestOverview = false
  })
}

export function setShowImpressum(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showImpressum = val
  })
}

export function setShowPrivacy(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showPrivacy = val
  })
}

export function setShowStructogram(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showStructogram = val
  })
}

export function setShowCodeInfo(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showCodeInfo = val
  })
}

export function forceRerender(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.renderCounter++
  })
}

export function setPersist(core: Core, val: boolean) {
  if (val) {
    submit_event('persist_progress', core)
    localStorage.setItem(userIdKey, sessionStorage.getItem(userIdKey) ?? '')
    localStorage.setItem('karol_quest_beta_persist', '1')
    localStorage.setItem(
      'robot_karol_online_name',
      sessionStorage.getItem('robot_karol_online_name') ?? ''
    )
  } else {
    sessionStorage.setItem(userIdKey, localStorage.getItem(userIdKey) ?? '')
    localStorage.removeItem(userIdKey)
    localStorage.removeItem('karol_quest_beta_persist')
    localStorage.removeItem('robot_karol_online_name')
  }
  for (const id in questData) {
    const qd = getQuestSessionData(parseInt(id))
    if (qd) {
      if (val) {
        localStorage.setItem(`karol_quest_beta_${id}`, JSON.stringify(qd))
      } else {
        localStorage.removeItem(`karol_quest_beta_${id}`)
        sessionStorage.setItem(`karol_quest_beta_${id}`, JSON.stringify(qd))
      }
    }
  }
}

export function openPlayground(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.isPlayground = true
    ws.ui.showQuestOverview = false
  })
}

export function closePlayground(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.isPlayground = false
    ws.ui.showQuestOverview = true
  })
}

export function setShowHighscore(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showHighscore = val
  })
}

export function setUserName(core: Core, name: string) {
  core.mutateWs(({ ui }) => {
    ui.showNameModal = false
  })
  if (!!localStorage.getItem('karol_quest_beta_persist')) {
    localStorage.setItem('robot_karol_online_name', name)
  }
  sessionStorage.setItem('robot_karol_online_name', name)
  submit_event('set_name_' + name, core)
}

export function hideSaveHint(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showSaveHint = false
  })
}

export function openImage(core: Core, img: string) {
  core.mutateWs(({ ui }) => {
    ui.imageLightbox = img
  })
}

export function closeLightboxModal(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.imageLightbox = null
  })
}

export function setShowRemix(core: Core, val: boolean) {
  core.mutateWs(({ ui }) => {
    ui.showRemixModal = val
  })
}
