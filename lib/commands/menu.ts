import { Core } from '../state/core'
import { abort } from './vm'

export function openMenu(core: Core) {
  core.mutateCore((state) => {
    state.showMenu = true
    if (state.inviteMenu) {
      state.inviteMenu = false
    }
  })
  abort(core)
}

export function closeMenu(core: Core) {
  core.mutateCore((state) => {
    state.showMenu = false
  })
}

export function switchToEditor(core: Core) {
  core.mutateCore((state) => {
    state.showMenu = false
    state.puzzleWorkspace = undefined
  })
}

export function switchToPuzzle(core: Core, id: number) {
  throw 'bad'
}
