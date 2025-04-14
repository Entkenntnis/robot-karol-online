import { useCore } from '../../lib/state/core'
import ClassDiagram from './ClassDiagram'

export function InteractiveClassDiagram() {
  const core = useCore()
  return (
    <div className="flex flex-col h-full">
      <div className="">
        <ClassDiagram
          classes={core.ws.pythonCode
            .split('class ')
            .slice(1)
            .map((c) => c.split(':')[0].trim())}
        />
      </div>
      <div className="flex-grow bg-gray-200 relative">
        <div className="inset-2 rounded bg-gray-50 absolute">Object Bench</div>
      </div>
    </div>
  )
}
