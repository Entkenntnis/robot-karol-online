import { createContext, useContext, useMemo } from 'react'
import { Updater, useImmer } from 'use-immer'

export type Heading = 'north' | 'east' | 'south' | 'west'

export interface World {
  dimX: number
  dimY: number
  height: number
  karol: {
    x: number
    y: number
    dir: Heading
  }
  bricks: number[][]
  marks: boolean[][]
  blocks: boolean[][]
}

export interface Settings {}

export interface Project {
  world: World
  code: string
  settings: Settings
}

export type Controller = ReturnType<typeof createController>

export interface ProjectContextValue {
  project: Project
  controller: Controller
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function useProject() {
  const val = useContext(ProjectContext)
  if (val) {
    return val
  }
  throw new Error('Bad usage of app state')
}

export const ProjectProvider = ProjectContext.Provider

export function useProjectContext() {
  const [project, setProject] = useImmer<Project>(createDefaultProject)
  const controller = useMemo(() => createController(setProject), [setProject])
  return { project, controller }
}

// 'private' functions

function createController(setAppState: Updater<Project>) {
  return {
    forward(world: World) {
      const newPos = move(world.karol.x, world.karol.y, world.karol.dir, world)
      if (newPos) {
        setAppState((state) => {
          state.world.karol.x = newPos.x
          state.world.karol.y = newPos.y
        })
      } else {
        return 'Karol kann sich nicht in diese Richtung bewegen.'
      }
    },
    left() {
      setAppState((state) => {
        state.world.karol.dir = {
          north: 'west',
          west: 'south',
          south: 'east',
          east: 'north',
        }[state.world.karol.dir] as Heading
      })
    },
    right() {
      setAppState((state) => {
        state.world.karol.dir = {
          north: 'east',
          east: 'south',
          south: 'west',
          west: 'north',
        }[state.world.karol.dir] as Heading
      })
    },
    back(world: World) {
      const newPos = move(
        world.karol.x,
        world.karol.y,
        { north: 'south', south: 'north', east: 'west', west: 'east' }[
          world.karol.dir
        ] as Heading,
        world
      )

      if (newPos) {
        setAppState((state) => {
          state.world.karol.x = newPos.x
          state.world.karol.y = newPos.y
        })
      } else {
        return 'Karol kann sich nicht in diese Richtung bewegen.'
      }
    },
    mark() {
      setAppState((state) => {
        const world = state.world
        world.marks[world.karol.y][world.karol.x] =
          !world.marks[world.karol.y][world.karol.x]
      })
    },
    brick(world: World) {
      const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

      if (pos) {
        if (world.bricks[pos.y][pos.x] >= world.height) {
          return 'Maximale Stapelhöhe erreicht.'
        } else {
        }

        setAppState((state) => {
          state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] + 1
        })
      } else {
        return 'Karol kann dort keinen Ziegel aufstellen.'
      }
    },
    unbrick(world: World) {
      const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

      if (pos) {
        if (world.bricks[pos.y][pos.x] <= 0) {
          return 'Keine Ziegel zum Aufheben'
        } else {
          setAppState((state) => {
            state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] - 1
          })
        }
      } else {
        return 'Karol kann dort keine Ziegel aufheben.'
      }
    },
    block(world: World) {
      const pos = moveRaw(world.karol.x, world.karol.y, world.karol.dir, world)
      if (pos) {
        if (world.blocks[pos.y][pos.x]) {
          setAppState((state) => {
            state.world.blocks[pos.y][pos.x] = false
          })
        } else if (
          !world.marks[pos.y][pos.x] &&
          world.bricks[pos.y][pos.x] == 0
        ) {
          setAppState((state) => {
            state.world.blocks[pos.y][pos.x] = true
          })
        } else {
          if (world.marks[pos.y][pos.x]) {
            return 'Karol kann keinen Quader aufstellen, vor ihm liegt eine Marke.'
          } else {
            return 'Karol kann keinen Quader aufstellen, vor ihm liegen Ziegel.'
          }
        }
      } else {
        return 'Karol kann keinen Quader aufstellen, er steht vor einer Wand.'
      }
    },
    newWorld(x: number, y: number, z: number) {
      setAppState((state) => {
        state.world = createWorld(x, y, z)
      })
    },
  }
}

function createDefaultProject(): Project {
  return {
    world: createWorld(10, 10, 6),
    code: '{ Schreibe hier dein Programm }\n\n\n\n\n\n\n\n\n',
    settings: {},
  }
}

function move(x: number, y: number, dir: Heading, world: World) {
  const pos = moveRaw(x, y, dir, world)
  if (pos && !world.blocks[pos.y][pos.x]) {
    return pos
  }
}

function moveRaw(x: number, y: number, dir: Heading, world: World) {
  if (dir == 'east') {
    if (x + 1 < world.dimX) {
      return { x: x + 1, y }
    }
  }
  if (dir == 'west') {
    if (x > 0) {
      return { x: x - 1, y }
    }
  }
  if (dir == 'south') {
    if (y + 1 < world.dimY) {
      return { x, y: y + 1 }
    }
  }
  if (dir == 'north') {
    if (y > 0) {
      return { x, y: y - 1 }
    }
  }
}

function createWorld(dimX: number, dimY: number, height: number): World {
  return {
    dimX,
    dimY,
    height,
    karol: {
      x: 0,
      y: 0,
      dir: 'south',
    },
    bricks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(0)),

    marks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
    blocks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
  }
}
