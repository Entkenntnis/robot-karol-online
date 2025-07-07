import { setExecutionMarker } from '../codemirror/basicSetup'
import { is } from '../codemirror/pythonParser/parser.terms'
import { Core } from '../state/core'
import { showModal } from './modal'

let nonce = 77

let lastOutput = ''
let nextInput = ''
let syncArray: Int32Array | null = null
let endOfExecution = false
let lastMarkedLine = -1

export async function startChatRunner(core: Core) {
  console.log('startChatRunner called')
  const myNonce = nonce
  lastOutput = ''
  nextInput = ''
  lastMarkedLine = -1
  syncArray = null
  const generator = runnerGenerator(core)
  let n = generator.next()
  while (n.done === false) {
    await n.value
    console.log('check for nounce', nonce, myNonce)
    if (nonce !== myNonce) {
      console.log('Chat runner stopped due to new start request')
      return
    }
    n = generator.next()
  }
}

export function stopChatRunner(core: Core) {
  nonce++
  core.mutateWs((ws) => {
    ws.ui.state = 'ready'
    ws.vm.chatCursor = undefined
  })
  setExecutionMarker(core, -1)
  lastMarkedLine = -1
}

export function chatOutput(
  core: Core,
  text: string,
  sync: Int32Array,
  line: number
) {
  console.log('Chat output:', text)
  lastOutput = text
  syncArray = sync
  setExecutionMarker(core, line, 'chat')
  lastMarkedLine = line
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
  setExecutionMarker(core, line, 'chat')
  lastMarkedLine = line
  syncArray = sync
  nextInput = ''
}

export function chatError(core: Core, message: string) {
  const isMissingInput = message.includes('<-- marker:no-input -->')
  core.mutateWs((ws) => {
    if (!isMissingInput) {
      ws.ui.errorMessages = [message]
    } else {
      ws.vm.chatvisualWarning = 'no-input-here'
    }
    ws.ui.state = 'ready'
    ws.vm.chatCursor!.mode = 'warn'
  })
  const match = message.match(/File "<exec>", line (\d+), in <module>/)
  if (match) {
    const line = parseInt(match[1])
    setExecutionMarker(core, line, isMissingInput ? 'debugging' : 'error')
  }
  nonce++
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
    ws.vm.chatCursor = { chatIndex: 0, msgIndex: 0, mode: 'play' }
    ws.vm.chatVisualRole = 'out'
    ws.vm.chatVisualText = ''
    ws.vm.chatvisualWarning = undefined
  })
  setExecutionMarker(core, -1)

  for (let chat = 0; chat < core.ws.quest.chats.length; chat++) {
    endOfExecution = false
    core.mutateWs((ws) => {
      ws.vm.chatCursor = { chatIndex: chat, msgIndex: 0, mode: 'play' }
    })
    scrollChatCursorIntoView()
    setTimeout(() => {
      scrollChatCursorIntoView()
    }, 100)
    const messages = core.ws.quest.chats[chat].messages

    while (core.ws.vm.chatCursor!.msgIndex < messages.length) {
      const expected = messages[core.ws.vm.chatCursor!.msgIndex]
      console.log(
        `Chat runner message ${core.ws.vm.chatCursor!.msgIndex + 1} of ${
          messages.length
        }: ${expected.text}`
      )
      if (expected.role == 'in') {
        nextInput = expected.text
      }

      // yield wait(500)

      if (core.ws.vm.chatCursor!.msgIndex == 0) {
        // run the code only once at the start of the chat
        core.worker.mainWorker.postMessage({
          type: 'run-chat',
          code: core.ws.pythonCode,
        })
        yield wait(250) // wait for worker to start
      } else {
        if (syncArray) {
          Atomics.store(syncArray, 0, 1) // unblock worker
          Atomics.notify(syncArray, 0) // notify worker
          syncArray = null // reset syncArray
        }
      }
      if (expected.role == 'out') {
        while (lastOutput === '') {
          console.log('Waiting for output... ', lastOutput)
          // wait for output
          yield wait(20)
          if (endOfExecution) {
            // TODO: end of execution, waiting for output
            // unexpected end of execution
            console.warn('End of execution reached, but output expected')
            core.mutateWs((ws) => {
              ws.ui.state = 'ready'
              ws.vm.chatCursor!.mode = 'warn'
              ws.vm.chatvisualWarning = 'missing-output'
            })
            setExecutionMarker(core, -1)
            return
            // TODO
          }
          // input here is impossible, because we will through exception instead
        }
        console.log('output captured')
        if (lastOutput.trim() == expected.text.trim()) {
          lastOutput = '' // reset output
          core.mutateWs((ws) => {
            ws.vm.chatCursor!.msgIndex++
          })
          scrollChatCursorIntoView()
          const text = expected.text.trim()
          for (let i = 0; i < text.length; i++) {
            core.mutateWs((ws) => {
              ws.vm.chatVisualText += text[i]
              ws.vm.chatVisualRole = expected.role
            })
            yield wait(20) // simulate typing effect
          }
          yield wait(500)
          core.mutateWs((ws) => {
            ws.vm.chatVisualText = ''
          })
          yield wait(200)
        } else {
          // input
          // TODO: mismatch
          console.warn(
            `Output mismatch: expected "${expected.text}", got "${lastOutput}"`
          )
          core.mutateWs((ws) => {
            ws.vm.chatCursor!.mode = 'warn'
            ws.vm.chatvisualWarning = 'output-mismatch'
            ws.vm.chatVisualText = lastOutput
            ws.vm.chatVisualRole = 'spill'
            // ws.vm.chatSpill_obsolete_on_the_way_out.push(lastOutput)
          })
          core.worker.reset()
          core.mutateWs((ws) => {
            ws.ui.state = 'ready'
          })
          setExecutionMarker(core, lastMarkedLine, 'debugging')
          return
          // END TODO
        }
      }
      if (expected.role == 'in') {
        while (nextInput !== '') {
          console.log('Waiting for input to be process')
          // wait for input
          yield wait(20)
          if (endOfExecution || lastOutput !== '') {
            // unexpected end of execution
            console.warn('End of execution reached, but input expected')
            core.mutateWs((ws) => {
              ws.ui.state = 'ready'
              ws.vm.chatCursor!.mode = 'warn'
              ws.vm.chatvisualWarning = 'missing-input'
              ws.vm.chatVisualText = ''
            })

            console.log(
              `set execution marker for line ${lastMarkedLine} ${lastOutput}`
            )
            if (lastOutput !== '') {
              core.worker.reset()
              setExecutionMarker(core, lastMarkedLine, 'debugging')
            } else {
              setExecutionMarker(core, -1)
            }
            return
          }
        }

        const text = expected.text.trim()
        core.mutateWs((ws) => {
          ws.vm.chatCursor!.msgIndex++
          ws.vm.chatVisualRole = expected.role
        })
        scrollChatCursorIntoView()
        yield wait(250) // let Karol turn
        for (let i = 0; i < text.length; i++) {
          core.mutateWs((ws) => {
            ws.vm.chatVisualText += text[i]
          })
          yield wait(20) // simulate typing effect
        }

        yield wait(500) // display text
        core.mutateWs((ws) => {
          ws.vm.chatVisualText = ''
          ws.vm.chatVisualRole = 'out'
        })
        yield wait(200)
      }
    }
    // end of chat run, reset everything
    if (syncArray) {
      Atomics.store(syncArray, 0, 1) // unblock worker
      Atomics.notify(syncArray, 0) // notify worker
      syncArray = null // reset syncArray
    }
    while (!endOfExecution) {
      // wait for end of execution
      yield wait(20)
    }
    console.log('Chat run finished')
    setExecutionMarker(core, -1)
    lastMarkedLine = -1
  }

  core.mutateWs((ws) => {
    ws.vm.chatCursor!.chatIndex++
  })

  yield wait(500)

  while (!endOfExecution) {
    // wait for end of execution
    yield wait(20)
  }

  showModal(core, 'success')
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
