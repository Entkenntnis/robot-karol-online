import clsx from 'clsx'
import { useCore } from '../../lib/state/core'

export function PythonConsole() {
  const core = useCore()
  return (
    <>
      {core.ws.settings.language == 'python-pro' &&
        core.ws.ui.messages.length > 0 && (
          <div
            className={clsx(
              'absolute left-2 max-h-[300px] min-w-[300px] overflow-y-auto bg-gray-700 p-2 rounded-lg text-lime-400 max-w-[calc(100%-16px)] break-words',
              core.ws.ui.isTesting ? 'bottom-2' : 'bottom-11'
            )}
          >
            {core.ws.ui.messages.map((m) => (
              <div key={`${m.ts}-${m.text}`} className="">
                <span className="rounded">
                  {m.text}
                  {m.count > 1 && <span> (x{m.count})</span>}
                </span>
              </div>
            ))}
          </div>
        )}
    </>
  )
}
