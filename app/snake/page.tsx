'use client'

import { useEffect, useRef } from 'react'
import { View } from '../../components/helper/View'
import { createWorldCmd, forward, left, right } from '../../lib/commands/world'
import { useCreateCore } from '../../lib/state/core'
import clsx from 'clsx'

const stepDelays = [
  // Geschwindigkeit ab LEN
  { len: 0, ms: 600 },
  { len: 1, ms: 400 },
  { len: 3, ms: 300 },
  { len: 5, ms: 200 },
  { len: 10, ms: 150 },
  { len: 18, ms: 120 },
  { len: 30, ms: 100 },
  { len: 45, ms: 80 },
  { len: Infinity, ms: 80 },
]

function getDelay(n: number) {
  for (let i = 0; i < stepDelays.length - 1; i++) {
    if (n >= stepDelays[i].len && n < stepDelays[i + 1].len) {
      // This logic is broken
      return stepDelays[i].ms
    }
  }
  return 600
}

export default function Snake() {
  const core = useCreateCore()
  const next = useRef<null | { x: number; y: number }>(null)
  const tail = useRef<{ x: number; y: number }[]>([])
  const stepMs = useRef(600)
  const lastStepTimestamp = useRef(-1)

  function spawnTarget() {
    let count = 0
    while (count++ < 100) {
      const x = Math.floor(Math.random() * core.ws.world.dimX)
      const y = Math.floor(Math.random() * core.ws.world.dimY)
      if (core.ws.world.bricks[y][x] == 0 && !core.ws.world.marks[y][x]) {
        if (!(core.ws.world.karol.x == x && core.ws.world.karol.y == y)) {
          core.mutateWs((state) => {
            state.world.marks[y][x] = true
          })

          next.current = { x, y }
          return
        }
      }
    }
  }
  useEffect(() => {
    createWorldCmd(core, 15, 12, 6)
    core.mutateWs((state) => {
      state.ui.state = 'loading'
      state.world.karol.dir = 'north'
      state.world.karol.y = 11
    })
    const interval = setInterval(() => {
      if (core.ws.ui.state == 'running') {
        if (!next.current) {
          spawnTarget()
        }
        const ts = new Date().getTime()
        const diff = ts - lastStepTimestamp.current
        if (diff > stepMs.current) {
          lastStepTimestamp.current = ts
          // step start
          if (core.ws.code == 'ArrowLeft') {
            left(core)
          }
          if (core.ws.code == 'ArrowRight') {
            right(core)
          }
          core.mutateWs((state) => {
            state.code = ''
          })
          const prevX = core.ws.world.karol.x
          const prevY = core.ws.world.karol.y
          if (!forward(core)) {
            core.mutateWs(({ ui }) => {
              ui.state = 'error'
            })
          } else {
            tail.current.push({ x: prevX, y: prevY })
            core.mutateWs((state) => {
              state.world.bricks[prevY][prevX] = 2
            })

            let noDelete = false
            if (next.current) {
              if (
                core.ws.world.karol.x == next.current.x &&
                core.ws.world.karol.y == next.current.y
              ) {
                core.mutateWs((state) => {
                  state.world.marks[core.ws.world.karol.y][
                    core.ws.world.karol.x
                  ] = false
                })
                next.current = null
                noDelete = true
                stepMs.current = getDelay(tail.current.length)
              }
            }
            if (!noDelete) {
              const toDelete = tail.current.shift()!
              core.mutateWs((state) => {
                state.world.bricks[toDelete.y][toDelete.x] = 0
              })
            }
          }
          // step end
        }
      }
    }, 0)
    window.addEventListener('keydown', (e) => {
      core.mutateWs((state) => {
        state.code = e.key
      })
    })
    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="mt-8">
      <h1 className="text-center text-3xl">Snake Karol Edition</h1>
      <p className="text-center mt-4">
        Steuere Karol mit den Pfeiltasten links/rechts.
      </p>
      <p className="text-center mt-4">Länge: {tail.current.length}</p>
      <div className="h-full w-full flex justify-center items-center">
        <div className="relative">
          <View appearance={core.ws.appearance} world={core.ws.world} />
          {core.ws.ui.state == 'error' && (
            <div className="absolute text-[120px] text-red-500 top-20 text-center left-0 right-0">
              Game Over
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-6">
        {core.ws.ui.state === 'loading' && (
          <button
            className="px-3 py-2 bg-green-200 hover:bg-green-300 rounded-xl"
            onClick={() => {
              core.mutateWs((state) => {
                state.ui.state = 'running'
              })
            }}
          >
            Start
          </button>
        )}
        {core.ws.ui.state === 'running' && (
          <>
            <button
              className={clsx(
                'px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl mr-6',
                core.ws.code == 'ArrowLeft' && 'bg-gray-300'
              )}
              onClick={() => {
                core.mutateWs((state) => {
                  state.code = 'ArrowLeft'
                })
              }}
            >
              LinksDrehen
            </button>
            <button
              className={clsx(
                'px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl',
                core.ws.code == 'ArrowRight' && 'bg-gray-300'
              )}
              onClick={() => {
                core.mutateWs((state) => {
                  state.code = 'ArrowRight'
                })
              }}
            >
              RechtsDrehen
            </button>
          </>
        )}
        {core.ws.ui.state === 'error' && (
          <button
            className="px-3 py-2 underline"
            onClick={() => {
              // reset game
              createWorldCmd(core, 15, 12, 6)
              stepMs.current = 600
              tail.current = []
              next.current = null
              core.mutateWs((state) => {
                state.ui.state = 'running'
                state.world.karol.dir = 'north'
                state.world.karol.y = 11
                state.code = ''
              })
            }}
          >
            neu starten
          </button>
        )}
      </div>
    </div>
  )
}
