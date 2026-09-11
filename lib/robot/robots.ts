import type { Core } from '../state/core'
import type { Robot, World } from '../state/types'

export function primaryRobotId(world: World): string {
  return world.robots[0]?.id ?? 'r0'
}

export function getRobot(world: World, id: string): Robot {
  return world.robots.find((robot) => robot.id === id) ?? world.robots[0]
}

export function visibleRobots(world: World): Robot[] {
  return world.robots.filter((robot) => robot.visible)
}

export function addRobot(core: Core, id: string): void {
  core.mutateWs(({ world }) => {
    if (!world.robots.some((robot) => robot.id === id)) {
      world.robots.push({ id, x: 0, y: 0, dir: 'south', visible: true })
    }
  })
}

export function hideRobot(core: Core, id: string): void {
  core.mutateWs(({ world }) => {
    const robot = world.robots.find((entry) => entry.id === id)
    if (robot) {
      robot.visible = false
    }
  })
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
