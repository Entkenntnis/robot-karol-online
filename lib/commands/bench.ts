import { Core } from '../state/core'
import { ObjectInfo } from '../state/types'

export function exitBench(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.isBench = false
    ui.state = 'ready'
  })
  core.worker!.reset()
}

export async function startBench(core: Core) {
  await core.worker!.prepareBench()
  core.mutateWs((ws) => {
    ws.ui.isBench = true
    ws.world = ws.quest.tasks[0].start
    ws.ui.showOutput = true
    ws.quest.lastStartedTask = 0
    ws.ui.state = 'running'
  })
  await executeInBench(core, core.ws.pythonCode)
  await updateBenchClasses(core)
  await updateBenchObjects(core)
}

export async function executeInBench(core: Core, code: string) {
  const result = await core.worker!.messageBench({
    request: 'execute',
    code,
  })
  await updateBenchObjects(core)
  return result
}

export async function updateBenchClasses(core: Core) {
  const result = (await core.worker!.messageBench({
    request: 'class-info',
  })) as any
  core.mutateWs((ws) => {
    ws.bench.classInfo = JSON.parse(result.classInfo)
  })
}

export async function updateBenchObjects(core: Core) {
  const result = (await core.worker!.messageBench({
    request: 'object-info',
  })) as any
  core.mutateWs((ws) => {
    ws.bench.objects = JSON.parse(result.classInfo)
      .map((obj: [string, string]) => {
        return {
          name: obj[0],
          className: obj[1],
        }
      })
      .filter((obj: ObjectInfo) => {
        return core.ws.bench.classInfo[obj.className] !== undefined
      })
  })
}
