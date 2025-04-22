import { useState, useRef, useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import { executeInBench } from '../../lib/commands/bench'
import { showModal } from '../../lib/commands/modal'

interface ClassDiagramProps {
  classes: string[]
}

export default function ClassDiagram({ classes }: ClassDiagramProps) {
  const core = useCore()

  return (
    <div className="relative px-8 py-16 flex flex-wrap justify-center items-center gap-8 bg-gray-100 min-h-[36vh]">
      {classes.map((className, index) => (
        <div
          key={index}
          onClick={() => {
            core.mutateWs(({ bench }) => {
              bench.invocationMode = 'constructor'
              bench.invocationClass = className
              bench.invocationParameters =
                core.ws.bench.classInfo[className].constructor.parameters
            })
            showModal(core, 'invocation')
          }}
          className="relative bg-white border-2 border-gray-800 rounded-sm cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="px-8 py-1 border-b-2 border-gray-800">
            {className}
          </div>
          <div className="h-8" />
        </div>
      ))}
    </div>
  )
}
