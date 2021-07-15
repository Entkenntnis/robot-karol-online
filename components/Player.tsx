import { useAppState } from './App'
import { Heading, KarolWorld, View } from './View'

export function Player() {
  const { appState, setAppState } = useAppState()

  return (
    <div
      onKeyDown={(e) => {
        if (e.code == 'ArrowLeft') {
          setAppState((state) => {
            state.world.karol.dir = {
              north: 'west',
              west: 'south',
              south: 'east',
              east: 'north',
            }[state.world.karol.dir] as Heading
          })
          e.preventDefault()
        }
        if (e.code == 'ArrowRight') {
          setAppState((state) => {
            state.world.karol.dir = {
              north: 'east',
              east: 'south',
              south: 'west',
              west: 'north',
            }[state.world.karol.dir] as Heading
          })
          e.preventDefault()
        }
        if (e.code == 'ArrowUp') {
          setAppState((state) => {
            const newPos = move(
              state.world.karol.x,
              state.world.karol.y,
              state.world.karol.dir,
              state.world
            )

            if (newPos) {
              state.world.karol.x = newPos.x
              state.world.karol.y = newPos.y
            }
          })
          e.preventDefault()
        }
        if (e.code == 'ArrowDown') {
          setAppState((state) => {
            const world = state.world
            if (world.karol.dir == 'west') {
              if (world.karol.x + 1 < world.width) {
                world.karol.x++
              }
            }
            if (world.karol.dir == 'east') {
              if (world.karol.x > 0) {
                world.karol.x--
              }
            }
            if (world.karol.dir == 'north') {
              if (world.karol.y + 1 < world.length) {
                world.karol.y++
              }
            }
            if (world.karol.dir == 'south') {
              if (world.karol.y > 0) {
                world.karol.y--
              }
            }
          })
          e.preventDefault()
        }
        if (e.code == 'KeyM') {
          setAppState((state) => {
            const world = state.world
            world.marks[world.karol.y][world.karol.x] =
              !world.marks[world.karol.y][world.karol.x]
          })
          e.preventDefault()
        }
        if (e.code == 'KeyH') {
          setAppState((state) => {
            const { world } = state
            const pos = move(
              world.karol.x,
              world.karol.y,
              world.karol.dir,
              world
            )

            if (pos) {
              world.bricks[pos.y][pos.x] = Math.min(
                world.height,
                world.bricks[pos.y][pos.x] + 1
              )
            }
          })
          e.preventDefault()
        }
        if (e.code == 'KeyA') {
          setAppState((state) => {
            const { world } = state
            const pos = move(
              world.karol.x,
              world.karol.y,
              world.karol.dir,
              world
            )

            if (pos) {
              world.bricks[pos.y][pos.x] = Math.max(
                0,
                world.bricks[pos.y][pos.x] - 1
              )
            }
          })
          e.preventDefault()
        }
      }}
      tabIndex={1}
      className="focus:border-green-200 border-white border-2 mb-32"
    >
      <View world={appState.world} />
    </div>
  )
}

function move(x: number, y: number, dir: Heading, world: KarolWorld) {
  if (dir == 'east') {
    if (x + 1 < world.width) {
      return { x: x + 1, y }
    }
  }
  if (dir == 'west') {
    if (x > 0) {
      return { x: x - 1, y }
    }
  }
  if (dir == 'south') {
    if (y + 1 < world.length) {
      return { x, y: y + 1 }
    }
  }
  if (dir == 'north') {
    if (y > 0) {
      return { x, y: y - 1 }
    }
  }
}
