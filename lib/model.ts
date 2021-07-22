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
    forward() {
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
    back() {
      setAppState((state) => {
        const newPos = move(
          state.world.karol.x,
          state.world.karol.y,
          { north: 'south', south: 'north', east: 'west', west: 'east' }[
            state.world.karol.dir
          ] as Heading,
          state.world
        )

        if (newPos) {
          state.world.karol.x = newPos.x
          state.world.karol.y = newPos.y
        }
      })
    },
    mark() {
      setAppState((state) => {
        const world = state.world
        world.marks[world.karol.y][world.karol.x] =
          !world.marks[world.karol.y][world.karol.x]
      })
    },
    brick() {
      setAppState((state) => {
        const { world } = state
        const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

        if (pos) {
          world.bricks[pos.y][pos.x] = Math.min(
            world.height,
            world.bricks[pos.y][pos.x] + 1
          )
        }
      })
    },
    unbrick() {
      setAppState((state) => {
        const { world } = state
        const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

        if (pos) {
          world.bricks[pos.y][pos.x] = Math.max(
            0,
            world.bricks[pos.y][pos.x] - 1
          )
        }
      })
    },
    block(world: World) {
      setAppState((state) => {
        const pos = moveRaw(
          world.karol.x,
          world.karol.y,
          world.karol.dir,
          world
        )
        if (pos) {
          if (world.blocks[pos.y][pos.x]) {
            state.world.blocks[pos.y][pos.x] = false
          } else if (
            !world.marks[pos.y][pos.x] &&
            world.bricks[pos.y][pos.x] == 0
          ) {
            state.world.blocks[pos.y][pos.x] = true
          }
        }
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
