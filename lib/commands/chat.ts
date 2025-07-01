import { setExecutionMarker } from '../codemirror/basicSetup'
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
  core.mutateWs((ws) => {
    ws.ui.state = 'ready'
    ws.vm.chatCursor = undefined
  })
}

let lastOutput = ''
let nextInput = ''
let syncArray: Int32Array | null = null

export function chatOutput(
  core: Core,
  text: string,
  sync: Int32Array,
  line: number
) {
  lastOutput = text
  syncArray = sync
  setExecutionMarker(
    core,
    line,
    core.ws.vm.isDebugging ? 'debugging' : 'normal'
  )
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
  core.mutateWs((ws) => {
    ws.ui.state = 'running'
    ws.vm.chatCursor = { chatIndex: 0, msgIndex: 0 }
  })

  for (let chat = 0; chat < core.ws.quest.chats.length; chat++) {
    core.mutateWs((ws) => {
      ws.ui.state = 'running'
      ws.vm.chatCursor = { chatIndex: chat, msgIndex: 0 }
    })
    scrollChatCursorIntoView()
    const messages = core.ws.quest.chats[chat].messages

    while (core.ws.vm.chatCursor!.msgIndex < messages.length) {
      const expectedMessage = messages[core.ws.vm.chatCursor!.msgIndex]
      console.log(
        `Chat runner message ${core.ws.vm.chatCursor!.msgIndex + 1} of ${
          messages.length
        }: ${expectedMessage.text}`
      )
      if (expectedMessage.role == 'in') {
        nextInput = expectedMessage.text
      }
      // wait for stdout message
      // it's actually stupid to execute the code so early, we only need to execute code in this place
      if (core.ws.vm.chatCursor!.msgIndex == 0) {
        // run the code only once at the start of the chat
        core.worker.mainWorker.postMessage({
          type: 'run-chat',
          code: core.ws.pythonCode,
        })
      } else {
        // unblock worker TODO setup buffer for it
        // TODO TODO TODO
        if (syncArray) {
          Atomics.store(syncArray, 0, 1) // unblock worker
          Atomics.notify(syncArray, 0) // notify worker
          syncArray = null // reset syncArray
        }
      }
      if (expectedMessage.role == 'out') {
        while (lastOutput === '') {
          // wait for output
          yield wait(20)
        }
        if (lastOutput.trim() == expectedMessage.text.trim()) {
          lastOutput = '' // reset output
        } else {
          // input
          alert(
            'mismatch not implemented yet' + lastOutput + expectedMessage.text
          )
          return
        }
      }
      core.mutateWs((ws) => {
        ws.vm.chatCursor!.msgIndex++
      })
      scrollChatCursorIntoView()
    }
  }

  /*for (let j = 0; j < core.ws.quest.chats.length; j++) {
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

  yield wait(1000)*/

  // stopChatRunner(core)
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function scrollChatCursorIntoView() {
  document
    .getElementById('chat-cursor')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
