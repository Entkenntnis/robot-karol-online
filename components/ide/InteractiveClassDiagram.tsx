import { useCore } from '../../lib/state/core'
import ClassDiagram from './ClassDiagram'

export function InteractiveClassDiagram() {
  const core = useCore()
  return (
    <div className="flex flex-col h-full">
      <div className="">
        <ClassDiagram
          classes={Object.values(core.ws.bench.classInfo).map(
            (cls) => cls.name
          )}
        />
      </div>
      <div className="flex-grow bg-gray-200 relative">
        <div className="inset-2 rounded bg-gray-50 absolute">Object Bench</div>
      </div>
    </div>
  )
}
