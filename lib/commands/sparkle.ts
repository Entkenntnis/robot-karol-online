import { Core } from '../state/core'

export function createSparkle(
  core: Core,
  posX: number,
  posY: number,
  type: 'happy' | 'fail'
) {
  ;(async () => {
    for (let i = 0; i < 20; i++) {
      core.mutateLevel((state) => {
        state.sparkle = {
          type,
          posX,
          posY: posY - i * 4,
        }
      })
      await sleep(20)
    }
    await sleep(500)
    core.mutateLevel((state) => {
      state.sparkle = undefined
    })
  })()
}

function sleep(t: number) {
  return new Promise((res) => setTimeout(res, t))
}
