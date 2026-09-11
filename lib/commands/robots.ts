import type { Core } from '../state/core'
import type { Heading, Robot, World } from '../state/types'

export function createSingleRobotWorld(dir: Heading): World {
  return {
    dimX: 1,
    dimY: 1,
    robots: [
      {
        x: 0,
        y: 0,
        dir,
        id: 'r0',
        visible: true,
      },
    ],
    blocks: [[false]],
    marks: [[false]],
    bricks: [[0]],
    height: 1,
  }
}

export function getRobot(world: World, id?: string): [Robot, number] {
  const matchingIndex = world.robots.findIndex((robot) => robot.id === id)
  const index = matchingIndex >= 0 ? matchingIndex : 0
  return [world.robots[index], index]
}

export function mutateRobot(
  core: Core,
  id: string,
  fn: (robot: Robot, world: World) => void,
): void {
  core.mutateWs(({ world }) => {
    const robot =
      world.robots.find((entry) => entry.id === id) ?? world.robots[0]
    if (robot) {
      fn(robot, world)
    }
  })
}
