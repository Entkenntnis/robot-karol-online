import clsx from 'clsx'
import { karolDefaultImage } from '../../lib/data/images'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'

export function ChatVisual() {
  const core = useCore()

  // check state
  // if there is no warning, just display last chat message
  // if there is warning, find out which kind of error there is and display this

  // HMMM, but actually, the runner should give me the information, because the message is not always the last one,
  // but could be a part of it, ... so yeah, move logic to the runner
  const cursor = core.ws.vm.chatCursor!
  const message =
    core.ws.quest.chats[cursor.chatIndex]?.messages[cursor.msgIndex - 1]

  const index = core.ws.vm.chatVisualIndex

  return (
    <div
      className="bg-slate-100 top-0 sticky z-[100]"
      style={{ backgroundImage: 'url("/bright-squares.png")' }}
    >
      <div className="flex justify-between items-top px-8 pt-10">
        <div className="flex-shrink-0">
          <img src="/program-icon.png" className="w-20 mt-4 select-none" />
        </div>
        <div className="flex-grow-1 w-full mx-6">
          {message && (
            <div
              className={clsx(
                'flex my-1 mx-2',
                message.role == 'in' && 'justify-end'
              )}
            >
              <div
                className={clsx(
                  'rounded-lg px-3 py-0.5 text-xl',
                  message.role == 'out'
                    ? 'bg-cyan-100 rounded-bl-none'
                    : 'bg-orange-100 rounded-br-none'
                )}
              >
                {message.text}
              </div>
            </div>
          )}
        </div>
        <View
          robotImageDataUrl={core.ws.robotImageDataUrl || karolDefaultImage}
          world={{
            dimX: 1,
            dimY: 1,
            karol: [
              {
                x: 0,
                y: 0,
                dir: 'south',
              },
            ],
            blocks: [[false]],
            marks: [[false]],
            bricks: [[0]],
            height: 1,
          }}
          hideWorld
        />
      </div>
      <div className="h-6" />
    </div>
  )
}
