'use client'

import { useEffect, useRef } from 'react'
import { View } from '../../components/helper/View'
import { createWorldCmd, forward, left, right } from '../../lib/commands/world'
import { useCreateCore } from '../../lib/state/core'

export default function Snake() {
  const core = useCreateCore()
  const next = useRef<null | { x: number; y: number }>(null)
  const tail = useRef<{ x: number; y: number }[]>([])

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
            }
          }
          if (!noDelete) {
            const toDelete = tail.current.shift()!
            core.mutateWs((state) => {
              state.world.bricks[toDelete.y][toDelete.x] = 0
            })
          }
        }
      }
    }, 600)
    window.addEventListener('keydown', (e) => {
      core.mutateWs((state) => {
        state.code = e.key
      })
      if (e.key == ' ' && core.ws.ui.state == 'loading') {
        core.mutateWs((state) => {
          state.ui.state = 'running'
        })
      }
      if (e.key == ' ' && core.ws.ui.state == 'error') {
        // reset game
        createWorldCmd(core, 20, 15, 6)
        core.mutateWs((state) => {
          state.ui.state = 'running'
        })
      }
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
        Steuere Karol mit der Links-/Rechtstaste. Starte das Spiel mit
        Leertaste.
      </p>
      <div className="h-full w-full flex justify-center items-center mt-8">
        <div className="relative">
          <View appearance={core.ws.appearance} world={core.ws.world} />
          {core.ws.ui.state == 'error' && (
            <div className="absolute text-[120px] text-red-500 top-20 text-center left-0 right-0">
              Game Over
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
