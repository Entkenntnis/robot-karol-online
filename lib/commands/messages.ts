import { pythonKarolExamples } from '../data/pythonExamples'
import { Core } from '../state/core'
import { submitAnalyzeEvent } from './analyze'

export function addMessage(core: Core, text: string) {
  const ts = Date.now()
  core.mutateWs(({ ui }) => {
    while (ui.messages.length >= 5) {
      ui.messages.shift()
    }
    const lastIndex = ui.messages.length - 1
    if (lastIndex >= 0 && ui.messages[lastIndex].text == text) {
      ui.messages[lastIndex].count++
    } else {
      ui.messages.push({ text, ts, count: 1 })
    }
  })
  setTimeout(() => {
    core.mutateWs(({ ui }) => {
      ui.messages = ui.messages.filter((m) => m.ts != ts)
    })
  }, 5000)
}

export function addConsoleMessage(core: Core, text: string) {
  const ts = Date.now()

  // =========================================
  // special handler for dance, dance
  const sharedId =
    pythonKarolExamples.find((el) => el.title == 'Dance, Dance')?.link || ''
  if (
    '#' + core.ws.ui.sharedQuestId == sharedId &&
    text.trim().endsWith(' Punkte')
  ) {
    const score = parseInt(text.split(' ')[0])
    const title =
      core.ws.quest.tasks[core.ws.quest.lastStartedTask!]?.title || ''
    submitAnalyzeEvent(core, `ev_dance_score_${score}_${title}`)
  }
  // =========================================

  core.mutateWs(({ ui }) => {
    /*while (ui.messages.length >= 5) {
      ui.messages.shift()
    }*/
    // const lastIndex = ui.messages.length - 1
    //if (lastIndex >= 0 && ui.messages[lastIndex].text == text) {
    // ui.messages[lastIndex].count++
    // } else {
    ui.messages.push({ text, ts, count: 1 })
    // }
  })
  /*setTimeout(() => {
    core.mutateWs(({ ui }) => {
      ui.messages = ui.messages.filter((m) => m.ts != ts)
    })
  }, 5000)*/
}
