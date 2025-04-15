import { Core } from '../state/core'

export async function navigate(core: Core, hash: string) {
  history.pushState(null, '', '/' + hash)

  // push state is not triggering hash change event, so hydrate manually
  await hydrateFromHash(core)
}

// Assume that all relevant data is in the hash
export async function hydrateFromHash(core: Core) {
  const hash = window.location.hash.replace(/^#/, '')
  const page = hash.split(':')[0].toUpperCase()
  const colonIndex = hash.indexOf(':')
  const data = colonIndex !== -1 ? hash.substring(colonIndex + 1) : ''

  console.log('NAV: hydrate from hash', page, data)

  // PHASE 0: reset
  core.reset()

  // PHASE 1: hydrate
  if (page == '') {
    core.mutateWs((ws) => {
      ws.page = 'overview'
    })
    document.title = 'Robot Karol Online'
    return
  }

  if (page == 'EDITOR') {
    core.mutateWs((ws) => {
      ws.page = 'editor'
    })
    document.title = 'Editor'
    return
  }

  if (page == 'INSPIRATION') {
    core.mutateWs((ws) => {
      ws.page = 'inspiration'
    })
    document.title = 'Aufgaben-Galerie'
    return
  }

  // fall back
  await navigate(core, '')
}
