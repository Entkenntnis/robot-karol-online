import next from 'next'
import { setExecutionMarker } from '../codemirror/basicSetup'
import { Core } from '../state/core'
import { show } from 'blockly/core/contextmenu'
import { showModal } from './modal'

let nounce = 42

export async function startChatRunner(core: Core) {
  const myNounce = nounce
  lastOutput = ''
  nextInput = ''
  syncArray = null
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
  setExecutionMarker(core, -1)
}

let lastOutput = ''
let nextInput = ''
let syncArray: Int32Array | null = null
let endOfExecution = false

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

export function chatInput(
  core: Core,
  sync: Int32Array,
  meta: Int32Array,
  data: Uint8Array,
  line: number
) {
  // highlight line, update meta data, store input and set sync
  if (!nextInput) {
    meta[0] = 1
    sync[0] = 1
    Atomics.notify(sync, 0) // notify worker
  } else {
    const encoded = new TextEncoder().encode(nextInput)
    if (encoded.length > data.length) {
      alert('Input too long')
      return
    }
    data.set(encoded)
    meta[1] = encoded.length
    sync[0] = 1
  }
  setExecutionMarker(
    core,
    line,
    core.ws.vm.isDebugging ? 'debugging' : 'normal'
  )
  syncArray = sync // store syncArray for later use
}

export function chatError(core: Core, message: string) {
  core.mutateWs((ws) => {
    ws.ui.errorMessages = [message]
    ws.ui.state = 'ready'
  })
}

export function chatDone(core: Core) {
  endOfExecution = true
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
    endOfExecution = false
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
      yield wait(500)
    }
    if (syncArray) {
      Atomics.store(syncArray, 0, 1) // unblock worker
      Atomics.notify(syncArray, 0) // notify worker
      syncArray = null // reset syncArray
    }
  }

  while (!endOfExecution) {
    // wait for end of execution
    yield wait(20)
  }

  showModal(core, 'success')
  stopChatRunner(core)

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
