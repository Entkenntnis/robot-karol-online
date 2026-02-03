import { Store } from 'pullstate'
import type { ICanvsObjects } from './types'

export const CanvasObjects = new Store<ICanvsObjects>({
  objects: [],
})
