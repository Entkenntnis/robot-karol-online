import { Store } from 'pullstate'
import { ICmdBlocksStore } from './types'

export const CmdBlocksStore = new Store<ICmdBlocksStore>({
  names: [],
})
