import { Store } from 'pullstate'
import { ICanvsObjects } from './types'

export const CanvasObjects = new Store<ICanvsObjects>({
  objects: [],
})
