import { useState, useRef, useEffect } from 'react'

interface ClassDiagramProps {
  classes: string[]
}

export default function ClassDiagram({ classes }: ClassDiagramProps) {
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    targetRect?: DOMRect
  }>({ visible: false, x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    setContextMenu({
      visible: true,
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
      targetRect: e.currentTarget.getBoundingClientRect(),
    })
  }

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
          onContextMenu={handleContextMenu}
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
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            Option 1
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            Option 2
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            Option 3
          </div>
        </div>
      )}
    </div>
  )
}
