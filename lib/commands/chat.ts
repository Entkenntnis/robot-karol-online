import { setExecutionMarker } from '../codemirror/basicSetup'
import { Core } from '../state/core'
import { showModal } from './modal'

export async function startChatRunner(core: Core) {
  console.log('startChatRunner called')
  const myNonce = core.chatVm.nonce
  core.chatVm.lastOutput = null
  core.chatVm.nextInput = ''
  core.chatVm.lastMarkedLine = -1
  core.chatVm.syncArray = null
  const generator = runnerGenerator(core)
  let n = generator.next()
  while (n.done === false) {
    await n.value
    console.log('check for nounce', core.chatVm.nonce, myNonce)
    if (core.chatVm.nonce !== myNonce) {
      console.log('Chat runner stopped due to new start request')
      return
    }
    n = generator.next()
  }
}

export function stopChatRunner(core: Core) {
  core.chatVm.nonce++
  core.mutateWs((ws) => {
    ws.ui.state = 'ready'
    ws.vm.chatCursor = undefined
  })
  setExecutionMarker(core, -1)
  core.chatVm.lastMarkedLine = -1
}

export function chatOutput(
  core: Core,
  text: string,
  sync: Int32Array,
  line: number,
) {
  console.log('Chat output:', text)
  core.chatVm.lastOutput = text
  core.chatVm.syncArray = sync
  setExecutionMarker(core, line, 'chat')
  core.chatVm.lastMarkedLine = line
}

export function chatInput(
  core: Core,
  sync: Int32Array,
  meta: Int32Array,
  data: Uint8Array,
  line: number,
) {
  // highlight line, update meta data, store input and set sync
  if (!core.chatVm.nextInput) {
    meta[0] = 1
    sync[0] = 1
    Atomics.notify(sync, 0) // notify worker
  } else {
    const encoded = new TextEncoder().encode(core.chatVm.nextInput)
    if (encoded.length > data.length) {
      alert('Input too long')
      return
    }
    data.set(encoded)
    meta[1] = encoded.length
    sync[0] = 1
  }
  setExecutionMarker(core, line, 'chat')
  core.chatVm.lastMarkedLine = line
  core.chatVm.syncArray = sync
  core.chatVm.nextInput = ''
}

export function chatError(core: Core, message: string) {
  const isMissingInput = message.includes('<-- marker:no-input -->')
  core.mutateWs((ws) => {
    if (!isMissingInput) {
      ws.ui.errorMessages = [message]
    } else {
      const cursor = core.ws.vm.chatCursor
      if (
        cursor &&
        core.ws.quest.chats[cursor.chatIndex].messages.length == cursor.msgIndex
      ) {
        ws.vm.chatvisualWarning = 'no-input-here-at-end'
      } else {
        ws.vm.chatvisualWarning = 'no-input-here'
      }
    }
    ws.ui.state = 'ready'
    ws.vm.chatCursor!.mode = 'warn'
    ws.vm.inspector = ''
  })
  const match = message.match(/File "<exec>", line (\d+), in <module>/)
  if (match) {
    const line = parseInt(match[1])
    setExecutionMarker(core, line, isMissingInput ? 'debugging' : 'error')
  }
  core.chatVm.nonce++
}

export function chatDone(core: Core) {
  core.chatVm.endOfExecution = true
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
    ws.vm.inspector = ''
  })
  setExecutionMarker(core, -1)

  for (let chat = 0; chat < core.ws.quest.chats.length; chat++) {
    core.chatVm.endOfExecution = false
    core.mutateWs((ws) => {
      ws.vm.chatCursor = { chatIndex: chat, msgIndex: 0, mode: 'play' }
      ws.vm.inspector = ''
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
        }: ${expected.text}`,
      )
      if (expected.role == 'in') {
        core.chatVm.nextInput = expected.text
      }

      // yield wait(500)

      if (core.ws.vm.chatCursor!.msgIndex == 0) {
        // run the code only once at the start of the chat
        core.worker.mainWorker.postMessage({
          type: 'run-chat',
          code: core.ws.pythonCode,
        })
        yield wait(500) // wait for worker to start
      } else {
        if (core.chatVm.syncArray) {
          Atomics.store(core.chatVm.syncArray, 0, 1) // unblock worker
          Atomics.notify(core.chatVm.syncArray, 0) // notify worker
          core.chatVm.syncArray = null // reset syncArray
        }
      }
      if (expected.role == 'out') {
        while (core.chatVm.lastOutput === null) {
          console.log('Waiting for output... ', core.chatVm.lastOutput)
          // wait for output
          yield wait(20)
          if (core.chatVm.endOfExecution) {
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
        if (core.chatVm.lastOutput.trim() == expected.text.trim()) {
          core.chatVm.lastOutput = null // reset output
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
            `Output mismatch: expected "${expected.text}", got "${core.chatVm.lastOutput}"`,
          )
          core.mutateWs((ws) => {
            ws.vm.chatCursor!.mode = 'warn'
            ws.vm.chatvisualWarning = 'output-mismatch'
            ws.vm.chatVisualText = core.chatVm.lastOutput!
            ws.vm.chatVisualRole = 'spill'
          })
          core.worker.reset()
          core.mutateWs((ws) => {
            ws.ui.state = 'ready'
          })
          setExecutionMarker(core, core.chatVm.lastMarkedLine, 'debugging')
          return
          // END TODO
        }
      }
      if (expected.role == 'in') {
        while (core.chatVm.nextInput !== '') {
          console.log('Waiting for input to be process')
          // wait for input
          yield wait(20)
          if (core.chatVm.endOfExecution || core.chatVm.lastOutput !== null) {
            // unexpected end of execution
            console.warn('End of execution reached, but input expected')
            core.mutateWs((ws) => {
              ws.ui.state = 'ready'
              ws.vm.chatCursor!.mode = 'warn'
              ws.vm.chatvisualWarning = 'missing-input'
              ws.vm.chatVisualText = ''
            })

            console.log(
              `set execution marker for line ${core.chatVm.lastMarkedLine} ${core.chatVm.lastOutput}`,
            )
            if (core.chatVm.lastOutput !== null) {
              core.worker.reset()
              setExecutionMarker(core, core.chatVm.lastMarkedLine, 'debugging')
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
    if (core.chatVm.syncArray) {
      Atomics.store(core.chatVm.syncArray, 0, 1) // unblock worker
      Atomics.notify(core.chatVm.syncArray, 0) // notify worker
      core.chatVm.syncArray = null // reset syncArray
    }
    while (!core.chatVm.endOfExecution) {
      // wait for end of execution
      yield wait(20)
      if (core.chatVm.lastOutput !== null) {
        // unexpected output at the end of chat
        core.worker.reset()
        setExecutionMarker(core, core.chatVm.lastMarkedLine, 'debugging')
        core.mutateWs((ws) => {
          ws.ui.state = 'ready'
          ws.vm.chatCursor!.mode = 'warn'
          ws.vm.chatvisualWarning = 'no-output-here-at-end'
          ws.vm.chatVisualText = core.chatVm.lastOutput!
          ws.vm.chatVisualRole = 'spill'
        })
        return
      }
    }
    console.log('Chat run finished')
    setExecutionMarker(core, -1)
    core.chatVm.lastMarkedLine = -1
  }

  core.mutateWs((ws) => {
    ws.vm.chatCursor!.chatIndex++
  })

  yield wait(500)

  while (!core.chatVm.endOfExecution) {
    // wait for end of execution
    yield wait(20)
  }
  stopChatRunner(core)

  setTimeout(() => {
    document
      .getElementById('quest-title-h1')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)

  // this will be persisted
  core.mutateWs((ws) => {
    ws.quest.completedOnce = true
    ws.ui.isAlreadyCompleted = true
  })

  showModal(core, 'success')
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function scrollChatCursorIntoView() {
  document
    .getElementById('chat-cursor')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
