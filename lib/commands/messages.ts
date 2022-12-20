import { Core } from '../state/core'

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
  /*setTimeout(() => {
    core.mutateWs(({ ui }) => {
      ui.messages = ui.messages.filter((m) => m.ts != ts)
    })
  }, 3500)*/
}
