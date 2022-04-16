import { Core } from '../state/core'
import { World } from '../state/types'

export function serialize(core: Core) {
  const { world, code } = core.ws
  return { world, code }
}

export function deserialize_TO_REWRITE(
  core: Core,
  file?: string,
  filename?: string
) {
  try {
    const { world, code }: { world: World; code: string } = JSON.parse(
      file ?? '{}'
    )
    if (!world || code === undefined) {
      throw new Error('Datei unvollständig')
    }
    // minimal sanity check
    if (!world.dimX || !world.dimY || !world.height) {
      throw new Error('Welt beschädigt')
    }
    if (world.dimX > 100 || world.dimY > 100 || world.height > 10) {
      throw new Error('Welt ungültig')
    }
    for (let x = 0; x < world.dimX; x++) {
      for (let y = 0; y < world.dimY; y++) {
        if (
          typeof world.blocks[y][x] !== 'boolean' ||
          world.bricks[y][x] === undefined ||
          world.bricks[y][x] < 0 ||
          world.bricks[y][x] > world.height ||
          typeof world.marks[y][x] != 'boolean'
        ) {
          throw new Error('Welt enthält ungültigen Wert')
        }
      }
    }
    if (!world.chips) {
      // patch old save files
      world.chips = []
    }
    //this.abort()
    core.mutateWs((state) => {
      state.world = world
      state.code = code
      state.ui.needTextRefresh = true
      state.ui.originalWorld = world
      state.ui.filename = filename
    })
  } catch (e) {
    // @ts-ignore don't know why this suddenly fails
    alert(e.message ?? 'Laden fehlgeschlagen')
  }
}
