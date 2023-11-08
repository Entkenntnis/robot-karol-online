import { hideJavaInfo } from '../../lib/commands/language'
import { useCore } from '../../lib/state/core'

export function JavaInfo() {
  const core = useCore()
  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute right-4 top-4">
        <button
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={() => {
            hideJavaInfo(core)
          }}
        >
          Schließen
        </button>
      </div>
      <h1 className="ml-8 text-2xl pt-8">Info zu Java</h1>
      <div className="mx-8 [&>p]:mt-6">
        <p>
          Hi, du kannst Robot Karol auch mit (einer Teilmenge von) Java
          programmieren.
        </p>
      </div>
    </div>
  )
}
