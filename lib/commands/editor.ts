import { Core } from '../state/core'

export function setTitle(core: Core, title: string) {
  core.mutateWs(({ quest }) => {
    quest.title = title
  })
}

export function setDescription(core: Core, desc: string) {
  core.mutateWs(({ quest }) => {
    quest.description = desc
  })
}
