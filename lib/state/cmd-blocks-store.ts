import { Store } from 'pullstate'
import type { ICmdBlocksStore } from './types'

export const CmdBlocksStore = new Store<ICmdBlocksStore>({
  names: [],
})
