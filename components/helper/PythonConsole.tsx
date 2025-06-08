import { useRef, useEffect } from 'react'
import clsx from 'clsx'
import { useCore } from '../../lib/state/core'

export function PythonConsole() {
  const core = useCore()
  const containerRef = useRef<HTMLDivElement>(null)
  const messages = core.ws.ui.messages
  const isAtBottom = useRef(true)

  // Combined effect for scroll handling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (isAtBottom.current) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  return (
    <>
      {core.ws.settings.language == 'python-pro' && messages.length > 0 && (
        <div
          ref={containerRef}
          className={clsx(
            'absolute left-2 max-h-[300px] min-w-[300px] overflow-y-auto bg-gray-700 p-2 rounded-lg text-lime-400 max-w-[calc(100%-16px)] break-words',
            core.ws.ui.isTesting ? 'bottom-2' : 'bottom-11'
          )}
          onScroll={() => {
            const container = containerRef.current
            if (container) {
              isAtBottom.current =
                container.scrollHeight - container.scrollTop <=
                container.clientHeight + 5
            }
          }}
        >
          {messages.map((m, i, arr) => (
            <div key={`${m.ts}-${m.text}`} className="">
              <span className="rounded">{m.text}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
