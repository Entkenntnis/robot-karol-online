import { useState, useRef, useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import ClassDiagram from './ClassDiagram'
import { executeInBench } from '../../lib/commands/bench'
import clsx from 'clsx'
import { FaIcon } from '../helper/FaIcon'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { showModal } from '../../lib/commands/modal'

export function InteractiveClassDiagram() {
  const core = useCore()
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    selectedIndex?: number
  }>({ visible: false, x: 0, y: 0, selectedIndex: undefined })

  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, selectedIndex: undefined })
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
    <div className="flex flex-col h-full relative">
      <div className="">
        <ClassDiagram
          classes={Object.values(core.ws.bench.classInfo).map(
            (cls) => cls.name
          )}
        />
      </div>
      <div className="flex-grow bg-gray-200 relative" ref={containerRef}>
        <div className="inset-2 rounded bg-gray-50 absolute flex flex-wrap gap-4 items-start p-2">
          {core.ws.bench.objects.map((obj, i) => {
            return (
              <div
                key={i}
                className="bg-red-500 rounded-lg p-4 font-bold text-white text-center cursor-pointer"
                onContextMenu={(e) => {
                  e.preventDefault()
                  const containerRect =
                    containerRef.current?.getBoundingClientRect()
                  if (!containerRect) return

                  setContextMenu({
                    visible: true,
                    x: e.clientX - containerRect.left,
                    y: e.clientY - containerRect.top,
                    selectedIndex: i,
                  })
                }}
                onClickCapture={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const containerRect =
                    containerRef.current?.getBoundingClientRect()
                  if (!containerRect) return

                  setContextMenu({
                    visible: true,
                    x: e.clientX - containerRect.left,
                    y: e.clientY - containerRect.top,
                    selectedIndex: i,
                  })
                }}
              >
                {obj.name} :<br />
                {obj.className}
              </div>
            )
          })}
        </div>

        {contextMenu.visible && contextMenu.selectedIndex !== undefined && (
          <div
            ref={menuRef}
            className="absolute bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50 max-h-[30vh] overflow-y-auto"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            {Object.entries(
              core.ws.bench.classInfo[
                core.ws.bench.objects[contextMenu.selectedIndex!].className
              ].methods
            ).map(([name, val], i) => {
              return (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    core.mutateWs(({ bench }) => {
                      bench.invocationMode = 'method'
                      bench.invocationClass =
                        core.ws.bench.objects[
                          contextMenu.selectedIndex!
                        ].className
                      bench.invocationMethod = name
                      bench.invocationParameters = val.parameters
                      bench.invocationObject =
                        bench.objects[contextMenu.selectedIndex!].name
                    })
                    showModal(core, 'invocation')
                    closeContextMenu()
                  }}
                >
                  {`${name}(${val.parameters.map((p) => p.name).join(', ')})`}
                </div>
              )
            })}
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
              onClick={() => {
                const objName =
                  core.ws.bench.objects[contextMenu.selectedIndex!].name
                executeInBench(core, `del ${objName}`)
                closeContextMenu()
              }}
            >
              Löschen <code>del</code>
            </div>
          </div>
        )}
      </div>
      {core.ws.ui.errorMessages.length > 0 && (
        <div
          className={clsx(
            'absolute right-6 left-6 rounded bottom-4 overflow-auto min-h-[47px] max-h-[200px] flex-grow flex-shrink-0 bg-red-50'
          )}
        >
          <div className="flex justify-between mt-[9px] relative">
            <div className="px-3 pb-1 pt-0">
              <pre>{core.ws.ui.errorMessages[0]}</pre>
              <button
                className="absolute -top-1 right-2"
                onClick={() => {
                  core.mutateWs(({ ui }) => {
                    ui.state = 'ready'
                    ui.errorMessages = []
                  })
                }}
              >
                <FaIcon icon={faTimes} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
