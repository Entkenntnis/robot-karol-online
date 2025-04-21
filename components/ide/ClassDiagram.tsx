import { useState, useRef, useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import { executeInBench } from '../../lib/commands/bench'

interface ClassDiagramProps {
  classes: string[]
}

export default function ClassDiagram({ classes }: ClassDiagramProps) {
  const core = useCore()
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
  }>({ visible: false, x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 })
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative px-8 py-16 flex flex-wrap justify-center items-center gap-8 bg-gray-100"
    >
      {classes.map((className, index) => (
        <div
          key={index}
          onClickCapture={(e) => {
            const containerRect = containerRef.current?.getBoundingClientRect()
            if (!containerRect) return

            setContextMenu({
              visible: true,
              x: e.clientX - containerRect.left,
              y: e.clientY - containerRect.top,
            })
            setSelectedClass(className)
            e.preventDefault()
            e.stopPropagation()
          }}
          onContextMenu={(e) => {
            const containerRect = containerRef.current?.getBoundingClientRect()
            if (!containerRect) return

            setContextMenu({
              visible: true,
              x: e.clientX - containerRect.left,
              y: e.clientY - containerRect.top,
            })
            setSelectedClass(className)
            e.preventDefault()
          }}
          className="relative bg-white border-2 border-gray-800 rounded-sm cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="px-8 py-1 border-b-2 border-gray-800">
            {className}
          </div>
          <div className="h-8" />
        </div>
      ))}

      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="absolute bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              const name = prompt('Enter the name of the object:')
              executeInBench(
                core,
                `${name} = ${selectedClass}(${core.ws.bench.classInfo[
                  selectedClass!
                ].constructor.parameters
                  .map((p) => prompt(`Enter value for ${p.name}:`))
                  .join(', ')})`
              )
              closeContextMenu()
            }}
          >
            {`${selectedClass}(${core.ws.bench.classInfo[
              selectedClass!
            ].constructor.parameters
              .map((p) => p.name)
              .join(', ')})`}
          </div>
        </div>
      )}
    </div>
  )
}
