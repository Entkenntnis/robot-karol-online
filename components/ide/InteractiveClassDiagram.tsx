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
        <div className="inset-2 rounded bg-gray-50 absolute flex flex-wrap gap-4 items-start p-2">
          {core.ws.bench.objects.map((obj, i) => {
            return (
              <div
                key={i}
                className="bg-red-500 rounded-lg p-4 font-bold text-white text-center"
              >
                {obj.name} :<br />
                {obj.className}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
