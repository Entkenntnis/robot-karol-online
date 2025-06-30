import { Core } from '../state/core'

let nounce = 42

export async function startChatRunner(core: Core) {
  const myNounce = nounce
  const generator = runnerGenerator(core)
  let n = generator.next()
  while (n.done === false) {
    await n.value
    if (nounce !== myNounce) {
      console.log('Chat runner stopped due to new start request')
      return
    }
    n = generator.next()
  }
}

export function stopChatRunner(core: Core) {
  nounce++
  console.log('Chat runner stopped')
  core.mutateWs((ws) => {
    ws.ui.state = 'ready'
    ws.vm.chatCursor = undefined
  })
}

export function chatOutput(core: Core, text: string) {
  console.log('Chat output:', text)
}

export function chatError(core: Core, message: string) {
  alert(message)
}

function* runnerGenerator(core: Core) {
  if (
    !core.worker ||
    !core.worker.mainWorker ||
    !core.worker.backupWorker ||
    !core.worker.mainWorkerReady
  )
    throw new Error('Worker not ready')

  core.worker.isFresh = false

  core.worker.mainWorker.postMessage({
    type: 'run-chat',
    code: core.ws.pythonCode,
  })

  console.log('Chat runner started')
  core.mutateWs((ws) => {
    ws.ui.state = 'running'
    ws.vm.chatCursor = { chatIndex: 0, msgIndex: 0 }
  })
  scrollChatCursorIntoView()

  for (let j = 0; j < core.ws.quest.chats.length; j++) {
    core.mutateWs((ws) => {
      ws.vm.chatCursor!.chatIndex = j
      ws.vm.chatCursor!.msgIndex = 0
    })
    scrollChatCursorIntoView()
    for (let i = 0; i < core.ws.quest.chats[j].messages.length + 1; i++) {
      console.log(`Chat runner message ${i + 1}`)
      yield wait(500) // Simulate some processing time

      core.mutateWs((ws) => {
        ws.vm.chatCursor!.msgIndex++
      })
      scrollChatCursorIntoView()
    }
  }

  yield wait(1000)

  stopChatRunner(core)
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function scrollChatCursorIntoView() {
  document
    .getElementById('chat-cursor')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
